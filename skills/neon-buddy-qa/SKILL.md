---
name: neon-buddy-qa
description: >-
  Guides writing one psychology Q&A record for the neon-buddy repo (小念认识自己):
  research a developmental-psychology phenomenon on the web, write 5–8 turns
  where Nian asks and Dad answers with real findings, cite sources Dad actually
  opened, then run check, voice and snapshot. Use when adding or revising a
  record, when the user mentions 问答、小念问爸爸、心理学、认识自己、新记录、配音.
---

# 小念认识自己：写一条问答

目标：小念从自己身上的一件事发问（妈妈一走就哭、照镜子、发脾气、怕黑），爸爸用他听得懂的话，把**心理学研究发现了什么**讲清楚。读完，小念多认识自己一点，大人也知道背后的科学和家里能做什么。

形式和《身体奇遇记》一样：小念问，爸爸答，小念接着爸爸刚说的话追问，一路讲到原理，最后小念用自己的话总结。内容不照漫画书写；漫画书里真有过的同一类事，只在 `story` 里挂个链接。

仓库结构、命令、硬性规矩见根目录 `AGENTS.md`。样板：`src/records/miss-mom.ts`。

## 步骤

```
- [ ] 1. 选现象：心里的事，孩子身上看得见
- [ ] 2. 上网查：找 2–3 个能公开打开的出处，自己读过
- [ ] 3. 写 src/records/<id>.ts → npm run check -- <id>
- [ ] 4. 加进 src/records/index.ts
- [ ] 5. npm run voice -- <id>；npm run font
- [ ] 6. npm run snapshot -- home <id>（再加 --width 390）
```

### 1. 选现象

讲「我」：心情、想法、自己和别人、管住自己、说话。外面世界的科学（天为什么下雨、身体怎么消化）不放这里。一个现象一条记录，和已有的不重复。

`age` 写研究里说这件事**常在几个月大前后冒出来**（`from`，必填）到大多会过去的时候（`to`，不确定就不写）。绳子按 `from` 分组。页面上会写明「每个孩子早晚不一样」。

### 2. 查资料

- 用网络搜索，**打开**原文或可靠的二手页面读过才能引用。优先：期刊论文页（doi.org、PubMed、期刊官网）、美国儿科学会 HealthyChildren.org、哈佛儿童发展中心、CDC、NHS、Zero to Three、儿童早期发展百科（child-encyclopedia.com）、大学实验室页面。
- 不编论文、不编数字。爸爸台词和 parentTip 里出现的数字、年龄、实验细节，都要能在 sources 里查到。
- 有争议、被重复实验推翻或修正过的（比如棉花糖实验的长期预测），要按现在的认识讲，在 `limit` 里写清。
- 不引用量表分、达标率、人格类型；不把研究讲成「你就是这样的孩子」。

### 3. 写记录

```ts
import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "miss-mom", name: "妈妈别走", icon: "👋", category: "others",   // name ≤8 字；icon 一个 emoji
  age: { from: 8, to: 36 },                                            // 月
  title: "妈妈一出门，我为什么就哭得停不下来？",                          // ≤28 字，带「？」
  trigger: "妈妈穿上外套要去上班，小念一把抱住她的腿，哭着不让走",            // ≤50 字，具体的场景
  dialogue: [ /* 5–8 轮 { nian, dad, show? } */ ],
  parentTip: "……",                                                    // 40–260 字
  sources: [{ who, title, url, says, limit }],                         // 1–4 条
  // story: "do-it-myself",                                            // 漫画书里真有过同类的事才写
};

export default record;
```

**检查器会拦的**（`npm run check -- <id>`）：

- 5–8 轮；除最后一轮，小念每句都是问句，带「？」；最后一轮以「我懂了」「我明白了」开头，用自己的话总结
- 从第 2 轮起，小念的问题要用上爸爸上一句里的一个词（追问要接得上）
- 小念 ≤70 字；爸爸 20–170 字
- 对话里不用术语：杏仁核、前额叶、多巴胺、执行功能、心理理论、延迟满足……（见 `tests/qa-rules.mjs` 的 `jargon`）。术语留给 parentTip 和 sources
- 不贴标签、不诊断、不预言、不比较（`BANNED`）。小念问「我是不是坏孩子？」时，爸爸要把标签拆掉
- `show` 只用步骤图：2–4 格，每格一个 emoji 加 ≤10 字
- 出处链接是 https，`says` ≤80 字，`limit` ≤60 字

**写好的标准**（检查器管不到的）：

小念：
- 男孩，口气像五六岁到七岁：短句，带情绪。可以问现在的自己，也可以问「我小时候」，不用管那么小会不会说话
- 第一句说那件事，带一点担心或好奇：「我是不是太没用了？」「我是不是坏孩子？」
- 追问顺着往下挖：爸爸说了「看不见了也还在」，小念就问「看不见了也还在，那……？」

爸爸：
- 先接住感受，第一句就回答，再解释；不说教
- 比方用孩子见过的东西：警报器、刹车、小水壶装满了、拼图少一块
- 讲科学家的实验要讲得像个小故事，而且和原文一致：「科学家在宝宝鼻子上偷偷点一个红点，再让他照镜子……」
- 心理学里很多事是「大多数」「常常」，不是「一定」：每个孩子早晚不一样，要说出来
- 最后一轮爸爸一句短话收尾，给一个能做的小办法

**追问链的常见顺序**（不必全用）：

1. 这是怎么回事，正常吗
2. 心里 / 大脑里发生了什么，科学家怎么发现的
3. 为什么偏偏是这个年纪，会一直这样吗
4. 什么时候更厉害，常见误会
5. 我（和大人）可以怎么做
6. 小念总结，爸爸收尾

**parentTip**：研究怎么看（可以用术语）、家里可以怎么做、什么情况要找儿科医生或专业的人。

**sources**：`who` 写作者和年份或机构（「Warneken & Tomasello（2006）」「美国儿科学会 HealthyChildren.org」），`title` 写原标题，`says` 用大白话说发现了什么，`limit` 写它**不能**说明什么。

**字符串里的引号**用「」，不用英文双引号。

### 5～6. 配音、字体、截图

```bash
npm run voice -- <id>             # 小念 zh-CN-YunxiaNeural，爸爸 zh-CN-YunxiNeural；要联网
npm run font                      # 加了新汉字时
npm run snapshot -- home <id>
npm run snapshot -- home <id> --width 390
npm run typecheck && npm test && npm run check && npm run build
```

改了问答里任何一个字，都要重跑 `npm run voice`，`npm test` 会查配音是不是读的现在的字。

## 验收

- `npm run check` 无报错；每个出处都能打开，说的和原文一致
- 爸爸讲的实验和数字都能在出处里找到
- 没有诊断、标签、预言、比较
- 最后一轮是小念自己的总结
- 手机宽度下能看清，能听到配音
