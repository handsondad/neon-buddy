# 小念认识自己

**我为什么会这样？** 小念问，爸爸答，一起看看心理学家发现了什么。

妈妈一走就哭、照镜子认不出自己、突然大发脾气、怕黑、等不及吃糖、玩的时候自言自语……每一件是一条问答：小念接着爸爸的话一路追问，讲到研究里的实验和发现，最后用自己的话总结。每条都配了小念和爸爸的声音，后面有「给大人」：研究怎么看、家里能怎么做、出处在哪、它不能说明什么。

首页的晾衣绳按「这件事常在几岁冒出来」分组，也能按心理分类筛：认识我自己、心情和脾气、我和别人、好奇和想象、管住自己、说话和表达。年纪只是研究里的大致时间，每个孩子早一点、晚一点都很常见。

和《[小念家的漫画书](https://handsondad.github.io/storyverse/)》、《[小念的画廊](https://handsondad.github.io/kids-gallery/)》、《[身体奇遇记](https://handsondad.github.io/bodyverse/)》是同一个系列。

## 开发

需要 Node.js 22+。

```bash
npm install
npm run dev          # 开发服务器
npm run check        # 内容检查
npm test             # 测试（含配音是否齐全）
npm run voice        # 给新的或改过的问答配音（需要 edge-tts、ffmpeg）
npm run build        # 构建到 dist/
```

推到 `main` 会自动发布到 GitHub Pages（`.github/workflows/deploy.yml`）。写新问答见 [`skills/neon-buddy-qa/SKILL.md`](skills/neon-buddy-qa/SKILL.md)，仓库规矩见 [`AGENTS.md`](AGENTS.md)。

旧版「成长镜像」知识库在分支 `legacy/growth-mirror`。
