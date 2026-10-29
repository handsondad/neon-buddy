import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { emptyKnowledge, applyKnowledgeBatch, validateKnowledge, parseKnowledge, activeObservations, currentAnalyses, analysisNeedsReview } from "../src/lib/knowledge.ts";
import { analyzeKnowledge, approximateAge, selectKnowledge } from "../src/lib/knowledgeAnalysis.ts";
import { DOMAINS, THEORIES, SIGNALS } from "../src/lib/knowledgeFramework.ts";
import { knowledgeSchema } from "../scripts/knowledge-schema.mjs";
import { exampleKnowledge } from "../examples/knowledge-example.mjs";

const exampleBatch = JSON.parse(await readFile(new URL("../examples/agent-batch.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);
const stamp = "2026-10-25T13:00:00.000Z";
const current = () => applyKnowledgeBatch(emptyKnowledge(), clone(exampleBatch), stamp);
function emptyBatch(revision = 1) {
  return {
    schemaVersion: "1.0", expectedRevision: revision, writer: clone(exampleBatch.writer),
    sources: [], observations: [], analyses: [], deleteObservationIds: [], deleteSourceIds: [], deleteAnalysisIds: []
  };
}
function correction(kb) {
  const next = emptyBatch(kb.revision);
  const original = kb.observations[0];
  next.observations.push({ ...clone(original), id: "obs-correction", supersedes: original.id });
  return next;
}

test("full Agent batch round-trips sources, structured observations, analysis and provenance", () => {
  const kb = current();
  assert.equal(kb.revision, 1);
  assert.equal(kb.analyses[0].basedOnRevision, 1);
  assert.equal(kb.sources[0].reporter, "合成家长");
  assert.equal(kb.sources[0].recordedBy.name, exampleBatch.writer.name);
  assert.deepEqual(parseKnowledge(JSON.stringify(kb)), kb);
  assert.equal(analysisNeedsReview(kb, kb.analyses[0]), false);
  assert.equal(emptyKnowledge().sources.length, 0);
});

test("rejects unknown fields, missing fields, unsupported vocabulary and duplicate identifiers", () => {
  const invalid = [
    (kb) => { kb.extra = "ignored?"; },
    (kb) => { delete kb.sources[0].content; },
    (kb) => { kb.observations[0].context.emotionScore = 90; },
    (kb) => { kb.observations[0].domains = ["personality"]; },
    (kb) => { kb.observations[0].signals[0].code = "introverted"; },
    (kb) => { kb.observations[0].id = kb.sources[0].id; },
    (kb) => { kb.observations[0].context.setting = "toString"; },
    (kb) => { kb.observations[0].signals.push(clone(kb.observations[0].signals[0])); },
    (kb) => { kb.observations[0].domains.push(kb.observations[0].domains[0]); },
    (kb) => { kb.sources[0].kind = "ai_truth"; }
  ];
  for (const change of invalid) {
    const kb = current(); change(kb);
    assert.throws(() => validateKnowledge(kb));
  }
});

test("untraceable behavior, invented quotes and fabricated signal evidence are refused", () => {
  for (const change of [
    (kb) => { kb.observations[0].sourceId = "missing"; },
    (kb) => { kb.observations[0].sourceExcerpt = "并非材料里的文字"; },
    (kb) => { kb.observations[0].behavior = "他感到焦虑"; },
    (kb) => { kb.observations[0].signals[0].excerpt = "杜撰的证据"; },
    (kb) => { kb.observations[0].childExpression.text = "我很害怕"; }
  ]) {
    const kb = current(); change(kb); assert.throws(() => validateKnowledge(kb));
  }
});

test("source substring validation does not claim semantic or psychological validation", () => {
  const kb = current();
  kb.analyses[0].claim = "Agent可能给出并不合理的解释，仍须人核对。";
  assert.doesNotThrow(() => validateKnowledge(kb));
  assert.equal(kb.analyses[0].claim, validateKnowledge(kb).analyses[0].claim);
});

test("unknowns stay explicit; exact dates, timestamps and approximate age are not invented", () => {
  const kb = current();
  kb.observations[0].occurredOn = null;
  kb.observations[0].context.familiarity = "unknown";
  kb.observations[0].childExpression = null;
  kb.observations[0].signals = [];
  assert.doesNotThrow(() => validateKnowledge(kb));
  assert.equal(approximateAge(null, "2026-10-20"), "月龄未知");
  assert.equal(approximateAge("2021-06", "2026-10-20"), "约5岁4个月");
  for (const date of ["0000-01-01", "2026-02-30", "2999-01-01", "2026-1-1", ""]) {
    const next = current(); next.observations[0].occurredOn = date;
    assert.throws(() => validateKnowledge(next));
  }
  const beforeBirth = current();
  beforeBirth.child.birthMonth = "2026-11";
  assert.throws(() => validateKnowledge(beforeBirth));
  const wrongTimestamp = current();
  wrongTimestamp.observations[0].recordedAt = "2026/10/20";
  assert.throws(() => validateKnowledge(wrongTimestamp));
});

test("analyses require alternatives, limitations, theory, follow-ups and real nonoverlapping evidence", () => {
  for (const change of [
    (kb) => { kb.analyses[0].supportingIds = []; },
    (kb) => { kb.analyses[0].supportingIds = ["missing"]; },
    (kb) => { kb.analyses[0].counterIds = [kb.observations[0].id]; },
    (kb) => { kb.analyses[0].alternatives = []; },
    (kb) => { kb.analyses[0].limitations = []; },
    (kb) => { kb.analyses[0].followUps = []; },
    (kb) => { kb.analyses[0].theoryIds = ["pop_psychology"]; },
    (kb) => { kb.analyses[0].basedOnRevision = 2; },
    (kb) => { kb.analyses[0].generatedAt = "2026-10-19T00:00:00.000Z"; }
  ]) {
    const kb = current(); change(kb); assert.throws(() => validateKnowledge(kb));
  }
});

test("revision and authorship conflicts cannot silently overwrite material", () => {
  assert.throws(() => applyKnowledgeBatch(current(), exampleBatch), /已变化/);
  const batch = clone(exampleBatch); batch.observations[0].recordedBy.name = "冒名";
  assert.throws(() => applyKnowledgeBatch(emptyKnowledge(), batch), /署名/);
  const noOp = emptyBatch();
  assert.throws(() => applyKnowledgeBatch(current(), noOp), /没有任何变更/);
  const childSwap = emptyBatch(); childSwap.child = { id: "another-child", alias: "", birthMonth: null };
  assert.throws(() => applyKnowledgeBatch(current(), childSwap), /孩子ID/);
});

test("new knowledge conservatively invalidates old analysis without deleting history", () => {
  const kb = current();
  const batch = emptyBatch(); batch.child = { ...kb.child, alias: "新称呼" };
  const next = applyKnowledgeBatch(kb, batch, stamp);
  assert.equal(next.revision, 2);
  assert.equal(analysisNeedsReview(next, next.analyses[0]), true);
  assert.deepEqual(next.analyses, kb.analyses);
  assert.equal(analysisNeedsReview(kb, kb.analyses[0]), false);
});

test("observation corrections preserve originals and current analysis cannot cite replaced evidence", () => {
  const kb = current();
  const next = applyKnowledgeBatch(kb, correction(kb), stamp);
  assert.equal(next.observations.length, 2);
  assert.equal(activeObservations(next)[0].id, "obs-correction");
  assert.equal(analysisNeedsReview(next, next.analyses[0]), true);
  const invalid = clone(next); invalid.analyses[0].basedOnRevision = 2;
  assert.throws(() => validateKnowledge(invalid), /已经更正/);
  const branch = emptyBatch(2);
  branch.observations.push({ ...clone(kb.observations[0]), id: "branch", supersedes: kb.observations[0].id });
  assert.throws(() => applyKnowledgeBatch(next, branch), /禁止分叉/);
});

test("Agent can renew an explanation against corrected evidence in an append-only revision", () => {
  const kb = current();
  const updated = applyKnowledgeBatch(kb, correction(kb), stamp);
  const batch = emptyBatch(2);
  batch.analyses.push({ ...clone(exampleBatch.analyses[0]), id: "analysis-new", supersedes: kb.analyses[0].id, supportingIds: ["obs-correction"] });
  const renewed = applyKnowledgeBatch(updated, batch, stamp);
  assert.equal(currentAnalyses(renewed).length, 1);
  assert.equal(currentAnalyses(renewed)[0].id, "analysis-new");
  assert.equal(analysisNeedsReview(renewed, currentAnalyses(renewed)[0]), false);
  assert.equal(renewed.analyses.length, 2);
  const branch = emptyBatch(3);
  branch.analyses.push({ ...clone(batch.analyses[0]), id: "analysis-branch" });
  assert.throws(() => applyKnowledgeBatch(renewed, branch), /已有最新分析/);
});

test("source deletion cascades through corrections and analyses; observation-only deletion retains raw source", () => {
  const kb = current();
  const updated = applyKnowledgeBatch(kb, correction(kb), stamp);
  const removeSource = emptyBatch(2); removeSource.deleteSourceIds = [kb.sources[0].id];
  const removed = applyKnowledgeBatch(updated, removeSource, stamp);
  assert.deepEqual([removed.sources.length, removed.observations.length, removed.analyses.length], [0, 0, 0]);
  const removeObservation = emptyBatch(2); removeObservation.deleteObservationIds = [kb.observations[0].id];
  const kept = applyKnowledgeBatch(updated, removeObservation, stamp);
  assert.deepEqual([kept.sources.length, kept.observations.length, kept.analyses.length], [1, 0, 0]);
  const missing = emptyBatch(2); missing.deleteSourceIds = ["missing"];
  assert.throws(() => applyKnowledgeBatch(updated, missing), /不存在/);
});

test("same-batch deletion cannot reuse identifiers to rewrite history", () => {
  const kb = current();
  const batch = emptyBatch();
  batch.deleteSourceIds.push(kb.sources[0].id);
  batch.sources.push(clone(kb.sources[0]));
  assert.throws(() => applyKnowledgeBatch(kb, batch), /复用/);
});

test("deterministic analysis groups explicit context and behavior only; counts are traceable", () => {
  const kb = exampleKnowledge();
  const data = analyzeKnowledge(kb, { domain: "relationships", from: "", to: "" });
  assert.equal(data.observations.length, 5);
  assert.equal(data.contexts.find((context) => context.key === "community:new").observations.length, 2);
  const knownHome = data.contexts.find((context) => context.key === "home:familiar");
  assert.deepEqual(knownHome.signals.map((signal) => signal.code).sort(), ["declines", "initiates"]);
  assert.ok(knownHome.signals.every((signal) => signal.ids.every((id) => data.observations.some((item) => item.id === id))));
  assert.deepEqual(data.months.map((month) => month.month), ["2026-01", "2026-10"]);
  assert.equal(data.analyses[0].needsReview, false);
  assert.equal(data.analyses[0].outsideScope, false);
  assert.ok(!("personalityScore" in data));
});

test("time filters do not assign unknown dates and show analyses referencing outside scope", () => {
  const kb = exampleKnowledge();
  const data = analyzeKnowledge(kb, { domain: "relationships", from: "2026-10-01", to: "2026-10-29" });
  assert.equal(data.observations.length, 3);
  assert.equal(data.analyses[0].outsideScope, true);
  kb.observations[0].occurredOn = null;
  assert.equal(selectKnowledge(kb, { domain: "", from: "2026-01-01", to: "" }).length, 5);
  assert.equal(analyzeKnowledge(kb, { domain: "", from: "", to: "" }).unknownDates, 1);
  assert.throws(() => selectKnowledge(kb, { domain: "", from: "2026-10-20", to: "2026-01-01" }), /晚于/);
});

test("knowledge gaps describe missing evidence rather than deficits in the child", () => {
  const kb = current();
  kb.observations[0].childExpression = null;
  kb.observations[0].context.outcome = null;
  kb.observations[0].context.familiarity = "unknown";
  const data = analyzeKnowledge(kb, { domain: "", from: "", to: "" });
  for (const fragment of ["出生年月", "单一报告者", "缺少孩子表达", "后续", "反例", "熟悉度"]) {
    assert.ok(data.gaps.some((gap) => gap.includes(fragment)), fragment);
  }
});

test("limits reject unsupported schema, malformed JSON, non-text and oversized data", () => {
  assert.throws(() => parseKnowledge("{"), /有效JSON/);
  assert.throws(() => validateKnowledge({ ...emptyKnowledge(), schemaVersion: "2.0" }), /版本/);
  const kb = current(); kb.sources[0].content = "a".repeat(50001);
  assert.throws(() => validateKnowledge(kb), /50000/);
  const emptyRevision = current(); emptyRevision.revision = 0;
  assert.throws(() => validateKnowledge(emptyRevision), /修订号/);
  assert.throws(() => parseKnowledge("a".repeat(10_000_001)), /10MB/);
});

test("schema vocabulary stays synchronized with scientific framework; batch analysis revision is server owned", () => {
  const schema = knowledgeSchema(true);
  assert.deepEqual(schema.$defs.observation.properties.domains.items.enum, Object.keys(DOMAINS));
  assert.deepEqual(schema.$defs.analysis.properties.theoryIds.items.enum, Object.keys(THEORIES));
  assert.deepEqual(schema.$defs.observation.properties.signals.items.properties.code.enum, Object.keys(SIGNALS));
  assert.equal(schema.$defs.batchAnalysis.properties.basedOnRevision, undefined);
  assert.equal(schema.additionalProperties, false);
  assert.equal(Object.keys(DOMAINS).length, 8);
});
