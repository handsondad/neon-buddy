import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { emptyKnowledge, applyKnowledgeBatch, parseKnowledge, validateKnowledge, currentTopics, topicHistory, runNeedsReview, analysisNeedsReview } from "../src/lib/knowledge.ts";
import { SCIENCE_CARDS } from "../src/lib/scienceCards.ts";
import { THEORIES, DOMAINS } from "../src/lib/knowledgeFramework.ts";
import { knowledgeSchema } from "../scripts/knowledge-schema.mjs";
import { exampleKnowledge } from "../examples/knowledge-example.mjs";

const initialBatch = JSON.parse(await readFile(new URL("../examples/agent-batch.json", import.meta.url), "utf8"));
const researchBatch = JSON.parse(await readFile(new URL("../examples/research-batch.json", import.meta.url), "utf8"));
const stamp = "2026-10-25T14:00:00.000Z";
const first = () => applyKnowledgeBatch(emptyKnowledge(), structuredClone(initialBatch), stamp);
const research = () => applyKnowledgeBatch(first(), structuredClone(researchBatch), stamp);
const batch = (revision) => ({
  schemaVersion: "1.0", expectedRevision: revision, writer: initialBatch.writer,
  sources: [], observations: [], analyses: [], deleteObservationIds: [], deleteSourceIds: [], deleteAnalysisIds: []
});

test("scientific cards are versioned, theory-linked operational guidance for all eight domains", () => {
  assert.equal(new Set(SCIENCE_CARDS.map((card) => card.id)).size, SCIENCE_CARDS.length);
  assert.deepEqual(new Set(SCIENCE_CARDS.map((card) => card.kind)), new Set(["concept", "observation", "method"]));
  assert.deepEqual(new Set(SCIENCE_CARDS.flatMap((card) => card.domains)), new Set(Object.keys(DOMAINS)));
  for (const card of SCIENCE_CARDS) {
    assert.ok(card.version >= 1 && card.applicability && card.summary && card.prompts.length && card.fields.length && card.limits.length);
    assert.ok(card.theoryIds.length && card.theoryIds.every((id) => THEORIES[id]?.url.startsWith("https://")));
  }
});

test("legacy snapshots and batches remain unchanged, with no silent synthetic research", () => {
  const kb = first();
  assert.ok(!("topics" in kb) && !("runs" in kb));
  assert.deepEqual(parseKnowledge(JSON.stringify(kb)), kb);
  assert.deepEqual(currentTopics(kb), []);
  const newer = research();
  assert.equal(newer.revision, 2);
  assert.equal(newer.topics.length, 1);
  assert.equal(newer.runs[0].status, "insufficient");
  assert.equal(newer.runs[0].outputAnalysisIds.length, 0);
  assert.ok(analysisNeedsReview(newer, newer.analyses[0]));
  assert.equal(runNeedsReview(newer, newer.runs[0]), false);
  assert.deepEqual(parseKnowledge(JSON.stringify(newer)), newer);
});

test("locators identify exact UTF-16 ranges, including repeated text and supplementary characters", () => {
  const input = structuredClone(initialBatch);
  input.sources[0].content = `🙂${input.sources[0].content}${input.sources[0].content}`;
  const observation = input.observations[0];
  const start = 2 + observation.sourceExcerpt.length;
  observation.sourceLocator = { start, end: start + observation.sourceExcerpt.length };
  const kb = applyKnowledgeBatch(emptyKnowledge(), input, stamp);
  assert.deepEqual(kb.observations[0].sourceLocator, observation.sourceLocator);
  for (const locator of [{ start: 0, end: 0 }, { start: 1, end: 3 }, { start: -1, end: 9 }, { start: 0, end: 100000 }, { start: 0.1, end: 2 }, null, { start: 2, end: 3, page: 1 }]) {
    const broken = structuredClone(kb); broken.observations[0].sourceLocator = locator;
    assert.throws(() => validateKnowledge(broken));
  }
});

test("topics are append-only, chronological, same-domain chains without branches", () => {
  const kb = research(), next = batch(2);
  next.topics = [{ ...structuredClone(kb.topics[0]), id: "topic-revised", supersedes: kb.topics[0].id, question: "修订后的具体问题", createdAt: stamp }];
  const saved = applyKnowledgeBatch(kb, next, stamp);
  assert.deepEqual(currentTopics(saved).map((item) => item.id), ["topic-revised"]);
  assert.equal(topicHistory(saved, "topic-revised").length, 2);
  assert.ok(runNeedsReview(saved, saved.runs[0]));
  for (const change of [
    (b) => { b.topics[0].supersedes = "missing"; },
    (b) => { b.topics[0].domain = "agency"; },
    (b) => { b.topics[0].createdAt = "2026-10-20T00:00:00.000Z"; },
    (b) => { b.topics.push({ ...b.topics[0], id: "topic-branch" }); }
  ]) {
    const broken = structuredClone(next); change(broken);
    assert.throws(() => applyKnowledgeBatch(kb, broken, stamp));
  }
});

