import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { commitKnowledgeBatch, readKnowledgeFile, knowledgePath } from "../scripts/knowledge-store.mjs";
import { knowledgeApi } from "../scripts/knowledge-api.mjs";

const batch = JSON.parse(await readFile(new URL("../examples/agent-batch.json", import.meta.url), "utf8"));
const researchBatch = JSON.parse(await readFile(new URL("../examples/research-batch.json", import.meta.url), "utf8"));
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "neon-knowledge-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, path: join(root, "knowledge", "private", "current.json") };
}

test("atomic store creates only an explicitly committed valid archive and cleans locks", async (t) => {
  const { path } = await fixture(t);
  assert.equal((await readKnowledgeFile(path, true)).revision, 0);
  const saved = await commitKnowledgeBatch(path, batch);
  assert.equal(saved.revision, 1);
  assert.deepEqual(await readKnowledgeFile(path), saved);
  assert.deepEqual(await readdir(dirname(path)), ["current.json"]);
});

test("knowledge location cannot accidentally place private material in public or build sources", async (t) => {
  const { root, path } = await fixture(t);
  const previous = process.env.NEON_KB_PATH;
  try {
    process.env.NEON_KB_PATH = join(root, "public", "child.json");
    assert.throws(() => knowledgePath(root), /不能进入/);
    process.env.NEON_KB_PATH = path;
    assert.equal(knowledgePath(root), path);
    delete process.env.NEON_KB_PATH;
    assert.equal(knowledgePath(root), path);
  } finally {
    if (previous === undefined) delete process.env.NEON_KB_PATH; else process.env.NEON_KB_PATH = previous;
  }
});

test("corruption, stale revision, invalid input and active lock preserve existing bytes", async (t) => {
  const { path } = await fixture(t);
  await commitKnowledgeBatch(path, batch);
  const before = await readFile(path, "utf8");
  await assert.rejects(commitKnowledgeBatch(path, batch), /已变化/);
  assert.equal(await readFile(path, "utf8"), before);
  await writeFile(`${path}.lock`, "locked");
  await assert.rejects(commitKnowledgeBatch(path, batch), /锁定/);
  assert.equal(await readFile(path, "utf8"), before);
  await rm(`${path}.lock`);
  await writeFile(path, "{broken-archive");
  await assert.rejects(commitKnowledgeBatch(path, { ...batch, expectedRevision: 1 }), /有效JSON/);
  assert.equal(await readFile(path, "utf8"), "{broken-archive");
  assert.deepEqual(await readdir(dirname(path)), ["current.json"]);
});

test("concurrent writers cannot both commit the same expected revision", async (t) => {
  const { path } = await fixture(t);
  const outcomes = await Promise.allSettled([commitKnowledgeBatch(path, batch), commitKnowledgeBatch(path, batch)]);
  assert.equal(outcomes.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter((result) => result.status === "rejected").length, 1);
  assert.equal((await readKnowledgeFile(path)).revision, 1);
  assert.deepEqual(await readdir(dirname(path)), ["current.json"]);
});

test("deletion requires explicit option and cascades only after authorization", async (t) => {
  const { path } = await fixture(t);
  const saved = await commitKnowledgeBatch(path, batch);
  const deletion = {
    schemaVersion: "1.0", expectedRevision: 1, writer: batch.writer,
    sources: [], observations: [], analyses: [],
    deleteSourceIds: [saved.sources[0].id], deleteObservationIds: [], deleteAnalysisIds: []
  };
  await assert.rejects(commitKnowledgeBatch(path, deletion), /allow-delete/);
  assert.equal((await readKnowledgeFile(path)).sources.length, 1);
  const deleted = await commitKnowledgeBatch(path, deletion, { allowDelete: true });
  assert.deepEqual([deleted.sources.length, deleted.observations.length, deleted.analyses.length], [0, 0, 0]);
});

