/**
 * 首页的晾衣绳：按这件事常在几岁冒出来分组（1岁前 → 1岁多 → … → 6岁起），点一个年龄牌子展开，后面挂着那个年纪的一件件事。
 * 和《小念的画廊》《小念家的漫画书》首页是同一根绳子：两头高、中间垂下去，挂件的高度跟着绳子走，比屏幕长就左右滑。
 */
import type { QaRecord } from "../qa/types.ts";
import { AGE_BANDS, bandOf } from "../qa/vocab.ts";

export type LineSize = {
  readonly tagW: number;
  readonly bundleW: number;
  readonly flagW: number;
  readonly gap: number;
  /** 两头留给立杆 */
  readonly pad: number;
  /** 绳子中间垂下多少 */
  readonly sag: number;
  /** 绳子两头的高度 */
  readonly top: number;
  /** 整根绳子连挂件有多高 */
  readonly rowH: number;
};

export const LINE: LineSize = { tagW: 132, bundleW: 140, flagW: 88, gap: 22, pad: 64, sag: 36, top: 28, rowH: 300 };
/** 手机上挂件小一号 */
export const COMPACT: LineSize = { tagW: 104, bundleW: 108, flagW: 72, gap: 14, pad: 40, sag: 24, top: 24, rowH: 250 };
export const sizeFor = (room: number): LineSize => (room > 0 && room < 560 ? COMPACT : LINE);

const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5];
const COLORS = ["#ffe3c2", "#d9ecff", "#dff5e8", "#ffe0ea", "#efe4ff", "#fff2b8"];

/** 先按常在几个月冒出来，再按大多到几个月过去 */
export const byAge = (a: QaRecord, b: QaRecord) =>
  a.age.from - b.age.from || (a.age.to ?? 999) - (b.age.to ?? 999) || a.id.localeCompare(b.id);

/** 绳子在横坐标 x 处垂下多少（0 是两头的高度） */
export function sagAt(x: number, width: number, size: LineSize = LINE): number {
  const t = Math.min(1, Math.max(0, (x - size.pad / 2) / (width - size.pad)));
  return 4 * size.sag * t * (1 - t);
}

export type Group = {
  /** 「under-1」「age-2」 */
  readonly key: string;
  /** 「1岁前」「2岁多」 */
  readonly name: string;
  /** 从早到晚 */
  readonly records: readonly QaRecord[];
};

export function buildGroups(records: readonly QaRecord[]): Group[] {
  const sorted = [...records].sort(byAge);
  return AGE_BANDS.map((band) => ({ key: band.key, name: band.name, records: sorted.filter((r) => bandOf(r.age.from) === band) }))
    .filter((g) => g.records.length);
}

export type Slot =
  | { readonly kind: "bundle"; readonly group: Group }
  | { readonly kind: "flag"; readonly group: Group }
  | { readonly kind: "record"; readonly record: QaRecord };

/** 展开的那个年纪挂一面旗，后面跟着它里面的事；别的年纪收成一个牌子。一次只开一个 */
export function visibleSlots(groups: readonly Group[], open: string | null): Slot[] {
  return groups.flatMap((group): Slot[] =>
    group.key === open ? [{ kind: "flag", group }, ...group.records.map((record): Slot => ({ kind: "record", record }))] : [{ kind: "bundle", group }]);
}

export const groupOf = (groups: readonly Group[], id: string) => groups.find((g) => g.records.some((r) => r.id === id));

export type LineItem = { readonly slot: Slot; readonly x: number; readonly y: number; readonly tilt: number; readonly color: string };

/**
 * room：框有多宽；框比挂件宽时绳子拉满，挂件之间稍微松一点，整串居中，不会散得太开。
 */
export function layoutLine(slots: readonly Slot[], room = 0, size: LineSize = LINE): { items: LineItem[]; width: number } {
  const widthOf = (s: Slot) => (s.kind === "bundle" ? size.bundleW : s.kind === "flag" ? size.flagW : size.tagW);
  const content = slots.reduce((sum, s) => sum + widthOf(s), 0) + size.gap * Math.max(0, slots.length - 1);
  const width = Math.max(room, content + size.pad * 2);
  const free = width - size.pad * 2 - content;
  const extra = Math.min(free / (slots.length + 1), size.tagW / 2);

  let left = size.pad + (free - extra * Math.max(0, slots.length - 1)) / 2;
  const items = slots.map((slot, i): LineItem => {
    const x = left + widthOf(slot) / 2;
    left += widthOf(slot) + size.gap + extra;
    return { slot, x, y: sagAt(x, width, size), tilt: TILTS[i % TILTS.length], color: COLORS[i % COLORS.length] };
  });
  return { items, width };
}

/** 上一件、下一件和第几件：按年龄先后 */
export function neighbors(records: readonly QaRecord[], id: string): { prev?: QaRecord; next?: QaRecord; index: number; total: number } {
  const sorted = [...records].sort(byAge);
  const i = sorted.findIndex((r) => r.id === id);
  if (i < 0) return { index: 0, total: sorted.length };
  return { prev: sorted[i - 1], next: sorted[i + 1], index: i + 1, total: sorted.length };
}
