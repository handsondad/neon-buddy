import test from "node:test";
import assert from "node:assert/strict";
import { buildGroups, COMPACT, layoutLine, LINE, neighbors, sagAt, sizeFor, visibleSlots } from "../src/pages/timeline.ts";
import { ageRange, bandOf, monthsText } from "../src/qa/vocab.ts";
import { RECORDS } from "../src/records/index.ts";

const rec = (id, from, to) => ({ id, age: { from, to } });

test("月龄写法", () => {
  assert.equal(monthsText(8), "8个月");
  assert.equal(monthsText(12), "1岁");
  assert.equal(monthsText(18), "1岁半");
  assert.equal(monthsText(27), "2岁3个月");
  assert.equal(ageRange({ from: 0 }), "刚出生起");
  assert.equal(ageRange({ from: 8, to: 36 }), "8个月–3岁");
  assert.equal(ageRange({ from: 36 }), "3岁起");
});

test("按常在几岁冒出来分组，组里从小到大", () => {
  assert.equal(bandOf(0).key, "under-1");
  assert.equal(bandOf(11).key, "under-1");
  assert.equal(bandOf(12).key, "age-1");
  assert.equal(bandOf(47).key, "age-3");
  assert.equal(bandOf(60).key, "age-4");
  assert.equal(bandOf(84).key, "age-6");
  const groups = buildGroups([rec("c", 30), rec("a", 8, 36), rec("b", 8, 18), rec("d", 14)]);
  assert.deepEqual(groups.map((g) => g.key), ["under-1", "age-1", "age-2"]);
  assert.deepEqual(groups[0].records.map((r) => r.id), ["b", "a"]);
});

test("一次只展开一个年纪：旗子后面跟着那个年纪的事", () => {
  const groups = buildGroups([rec("a", 6), rec("b", 14), rec("c", 18)]);
  assert.deepEqual(visibleSlots(groups, null).map((s) => s.kind), ["bundle", "bundle"]);
  const open = visibleSlots(groups, "age-1");
  assert.deepEqual(open.map((s) => (s.kind === "record" ? s.record.id : s.kind)), ["bundle", "flag", "b", "c"]);
});

test("挂件不重叠，高度跟着绳子走，中间垂得最低", () => {
  const groups = buildGroups(RECORDS);
  for (const size of [LINE, COMPACT]) {
    for (const g of groups) {
      const { items, width } = layoutLine(visibleSlots(groups, g.key), 0, size);
      for (let i = 1; i < items.length; i++) assert.ok(items[i].x > items[i - 1].x + size.flagW / 2);
      for (const it of items) assert.ok(it.x > 0 && it.x < width && it.y >= 0 && it.y <= size.sag + 1e-9);
    }
  }
  const w = 1000;
  assert.ok(sagAt(w / 2, w) > sagAt(100, w));
  assert.ok(Math.abs(sagAt(w / 2, w) - LINE.sag) < 1);
  assert.equal(sizeFor(390), COMPACT);
  assert.equal(sizeFor(1000), LINE);
});

test("框比挂件宽时整串居中", () => {
  const groups = buildGroups([rec("a", 6)]);
  const { items, width } = layoutLine(visibleSlots(groups, null), 1000);
  assert.equal(width, 1000);
  assert.equal(items[0].x, 500);
});

test("上一件下一件按年龄先后", () => {
  const list = [rec("b", 12), rec("a", 6), rec("c", 24)];
  assert.deepEqual(neighbors(list, "b"), { prev: list[1], next: list[2], index: 2, total: 3 });
  assert.equal(neighbors(list, "a").prev, undefined);
  assert.equal(neighbors(list, "x").index, 0);
});
