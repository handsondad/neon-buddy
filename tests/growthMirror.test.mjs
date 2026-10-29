import test from "node:test";
import assert from "node:assert/strict";
import { emptyJournal, validateJournal, parseJournal, removeEvent, removeUnderstanding, appendPerspective } from "../src/lib/growth.ts";
import { mirrorPeriods, periodEvidence, currentUnderstandings, understandingWarnings, LENSES } from "../src/lib/growthMirror.ts";
import { serializeBackup } from "../src/lib/growthRepository.ts";

const event = (id, overrides = {}) => ({
  id, occurredOn: "2020-05-01", createdAt: "2020-05-02T03:04:05.000Z",
  title: "等待伙伴一起搭积木", topic: "relationships", context: "熟悉的伙伴",
  observation: "提出了一个新的搭法。", observer: "爸爸", source: "observed",
  childQuote: "", interpretation: "", support: "", question: "", perspectives: [], ...overrides
});
const understanding = (overrides = {}) => ({
  id: "u1", topic: "relationships", from: "2020-05-01", to: "2020-05-31",
  author: "爸爸", statement: "在熟悉的伙伴身边愿意主动提出玩法。",
  alternative: "也可能是熟悉了这项活动，还需要看其他环境。",
  question: "想听听他希望怎样加入新的游戏。", support: "给他先观察的空间。",
  evidenceIds: ["e1"], counterEvidenceIds: ["e2"], status: "exploring",
  createdAt: "2020-06-01T00:00:00.000Z", ...overrides
});
const journal = () => ({ ...emptyJournal(), events: [event("e1"), event("e2", { context: "新伙伴", observation: "先看了一会儿。" })], understandings: [understanding()] });

test("mirror preserves old schema archives without silently adding derived content", () => {
  const old = { ...emptyJournal(), events: [event("e1")] };
  assert.deepEqual(parseJournal(serializeBackup(old)), old);
  assert.deepEqual(parseJournal(serializeBackup(journal())), journal());
  assert.deepEqual(journal().events[0].interpretation, "");
});

test("understanding requires evidence, attribution, alternatives, questions and valid scope", () => {
  for (const changes of [
    { evidenceIds: [] }, { author: " " }, { statement: "" }, { alternative: " " }, { question: "" },
    { evidenceIds: ["missing"] }, { evidenceIds: ["e1", "e1"] },
    { counterEvidenceIds: ["e1"] }, { status: "diagnosed" }, { topic: "toString" },
    { from: "2020-05-20", to: "2020-05-10" }, { from: "2020-05-02" },
    { createdAt: "yesterday" }, { id: "e1" }
  ]) {
    assert.throws(() => validateJournal({ ...journal(), understandings: [understanding(changes)] }), JSON.stringify(changes));
  }
  assert.throws(() => validateJournal({ ...journal(), understandings: null }), /列表/);
  assert.throws(() => validateJournal({ ...journal(), understandings: Array(501).fill(understanding()) }), /500/);
});

test("references are typed, bounded and cannot overlap evidence and counterexamples", () => {
  for (const changes of [{ evidenceIds: [null] }, { counterEvidenceIds: ["missing"] }, { evidenceIds: Array(101).fill("e1") }]) {
    assert.throws(() => validateJournal({ ...journal(), understandings: [understanding(changes)] }));
  }
  const input = journal();
  input.understandings[0].counterEvidenceIds = [];
  assert.doesNotThrow(() => validateJournal(input));
  assert.ok(understandingWarnings(input.understandings[0], input).some((text) => text.includes("尚未附上反例")));
});

test("revisions retain originals and display only the latest chain member", () => {
  const input = journal();
  input.understandings.push(understanding({ id: "u2", supersedes: "u1", statement: "新的情境使我改变了理解。" }));
  const parsed = validateJournal(input);
  assert.equal(parsed.understandings[0].statement, understanding().statement);
  assert.deepEqual(currentUnderstandings(parsed).map((item) => item.id), ["u2"]);
  for (const changes of [{ supersedes: "missing" }, { id: "u3", supersedes: "u1" }, { id: "u3", supersedes: "u2", topic: "emotion" }]) {
    assert.throws(() => validateJournal({ ...input, understandings: [...input.understandings, understanding(changes)] }));
  }
});

