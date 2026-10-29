export const TOPICS = {
  emotion: "情绪与调节",
  relationships: "同伴与关系",
  autonomy: "自主与表达",
  curiosity: "兴趣与探索",
  persistence: "坚持与调整",
  everyday: "日常与快乐"
} as const;

export const PERSPECTIVES = {
  child: "孩子视角",
  adult: "成人视角",
  correction: "更正／不同理解"
} as const;

export const SOURCES = { observed: "亲眼观察／直接表达", reported: "他人转述" } as const;
export const CHILD_RESPONSES = {
  agree: "孩子表示认可这段记录",
  disagree: "孩子表示有不同理解",
  skip: "孩子选择暂不回答"
} as const;
export type ChildResponse = keyof typeof CHILD_RESPONSES;
export type Topic = keyof typeof TOPICS;
export type PerspectiveKind = keyof typeof PERSPECTIVES;
export type RecordSource = keyof typeof SOURCES;

export interface Perspective {
  id: string;
  kind: PerspectiveKind;
  author: string;
  source: RecordSource;
  content: string;
  response?: ChildResponse;
  createdAt: string;
}

export interface GrowthEvent {
  id: string;
  occurredOn: string;
  createdAt: string;
  title: string;
  topic: Topic;
  context: string;
  observation: string;
  observer: string;
  source: RecordSource;
  childQuote: string;
  interpretation: string;
  support: string;
  question: string;
  perspectives: Perspective[];
}

export interface GrowthJournal {
  schemaVersion: 1;
  childName: string;
  events: GrowthEvent[];
  understandings?: GrowthUnderstanding[];
}

export interface GrowthUnderstanding {
  id: string;
  topic: Topic;
  from: string;
  to: string;
  author: string;
  statement: string;
  alternative: string;
  question: string;
  support: string;
  evidenceIds: string[];
  counterEvidenceIds: string[];
  status: "exploring" | "working";
  createdAt: string;
  supersedes?: string;
}

export interface EventFilters {
  keyword: string;
  topic: Topic | "";
  from: string;
  to: string;
}

export function emptyJournal(): GrowthJournal {
  return { schemaVersion: 1, childName: "", events: [] };
}

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("档案结构无效，应为对象。");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, required = false, max = 8000): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    throw new Error(`${label}无效${required ? "或未填写" : ""}（最多${max}字）。`);
  }
  return value;
}

function member<T extends string>(value: unknown, options: Record<T, string>, label: string): T {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(options, value)) {
    throw new Error(`${label}无效。`);
  }
  return value as T;
}

function dateOnly(value: unknown): string {
  const date = text(value, "事件日期", true, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number(date.slice(0, 4)) < 1 || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error("事件日期必须是有效的年月日。");
  }
  if (date > localDate()) throw new Error("真实事件不能使用未来日期。");
  return date;
}

function timestamp(value: unknown): string {
  const result = text(value, "记录时间", true, 24);
  if (!Number.isFinite(Date.parse(result)) || new Date(result).toISOString() !== result) {
    throw new Error("记录时间必须是ISO时间。");
  }
  return result;
}

function identifier(value: unknown, ids: Set<string>): string {
  const id = text(value, "记录标识", true, 100);
  if (ids.has(id)) throw new Error("档案包含重复的记录标识。");
  ids.add(id);
  return id;
}

