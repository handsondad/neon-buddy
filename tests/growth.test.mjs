import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyJournal, validateJournal, parseJournal, filterEvents, appendPerspective, removeEvent, localDate
} from "../src/lib/growth.ts";
import {
  readJournal, writeJournal, clearJournal, spaceId, inspectJournal, journalChanged, journalStorageKey, serializeBackup, MAX_BACKUP_SIZE
} from "../src/lib/growthRepository.ts";

function event(overrides = {}) {
  return {
    id: "event-1", occurredOn: "2020-05-01", createdAt: "2020-05-02T03:04:05.000Z",
    title: "一起搭积木", topic: "everyday", context: "客厅",
    observation: "把积木分给了另一位小朋友。", observer: "记录者", source: "observed",
    childQuote: "", interpretation: "", support: "", question: "", perspectives: [],
    ...overrides
  };
}

function journal(events = [event()]) {
  return { ...emptyJournal(), events };
}

function memoryStorage() {
  const data = new Map();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key)
  };
}

test("archive round-trip retains facts, quotes and hypotheses separately", () => {
  const input = journal([event({ childQuote: "想先看看", interpretation: "可能想先熟悉环境" })]);
  assert.deepEqual(parseJournal(JSON.stringify(input)), input);
  assert.equal(parseJournal(JSON.stringify(input)).events[0].perspectives.length, 0);
  assert.equal(input.events[0].observation, "把积木分给了另一位小朋友。");
});

test("validates leap days, actual calendar days and future dates", () => {
  assert.doesNotThrow(() => validateJournal(journal([event({ occurredOn: "2020-02-29" })])));
  for (const date of ["0000-01-01", "2021-02-29", "2020-02-30", "2020-13-01", "2020-1-1", "2999-01-01"]) {
    assert.throws(() => validateJournal(journal([event({ occurredOn: date })])), /日期/);
  }
  const today = new Date();
  assert.equal(localDate(today).slice(0, 4), String(today.getFullYear()));
});

test("rejects malformed, unsupported and incomplete backups", () => {
  assert.throws(() => parseJournal("{"), /JSON/);
  assert.throws(() => validateJournal(null), /结构/);
  assert.throws(() => validateJournal({ ...journal(), schemaVersion: 2 }), /版本/);
  assert.throws(() => validateJournal({ schemaVersion: 1, childName: "", events: "not-an-array" }), /列表/);
  for (const overrides of [
    { observation: " " }, { observer: "" }, { title: "a".repeat(101) },
    { context: "a".repeat(8001) }, { topic: "toString" }, { source: "ai" },
    { perspectives: null }, { createdAt: "2020/01/01" }, { childQuote: null }
  ]) {
    assert.throws(() => validateJournal(journal([event(overrides)])));
  }
});

test("rejects duplicate event and perspective identifiers", () => {
  assert.throws(() => validateJournal(journal([event(), event()])), /重复/);
  const perspective = { id: "event-1", kind: "child", author: "代录者", source: "reported", content: "不同理解", createdAt: "2020-06-01T00:00:00.000Z" };
  assert.throws(() => appendPerspective(journal(), "event-1", perspective), /重复/);
});

test("appends attributed corrections without rewriting original history", () => {
  const original = journal([event({ interpretation: "想自己搭" })]);
  const perspective = { id: "perspective-1", kind: "correction", author: "孩子（代录）", source: "reported", content: "其实想一起搭", createdAt: "2020-06-01T00:00:00.000Z" };
  const updated = appendPerspective(original, "event-1", perspective);
  assert.equal(original.events[0].perspectives.length, 0);
  assert.equal(updated.events[0].interpretation, "想自己搭");
  assert.deepEqual(updated.events[0].perspectives, [perspective]);
  assert.throws(() => appendPerspective(original, "missing", perspective), /找不到/);
});

test("searches all recorded perspectives and filters dates inclusively", () => {
  const first = event({ perspectives: [{ id: "p1", kind: "child", author: "本人", source: "observed", content: "想一起搭", createdAt: "2020-06-01T00:00:00.000Z" }] });
  const second = event({ id: "event-2", title: "ABC", occurredOn: "2020-05-02", topic: "curiosity", childQuote: "蓝色积木" });
  const filters = { keyword: "", topic: "", from: "", to: "" };
  assert.deepEqual(filterEvents([first, second], filters).map((item) => item.id), ["event-2", "event-1"]);
  assert.equal(filterEvents([first, second], { ...filters, keyword: "想一起搭" })[0].id, first.id);
  assert.equal(filterEvents([first, second], { ...filters, keyword: "abc" })[0].id, second.id);
  assert.equal(filterEvents([first, second], { ...filters, keyword: "蓝色" })[0].id, second.id);
  assert.equal(filterEvents([first, second], { ...filters, from: "2020-05-01", to: "2020-05-01" }).length, 1);
  assert.equal(filterEvents([first, second], { ...filters, topic: "emotion" }).length, 0);
  assert.deepEqual([first, second].map((item) => item.id), ["event-1", "event-2"]);
});

