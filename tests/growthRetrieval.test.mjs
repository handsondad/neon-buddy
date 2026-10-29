import test from "node:test";
import assert from "node:assert/strict";
import { emptyJournal, validateJournal, removeEvent } from "../src/lib/growth.ts";
import { answerFromRecords } from "../src/lib/growthReview.ts";
import { localRetrieval, retrieveFromRecords } from "../src/lib/growthRetrieval.ts";

const all = { from: "", to: "", topic: "" };
const request = { question: "关于积木记录了什么？", keyword: "积木", focus: "all" };

function event(id, overrides = {}) {
  return {
    id, occurredOn: "2020-05-01", createdAt: "2020-05-02T03:04:05.000Z",
    title: "公园搭积木", topic: "curiosity", context: "下午在公园",
    observation: "先看了一会儿，后来加入搭积木。", observer: "合成记录者", source: "observed",
    childQuote: "我想先看看。", interpretation: "待确认的理解。",
    support: "未验证的支持设想。", question: "当时你在想什么？",
    perspectives: [{ id: `${id}-p`, kind: "correction", author: "合成视角作者", source: "reported",
      content: "不是不想玩，是在看怎么玩。", createdAt: "2020-06-02T03:04:05.000Z" }],
    ...overrides
  };
}

function journal() {
  return validateJournal({ ...emptyJournal(), childName: "不应进入服务的昵称", events: [
    event("chosen"), event("unselected", { observation: "不应进入服务的观察" }),
    event("outside", { occurredOn: "2019-01-01" })
  ] });
}

function search(input = journal(), options = {}) {
  return retrieveFromRecords(input, options.scope ?? all, options.request ?? request, options.ids ?? ["chosen"], {
    service: options.service ?? localRetrieval,
    signal: options.signal ?? new AbortController().signal
  });
}

function service(retrieve) {
  return { id: "test-service", label: "测试适配器", matching: "literal", retrieve };
}

test("local adapter preserves existing literal matching and attributed evidence", async () => {
  const input = journal();
  for (const override of [
    {}, { keyword: "公园", focus: "childQuote" }, { keyword: "怎么玩", focus: "perspective" },
    { keyword: "乐高" }, { keyword: "" }, { keyword: "SUPPORT" }
  ]) {
    const query = { ...request, ...override };
    const expected = answerFromRecords({ ...input, events: [input.events[0]] }, all, query);
    assert.deepEqual(await search(input, { request: query }), expected);
  }
});

test("service receives only selected focused material, not the journal or attribution", async () => {
  const input = journal();
  const before = JSON.stringify(input);
  let captured;
  const result = await search(input, {
    scope: { ...all, from: "2020-01-01" },
    request: { ...request, focus: "childQuote" },
    service: service(async (payload) => {
      captured = payload;
      return { references: payload.documents.map((item) => item.reference) };
    })
  });
  assert.deepEqual(Object.keys(captured).sort(), ["documents", "keyword"]);
  assert.equal(captured.documents.length, 1);
  assert.deepEqual(Object.keys(captured.documents[0]).sort(), ["reference", "title", "context", "topic", "text", "label"].sort());
  assert.equal(captured.documents[0].reference.field, "childQuote");
  assert.ok(!JSON.stringify(captured).includes("不应进入服务"));
  assert.ok(!JSON.stringify(captured).includes("合成记录者"));
  assert.ok(!JSON.stringify(captured).includes("待确认的理解"));
  assert.equal(result.evidence[0].author, "合成记录者");
  assert.equal(result.evidence[0].text, "我想先看看。");
  assert.equal(JSON.stringify(input), before);
});

test("selection requires explicit, unique and in-scope existing events before service invocation", async () => {
  let calls = 0;
  const adapter = service(async () => { calls++; return { references: [] }; });
  await assert.rejects(search(journal(), { ids: [], service: adapter }), /选择/);
  await assert.rejects(search(journal(), { ids: ["chosen", "chosen"], service: adapter }), /重复/);
  await assert.rejects(search(journal(), { ids: ["deleted"], service: adapter }), /已删除/);
  await assert.rejects(search(journal(), {
    ids: ["outside"], scope: { ...all, from: "2020-01-01" }, service: adapter
  }), /超出/);
  await assert.rejects(search(journal(), { scope: { ...all, topic: "emotion" }, service: adapter }), /超出/);
  assert.equal(calls, 0);
});

test("unsupported questions and absent focused evidence never invoke the adapter", async () => {
  let calls = 0;
  const adapter = service(async () => { calls++; return { references: [] }; });
  assert.equal((await search(journal(), { request: { ...request, question: "为什么会这样？" }, service: adapter })).status, "unsupported");
  const noQuote = journal();
  noQuote.events[0].childQuote = "";
  assert.equal((await search(noQuote, { request: { ...request, focus: "childQuote" }, service: adapter })).status, "insufficient");
  assert.equal(calls, 0);
});

