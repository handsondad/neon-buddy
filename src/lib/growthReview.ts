import {
  TOPICS, PERSPECTIVES, SOURCES, CHILD_RESPONSES, filterEvents,
  type GrowthEvent, type GrowthJournal, type RecordSource, type Topic
} from "./growth.ts";

export type ReviewScope = { from: string; to: string; topic: Topic | "" };
export type EvidenceField = "observation" | "childQuote" | "interpretation" | "support" | "question" | "perspective";
export type QuestionFocus = "all" | EvidenceField;

export const EVIDENCE_LABELS: Record<EvidenceField, string> = {
  observation: "记录的观察",
  childQuote: "孩子原话 · 记录者提供，未核实",
  interpretation: "记录者理解 · 待确认",
  support: "记录者提出的支持 · 未验证效果",
  question: "待问问题 · 不是孩子的回答",
  perspective: "后来补充的视角 · 身份未核实"
};

export interface Evidence {
  eventId: string;
  perspectiveId?: string;
  eventTitle: string;
  occurredOn: string;
  recordedAt: string;
  author: string;
  source: RecordSource;
  field: EvidenceField;
  label: string;
  text: string;
}

export interface PeriodReview {
  scope: ReviewScope;
  eventCount: number;
  eventsWithLaterPerspectives: number;
  topics: { topic: Topic; count: number }[];
  evidence: Evidence[];
}

export interface QuestionRequest {
  question: string;
  keyword: string;
  focus: QuestionFocus;
}

export interface EvidenceAnswer {
  status: "answered" | "insufficient" | "unsupported";
  message: string;
  totalMatches: number;
  evidence: Evidence[];
}

function scopeDate(value: string) {
  if (!value) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1 || !Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error("回顾日期无效，请填写有效的年月日。");
  }
}

export function validateReviewScope(scope: ReviewScope): void {
  scopeDate(scope.from);
  scopeDate(scope.to);
  if (scope.from && scope.to && scope.from > scope.to) throw new Error("回顾开始日期不能晚于结束日期。");
  if (scope.topic && !Object.prototype.hasOwnProperty.call(TOPICS, scope.topic)) throw new Error("回顾主题无效。");
}

export function eventEvidence(event: GrowthEvent): Evidence[] {
  const fields: Exclude<EvidenceField, "perspective">[] = [
    "observation", "childQuote", "interpretation", "support", "question"
  ];
  const evidence: Evidence[] = fields.filter((field) => event[field].trim()).map((field) => ({
    eventId: event.id, eventTitle: event.title, occurredOn: event.occurredOn,
    recordedAt: event.createdAt, author: event.observer, source: event.source,
    field, label: EVIDENCE_LABELS[field], text: event[field]
  }));
  return [...evidence, ...event.perspectives.map((item): Evidence => ({
    eventId: event.id, perspectiveId: item.id, eventTitle: event.title, occurredOn: event.occurredOn,
    recordedAt: item.createdAt, author: item.author, source: item.source,
    field: "perspective",
    label: `${PERSPECTIVES[item.kind]}${item.response ? ` · ${CHILD_RESPONSES[item.response]}` : ""} · 录入者提供，身份未核实`,
    text: item.content
  }))];
}

export function buildPeriodReview(journal: GrowthJournal, scope: ReviewScope): PeriodReview {
  validateReviewScope(scope);
  const events = filterEvents(journal.events, { ...scope, keyword: "" });
  return {
    scope: { ...scope },
    eventCount: events.length,
    eventsWithLaterPerspectives: events.filter((event) => event.perspectives.length > 0).length,
    topics: Object.keys(TOPICS).flatMap((key) => {
      const topic = key as Topic;
      const count = events.filter((event) => event.topic === topic).length;
      return count ? [{ topic, count }] : [];
    }),
    evidence: events.flatMap(eventEvidence)
  };
}

const UNSUPPORTED_QUESTION = /诊断|自闭|抑郁|多动|焦虑症|人格|性格|是不是|是否.{0,8}(?:病|障碍)|为什么|原因|未来|预测|会不会|证明|导致|疗效|好转|adhd|autis|diagnos|personality|predict|why\b|caus/i;

