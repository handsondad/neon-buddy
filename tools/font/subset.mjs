// 从完整的站酷快乐体里只截出网站用到的字，生成 public/fonts/buddy.woff2。
// 完整字库 1.5 MB，截完一般只有几十 KB。问答或页面加了新字，就重跑一次：npm run font
//
// 需要 Python 和 fontTools：python -m pip install fonttools
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cacheDir = join(root, "tools/font/.cache");
const source = join(cacheDir, "ZCOOLKuaiLe-Regular.ttf");
const url = "https://github.com/google/fonts/raw/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf";
const outDir = join(root, "public/fonts");
export const CHARS_FILE = join(outDir, "buddy-chars.txt");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|css|html)$/.test(name)) out.push(p);
  }
  return out;
}

/** 中日韩文字和全角标点要靠站酷快乐体；英文、数字、表情符号交给系统字体也不会出方框 */
export const needsBuddyFont = (ch) => {
  const code = ch.codePointAt(0);
  return (code >= 0x3000 && code <= 0x9fff) || (code >= 0xff00 && code <= 0xffef) || (code >= 0x2010 && code <= 0x2027);
};

export function collect() {
  const set = new Set();
  for (let c = 0x20; c < 0x7f; c++) set.add(String.fromCharCode(c));
  for (const ch of "，。！？、：；“”‘’（）《》…—·～「」【】") set.add(ch);
  for (const file of [...walk(join(root, "src")), join(root, "index.html")]) {
    for (const ch of readFileSync(file, "utf8")) if (needsBuddyFont(ch)) set.add(ch);
  }
  return [...set].sort().join("");
}

async function main() {
  if (!existsSync(source)) {
    mkdirSync(cacheDir, { recursive: true });
    console.log(`下载 ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`下载失败：${res.status}`);
    writeFileSync(source, Buffer.from(await res.arrayBuffer()));
  }
  mkdirSync(outDir, { recursive: true });
  const chars = collect();
  writeFileSync(CHARS_FILE, chars);
  execFileSync("python", [
    "-m", "fontTools.subset", source,
    `--text-file=${CHARS_FILE}`, "--flavor=woff2", `--output-file=${join(outDir, "buddy.woff2")}`,
    "--layout-features=*",
  ], { stdio: "inherit" });
  const size = statSync(join(outDir, "buddy.woff2")).size;
  console.log(`${[...chars].length} 个字 → public/fonts/buddy.woff2（${(size / 1024).toFixed(0)} KB）`);
}

const entry = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href;
if (entry === import.meta.url) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