test("deleting an event deletes its perspectives without affecting other events", () => {
  const input = journal([event({ perspectives: [{ id: "p", kind: "adult", author: "记录者", source: "observed", content: "补充", createdAt: "2020-06-01T00:00:00.000Z" }] }), event({ id: "event-2" })]);
  const output = removeEvent(input, "event-1");
  assert.equal(output.events.length, 1);
  assert.equal(output.events[0].id, "event-2");
  assert.equal(input.events.length, 2);
  assert.throws(() => removeEvent(input, "missing"), /找不到/);
});

test("spaces persist across reloads without touching legacy data", () => {
  const storage = memoryStorage();
  storage.setItem("xyr_virtual_child_v1:guest", "legacy");
  assert.deepEqual(readJournal(storage, "family").journal, emptyJournal());
  const saved = writeJournal(storage, "family", journal(), null);
  assert.deepEqual(readJournal(storage, "family"), saved);
  assert.deepEqual(readJournal(storage, "other").journal, emptyJournal());
  clearJournal(storage, "family", saved.revision);
  assert.equal(readJournal(storage, "family").revision, null);
  assert.equal(storage.getItem("xyr_virtual_child_v1:guest"), "legacy");
});

test("detects stale writes and stale deletion without overwriting newer records", () => {
  const storage = memoryStorage();
  const first = writeJournal(storage, "family", journal(), null);
  const second = writeJournal(storage, "family", { ...first.journal, childName: "昵称" }, first.revision);
  assert.throws(() => writeJournal(storage, "family", journal([]), first.revision), /其他窗口/);
  assert.throws(() => clearJournal(storage, "family", first.revision), /其他窗口/);
  assert.deepEqual(readJournal(storage, "family"), second);
});

test("corrupted records are surfaced, not silently replaced or erased", () => {
  const storage = memoryStorage();
  storage.setItem("neon_buddy_growth_mirror_v1:family", "{broken");
  assert.throws(() => readJournal(storage, "family"), /JSON/);
  assert.throws(() => writeJournal(storage, "family", emptyJournal(), null), /其他窗口/);
  assert.equal(storage.getItem("neon_buddy_growth_mirror_v1:family"), "{broken");
});

test("storage access and quota failures remain explicit", () => {
  const storage = memoryStorage();
  const quota = { ...storage, setItem() { throw new Error("QuotaExceededError"); } };
  assert.throws(() => writeJournal(quota, "family", journal(), null), /QuotaExceededError/);
  assert.equal(storage.data.size, 0);
  assert.throws(() => readJournal({ getItem() { throw new Error("SecurityError"); } }, "family"), /SecurityError/);
});

test("space IDs normalize only within the documented format", () => {
  assert.equal(spaceId(" Family_2 "), "family_2");
  for (const input of ["", "a", "../family", "姓名", "x".repeat(25)]) assert.throws(() => spaceId(input), /空间ID/);
});

test("inspection preserves unreadable raw data without treating it as a valid empty journal", () => {
  const storage = memoryStorage();
  for (const raw of ["{broken", "", JSON.stringify({ schemaVersion: 999, childName: "", events: [] })]) {
    storage.setItem(journalStorageKey("family"), raw);
    const state = inspectJournal(storage, "family");
    assert.equal(state.snapshot, null);
    assert.equal(state.revision, raw);
    assert.match(state.error, /停止写入/);
    assert.equal(storage.getItem(journalStorageKey("family")), raw);
  }
  const denied = inspectJournal({ getItem() { throw new Error("SecurityError"); } }, "family");
  assert.equal(denied.revision, undefined);
  assert.equal(denied.snapshot, null);
  assert.match(denied.error, /SecurityError/);
});