export function validateJournal(value: unknown): GrowthJournal {
  const root = object(value);
  if (root.schemaVersion !== 1) throw new Error("不支持此档案版本，请保留原文件。");
  if (!Array.isArray(root.events) || root.events.length > 10000) {
    throw new Error("事件列表无效或超过10000条。");
  }
  const ids = new Set<string>();
  const events = root.events.map((value): GrowthEvent => {
    const item = object(value);
    if (!Array.isArray(item.perspectives) || item.perspectives.length > 1000) {
      throw new Error("视角列表无效或超过1000条。");
    }
    return {
      id: identifier(item.id, ids),
      occurredOn: dateOnly(item.occurredOn),
      createdAt: timestamp(item.createdAt),
      title: text(item.title, "标题", true, 100),
      topic: member(item.topic, TOPICS, "主题"),
      context: text(item.context, "情境"),
      observation: text(item.observation, "观察事实", true),
      observer: text(item.observer, "记录者", true, 60),
      source: member(item.source, SOURCES, "事件来源"),
      childQuote: text(item.childQuote, "孩子原话"),
      interpretation: text(item.interpretation, "记录者理解"),
      support: text(item.support, "可尝试的支持"),
      question: text(item.question, "待问问题"),
      perspectives: item.perspectives.map((value): Perspective => {
        const perspective = object(value);
        const kind = member(perspective.kind, PERSPECTIVES, "视角类型");
        const response = perspective.response === undefined
          ? undefined : member(perspective.response, CHILD_RESPONSES, "孩子参与选择");
        if (response && kind !== "child") throw new Error("孩子参与选择只能用于孩子视角。");
        if (response === "skip" && perspective.content !== "") throw new Error("暂不回答时不保存表达内容。");
        return {
          id: identifier(perspective.id, ids),
          kind,
          author: text(perspective.author, "视角作者", true, 60),
          source: member(perspective.source, SOURCES, "视角来源"),
          content: text(perspective.content, "视角内容", !response),
          ...(response ? { response } : {}),
          createdAt: timestamp(perspective.createdAt)
        };
      })
    };
  });
  const result: GrowthJournal = { schemaVersion: 1, childName: text(root.childName, "昵称", false, 60), events };
  if (root.understandings !== undefined) {
    if (!Array.isArray(root.understandings) || root.understandings.length > 500) throw new Error("阶段理解列表无效或超过500项。");
    const eventIds = new Set(events.map((event) => event.id));
    const previous = new Map<string, GrowthUnderstanding>();
    const superseded = new Set<string>();
    result.understandings = root.understandings.map((value): GrowthUnderstanding => {
      const item = object(value);
      const references = (value: unknown): string[] => {
        if (!Array.isArray(value) || value.length > 100 || value.some((id) => typeof id !== "string" || !eventIds.has(id))
          || new Set(value).size !== value.length) throw new Error("阶段理解引用无效、重复或原经历已不存在。");
        return value;
      };
      const evidenceIds = references(item.evidenceIds);
      const counterEvidenceIds = references(item.counterEvidenceIds);
      const from = dateOnly(item.from);
      const to = dateOnly(item.to);
      if (from > to) throw new Error("阶段理解起止日期无效。");
      if (!evidenceIds.length || evidenceIds.some((id) => counterEvidenceIds.includes(id))) throw new Error("至少选择一项依据，且同一经历不能同时作为依据和反例。");
      if (events.some((event) => [...evidenceIds, ...counterEvidenceIds].includes(event.id) && (event.occurredOn < from || event.occurredOn > to))) {
        throw new Error("阶段理解引用超出其时间范围。");
      }
      const topic = member(item.topic, TOPICS, "理解主题");
      const supersedes = item.supersedes === undefined ? undefined : text(item.supersedes, "旧版本标识", true, 100);
      if (supersedes && (!previous.has(supersedes) || previous.get(supersedes)?.topic !== topic || superseded.has(supersedes))) {
        throw new Error("阶段理解只能修订同主题的已有最新版本。");
      }
      const understanding: GrowthUnderstanding = {
        id: identifier(item.id, ids), topic, from, to, evidenceIds, counterEvidenceIds,
        author: text(item.author, "理解作者", true, 60),
        statement: text(item.statement, "阶段理解", true),
        alternative: text(item.alternative, "其他解释", true),
        question: text(item.question, "待核实问题", true),
        support: text(item.support, "支持尝试"),
        status: member(item.status, { exploring: "探索中", working: "当前工作理解" }, "理解状态"),
        createdAt: timestamp(item.createdAt),
        ...(supersedes ? { supersedes } : {})
      };
      previous.set(understanding.id, understanding);
      if (supersedes) superseded.add(supersedes);
      return understanding;
    });
  }
  return result;
}

export function parseJournal(raw: string): GrowthJournal {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("档案不是有效的JSON文件。原始数据未被覆盖。");
  }
  return validateJournal(value);
}

export function filterEvents(events: GrowthEvent[], filters: EventFilters): GrowthEvent[] {
  const keyword = filters.keyword.trim().toLocaleLowerCase();
  return events.filter((event) => {
    const searchable = [
      event.title, event.context, event.observation, event.observer, event.childQuote,
      event.interpretation, event.support, event.question, TOPICS[event.topic],
      ...event.perspectives.flatMap((item) => [item.author, item.content, PERSPECTIVES[item.kind], item.response ? CHILD_RESPONSES[item.response] : ""])
    ].join("\n").toLocaleLowerCase();
    return (!keyword || searchable.includes(keyword))
      && (!filters.topic || event.topic === filters.topic)
      && (!filters.from || event.occurredOn >= filters.from)
      && (!filters.to || event.occurredOn <= filters.to);
  }).sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt));
}

export function appendPerspective(journal: GrowthJournal, eventId: string, perspective: Perspective): GrowthJournal {
  if (!journal.events.some((event) => event.id === eventId)) throw new Error("找不到要补充的事件，请重新载入。");
  return validateJournal({
    ...journal,
    events: journal.events.map((event) => event.id === eventId
      ? { ...event, perspectives: [...event.perspectives, perspective] }
      : event)
  });
}

export function removeEvent(journal: GrowthJournal, eventId: string): GrowthJournal {
  if (!journal.events.some((event) => event.id === eventId)) throw new Error("找不到要删除的事件，请重新载入。");
  const removed = new Set(journal.understandings?.filter((item) => item.evidenceIds.includes(eventId) || item.counterEvidenceIds.includes(eventId)).map((item) => item.id));
  for (const item of journal.understandings || []) {
    if (item.supersedes && removed.has(item.supersedes)) removed.add(item.id);
  }

  return {
    ...journal, events: journal.events.filter((event) => event.id !== eventId),
    ...(journal.understandings ? { understandings: journal.understandings.filter((item) => !removed.has(item.id)) } : {})
  };
}

export function removeUnderstanding(journal: GrowthJournal, id: string): GrowthJournal {
  if (!journal.understandings?.some((item) => item.id === id)) throw new Error("找不到这份阶段理解，请重新载入。");
  const removed = new Set([id]);
  for (const item of journal.understandings) {
    if (item.supersedes && removed.has(item.supersedes)) removed.add(item.id);
  }
  return { ...journal, understandings: journal.understandings.filter((item) => !removed.has(item.id)) };
}
