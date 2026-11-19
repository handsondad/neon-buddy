// 内容检查：npm run check [-- <记录id>...]。改了问答、加了记录都跑一遍，有一条不对就退出码 1。
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RECORDS, STORY_TITLES } from "../src/records/index.ts";
import { CATEGORIES } from "../src/qa/vocab.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const len = (s) => [...(s ?? "")].length;
export const LIMITS = { name: 8, title: 28, trigger: 50, nian: 70, dadMin: 20, dad: 170, tipMin: 40, tip: 260, says: 80, limit: 60, step: 10 };
export const TURNS = [5, 8];

/** 孩子听不懂的词：先打比方，用大白话说；这些名字留给「给大人」 */
export const jargon = /神经元|神经递质|皮质醇|多巴胺|血清素|催产素|前额叶|边缘系统|杏仁核|海马体|元认知|执行功能|依恋类型|气质类型|自我效能|内化|外化|社会化|客体永久|心理理论|延迟满足|镜像神经/;

/** 不下诊断、不贴标签、不预言、不和别的孩子比 */
export const BANNED = [
  "多动症", "自闭", "抑郁症", "焦虑症", "障碍", "智商", "情商低", "人格", "发育迟缓", "落后", "超前", "达标",
  "天生就是", "长大一定", "将来一定", "以后一定", "性格内向", "性格外向", "胆小鬼", "坏孩子", "不乖", "熊孩子", "破坏王",
];

/** 「我是坏孩子吗？」「不是坏孩子」「『破坏王』这种话」这样问、否定、加引号提到标签，是在拆标签，不算贴 */
function rebutted(text, at, word) {
  const before = text.slice(Math.max(0, at - 4), at);
  const rest = text.slice(at + word.length).split(/[。！？，\n]/)[0];
  return /不是|不叫|别说|不用/.test(before) || /[「“]$/.test(before) || /吗/.test(rest);
}

// 只由这些字组成的两个字，说明不了在聊什么
const filler = new Set("的了吗呢吧呀啊哦嘛是我你他她它们这那就也都还又在有和么什怎为个一不没会要说想看能可以得很太好真再");

/** 一句话里有意思的两个字的词，比如「镜子」「分开」 */
export function topicWords(line) {
  const words = new Set();
  const chars = [...line];
  for (let i = 0; i < chars.length - 1; i += 1) {
    const [a, b] = [chars[i], chars[i + 1]];
    if (!/\p{Script=Han}/u.test(a) || !/\p{Script=Han}/u.test(b) || filler.has(a) || filler.has(b)) continue;
    words.add(a + b);
  }
  return words;
}

export const sharedWords = (question, answer) => [...topicWords(question)].filter((w) => answer.includes(w));

