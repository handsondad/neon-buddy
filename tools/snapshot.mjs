// 把页面截成 PNG，放在 snapshots/ 下，给能看图的 agent 自查用。
//
//   npm run snapshot                       首页 + 每一条问答
//   npm run snapshot -- home ning          只截首页和这一条
//   npm run snapshot -- --width 390        手机宽度（默认 1000）
//
// 会自己起一个 Vite 开发服务器；已经开着的话可以加 --url http://localhost:5173/ 直接用。
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { RECORDS } from "../src/records/index.ts";
import { findBrowser } from "./browser.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "snapshots");

function parseArgs(argv) {
  const opts = { width: 1000, url: null, targets: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--width") opts.width = Number(argv[++i]);
    else if (argv[i] === "--url") opts.url = argv[++i];
    else opts.targets.push(argv[i]);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const targets = opts.targets.length ? opts.targets : ["home", ...RECORDS.map((r) => r.id)];
  for (const t of targets) {
    if (t !== "home" && !RECORDS.some((r) => r.id === t)) throw new Error(`没有记录 ${t}，看看 src/records/ 下的文件名`);
  }

  let server = null;
  let base = opts.url;
  if (!base) {
    const { createServer } = await import("vite");
    server = await createServer({ root, logLevel: "error", server: { port: 0 } });
    await server.listen();
    base = server.resolvedUrls.local[0];
  }

  mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: findBrowser(), headless: true, args: ["--hide-scrollbars"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: opts.width, height: 800, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const problems = [];
    page.on("pageerror", (err) => problems.push(err.message));
    page.on("console", (msg) => { if (msg.type() === "error") problems.push(msg.text()); });
    page.on("requestfailed", (req) => problems.push(`没加载出来：${req.url()}`));
    page.on("response", (res) => { if (res.status() >= 400) problems.push(`${res.status()}：${res.url()}`); });
    for (const t of targets) {
      await page.goto(`${base}${t === "home" ? "#/" : `#/q/${t}`}`, { waitUntil: "networkidle0" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        // 绳子上滚出屏幕的缩略图是懒加载的，等不来，最多等 5 秒
        const loaded = Promise.all([...document.images].map((img) => img.complete || new Promise((ok) => { img.onload = img.onerror = ok; })));
        await Promise.race([loaded, new Promise((ok) => setTimeout(ok, 5000))]);
      });
      const file = `${t}${opts.width === 1000 ? "" : `-${opts.width}`}.png`;
      await page.screenshot({ path: join(outDir, file), fullPage: true });
      console.log(`snapshots/${file}`);
    }
    if (problems.length) {
      console.error("页面报错：\n" + [...new Set(problems)].join("\n"));
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    await server?.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
