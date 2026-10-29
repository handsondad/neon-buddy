import { mkdir, open, readFile, rename, stat, unlink } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { applyKnowledgeBatch, emptyKnowledge, MAX_KNOWLEDGE_BYTES, parseKnowledge } from "../src/lib/knowledge.ts";

export function knowledgePath(root = process.cwd()) {
  const path = process.env.NEON_KB_PATH ? resolve(process.env.NEON_KB_PATH) : resolve(root, "knowledge", "private", "current.json");
  const within = relative(resolve(root), path);
  if (!isAbsolute(within) && within !== ".." && !within.startsWith(`..${sep}`)) {
    const parts = within.split(sep);
    if (parts[0] !== "knowledge" || parts[1] !== "private" || parts.length < 3) {
      throw new Error("仓库内的真实知识文件只能放在knowledge/private目录，不能进入源码、public、dist或示例。");
    }
  }
  return path;
}

export async function readKnowledgeFile(path, allowMissing = false) {
  try {
    if ((await stat(path)).size > MAX_KNOWLEDGE_BYTES) throw new Error("知识库超过10MB，停止读取。");
    return parseKnowledge(await readFile(path, "utf8"));
  } catch (error) {
    if (allowMissing && error.code === "ENOENT") return emptyKnowledge();
    throw error;
  }
}

export async function commitKnowledgeBatch(path, batch, { allowDelete = false } = {}) {
  if (!allowDelete && [batch?.deleteObservationIds, batch?.deleteSourceIds, batch?.deleteAnalysisIds, batch?.deleteTopicIds, batch?.deleteRunIds].some((ids) => Array.isArray(ids) && ids.length)) {
    throw new Error("删除需要显式 --allow-delete；应先获得使用者对删除范围的授权。");
  }
  await mkdir(dirname(path), { recursive: true });
  const lockPath = `${path}.lock`;
  let lock;
  try {
    lock = await open(lockPath, "wx", 0o600);
  } catch (error) {
    if (error.code === "EEXIST") throw new Error("知识库正被另一个写入者锁定；不要覆盖。若进程异常退出，核对无写入进程后再人工处理该.lock文件。");
    throw error;
  }
  const temp = `${path}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    const current = await readKnowledgeFile(path, true);
    const next = applyKnowledgeBatch(current, batch);
    const file = await open(temp, "wx", 0o600);
    try {
      await file.writeFile(`${JSON.stringify(next, null, 2)}\n`, "utf8");
      await file.sync();
    } finally { await file.close(); }
    if ((await stat(temp)).size > MAX_KNOWLEDGE_BYTES) throw new Error("格式化后的知识库超过10MB，未替换原文件。");
    await rename(temp, path);
    return next;
  } finally {
    try { await unlink(temp); } catch (error) { if (error.code !== "ENOENT") console.error("临时文件清理失败：", error.message); }
    await lock.close();
    await unlink(lockPath);
  }
}
