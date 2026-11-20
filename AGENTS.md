# AGENTS.md：给接手这个仓库的代码助手

## 这是什么

「小念认识自己」：讲心理的问答网站。小念（男孩）问爸爸「我为什么会这样」：妈妈一走就哭、照镜子、发脾气、怕黑、等不及吃糖……爸爸用他听得懂的话讲心理学研究发现了什么，小念接着追问，最后用自己的话总结。每条都有小念和爸爸的配音，后面附「给大人」和出处。讲的是认识自己，不讲身体和自然（那些在《身体奇遇记》里）。

和《小念家的漫画书》（[storyverse](https://github.com/handsondad/storyverse)）、《小念的画廊》（kids-gallery）、《身体奇遇记》（bodyverse）是同一个系列：同一个小念，同一套颜色、字体、首页晾衣绳和配音。没有后端，没有动画；记录是 `src/records/` 里的 TypeScript 数据。推到 `main` 就由 GitHub Actions 发布到 GitHub Pages。

技术栈：React 18 + TypeScript（strict）+ Vite 5。Hash 路由，相对路径资源，部署在任意子路径下都能打开。

**写新问答或改问答之前，先读 `skills/neon-buddy-qa/SKILL.md`。**

旧的「成长镜像」知识库（Agent 批次 CLI、本地 API）在分支 `legacy/growth-mirror`，更早的「虚拟孩子」在 `legacy/virtual-child`。`main` 不再有它们。

## 命令

需要 Node.js 22+。测试和脚本直接用 Node 跑 `.ts` 文件。

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | 年龄分组、绳子布局、配音是否齐全且读的是现在的字 |
| `npm run check [-- <id>...]` | 内容检查：问答规矩、字数、术语、标签词、出处格式、字体缺字；新文件没加进 index 也能单独查 |
| `npm run voice [-- <id>...]` | 给新的或改过的句子配音（edge-tts，要联网，需要 ffmpeg / ffprobe） |
| `npm run comics [-- --force]` | 从旁边的 `../storyverse` 截漫画小封面和头像（只截还没有的） |
| `npm run snapshot [-- home <id>...] [--width 390]` | 截成 PNG，放在 `snapshots/` |
| `npm run font` | 按源码里用到的字重新截取字体 |
| `npm run build` | 生产构建，输出到 `dist/` |

交付前五个都要过：`npm run typecheck`、`npm test`、`npm run check`、`npm run build`，以及改过的问答 `npm run voice`。新记录还要 `npm run snapshot -- home <id>` 自己看图，手机宽度（`--width 390`）也看。

## 地图

| 路由 | 页面 | 文件 |
|---|---|---|
| `#/` | 首页：心理分类筛选 + 按「常在几岁冒出来」折叠的晾衣绳（位置在 `src/pages/timeline.ts`）+ 预览 + 六类说明 | `src/pages/WallPage.tsx` |
| `#/q/<id>` | 一条问答：配音播放、小念和爸爸的对话、漫画书里的同一天、给大人和出处、同类的事，← → 换一件 | `src/pages/QaPage.tsx` |

内容和工具：

- `src/records/<id>.ts`：一条记录，类型在 `src/qa/types.ts`；出处（`sources`）写在记录里
- `src/records/index.ts`：记录列表、漫画书故事标题和链接
- `src/qa/vocab.ts`：六个心理分类、年龄分组和写法
- `src/qa/voice.ts` + `src/qa/voice-manifest.json`：配音的时长和指纹（manifest 是生成的，别手改）；音频在 `public/voice/<id>/<轮次>-<nian|dad>.mp3`
- `src/pages/useNarration.ts`：问答页按顺序播放配音
- `tools/voice/`：配音生成，声音设置在 `voices.mjs`（和《身体奇遇记》一样）
- `public/comics/<故事>/thumb.webp`：漫画书小封面；`public/avatars/`：头像；`public/fonts/buddy.woff2`：站酷快乐体子集（OFL）
- `tools/comics.mjs`：截漫画；`tools/snapshot.mjs`：截页面；`tools/font/subset.mjs`：截字体
- `tests/qa-rules.mjs`：内容检查器

## 硬性规矩

- **讲真科学**：爸爸讲的实验、年龄、数字都要能在 `sources` 里找到；出处只写能公开打开、自己读过的论文和机构页面，不编文献。有争议或被重复实验修正过的，按现在的认识讲，写进 `limit`。
- **年龄**：`age` 是研究里说这件事常冒出来的大致时间，不是标准。页面要一直说明「每个孩子早晚不一样」；不写达标率、量表分。
- **不贴标签**：不诊断、不贴固定标签（胆小、倔、破坏王）、不预言将来、不和别的孩子比。小念问「我是不是坏孩子」时，爸爸要把标签拆掉。检查器拦一批词，但它只是兜底。
- **不说教**：先接住小念的感受，再讲道理；最后一轮由小念用自己的话总结，爸爸一句短话收尾。
- **配音**：只用合成的声音，小念 `zh-CN-YunxiaNeural`，爸爸 `zh-CN-YunxiNeural`，和《身体奇遇记》一样；改了字就重配。
- **孩子的隐私**：不写真名、学校和幼儿园名字、住址、家里人的名字。真实材料和草稿放 `private/`（已忽略），不进仓库。
- **素材许可**：新素材要在 `THIRD_PARTY_NOTICES.md` 写明来源。
- **代码风格**：照周围代码写。中文注释只写代码本身表达不了的约束；改动要小而完整。

## 已知的坑

- **`.ts` 扩展名**：Node 直接跑 `.ts`，所以被测试导入的文件相互导入时要写 `.ts` 扩展名；类型只用 `import type`。
- **配音会串**：自己测试时别在多个标签页里同时播；测完点「先停一下」或离开问答页。
- **截漫画要有漫画书仓库**：`npm run comics` 默认找 `../storyverse`，会在那里起一个 Vite；不在旁边用 `--storyverse <路径>`，已经开着用 `--url`。
- **字体缺字**：页面上出现方框，跑 `npm run font` 再刷新。需要 `python -m pip install fonttools`。
- **截图要用本机 Edge/Chrome**：`puppeteer-core` 不自带浏览器；找不到时设环境变量 `BROWSER_PATH`。
