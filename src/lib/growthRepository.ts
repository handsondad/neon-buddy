import { emptyJournal, parseJournal, validateJournal, type GrowthJournal } from "./growth.ts";

const PREFIX = "neon_buddy_growth_mirror_v1:";
export const MAX_BACKUP_SIZE = 5_000_000;

export interface JournalSnapshot {
  journal: GrowthJournal;
  revision: string | null;
}

export interface JournalInspection {
  snapshot: JournalSnapshot | null;
  revision: string | null | undefined;
  error: string;
}

type JournalStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function spaceId(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,24}$/.test(normalized)) {
    throw new Error("空间ID须为2–24位英文字母、数字、下划线或连字符。");
  }
  return normalized;
}

export function journalStorageKey(space: string): string {
  return `${PREFIX}${spaceId(space)}`;
}

export function readJournal(storage: JournalStorage, space: string): JournalSnapshot {
  const revision = storage.getItem(journalStorageKey(space));
  return { journal: revision === null ? emptyJournal() : parseJournal(revision), revision };
}

export function inspectJournal(storage: JournalStorage, space: string): JournalInspection {
  let revision: string | null | undefined;
  try {
    revision = storage.getItem(journalStorageKey(space));
    const journal = revision === null ? emptyJournal() : parseJournal(revision);
    return { snapshot: { journal, revision }, revision, error: "" };
  } catch (error) {
    return { snapshot: null, revision, error: `无法读取档案，已停止写入以保护原数据。${errorMessage(error)}` };
  }
}

export function journalChanged(storage: JournalStorage, space: string, revision: string | null): boolean {
  return storage.getItem(journalStorageKey(space)) !== revision;
}

export function serializeBackup(journal: GrowthJournal): string {
  const content = JSON.stringify(validateJournal(journal));
  if (new TextEncoder().encode(content).byteLength > MAX_BACKUP_SIZE) {
    throw new Error("档案超过5MB，未写入。请先下载原始副本，并将资料分空间保存，保证备份可恢复。");
  }
  return content;
}

export function writeJournal(
  storage: JournalStorage, space: string, journal: GrowthJournal, expectedRevision: string | null
): JournalSnapshot {
  const revision = serializeBackup(journal);
  const key = journalStorageKey(space);
  if (storage.getItem(key) !== expectedRevision) {
    throw new Error("此空间已在其他窗口发生变化。请先复制未保存内容，再重新载入，避免覆盖他人的记录。");
  }
  storage.setItem(key, revision);
  return { journal: parseJournal(revision), revision };
}

export function clearJournal(storage: JournalStorage, space: string, expectedRevision: string | null): JournalSnapshot {
  const key = journalStorageKey(space);
  if (storage.getItem(key) !== expectedRevision) {
    throw new Error("此空间已在其他窗口发生变化，请重新载入后再清空。");
  }
  storage.removeItem(key);
  return { journal: emptyJournal(), revision: null };
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败，请保留当前输入并检查浏览器存储设置。";
}
