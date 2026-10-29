import test from "node:test";
import assert from "node:assert/strict";
import { groupJournalMonths, monthDays, monthLabel, shiftMonth } from "../src/lib/journalView.ts";

test("journal list groups by actual occurrence month, newest first", () => {
  const entries = [
    { id: "a", occurredOn: "2020-05-01", createdAt: "2026-10-29T00:00:00.000Z" },
    { id: "b", occurredOn: "2020-06-02", createdAt: "2020-06-03T00:00:00.000Z" },
    { id: "c", occurredOn: "2020-05-20", createdAt: "2020-05-21T00:00:00.000Z" },
    { id: "d", occurredOn: "2020-05-20", createdAt: "2020-05-22T00:00:00.000Z" }
  ];
  const before = JSON.stringify(entries);
  const groups = groupJournalMonths(entries);
  assert.deepEqual(groups.map((group) => group.key), ["2020-06", "2020-05"]);
  assert.equal(groups[0].label, "2020年6月");
  assert.deepEqual(groups[1].events.map((event) => event.id), ["d", "c", "a"]);
  assert.equal(JSON.stringify(entries), before);
  assert.deepEqual(groupJournalMonths([]), []);
});

test("calendar uses a Monday-first grid and actual leap-year lengths", () => {
  const feb2020 = monthDays("2020-02");
  assert.equal(feb2020.indexOf("2020-02-01"), 5);
  assert.equal(feb2020.filter(Boolean).length, 29);
  assert.equal(feb2020.length % 7, 0);
  assert.equal(monthDays("2021-02").filter(Boolean).length, 28);
  assert.equal(monthDays("2021-02")[0], "2021-02-01");
  assert.equal(monthDays("2026-10").indexOf("2026-10-01"), 3);
  assert.equal(monthDays("2026-10").filter(Boolean).at(-1), "2026-10-31");
  assert.equal(monthDays("2026-04").filter(Boolean).length, 30);
});

test("calendar month navigation handles year boundaries without timezone drift", () => {
  assert.equal(shiftMonth("2020-12", 1), "2021-01");
  assert.equal(shiftMonth("2021-01", -1), "2020-12");
  assert.equal(shiftMonth("2020-03", -1), "2020-02");
  assert.equal(shiftMonth("0099-12", 1), "0100-01");
  assert.equal(monthLabel("2026-01"), "2026年1月");
  assert.equal(monthDays("0001-01").filter(Boolean)[0], "0001-01-01");
  assert.equal(monthDays("9999-12").filter(Boolean).at(-1), "9999-12-31");
});

test("calendar rejects invalid months and out-of-range navigation explicitly", () => {
  for (const month of ["", "2020-13", "2020-00", "2020-1", "0000-01", "abc"]) {
    assert.throws(() => monthDays(month), /月份/);
    assert.throws(() => monthLabel(month), /月份/);
    assert.throws(() => shiftMonth(month, 1), /月份/);
  }
  assert.throws(() => shiftMonth("0001-01", -1), /超出/);
  assert.throws(() => shiftMonth("9999-12", 1), /超出/);
});