test("inspection distinguishes empty storage and readable archives from unreadable storage", () => {
  const storage = memoryStorage();
  const fresh = inspectJournal(storage, "family");
  assert.equal(fresh.error, "");
  assert.equal(fresh.revision, null);
  assert.deepEqual(fresh.snapshot, { journal: emptyJournal(), revision: null });
  const saved = writeJournal(storage, "family", journal(), null);
  assert.deepEqual(inspectJournal(storage, "family"), { snapshot: saved, revision: saved.revision, error: "" });
});

test("recovery can explicitly replace corrupt data but rejects concurrent modifications", () => {
  const storage = memoryStorage();
  const key = journalStorageKey("family");
  storage.setItem(key, "{original");
  const state = inspectJournal(storage, "family");
  storage.setItem(key, "{newer");
  assert.throws(() => writeJournal(storage, "family", journal(), state.revision), /其他窗口/);
  assert.equal(storage.getItem(key), "{newer");
  const latest = inspectJournal(storage, "family");
  const saved = writeJournal(storage, "family", journal(), latest.revision);
  assert.deepEqual(readJournal(storage, "family"), saved);
});

test("invalid recovery files and quota failures do not replace original corrupt data", () => {
  const storage = memoryStorage();
  const key = journalStorageKey("family");
  storage.setItem(key, "{original");
  assert.throws(() => writeJournal(storage, "family", { ...journal(), schemaVersion: 2 }, "{original"), /版本/);
  const quota = { ...storage, setItem() { throw new Error("QuotaExceededError"); } };
  assert.throws(() => writeJournal(quota, "family", journal(), "{original"), /QuotaExceededError/);
  assert.equal(storage.getItem(key), "{original");
});

test("revision checks detect replacement, deletion and corrupt writes without touching other spaces", () => {
  const storage = memoryStorage();
  const saved = writeJournal(storage, "family", journal(), null);
  assert.equal(journalChanged(storage, "family", saved.revision), false);
  writeJournal(storage, "other", journal(), null);
  assert.equal(journalChanged(storage, "family", saved.revision), false);
  storage.setItem(journalStorageKey("family"), "{changed");
  assert.equal(journalChanged(storage, "family", saved.revision), true);
  storage.removeItem(journalStorageKey("family"));
  assert.equal(journalChanged(storage, "family", saved.revision), true);
  assert.equal(journalChanged(storage, "family", null), false);
  assert.throws(() => journalChanged({ getItem() { throw new Error("StorageDenied"); } }, "family", null), /StorageDenied/);
});

test("compact backups are recoverable and UTF-8 byte limit matches import size", () => {
  const input = journal([event({ childQuote: "保留原文与换行\n不补写" })]);
  const backup = serializeBackup(input);
  assert.deepEqual(parseJournal(backup), input);
  assert.ok(new TextEncoder().encode(backup).length <= MAX_BACKUP_SIZE);
  const many = journal(Array.from({ length: 220 }, (_, index) => event({
    id: `large-${index}`, observation: "文".repeat(8000)
  })));
  assert.ok(JSON.stringify(many).length < MAX_BACKUP_SIZE);
  assert.ok(new TextEncoder().encode(JSON.stringify(many)).length > MAX_BACKUP_SIZE);
  const storage = memoryStorage();
  const saved = writeJournal(storage, "family", input, null);
  assert.throws(() => serializeBackup(many), /5MB/);
  assert.throws(() => writeJournal(storage, "family", many, saved.revision), /5MB/);
  assert.deepEqual(readJournal(storage, "family"), saved);
});

test("backup limit accepts exactly five million UTF-8 bytes and rejects one additional byte", () => {
  const input = journal(Array.from({ length: 620 }, (_, index) => event({
    id: `boundary-${index}`, observation: "a".repeat(7500), context: ""
  })));
  let remaining = MAX_BACKUP_SIZE - new TextEncoder().encode(JSON.stringify(input)).byteLength;
  assert.ok(remaining > 0 && remaining < input.events.length * 8000);
  for (const item of input.events) {
    const count = Math.min(8000, remaining);
    item.context = "b".repeat(count);
    remaining -= count;
    if (remaining === 0) break;
  }
  assert.equal(new TextEncoder().encode(serializeBackup(input)).byteLength, MAX_BACKUP_SIZE);
  const room = input.events.find((item) => item.context.length < 8000);
  room.context += "c";
  assert.equal(new TextEncoder().encode(JSON.stringify(input)).byteLength, MAX_BACKUP_SIZE + 1);
  assert.throws(() => serializeBackup(input), /5MB/);
});