test("deletion removes dependent understandings and their subsequent revisions only", () => {
  const input = journal();
  input.understandings.push(understanding({ id: "u2", supersedes: "u1", evidenceIds: ["e2"], counterEvidenceIds: [] }));
  input.understandings.push(understanding({ id: "other", evidenceIds: ["e2"], counterEvidenceIds: [] }));
  const next = removeEvent(validateJournal(input), "e1");
  assert.deepEqual(next.understandings.map((item) => item.id), ["other"]);
  assert.equal(next.events[0].id, "e2");
  assert.doesNotThrow(() => validateJournal(next));
  assert.equal(input.understandings.length, 3);
  assert.deepEqual(removeUnderstanding(input, "u1").understandings.map((item) => item.id), ["other"]);
  assert.equal(removeUnderstanding(input, "u2").understandings.length, 2);
  assert.throws(() => removeUnderstanding(input, "missing"), /找不到/);
});

test("comparison periods are equal length, nonoverlapping and work across leap days", () => {
  assert.deepEqual(mirrorPeriods("2020-03-01", "2020-03-02"), {
    from: "2020-03-01", to: "2020-03-02", previous: { from: "2020-02-28", to: "2020-02-29" }
  });
  assert.equal(mirrorPeriods("0001-01-01", "0001-01-01").previous, null);
  for (const [from, to] of [["2020-02-30", "2020-03-01"], ["0000-01-01", "2020-01-01"], ["", ""], ["2020-03-02", "2020-03-01"]]) {
    assert.throws(() => mirrorPeriods(from, to));
  }
});

test("scope uses occurrence date and never treats counts as developmental scores", () => {
  const events = [event("e1"), event("e2", { occurredOn: "2020-04-30" }), event("e3", { topic: "emotion" })];
  assert.deepEqual(periodEvidence(events, "2020-05-01", "2020-05-31", "relationships").map((item) => item.id), ["e1"]);
  assert.deepEqual(periodEvidence(events, "2020-05-01", "2020-05-31").map((item) => item.id), ["e1", "e3"]);
});

test("later child corrections trigger a recheck without changing prior descriptions", () => {
  const original = journal();
  const next = appendPerspective(original, "e1", {
    id: "p1", kind: "child", source: "reported", author: "孩子（代录）",
    content: "我当时只是想找蓝色积木。", response: "disagree", createdAt: "2020-06-02T00:00:00.000Z"
  });
  assert.ok(understandingWarnings(next.understandings[0], next).some((text) => text.includes("后来的补充")));
  assert.deepEqual(next.understandings, original.understandings);
  assert.ok(understandingWarnings(original.understandings[0], original).some((text) => text.includes("缺少孩子")));
});

test("child skipping is not treated as an expression or consent to an understanding", () => {
  const input = journal();
  input.events[0].perspectives.push({ id: "p", kind: "child", author: "代录", source: "reported", response: "skip", content: "", createdAt: "2020-05-03T00:00:00.000Z" });
  assert.ok(understandingWarnings(input.understandings[0], input).some((text) => text.includes("缺少孩子")));
  input.events[0].perspectives[0].response = "agree";
  assert.ok(understandingWarnings(input.understandings[0], input).some((text) => text.includes("缺少孩子")));
  input.events[0].childQuote = "我想先看看";
  assert.ok(!understandingWarnings(input.understandings[0], input).some((text) => text.includes("缺少孩子")));
});

test("all six lenses have explicit questions, support options and research sources", () => {
  assert.equal(Object.keys(LENSES).length, 6);
  for (const lens of Object.values(LENSES)) {
    assert.equal(lens.questions.length, 3);
    assert.ok(lens.tryNext.length > 10);
    assert.match(lens.source.url, /^https:\/\//);
    assert.ok(lens.principle.length > 20);
  }
});