test("CLI can show, validate, apply and emit schemas without a model or browser", async (t) => {
  const { root, path } = await fixture(t);
  const file = join(root, "batch.json");
  await writeFile(file, JSON.stringify(batch));
  const cli = (...args) => spawnSync(process.execPath, [resolve("scripts", "knowledge-cli.mjs"), ...args], { encoding: "utf8", env: { ...process.env, NEON_KB_PATH: path } });
  const initial = cli("show");
  assert.equal(initial.status, 0); assert.equal(JSON.parse(initial.stdout).revision, 0);
  const validated = cli("validate", "--file", file);
  assert.equal(validated.status, 0, validated.stderr);
  assert.equal((await readKnowledgeFile(path, true)).revision, 0);
  const applied = cli("apply", "--file", file);
  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(JSON.parse(cli("show").stdout).revision, 1);
  assert.notEqual(cli("apply", "--file", file).status, 0);
  assert.equal(JSON.parse(cli("schema", "--batch").stdout).title, "Neon Buddy Agent batch 1.0");
  const cards = JSON.parse(cli("cards").stdout);
  assert.ok(cards.cards.some((card) => card.id === "method-alternatives"));
  const researchFile = join(root, "research.json");
  await writeFile(researchFile, JSON.stringify(researchBatch));
  const researched = cli("apply", "--file", researchFile);
  assert.equal(researched.status, 0, researched.stderr);
  assert.equal(JSON.parse(cli("show").stdout).runs[0].status, "insufficient");
  assert.notEqual(cli("apply", "--file").status, 0);
  assert.notEqual(cli("show", "--wrong").status, 0);
});

test("research deletions require authorization and remove dependent summaries atomically", async (t) => {
  const { path } = await fixture(t);
  await commitKnowledgeBatch(path, batch);
  const researched = await commitKnowledgeBatch(path, researchBatch);
  for (const [field, id] of [["deleteTopicIds", researched.topics[0].id], ["deleteRunIds", researched.runs[0].id]]) {
    const deletion = { ...batch, child: undefined, expectedRevision: 2, sources: [], observations: [], analyses: [], [field]: [id] };
    const before = await readFile(path, "utf8");
    await assert.rejects(commitKnowledgeBatch(path, deletion), /allow-delete/);
    assert.equal(await readFile(path, "utf8"), before);
  }
  const deletion = { ...batch, child: undefined, expectedRevision: 2, sources: [], observations: [], analyses: [], deleteSourceIds: [researched.sources[0].id] };
  const deleted = await commitKnowledgeBatch(path, deletion, { allowDelete: true });
  assert.equal(deleted.runs.length, 0);
  assert.equal(deleted.topics.length, 1);
  assert.deepEqual(await readdir(dirname(path)), ["current.json"]);
});

test("read-only API follows file updates, isolates example data and reports corrupt storage", async (t) => {
  const { root, path } = await fixture(t);
  const previous = process.env.NEON_KB_PATH;
  process.env.NEON_KB_PATH = path;
  const handlers = [];
  knowledgeApi(root).configurePreviewServer({ middlewares: { use(handler) { handlers.push(handler); } } });
  if (previous === undefined) delete process.env.NEON_KB_PATH; else process.env.NEON_KB_PATH = previous;
  // Capture an explicit path through the root; no actual user file is touched.
  const server = createServer((req, res) => { void handlers[0](req, res, () => { res.statusCode = 404; res.end(); }); });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/knowledge`;
  const initial = await fetch(base);
  assert.equal(initial.headers.get("cache-control"), "no-store");
  assert.equal((await initial.json()).knowledge.revision, 0);
  await commitKnowledgeBatch(path, batch);
  const updated = await (await fetch(base)).json();
  assert.equal(updated.knowledge.revision, 1);
  assert.equal(updated.dataset, "private");
  const example = await (await fetch(`${base}?example=1`)).json();
  assert.equal(example.dataset, "example");
  assert.ok(example.knowledge.child.alias.includes("合成"));
  assert.equal((await readKnowledgeFile(path)).child.alias, "合成示例");
  assert.equal((await fetch(base, { method: "POST" })).status, 405);
  assert.equal((await fetch(base, { headers: { Origin: "https://example.invalid" } })).status, 403);
  assert.equal((await fetch(`${base}?file=private.json`)).status, 503);
  await writeFile(path, "{invalid");
  const failure = await fetch(base);
  assert.equal(failure.status, 503);
  assert.ok((await failure.json()).error.includes("未以空画像替代"));
  assert.equal(await readFile(path, "utf8"), "{invalid");
});
