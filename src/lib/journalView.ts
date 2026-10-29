import type { GrowthEvent } from "./growth.ts";

export interface JournalMonth {
  key: string;
  label: string;
  events: GrowthEvent[];
}

export function groupJournalMonths(events: GrowthEvent[]): JournalMonth[] {
  const groups = new Map<string, JournalMonth>();
  const sorted = [...events].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt));
  for (const event of sorted) {
    const key = event.occurredOn.slice(0, 7);
    if (!groups.has(key)) groups.set(key, { key, label: monthLabel(key), events: [] });
    groups.get(key)!.events.push(event);
  }
  return [...groups.values()];
}

export function monthLabel(month: string): string {
  validateMonth(month);
  return `${month.slice(0, 4)}年${Number(month.slice(5))}月`;
}

function validateMonth(month: string): void {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || Number(month.slice(0, 4)) < 1) {
    throw new Error("月份无效。");
  }
}

export function monthDays(month: string): (string | null)[] {
  validateMonth(month);
  const first = new Date(`${month}-01T12:00:00Z`);
  const year = first.getUTCFullYear();
  const next = new Date(first);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(0);
  const days = next.getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const values: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= days; day++) values.push(`${String(year).padStart(4, "0")}-${month.slice(5)}-${String(day).padStart(2, "0")}`);
  while (values.length % 7) values.push(null);
  return values;
}

export function shiftMonth(month: string, delta: number): string {
  validateMonth(month);
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  const year = date.getUTCFullYear();
  if (year < 1 || year > 9999) throw new Error("月份已超出支持范围。");
  return `${String(year).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
