// 用 edge-tts 给每一句问答配音，写到 public/voice/<记录>/<轮次>-<nian|dad>.mp3，
// 时长和指纹记在 src/qa/voice-manifest.json。只生成新的或改过的句子，可以随时中断再续。
//   npm run voice                   全部
//   npm run voice -- miss-mom ning  只配这几条
// 需要：python -m pip install edge-tts，以及 PATH 里的 ffmpeg / ffprobe；生成时要联网。
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RECORDS } from "../../src/records/index.ts";
import { clipHash, clipKey, voices } from "./voices.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = join(root, "src/qa/voice-manifest.json");
const voiceDir = join(root, "public/voice");
const parallel = 4;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.stderr.on("data", (chunk) => { err += chunk; });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`${command} 退出码 ${code}: ${err.slice(-400)}`))));
  });
}

const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { clips: {} };

/** Windows 上开发服务器正在读这个文件时改名会报 EPERM，稍等再试 */
function save() {
  const sorted = Object.fromEntries(Object.entries(manifest.clips).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(`${manifestPath}.tmp`, `${JSON.stringify({ voices, clips: sorted }, null, 1)}\n`);
  for (let attempt = 1; ; attempt += 1) {
    try {
      renameSync(`${manifestPath}.tmp`, manifestPath);
      return;
    } catch (error) {
      if (attempt >= 20 || !["EPERM", "EBUSY", "EACCES"].includes(error.code)) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
}

const only = new Set(process.argv.slice(2));
for (const id of only) if (!RECORDS.some((r) => r.id === id)) throw new Error(`没有记录 ${id}，先加进 src/records/index.ts`);
const wanted = new Map();
for (const record of RECORDS) {
  record.dialogue.forEach((turn, index) => {
    for (const who of ["nian", "dad"]) wanted.set(clipKey(record.id, index, who), { who, text: turn[who], record: record.id });
  });
}

for (const key of Object.keys(manifest.clips)) {
  if (wanted.has(key)) continue;
  delete manifest.clips[key];
  rmSync(join(voiceDir, `${key}.mp3`), { force: true });
}

const todo = [...wanted].filter(([key, clip]) => {
  if (only.size && !only.has(clip.record)) return false;
  return manifest.clips[key]?.hash !== clipHash(clip.who, clip.text) || !existsSync(join(voiceDir, `${key}.mp3`));
});
console.log(`需要配音 ${todo.length} 句（问答一共 ${wanted.size} 句）`);

const scratch = join(tmpdir(), "neon-buddy-voice");
mkdirSync(scratch, { recursive: true });

async function make(key, { who, text }) {
  const { voice, rate } = voices[who];
  const raw = join(scratch, `${key.replace("/", "_")}.raw.mp3`);
  const out = join(voiceDir, `${key}.mp3`);
  mkdirSync(dirname(out), { recursive: true });
  for (let attempt = 1; ; attempt += 1) {
    try {
      await run("python", ["-m", "edge_tts", "--voice", voice, `--rate=${rate}`, "--text", text, "--write-media", raw]);
      break;
    } catch (error) {
      if (attempt >= 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
  await run("ffmpeg", ["-y", "-v", "error", "-i", raw, "-ac", "1", "-ar", "24000", "-b:a", "32k", out]);
  rmSync(raw, { force: true });
  const seconds = Number((await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out])).trim());
  manifest.clips[key] = { hash: clipHash(who, text), seconds: Math.round(seconds * 100) / 100 };
}

let done = 0;
let failed = 0;
const queue = [...todo];
await Promise.all(Array.from({ length: parallel }, async () => {
  for (let item = queue.shift(); item; item = queue.shift()) {
    const [key, clip] = item;
    try {
      await make(key, clip);
      save();
      done += 1;
      if (done % 20 === 0 || done === todo.length) console.log(`${done}/${todo.length}`);
    } catch (error) {
      failed += 1;
      console.error(`✖ ${key}: ${error.message}`);
    }
  }
}));
save();
console.log(failed ? `完成 ${done} 句，失败 ${failed} 句，再跑一次会只补失败的` : `全部完成：${done} 句`);
process.exitCode = failed ? 1 : 0;
