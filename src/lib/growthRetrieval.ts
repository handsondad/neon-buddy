import { filterEvents, type GrowthJournal, type Topic } from "./growth.ts";
import {
  answerWithEvidence, buildPeriodReview, matchesEvidenceKeyword, questionBoundary,
  type Evidence, type EvidenceAnswer, type EvidenceField, type QuestionRequest, type ReviewScope
} from "./growthReview.ts";

export interface EvidenceReference {
  eventId: string;
  field: EvidenceField;
  perspectiveId?: string;
}

export interface RetrievalDocument {
  reference: Readonly<EvidenceReference>;
  title: string;
  context: string;
  topic: Topic;
  text: string;
  label: string;
}

export interface RetrievalInput {
  keyword: string;
  documents: readonly Readonly<RetrievalDocument>[];
}

export interface RetrievalService {
  readonly id: string;
  readonly label: string;
  readonly matching: "literal" | "semantic";
  retrieve(input: RetrievalInput, signal: AbortSignal): Promise<unknown>;
}

export const localRetrieval: RetrievalService = {
  id: "local-literal-v1",
  label: "浏览器本地 · 字面检索",
  matching: "literal",
  async retrieve(input, signal) {
    signal.throwIfAborted();
    return {
      references: input.documents.filter((item) => matchesEvidenceKeyword(input.keyword, item, {
        text: item.text, label: item.label, field: item.reference.field
      })).map((item) => ({ ...item.reference }))
    };
  }
};

function referenceKey(reference: EvidenceReference): string {
  return JSON.stringify([reference.eventId, reference.field, reference.perspectiveId ?? null]);
}

function resolveReferences(value: unknown, evidence: Evidence[]): Evidence[] {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.keys(value).length !== 1 || !("references" in value) || !Array.isArray(value.references)
    || value.references.length > evidence.length) {
    throw new Error("检索服务返回格式无效；只允许返回本次素材中的引用。");
  }
  const available = new Map(evidence.map((item) => [referenceKey(item), item]));
  const seen = new Set<string>();
  return value.references.map((reference: unknown) => {
    if (!reference || typeof reference !== "object" || Array.isArray(reference)
      || !("eventId" in reference) || typeof reference.eventId !== "string"
      || !("field" in reference) || typeof reference.field !== "string"
      || ("perspectiveId" in reference && typeof reference.perspectiveId !== "string")
      || Object.keys(reference).some((key) => !["eventId", "field", "perspectiveId"].includes(key))) {
      throw new Error("检索服务引用格式无效，不能返回改写的原文或来源。");
    }
    const key = JSON.stringify([reference.eventId, reference.field, "perspectiveId" in reference ? reference.perspectiveId : null]);
    const original = available.get(key);
    if (!original) throw new Error("检索服务引用了未选择、超出范围或不存在的素材。");
    if (seen.has(key)) throw new Error("检索服务返回了重复引用。");
    seen.add(key);
    return { ...original };
  });
}

async function cancellable<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  let onAbort: () => void = () => {};
  const cancelled = new Promise<never>((_, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
  try {
    return await Promise.race([operation, cancelled]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}

export async function retrieveFromRecords(
  journal: GrowthJournal,
  scope: ReviewScope,
  request: QuestionRequest,
  selectedIds: readonly string[],
  { service = localRetrieval, signal }: { service?: RetrievalService; signal: AbortSignal }
): Promise<EvidenceAnswer> {
  signal.throwIfAborted();
  const review = buildPeriodReview(journal, scope);
  if (!selectedIds.length) throw new Error("请先选择至少一段参与检索的经历。");
  const events = filterEvents(journal.events, { ...scope, keyword: "" });
  const selected = new Set(selectedIds);
  const availableIds = new Set(events.map((event) => event.id));
  if (selected.size !== selectedIds.length || selectedIds.some((id) => !availableIds.has(id))) {
    throw new Error("检索素材包含重复、已删除或超出当前回顾范围的经历，请重新选择。");
  }
  const boundary = questionBoundary(request);
  if (boundary) return boundary;
  const evidence = review.evidence.filter((item) => selected.has(item.eventId)
    && (request.focus === "all" || item.field === request.focus)).map((item) => ({ ...item }));
  if (!evidence.length) return answerWithEvidence([]);
  const eventMap = new Map(events.map((event) => [event.id, event]));
  const documents = evidence.map((item): RetrievalDocument => {
    const event = eventMap.get(item.eventId)!;
    return {
      reference: { eventId: item.eventId, field: item.field, ...(item.perspectiveId ? { perspectiveId: item.perspectiveId } : {}) },
      title: event.title, context: event.context, topic: event.topic, text: item.text, label: item.label
    };
  });
  // The service chooses references; displayed text and attribution always come from our snapshot.
  const raw = await cancellable(service.retrieve({ keyword: request.keyword.trim(), documents }, signal), signal);
  signal.throwIfAborted();
  const answer = answerWithEvidence(resolveReferences(raw, evidence));
  if (answer.status === "answered" && service.matching === "semantic") {
    answer.message = "以下为所选素材中的原文引用，由检索服务筛选；不是推断性回答，也不证明因果、人格或支持效果。";
  }
  return answer;
}
