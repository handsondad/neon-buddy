import test from "node:test";
import assert from "node:assert/strict";
import { emptyJournal, validateJournal, appendPerspective, removeEvent, parseJournal } from "../src/lib/growth.ts";
import { answerFromRecords, buildPeriodReview, eventAnchor, formatReviewMarkdown } from "../src/lib/growthReview.ts";

const all = { from: "", to: "", topic: "" };
const question = { question: "关于积木，留下了哪些记录？", keyword: "积木", focus: "all" };

function event(overrides = {}) {
  return {
    id: "event-1", occurredOn: "2020-05-01", createdAt: "2020-05-02T03:04:05.000Z",
    title: "公园搭积木", topic: "curiosity", context: "下午在公园",
    observation: "先看了一会儿，后来加入搭积木。", observer: "爸爸", source: "observed",
    childQuote: "我想先看看。", interpretation: "可能想先熟悉环境，还待确认。",
    support: "下次提前介绍游戏规则。", question: "当时你在想什么？",
    perspectives: [{ id: "p1", kind: "correction", author: "孩子（代录）", source: "reported",
      content: "不是不想玩，是在看怎么玩。", createdAt: "2020-06-02T03:04:05.000Z" }],
    ...overrides
  };
}

function journal(events = [event()]) {
  return validateJournal({ ...emptyJournal(), events });
}

test("period review counts recorded events, never infers an ability or frequency", () => {
  const review = buildPeriodReview(journal(), all);
  assert.equal(review.eventCount, 1);
  assert.equal(review.eventsWithLaterPerspectives, 1);
  assert.deepEqual(review.topics, [{ topic: "curiosity", count: 1 }]);
  assert.deepEqual(Object.keys(review).sort(), ["scope", "eventCount", "eventsWithLaterPerspectives", "topics", "evidence"].sort());
  assert.equal(review.evidence.length, 6);
});

test("period uses occurrence date, not entry date or correction date", () => {
  assert.equal(buildPeriodReview(journal(), { ...all, from: "2020-05-01", to: "2020-05-01" }).eventCount, 1);
  assert.equal(buildPeriodReview(journal(), { ...all, from: "2020-06-01" }).eventCount, 0);
  assert.equal(buildPeriodReview(journal(), { ...all, to: "2020-04-30" }).eventCount, 0);
  const correction = buildPeriodReview(journal(), { ...all, from: "2020-05-01", to: "2020-05-01" }).evidence.at(-1);
  assert.equal(correction.recordedAt, "2020-06-02T03:04:05.000Z");
  assert.equal(correction.occurredOn, "2020-05-01");
});

test("filters topics without mutating journal or scope", () => {
  const input = journal([event(), event({ id: "event-2", perspectives: [], topic: "emotion" })]);
  const before = JSON.stringify(input);
  const scope = { ...all, topic: "emotion" };
  assert.equal(buildPeriodReview(input, scope).eventCount, 1);
  assert.deepEqual(scope, { from: "", to: "", topic: "emotion" });
  assert.equal(JSON.stringify(input), before);
});

test("rejects malformed or reversed review scopes", () => {
  for (const scope of [
    { ...all, from: "0000-01-01" }, { ...all, from: "2021-02-29" }, { ...all, to: "2020-13-01" },
    { ...all, from: "2020-05-02", to: "2020-05-01" }, { ...all, topic: "toString" }
  ]) assert.throws(() => buildPeriodReview(journal(), scope));
});

test("each citation retains exact text, source, author and source identifier", () => {
  const input = journal();
  const review = buildPeriodReview(input, all);
  for (const evidence of review.evidence) {
    assert.equal(evidence.eventId, input.events[0].id);
    if (evidence.perspectiveId) {
      const source = input.events[0].perspectives.find((item) => item.id === evidence.perspectiveId);
      assert.equal(evidence.text, source.content);
      assert.equal(evidence.author, source.author);
      assert.equal(evidence.source, "reported");
    } else {
      assert.equal(evidence.text, input.events[0][evidence.field]);
      assert.equal(evidence.author, "爸爸");
    }
  }
  assert.match(review.evidence.find((item) => item.field === "interpretation").label, /待确认/);
  assert.match(review.evidence.find((item) => item.field === "support").label, /未验证效果/);
});

test("child-quote focus cannot substitute a parent's hypothesis or a later correction", () => {
  const answer = answerFromRecords(journal(), all, { ...question, focus: "childQuote" });
  assert.equal(answer.status, "answered");
  assert.equal(answer.totalMatches, 1);
  assert.equal(answer.evidence[0].text, "我想先看看。");
  const withoutQuote = journal([event({ childQuote: "" })]);
  assert.equal(answerFromRecords(withoutQuote, all, { ...question, focus: "childQuote" }).status, "insufficient");
});

test("literal query searches context and exact content without inventing synonyms", () => {
  assert.equal(answerFromRecords(journal(), all, { ...question, keyword: "公园", focus: "childQuote" }).status, "answered");
  assert.equal(answerFromRecords(journal(), all, { ...question, keyword: "怎么玩", focus: "perspective" }).totalMatches, 1);
  assert.equal(answerFromRecords(journal(), all, { ...question, keyword: "乐高" }).status, "insufficient");
  assert.equal(answerFromRecords(journal(), all, { ...question, keyword: "玩具" }).status, "insufficient");
});

test("empty, absent and out-of-scope evidence give explicit uncertainty", () => {
  const answer = answerFromRecords(emptyJournal(), all, question);
  assert.equal(answer.status, "insufficient");
  assert.match(answer.message, /没有记录不代表没有发生/);
  assert.deepEqual(answer.evidence, []);
  assert.equal(answerFromRecords(journal(), { ...all, from: "2021-01-01" }, question).totalMatches, 0);
  assert.equal(answerFromRecords(journal(), all, { ...question, question: "  " }).status, "insufficient");
});