export function questionBoundary(request: QuestionRequest): EvidenceAnswer | null {
  if (!request.question.trim()) {
    return { status: "insufficient", message: "请先写下想回顾的问题。", totalMatches: 0, evidence: [] };
  }
  if (request.question.length > 500 || request.keyword.length > 100) {
    throw new Error("问题最多500字，检索关键词最多100字。");
  }
  if (request.focus !== "all" && !Object.prototype.hasOwnProperty.call(EVIDENCE_LABELS, request.focus)) {
    throw new Error("检索记录类型无效。");
  }
  if (UNSUPPORTED_QUESTION.test(request.question)) {
    return {
      status: "unsupported",
      message: "这些记录不能用于诊断、判定人格、解释因果或预测未来。可以改为查找具体经历、原话或不同视角；系统不会替孩子作出结论。",
      totalMatches: 0, evidence: []
    };
  }
  return null;
}

export function matchesEvidenceKeyword(
  keyword: string,
  event: Pick<GrowthEvent, "title" | "context" | "topic">,
  evidence: Pick<Evidence, "text" | "field" | "label">
): boolean {
  const search = keyword.trim().toLocaleLowerCase();
  return !search || [event.title, event.context, TOPICS[event.topic], evidence.text,
    evidence.field === "perspective" ? evidence.label : ""]
    .some((text) => text.toLocaleLowerCase().includes(search));
}

export function answerWithEvidence(evidence: Evidence[]): EvidenceAnswer {
  if (!evidence.length) {
    return {
      status: "insufficient",
      message: "当前范围和检索条件下没有可引用的记录。没有记录不代表没有发生，也不代表孩子没有这种感受；可以调整范围或补充真实经历。",
      totalMatches: 0, evidence: []
    };
  }
  return {
    status: "answered",
    message: "以下仅为当前范围内的原文摘录，不是对问题的推断性回答。关键词只做字面匹配，不理解同义表达，也不能据此确认行为变化或支持效果。",
    totalMatches: evidence.length,
    evidence
  };
}

export function answerFromRecords(journal: GrowthJournal, scope: ReviewScope, request: QuestionRequest): EvidenceAnswer {
  const review = buildPeriodReview(journal, scope);
  const boundary = questionBoundary(request);
  if (boundary) return boundary;
  const events = new Map(journal.events.map((event) => [event.id, event]));
  const evidence = review.evidence.filter((item) => (request.focus === "all" || item.field === request.focus)
    && matchesEvidenceKeyword(request.keyword, events.get(item.eventId)!, item));
  return answerWithEvidence(evidence);
}

export function eventAnchor(eventId: string): string {
  return `growth-event-${encodeURIComponent(eventId)}`;
}

export function formatReviewMarkdown(review: PeriodReview): string {
  const range = `${review.scope.from || "最早记录"} 至 ${review.scope.to || "最新记录"}`;
  const lines = [
    "# 成长记录阶段回顾", "",
    `范围：${range}；主题：${review.scope.topic ? TOPICS[review.scope.topic] : "全部主题"}。`,
    `共 ${review.eventCount} 段记录，其中 ${review.eventsWithLaterPerspectives} 段有后补视角。`,
    "仅为档案摘录，不是心理评估；记录数量不是行为频率，未验证任何支持效果。", ""
  ];
  for (const [index, item] of review.evidence.entries()) {
    lines.push(
      `## 依据 ${index + 1}`, "",
      `事件：${JSON.stringify(item.eventTitle)}；发生日期：${item.occurredOn}。`,
      `事件ID：${JSON.stringify(item.eventId)}${item.perspectiveId ? `；视角ID：${JSON.stringify(item.perspectiveId)}` : ""}。`,
      `来源：${item.label}；作者（未核实）：${JSON.stringify(item.author)}；${SOURCES[item.source]}；录入于：${item.recordedAt}。`, "",
      ...item.text.split(/\r?\n/).map((line) => `> ${line}`), ""
    );
  }
  if (!review.eventCount) lines.push("此范围没有记录，不作推测。", "");
  lines.push("导出的文件不会随应用内删除自动更新，请妥善保管或自行删除。");
  return lines.join("\n");
}
