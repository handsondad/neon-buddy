// 从《小念家的漫画书》（旁边的 storyverse 仓库）截出问答要用的图，存成 webp：
//   public/comics/<故事>/thumb.webp    「小念家也有过这样一天」的小封面
//   public/avatars/<角色>-<表情>.webp  问答气泡边的头像
//
//   npm run comics                        只截还没有的
//   npm run comics -- --force             全部重截
//   npm run comics -- --url http://localhost:5173/   用已经开着的漫画书开发服务器
//   npm run comics -- --storyverse ../storyverse     漫画书仓库在别处
//
// 用本机的 Edge 或 Chrome（puppeteer-core 不自带浏览器）。
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { findBrowser } from "./browser.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

/** 头像：漫画书样张里的表情，顺序和 storyverse/src/story/vocab.ts 的 EXPRESSIONS 一样 */
const EXPRESSIONS = ["neutral", "happy", "laugh", "surprised", "sad", "cry", "angry", "scared", "thinking", "confused", "shy", "sleepy", "proud", "serious", "yuck"];
export const AVATARS = [["nian", "thinking"], ["nian", "proud"], ["dad", "happy"]];

function parseArgs(argv) {
  const opts = { force: false, url: null, storyverse: resolve(root, "../storyverse") };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--force") opts.force = true;
    else if (argv[i] === "--url") opts.url = argv[++i];
    else if (argv[i] === "--storyverse") opts.storyverse = resolve(argv[++i]);
  }
  return opts;
}

/** 问答页「小念家也有过这样一天」挂的那些故事 */
export async function neededStories() {
  const { RECORDS } = await import(pathToFileURL(join(root, "src/records/index.ts")).href);
  return [...new Set(RECORDS.map((r) => r.story).filter(Boolean))];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const executablePath = findBrowser();

  const jobs = [];
  for (const story of await neededStories()) {
    jobs.push({ hash: `#/read/${story}/0`, file: join(publicDir, "comics", story, "thumb.webp"), width: 760, scale: 0.36 });
  }
  for (const [who, face] of AVATARS) {
    jobs.push({ hash: `#/cast/${who}`, file: join(publicDir, "avatars", `${who}-${face}.webp`), width: 1000, scale: 1.6, face });
  }
  const todo = opts.force ? jobs : jobs.filter((j) => !existsSync(j.file));
  if (!todo.length) {
    console.log("图都在，不用截。要重截加 --force");
    return;
  }

  let server = null;
  let base = opts.url;
  if (!base) {
    if (!existsSync(join(opts.storyverse, "src/stories"))) throw new Error(`找不到漫画书仓库：${opts.storyverse}，用 --storyverse 指定`);
    const { createServer } = await import("vite");
    server = await createServer({ root: opts.storyverse, configFile: join(opts.storyverse, "vite.config.ts"), logLevel: "error", server: { port: 0 } });
    await server.listen();
    base = server.resolvedUrls.local[0];
  }

  const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--hide-scrollbars"] });
  try {
    const page = await browser.newPage();
    for (const job of todo) {
      await page.setViewport({ width: job.width, height: job.face ? 1600 : 900, deviceScaleFactor: job.scale });
      await page.goto(`${base}?snap${job.hash}`, { waitUntil: "networkidle0", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const el = await page.waitForSelector("[data-snap]", { timeout: 20000 });
      if (!el) throw new Error(`${job.hash} 没有画出来`);
      mkdirSync(dirname(job.file), { recursive: true });
      if (!job.face) {
        await el.screenshot({ path: job.file, type: "webp", quality: 78 });
      } else {
        // 表情格里的头是一个内层 svg，它的包围盒会算上画出界的身子，只能按 x/y/width/height 换算出那一格，再截成正方形
        const clip = await page.evaluate((i) => {
          const outer = document.querySelector("[data-snap]");
          const inner = outer.querySelectorAll(":scope > g > svg")[i];
          if (!inner) return null;
          const box = outer.getBoundingClientRect();
          const k = box.width / outer.viewBox.baseVal.width;
          const w = inner.width.baseVal.value * k;
          const h = inner.height.baseVal.value * k;
          // 样张的 viewBox 把头放在离顶上六成的地方；框往下多出的一点落在表情名字上面的空白里
          const side = h * 0.9;
          const cx = box.left + inner.x.baseVal.value * k + w / 2;
          const cy = box.top + inner.y.baseVal.value * k + h * 0.58;
          return { x: cx - side / 2 + window.scrollX, y: cy - side / 2 + window.scrollY, width: side, height: side };
        }, EXPRESSIONS.indexOf(job.face));
        if (!clip) throw new Error(`${job.hash} 里找不到表情 ${job.face}`);
        await page.screenshot({ path: job.file, type: "webp", quality: 90, clip, captureBeyondViewport: true });
      }
      console.log(job.file.slice(root.length + 1).replaceAll("\\", "/"));
    }
  } finally {
    await browser.close();
    await server?.close();
  }
  const extra = readdirSync(join(publicDir, "comics")).filter((d) => !jobs.some((j) => j.file.includes(join("comics", d))));
  if (extra.length) console.log(`这些目录没有记录在用，可以删掉：${extra.join("、")}`);
}

const entry = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href;
if (entry === import.meta.url) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
