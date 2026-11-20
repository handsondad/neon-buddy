# 第三方素材

## 站酷快乐体（ZCOOL KuaiLe）

- 来源：https://github.com/google/fonts/tree/main/ofl/zcoolkuaile
- 许可：SIL Open Font License 1.1（`public/fonts/OFL.txt`，和字体一起发布）
- 使用：子集化后放在 `public/fonts/buddy.woff2`，用 `npm run font` 生成

## 配音（Microsoft Edge 在线语音）

`public/voice/` 里的配音由 [edge-tts](https://github.com/rany2/edge-tts)（GPL-3.0，只在生成时使用，不随网站发布）调用微软 Edge「大声朗读」的在线神经语音生成：小念 `zh-CN-YunxiaNeural`，爸爸 `zh-CN-YunxiNeural`，和《身体奇遇记》一样。这项服务没有为批量生成音频单独给出授权条款，所以这些音频只按家庭和非商业用途考虑；商用前应改用有明确商用授权的语音服务（如 Azure AI Speech）重新生成。

## 漫画小封面和头像

`public/comics/` 和 `public/avatars/` 里的图，是用 `npm run comics` 从同一个家里的《小念家的漫画书》（[storyverse](https://github.com/handsondad/storyverse)）截下来的，不是第三方素材，不随代码许可授权。

## 研究出处

问答页「爸爸参考了什么」列出的论文和机构页面（写在各条记录的 `sources` 里）只做引用和链接，没有复制原文。