test("diagnosis, personality, causality and prediction questions do not get simulated answers", () => {
  for (const text of ["孩子是不是自闭？", "这证明孩子性格内向吗？", "为什么不想参加？", "这种支持的疗效怎么样？", "未来会不会愿意交朋友？", "Can you predict personality?", "Why did this happen?"]) {
    const answer = answerFromRecords(journal(), all, { ...question, question: text });
    assert.equal(answer.status, "unsupported", text);
    assert.equal(answer.evidence.length, 0);
  }
});

test("long questions and invalid focus fail explicitly", () => {
  assert.throws(() => answerFromRecords(journal(), all, { ...question, question: "a".repeat(501) }), /500/);
  assert.throws(() => answerFromRecords(journal(), all, { ...question, keyword: "a".repeat(101) }), /100/);
  assert.throws(() => answerFromRecords(journal(), all, { ...question, focus: "score" }), /类型/);
});

test("contrasting perspectives coexist and none is selected as truth", () => {
  const original = journal();
  const changed = appendPerspective(original, "event-1", {
    id: "p2", kind: "adult", author: "另一位记录者", source: "observed",
    content: "我觉得当时他不想玩，但不能确定。", createdAt: "2020-06-03T03:04:05.000Z"
  });
  const answer = answerFromRecords(changed, all, { ...question, focus: "perspective" });
  assert.equal(answer.evidence.length, 2);
  assert.match(answer.evidence[0].text, /不是不想玩/);
  assert.match(answer.evidence[1].text, /不想玩/);
  assert.equal(original.events[0].perspectives.length, 1);
});

test("deletion and replacement immediately remove derived citations", () => {
  const original = journal();
  assert.equal(answerFromRecords(original, all, question).status, "answered");
  const deleted = removeEvent(original, "event-1");
  assert.equal(buildPeriodReview(deleted, all).evidence.length, 0);
  assert.equal(answerFromRecords(deleted, all, question).status, "insufficient");
  const replaced = journal([event({ id: "new-event", title: "另一次散步", context: "", observation: "看见了树叶。",
    childQuote: "", interpretation: "", support: "", question: "", perspectives: [] })]);
  assert.equal(answerFromRecords(replaced, all, question).totalMatches, 0);
});

test("markdown export includes exact evidence references and explicit limits", () => {
  const text = formatReviewMarkdown(buildPeriodReview(journal(), all));
  assert.ok(text.includes(`事件ID：${JSON.stringify("event-1")}`));
  assert.ok(text.includes(`视角ID：${JSON.stringify("p1")}`));
  assert.ok(text.includes("> 我想先看看。"));
  assert.ok(text.includes("> 不是不想玩，是在看怎么玩。"));
  assert.ok(text.includes("不是心理评估"));
  assert.ok(text.includes("记录数量不是行为频率"));
  assert.ok(text.includes("未验证任何支持效果"));
  assert.ok(text.includes("自行删除"));
  const empty = formatReviewMarkdown(buildPeriodReview(emptyJournal(), all));
  assert.ok(empty.includes("此范围没有记录，不作推测"));
});

test("child participation states round-trip without rewriting original events", () => {
  for (const response of ["agree", "disagree", "skip"]) {
    const original = journal();
    const updated = appendPerspective(original, "event-1", {
      id: `response-${response}`, kind: "child", response, author: "代录者", source: "reported",
      content: "", createdAt: "2020-06-03T03:04:05.000Z"
    });
    assert.equal(parseJournal(JSON.stringify(updated)).events[0].perspectives.at(-1).response, response);
    assert.equal(original.events[0].perspectives.length, 1);
    assert.equal(updated.events[0].observation, original.events[0].observation);
    assert.equal(updated.events[0].interpretation, original.events[0].interpretation);
    assert.equal(buildPeriodReview(updated, all).evidence.at(-1).text, "");
  }
});

test("cannot attach child participation to adults or add words to an abstention", () => {
  const make = (overrides) => appendPerspective(journal(), "event-1", {
    id: "p2", kind: "child", response: "skip", author: "代录者", source: "reported",
    content: "", createdAt: "2020-06-03T03:04:05.000Z", ...overrides
  });
  assert.throws(() => make({ kind: "adult" }), /孩子视角/);
  assert.throws(() => make({ content: "替孩子解释拒绝原因" }), /不保存表达/);
  assert.throws(() => make({ response: "unknown" }), /参与选择/);
  assert.throws(() => make({ response: undefined }), /内容/);
});

test("child abstention is attributed and searchable without inferring a reason", () => {
  const updated = appendPerspective(journal(), "event-1", {
    id: "p2", kind: "child", response: "skip", author: "代录者", source: "reported",
    content: "", createdAt: "2020-06-03T03:04:05.000Z"
  });
  const answer = answerFromRecords(updated, all, { ...question, keyword: "暂不回答", focus: "perspective" });
  assert.equal(answer.totalMatches, 1);
  assert.equal(answer.evidence[0].text, "");
  assert.match(answer.evidence[0].label, /暂不回答/);
  assert.match(answer.evidence[0].label, /身份未核实/);
});

test("anchors use encoded identifiers rather than interpreting selector characters", () => {
  assert.equal(eventAnchor("event-1"), "growth-event-event-1");
  assert.equal(eventAnchor('a#"><script>'), "growth-event-a%23%22%3E%3Cscript%3E");
});
