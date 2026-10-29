# 私有成长知识库

真实资料存放在 `knowledge\private\current.json`，目录已被 Git 忽略，不放入 public、不导入前端模块、不打包到 dist。未创建文件时API明确返回空知识库 revision 0。

通过根目录 `AGENTS.md` 和 `docs\AGENT_KNOWLEDGE_PROTOCOL.md` 了解写入约定。使用 `npm run kb -- show` 读取当前修订，`npm run kb -- validate --file <batch>` 验证，`npm run kb -- apply --file <batch>` 原子提交。不要让Agent直接改 current.json。

批次、中间材料、手工备份也放在本目录的 `private` 子目录或仓库外，不提交到 Git。没有应用级加密，Git忽略不等于加密或访问授权；本机只读API也不是儿童账号权限系统。
