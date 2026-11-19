// puppeteer-core 不自带浏览器，用本机的 Edge 或 Chrome；都找不到就设环境变量 BROWSER_PATH
import { existsSync } from "node:fs";

const BROWSERS = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

export function findBrowser() {
  const found = BROWSERS.find((p) => existsSync(p));
  if (!found) throw new Error("找不到 Edge 或 Chrome，可以用环境变量 BROWSER_PATH 指定");
  return found;
}