export function recordProblems(r, files = null) {
  const out = [];
  const fail = (msg) => out.push(`${r.id}: ${msg}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id ?? "")) fail("id 只用小写字母、数字和短横线");
  if (files && !files.includes(r.id)) fail(`没有 src/records/${r.id}.ts（文件名要和 id 一样）`);
  for (const key of ["name", "title", "trigger"]) {
    if (!r[key]?.trim()) fail(`${key} 是空的`);
    else if (len(r[key]) > LIMITS[key]) fail(`${key} ${len(r[key])} 个字，超过 ${LIMITS[key]}`);
  }
  if (!/？/.test(r.title ?? "")) fail("title 要是小念的问题，带「？」");
  if (!r.icon?.trim()) fail("icon 是空的");
  if (!CATEGORIES.some((c) => c.id === r.category)) fail(`没有这个分类：${r.category}`);
  const { from, to } = r.age ?? {};
  if (!Number.isInteger(from) || from < 0 || from > 144) fail(`age.from 要是 0–144 的整数（月）：${from}`);
  if (to !== undefined && (!Number.isInteger(to) || to <= from || to > 168)) fail(`age.to 要比 from 大：${to}`);

  const turns = r.dialogue ?? [];
  if (turns.length < TURNS[0] || turns.length > TURNS[1]) fail(`问答 ${turns.length} 轮，要 ${TURNS[0]}–${TURNS[1]} 轮`);
  turns.forEach((t, i) => {
    const n = i + 1;
    const last = i === turns.length - 1;
    if (!t.nian?.trim() || !t.dad?.trim()) { fail(`第 ${n} 轮小念和爸爸都要有话`); return; }
    if (len(t.nian) > LIMITS.nian) fail(`第 ${n} 轮小念 ${len(t.nian)} 个字，超过 ${LIMITS.nian}`);
    if (len(t.dad) < LIMITS.dadMin || len(t.dad) > LIMITS.dad) fail(`第 ${n} 轮爸爸 ${len(t.dad)} 个字，要 ${LIMITS.dadMin}–${LIMITS.dad}`);
    if (!last && !/？/.test(t.nian)) fail(`第 ${n} 轮小念要问一个问题，带「？」`);
    if (last && !/^.{0,4}(我懂了|我明白了)/.test(t.nian)) fail("最后一轮小念以「我懂了」「我明白了」开头，用自己的话总结");
    if (i > 0 && !sharedWords(t.nian, turns[i - 1].dad).length) fail(`第 ${n} 轮小念的问题要接住爸爸上一句里的一个词`);
    for (const line of [t.nian, t.dad]) {
      const m = line.match(jargon);
      if (m) fail(`第 ${n} 轮用了术语「${m[0]}」：先打比方，名字留给「给大人」`);
    }
    if (t.show) {
      if (t.show.kind !== "steps") fail(`第 ${n} 轮 show 只能是 steps`);
      const k = t.show.frames?.length ?? 0;
      if (k < 2 || k > 4) fail(`第 ${n} 轮步骤 ${k} 格，要 2–4 格`);
      for (const f of t.show.frames ?? []) {
        if (!f.icon?.trim() || !f.label?.trim()) fail(`第 ${n} 轮步骤缺图标或文字`);
        else if (len(f.label) > LIMITS.step) fail(`第 ${n} 轮步骤「${f.label}」超过 ${LIMITS.step} 个字`);
      }
    }
  });

  if (len(r.parentTip) < LIMITS.tipMin || len(r.parentTip) > LIMITS.tip) fail(`parentTip ${len(r.parentTip)} 个字，要 ${LIMITS.tipMin}–${LIMITS.tip}`);
  const sources = r.sources ?? [];
  if (sources.length < 1 || sources.length > 4) fail(`出处 ${sources.length} 条，要 1–4 条`);
  sources.forEach((s, i) => {
    const n = i + 1;
    for (const key of ["who", "title", "url", "says", "limit"]) if (!s[key]?.trim()) fail(`出处 ${n} 缺 ${key}`);
    if (s.url && !/^https:\/\/\S+$/.test(s.url)) fail(`出处 ${n} 的链接要是 https：${s.url}`);
    if (len(s.says) > LIMITS.says) fail(`出处 ${n} 的 says ${len(s.says)} 个字，超过 ${LIMITS.says}`);
    if (len(s.limit) > LIMITS.limit) fail(`出处 ${n} 的 limit ${len(s.limit)} 个字，超过 ${LIMITS.limit}`);
  });
  if (new Set(sources.map((s) => s.url)).size !== sources.length) fail("出处链接重复");

  if (r.story) {
    if (!STORY_TITLES[r.story]) fail(`漫画书故事 ${r.story} 不在 src/records/index.ts 的 STORY_TITLES 里`);
    if (!existsSync(join(root, "public/comics", r.story, "thumb.webp"))) fail(`缺图 public/comics/${r.story}/thumb.webp（npm run comics）`);
  }

  const all = [r.title, r.trigger, r.parentTip, ...turns.flatMap((t) => [t.nian, t.dad])].join("\n");
  for (const w of BANNED) {
    for (let at = all.indexOf(w); at >= 0; at = all.indexOf(w, at + 1)) {
      if (!rebutted(all, at, w)) fail(`用了「${w}」：不下诊断、不贴标签、不预言、不比较`);
    }
  }
  return out;
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const errors = [];
  const files = readdirSync(join(root, "src/records")).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => f.slice(0, -3));
  const ids = new Set();
  for (const r of RECORDS) {
    if (ids.has(r.id)) errors.push(`${r.id}: id 重复`);
    ids.add(r.id);
  }
  if (!only.size) for (const f of files) if (!ids.has(f)) errors.push(`${f}: 文件写了，但没加进 src/records/index.ts`);
  const titles = new Map();
  for (const r of RECORDS) {
    if (titles.has(r.title)) errors.push(`${r.id}: 标题和 ${titles.get(r.title)} 一样`);
    titles.set(r.title, r.id);
  }
  for (const r of RECORDS) if (!only.size || only.has(r.id)) errors.push(...recordProblems(r, files));
  // 还没加进 index.ts 的新文件，也能单独查
  for (const id of only) {
    if (ids.has(id)) continue;
    const file = join(root, "src/records", `${id}.ts`);
    if (!existsSync(file)) { errors.push(`${id}: 没有这条记录`); continue; }
    const { default: r } = await import(pathToFileURL(file).href);
    errors.push(...recordProblems(r, files));
  }

  if (!only.size) {
    for (const a of ["nian-thinking", "nian-proud", "dad-happy"]) {
      if (!existsSync(join(root, "public/avatars", `${a}.webp`))) errors.push(`avatars: 缺 public/avatars/${a}.webp（npm run comics）`);
    }
    if (!existsSync(join(root, "public/fonts/buddy.woff"))) errors.push("font: 缺 public/fonts/buddy.woff（npm run font）");
    else {
      const chars = new Set(readFileSync(join(root, "public/fonts/buddy-chars.txt"), "utf8"));
      const { collect } = await import("../tools/font/subset.mjs");
      const missing = [...collect()].filter((c) => !chars.has(c));
      if (missing.length) errors.push(`font: 字体里少了 ${missing.length} 个字：${missing.slice(0, 20).join("")}…（npm run font）`);
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n${errors.length} 处要改`);
    process.exit(1);
  }
  console.log(`✓ ${only.size || RECORDS.length} 条问答都没问题`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