test("research inputs reject unknown fields, forged versions, identity and time mismatches", () => {
  for (const change of [
    (b) => { b.topics[0].status = "validated"; },
    (b) => { b.topics[0].cardRefs[0].id = "missing"; },
    (b) => { b.topics[0].cardRefs[0].version = 2; },
    (b) => { b.topics[0].cardRefs.push(b.topics[0].cardRefs[0]); },
    (b) => { b.topics[0].createdBy.name = "different-agent"; },
    (b) => { b.runs[0].performedBy.name = "different-agent"; },
    (b) => { b.runs[0].inputRevision = 0; },
    (b) => { b.runs[0].topicId = "missing"; },
    (b) => { b.runs[0].readObservationIds = ["missing"]; },
    (b) => { b.runs[0].readObservationIds = []; },
    (b) => { b.runs[0].readObservationIds.push("obs-example-001"); },
    (b) => { b.runs[0].finishedAt = "2026-10-19T00:00:00.000Z"; },
    (b) => { b.runs[0].limitations = []; },
    (b) => { b.runs[0].counterSearch = ""; },
    (b) => { b.runs[0].privateThoughts = "not accepted"; },
    (b) => { b.deleteTopicIds = null; },
    (b) => { b.deleteRunIds = null; },
    (b) => { b.topics = null; },
    (b) => { b.runs = null; }
  ]) {
    const broken = structuredClone(researchBatch); change(broken);
    assert.throws(() => applyKnowledgeBatch(first(), broken, stamp));
  }
});

test("completed runs link same-batch analyses, actual cited observations and science cards", () => {
  const kb = exampleKnowledge();
  assert.equal(kb.runs.length, 2);
  assert.equal(runNeedsReview(kb, kb.runs[0]), true);
  assert.equal(runNeedsReview(kb, kb.runs[1]), false);
  assert.equal(analysisNeedsReview(kb, kb.analyses[1]), false);
  for (const change of [
    (k) => { k.runs[1].readObservationIds = ["obs-counter"]; },
    (k) => { k.runs[1].outputAnalysisIds = []; },
    (k) => { k.runs[1].status = "insufficient"; },
    (k) => { k.runs[1].status = "cancelled"; },
    (k) => { k.runs[1].outputAnalysisIds = ["analysis-context-initial"]; },
    (k) => { k.runs[1].inputRevision = 2; },
    (k) => { k.runs[1].performedBy.tool = "forged"; },
    (k) => { k.runs[1].cardRefs = [{ id: "concept-development-time", version: 1 }]; },
    (k) => { k.runs.push({ ...k.runs[1], id: "run-duplicate-output" }); },
    (k) => { k.runs[1].id = k.topics[0].id; }
  ]) {
    const broken = structuredClone(kb); change(broken);
    assert.throws(() => validateKnowledge(broken));
  }
  const oldOutput = structuredClone(researchBatch);
  oldOutput.runs[0].status = "completed";
  oldOutput.runs[0].outputAnalysisIds = ["analysis-example-001"];
  assert.throws(() => applyKnowledgeBatch(first(), oldOutput, stamp), /同批次/);
});

test("insufficient and cancelled runs do not masquerade as conclusions", () => {
  const insufficient = research();
  const next = batch(2);
  next.runs = [{ ...insufficient.runs[0], id: "run-cancelled", status: "cancelled", inputRevision: 2, readObservationIds: [], changeReason: "授权材料未齐，停止分析。", finishedAt: stamp }];
  const kb = applyKnowledgeBatch(insufficient, next, stamp);
  assert.equal(kb.runs.at(-1).status, "cancelled");
  assert.deepEqual(kb.runs.at(-1).outputAnalysisIds, []);
  assert.equal(kb.analyses.length, insufficient.analyses.length);
  const conflicting = structuredClone(kb);
  conflicting.runs.push({ ...conflicting.runs.at(-1), id: "run-conflicting", status: "insufficient", readObservationIds: ["obs-example-001"] });
  assert.throws(() => validateKnowledge(conflicting), /同一专题/);
  const noOp = batch(3); noOp.topics = []; noOp.runs = [];
  assert.throws(() => applyKnowledgeBatch(kb, noOp, stamp), /没有任何变更/);
});