test("invalid scopes, oversized queries and invalid focus fail before invoking the adapter", async () => {
  let calls = 0;
  const adapter = service(async () => { calls++; return { references: [] }; });
  await assert.rejects(search(journal(), { scope: { ...all, from: "2021-02-29" }, service: adapter }), /日期/);
  for (const override of [{ question: "a".repeat(501) }, { keyword: "a".repeat(101) }, { focus: "personality" }]) {
    await assert.rejects(search(journal(), { request: { ...request, ...override }, service: adapter }));
  }
  assert.equal(calls, 0);
});

test("empty results state uncertainty, not missing behavior or a success-shaped fallback", async () => {
  const result = await search(journal(), { service: service(async () => ({ references: [] })) });
  assert.equal(result.status, "insufficient");
  assert.match(result.message, /没有记录不代表没有发生/);
  assert.deepEqual(result.evidence, []);
});

test("rejects foreign, wrong-field and fabricated perspective references", async () => {
  for (const reference of [
    { eventId: "unselected", field: "childQuote" },
    { eventId: "chosen", field: "interpretation" },
    { eventId: "chosen", field: "childQuote", perspectiveId: "chosen-p" },
    { eventId: "chosen", field: "perspective", perspectiveId: "made-up" },
    { eventId: "chosen", field: "personality" }
  ]) {
    await assert.rejects(search(journal(), {
      request: { ...request, focus: "childQuote" },
      service: service(async () => ({ references: [reference] }))
    }), /引用/);
  }
});

test("strict reference output cannot smuggle rewritten text or model claims", async () => {
  for (const output of [
    null, [], {}, { references: "chosen" }, { references: [], answer: "虚构结论" },
    { references: [{ eventId: "chosen", field: "childQuote", text: "改写原话" }] },
    { references: [{ eventId: "chosen", field: "childQuote", author: "改写作者" }] },
    { references: [{ eventId: "chosen", field: "childQuote", perspectiveId: null }] },
    { references: [{ eventId: "chosen" }] },
    { references: [null] }
  ]) {
    await assert.rejects(search(journal(), { service: service(async () => output) }), /格式|改写/);
  }
});

test("duplicate references are rejected rather than inflating evidence counts", async () => {
  const reference = { eventId: "chosen", field: "childQuote" };
  await assert.rejects(search(journal(), {
    service: service(async () => ({ references: [reference, reference] }))
  }), /重复/);
});

test("adapter changes cannot rewrite the original snapshot or displayed attribution", async () => {
  const input = journal();
  const result = await search(input, {
    service: service(async (payload) => {
      const doc = payload.documents.find((item) => item.reference.field === "childQuote");
      doc.text = "适配器篡改的文字";
      doc.title = "适配器篡改的标题";
      return { references: [doc.reference] };
    })
  });
  assert.equal(result.evidence[0].text, "我想先看看。");
  assert.equal(result.evidence[0].eventTitle, "公园搭积木");
  assert.equal(input.events[0].childQuote, "我想先看看。");
});

test("a child abstention stays empty, attributed and retrievable", async () => {
  const input = journal();
  input.events[0].perspectives.push({
    id: "skip", kind: "child", response: "skip", author: "合成代录者", source: "reported",
    content: "", createdAt: "2020-06-03T03:04:05.000Z"
  });
  const result = await search(validateJournal(input), { request: { ...request, keyword: "暂不回答", focus: "perspective" } });
  assert.equal(result.totalMatches, 1);
  assert.equal(result.evidence[0].perspectiveId, "skip");
  assert.equal(result.evidence[0].text, "");
  assert.match(result.evidence[0].label, /暂不回答/);
});

test("adapter failures propagate without silently switching providers", async () => {
  const failure = new Error("测试服务不可用");
  await assert.rejects(search(journal(), { service: service(async () => { throw failure; }) }), (error) => error === failure);
});

test("cancellation before starting does not invoke a provider", async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  await assert.rejects(search(journal(), {
    signal: controller.signal,
    service: service(async () => { called = true; return { references: [] }; })
  }), { name: "AbortError" });
  assert.equal(called, false);
});

test("cancellation settles even when a provider ignores its signal; late result is discarded", async () => {
  const controller = new AbortController();
  let complete;
  const pending = search(journal(), {
    signal: controller.signal,
    service: service(() => new Promise((resolve) => { complete = resolve; }))
  });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  complete({ references: [{ eventId: "chosen", field: "childQuote" }] });
});

test("deletion requires fresh selection, and new records never become selected automatically", async () => {
  const input = journal();
  await assert.rejects(search(removeEvent(input, "chosen")), /已删除/);
  input.events.push(event("new-record", { perspectives: [] }));
  const result = await search(input);
  assert.ok(result.evidence.every((item) => item.eventId === "chosen"));
});

test("semantic adapters still return only canonical sources without claiming literal matching", async () => {
  const adapter = { ...service(async () => ({ references: [{ eventId: "chosen", field: "childQuote" }] })), matching: "semantic" };
  const result = await search(journal(), { service: adapter });
  assert.equal(result.evidence[0].text, "我想先看看。");
  assert.doesNotMatch(result.message, /字面匹配/);
  assert.match(result.message, /不是推断性回答/);
});
