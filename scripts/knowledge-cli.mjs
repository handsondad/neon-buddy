import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { applyKnowledgeBatch, MAX_KNOWLEDGE_BYTES } from "../src/lib/knowledge.ts";
import { commitKnowledgeBatch, knowledgePath, readKnowledgeFile } from "./knowledge-store.mjs";
import { knowledgeSchema } from "./knowledge-schema.mjs";
import { SCIENCE_CARDS } from "../src/lib/scienceCards.ts";
import { THEORIES } from "../src/lib/knowledgeFramework.ts";

const [command, ...args] = process.argv.slice(2);
try {
  const options = new Set(["--file", "--allow-delete", "--batch"]);
  for (let index = 0; index < args.length; index++) {
    if (!options.has(args[index])) throw new Error(`未知参数：${args[index]}`);
    if (args[index] === "--file") {
      if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error("--file 后需要文件路径。");
      index++;
    }
  }
  const fileAt = args.indexOf("--file");
  const file = fileAt < 0 ? null : resolve(args[fileAt + 1]);
  const path = knowledgePath();
  if (command === "cards") {
    console.log(JSON.stringify({ cards: SCIENCE_CARDS, theories: THEORIES, notice: "通用科学知识与产品指引，不含儿童资料；引用不等于验证了个体解释。" }, null, 2));
  } else if (command === "schema") {
    console.log(JSON.stringify(knowledgeSchema(args.includes("--batch")), null, 2));
  } else if (command === "show") {
    console.log(JSON.stringify(await readKnowledgeFile(path, true), null, 2));
  } else if (command === "validate" || command === "apply") {
    if (!file) {
      if (command === "apply") throw new Error("apply 需要 --file 批次路径。");
      const kb = await readKnowledgeFile(path, true);
      console.log(`知识库有效 · revision ${kb.revision} · ${kb.observations.length} observations · ${kb.analyses.length} analyses`);
    } else {
      if ((await stat(file)).size > MAX_KNOWLEDGE_BYTES) throw new Error("批次文件超过10MB。");
      let batch;
      try { batch = JSON.parse(await readFile(file, "utf8")); } catch (error) { throw new Error(`批次读取失败：${error.message}`); }
      if (command === "validate") {
        const next = applyKnowledgeBatch(await readKnowledgeFile(path, true), batch);
        console.log(`批次有效（未写入）· 预期修订 ${next.revision}`);
      } else {
        const kb = await commitKnowledgeBatch(path, batch, { allowDelete: args.includes("--allow-delete") });
        console.log(`已原子写入 · revision ${kb.revision} · ${kb.observations.length} observations · ${kb.analyses.length} analyses`);
      }
    }
  } else {
    throw new Error("用法：npm run kb -- show | cards | schema [--batch] | validate [--file batch.json] | apply --file batch.json [--allow-delete]");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