test("new knowledge and observation corrections invalidate research without deleting history", () => {
  const kb = exampleKnowledge(), next = batch(2);
  next.writer = kb.sources[0].recordedBy;
  next.observations = [{ ...structuredClone(kb.observations[0]), id: "obs-corrected", supersedes: kb.observations[0].id }];
  const corrected = applyKnowledgeBatch(kb, next, stamp);
  assert.equal(corrected.runs.length, 2);
  assert.ok(corrected.runs.every((item) => runNeedsReview(corrected, item)));
  assert.ok(corrected.analyses.every((item) => analysisNeedsReview(corrected, item)));
});

test("knowledge-card upgrades invalidate linked analyses without rewriting historical references", () => {
  const kb = exampleKnowledge();
  const card = SCIENCE_CARDS.find((item) => item.id === "concept-reactivity");
  const version = card.version;
  try {
    card.version++;
    assert.doesNotThrow(() => validateKnowledge(kb));
    assert.ok(runNeedsReview(kb, kb.runs[1]));
    assert.ok(analysisNeedsReview(kb, kb.analyses[1]));
    assert.equal(kb.runs[1].cardRefs[0].version, version);
    const newBatch = structuredClone(researchBatch);
    newBatch.topics[0].cardRefs = [{ id: card.id, version }];
    assert.throws(() => applyKnowledgeBatch(first(), newBatch, stamp), /当前知识卡版本/);
  } finally { card.version = version; }
});

test("source, observation and analysis deletion remove dependent run summaries, not unrelated topics", () => {
  const kb = exampleKnowledge();
  for (const [field, id] of [
    ["deleteSourceIds", "src-early-new"],
    ["deleteObservationIds", "obs-early-new"],
    ["deleteAnalysisIds", "analysis-context-initial"]
  ]) {
    const deletion = batch(2); deletion[field] = [id];
    const deleted = applyKnowledgeBatch(kb, deletion, stamp);
    assert.equal(deleted.runs.length, 0);
    assert.equal(deleted.topics.length, 1);
    assert.ok(deleted.observations.some((item) => item.id === "obs-explore"));
  }
  const deletion = batch(2); deletion.deleteSourceIds = ["src-explore"];
  const deleted = applyKnowledgeBatch(kb, deletion, stamp);
  assert.deepEqual(deleted.runs.map((item) => item.id), ["run-initial"]);
});

test("topic deletion cascades revisions and task records but retains independent source and analyses", () => {
  const kb = research(), next = batch(2);
  next.topics = [{ ...kb.topics[0], id: "topic-new", supersedes: kb.topics[0].id }];
  const revised = applyKnowledgeBatch(kb, next, stamp);
  const deletion = batch(3); deletion.deleteTopicIds = [kb.topics[0].id];
  const deleted = applyKnowledgeBatch(revised, deletion, stamp);
  assert.equal(deleted.topics.length, 0);
  assert.equal(deleted.runs.length, 0);
  assert.equal(deleted.sources.length, 1);
  assert.equal(deleted.analyses.length, 1);
  const missing = batch(4); missing.deleteTopicIds = ["missing"];
  assert.throws(() => applyKnowledgeBatch(deleted, missing, stamp), /删除目标/);
  const reuse = batch(2); reuse.deleteTopicIds = [kb.topics[0].id]; reuse.topics = [kb.topics[0]];
  assert.throws(() => applyKnowledgeBatch(kb, reuse, stamp), /复用/);
});

test("run-only deletion is explicit, leaves analyses stale and cannot silently rewrite the record", () => {
  const kb = exampleKnowledge(), deletion = batch(2);
  deletion.deleteRunIds = ["run-counter-review"];
  const deleted = applyKnowledgeBatch(kb, deletion, stamp);
  assert.equal(deleted.runs.length, 1);
  assert.equal(deleted.analyses.length, 2);
  assert.ok(analysisNeedsReview(deleted, deleted.analyses[1]));
  const rewritten = batch(2); rewritten.runs = [structuredClone(kb.runs[1])];
  rewritten.runs[0].inputRevision = 2;
  rewritten.runs[0].status = "cancelled";
  rewritten.runs[0].outputAnalysisIds = [];
  assert.throws(() => applyKnowledgeBatch(kb, rewritten, stamp), /署名|复用/);
});

test("schemas expose optional backward-compatible research and exact locators", () => {
  for (const isBatch of [true, false]) {
    const schema = knowledgeSchema(isBatch);
    assert.ok(!schema.required.includes("topics") && !schema.required.includes("runs"));
    assert.equal(schema.$defs.topic.additionalProperties, false);
    assert.equal(schema.$defs.run.additionalProperties, false);
    assert.ok(schema.$defs.observation.properties.sourceLocator);
    assert.ok(!schema.$defs.observation.required.includes("sourceLocator"));
    assert.deepEqual(schema.$defs.topic.properties.cardRefs.items.oneOf.map((item) => item.properties.id.const), SCIENCE_CARDS.map((item) => item.id));
  }
});
