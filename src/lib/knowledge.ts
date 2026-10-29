import { DOMAINS, FAMILIARITY, SETTINGS, SIGNALS, SOURCE_KINDS, THEORIES, type DomainId, type SignalId, type TheoryId } from "./knowledgeFramework.ts";
import { scienceCard } from "./scienceCards.ts";

export interface Writer { name: string; tool: string }
export interface KnowledgeSource {
  id: string; kind: keyof typeof SOURCE_KINDS; reporter: string; capturedAt: string;
  content: string; recordedBy: Writer;
}
export interface Observation {
  id: string; sourceId: string; sourceExcerpt: string;
  sourceLocator?: { start: number; end: number };
  occurredOn: string | null; recordedAt: string; domains: DomainId[];
  context: {
    setting: keyof typeof SETTINGS; familiarity: keyof typeof FAMILIARITY;
    activity: string | null; people: string | null; antecedent: string | null;
    response: string | null; outcome: string | null;
  };
  behavior: string;
  signals: { code: SignalId; excerpt: string }[];
  childExpression: { text: string; fidelity: "verbatim" | "recalled" | "paraphrase" } | null;
  recordedBy: Writer;
  supersedes: string | null;
}
export interface AgentAnalysis {
  id: string; domain: DomainId; title: string; question: string; claim: string; conditions: string;
  alternatives: string[]; limitations: string[]; followUps: string[];
  supportingIds: string[]; counterIds: string[]; theoryIds: TheoryId[];
  generatedAt: string; generatedBy: Writer;
  basedOnRevision: number; supersedes: string | null;
}
export interface KnowledgeBase {
  schemaVersion: "1.0"; revision: number; updatedAt: string | null;
  child: { id: string; alias: string; birthMonth: string | null };
  sources: KnowledgeSource[]; observations: Observation[]; analyses: AgentAnalysis[];
  topics?: ResearchTopic[];
  runs?: ResearchRun[];
}
export interface ResearchTopic {
  id: string; title: string; question: string; domain: DomainId;
  scope: string; status: "open" | "paused" | "closed";
  cardRefs: { id: string; version: number }[];
  createdAt: string; createdBy: Writer; supersedes: string | null;
}
export interface ResearchRun {
  id: string; topicId: string; inputRevision: number;
  status: "completed" | "insufficient" | "cancelled";
  readObservationIds: string[]; outputAnalysisIds: string[];
  cardRefs: { id: string; version: number }[];
  comparison: string; counterSearch: string; limitations: string[];
  changeReason: string; finishedAt: string; performedBy: Writer;
}
export interface KnowledgeBatch {
  schemaVersion: "1.0"; expectedRevision: number; writer: Writer;
  child?: KnowledgeBase["child"];
  sources: KnowledgeSource[]; observations: Observation[];
  analyses: Omit<AgentAnalysis, "basedOnRevision">[];
  deleteObservationIds: string[];
  deleteSourceIds: string[];
  deleteAnalysisIds: string[];
  topics?: ResearchTopic[];
  runs?: ResearchRun[];
  deleteTopicIds?: string[];
  deleteRunIds?: string[];
}
export const MAX_KNOWLEDGE_BYTES = 10_000_000;
export function emptyKnowledge(): KnowledgeBase {
  return { schemaVersion: "1.0", revision: 0, updatedAt: null, child: { id: "local-child", alias: "", birthMonth: null }, sources: [], observations: [], analyses: [] };
}
function obj(input: unknown, fields: readonly string[], label: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error(`${label}必须是对象。`);
  const result = input as Record<string, unknown>;
  if (Object.keys(result).some((key) => !fields.includes(key))) throw new Error(`${label}包含未约定字段，请先更新契约而不是静默丢弃。`);
  return result;
}
function str(value: unknown, label: string, max = 8000, empty = false): string {
  if (typeof value !== "string" || value.length > max || (!empty && !value.trim())) throw new Error(`${label}必须为${empty ? "可空" : "非空"}文本，最多${max}字。`);
  return value;
}
function nullable(value: unknown, label: string): string | null {
  return value === null ? null : str(value, label);
}
function id(value: unknown): string {
  const result = str(value, "ID", 80);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(result)) throw new Error("ID只允许英文字母、数字、下划线和连字符。");
  return result;
}
function integer(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`${label}必须是非负安全整数。`);
  return value;
}
function list<T>(value: unknown, parse: (item: unknown) => T, label: string, max: number, min = 0): T[] {
  if (!Array.isArray(value) || value.length > max || value.length < min) throw new Error(`${label}需要${min}–${max}项。`);
  return value.map(parse);
}
function unique<T>(values: T[], label: string): T[] {
  if (new Set(values).size !== values.length) throw new Error(`${label}不能重复。`);
  return values;
}
function member<T extends string>(value: unknown, values: Record<T, unknown>, label: string): T {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(values, value)) throw new Error(`${label}不在约定词表中。`);
  return value as T;
}
export function knowledgeDate(value: unknown): string {
  const date = str(value, "发生日期", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "0001-01-01"
    || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error("日期须为有效的YYYY-MM-DD；未知日期请用null，不猜测到某一天。");
  }
  const today = new Date();
  const current = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (date > current) throw new Error("真实材料不能使用未来发生日期。");
  return date;
}
function timestamp(value: unknown): string {
  const result = str(value, "录入／分析时间", 24);
  if (!Number.isFinite(Date.parse(result)) || new Date(result).toISOString() !== result || Date.parse(result) > Date.now() + 300_000) throw new Error("时间须为非未来的ISO UTC时间。");
  return result;
}
function writer(value: unknown): Writer {
  const input = obj(value, ["name", "tool"], "写入者");
  return { name: str(input.name, "写入者名称", 100), tool: str(input.tool, "Agent工具／模型说明", 200) };
}
function child(value: unknown): KnowledgeBase["child"] {
  const input = obj(value, ["id", "alias", "birthMonth"], "孩子信息");
  let month: string | null = null;
  if (input.birthMonth !== null) {
    month = str(input.birthMonth, "出生年月", 7);
    knowledgeDate(`${month}-01`);
    if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("出生年月须为YYYY-MM或null。");
  }
  return { id: id(input.id), alias: str(input.alias, "称呼", 60, true), birthMonth: month };
}
function source(value: unknown): KnowledgeSource {
  const input = obj(value, ["id", "kind", "reporter", "capturedAt", "content", "recordedBy"], "来源");
  return {
    id: id(input.id), kind: member(input.kind, SOURCE_KINDS, "来源类别"),
    reporter: str(input.reporter, "报告者", 100), capturedAt: timestamp(input.capturedAt),
    content: str(input.content, "来源原文", 50000), recordedBy: writer(input.recordedBy)
  };
}
function observation(value: unknown): Observation {
  const input = obj(value, ["id", "sourceId", "sourceExcerpt", "sourceLocator", "occurredOn", "recordedAt", "domains", "context", "behavior", "signals", "childExpression", "recordedBy", "supersedes"], "观察");
  const context = obj(input.context, ["setting", "familiarity", "activity", "people", "antecedent", "response", "outcome"], "情境");
  const expression = input.childExpression === null ? null : obj(input.childExpression, ["text", "fidelity"], "孩子表达");
  const locator = input.sourceLocator === undefined ? null : obj(input.sourceLocator, ["start", "end"], "原文定位");
  return {
    id: id(input.id), sourceId: id(input.sourceId), sourceExcerpt: str(input.sourceExcerpt, "来源片段", 50000),
    ...(locator ? { sourceLocator: { start: integer(locator.start, "片段起点"), end: integer(locator.end, "片段终点") } } : {}),
    occurredOn: input.occurredOn === null ? null : knowledgeDate(input.occurredOn),
    recordedAt: timestamp(input.recordedAt),
    domains: unique(list(input.domains, (item) => member(item, DOMAINS, "发展维度"), "发展维度", Object.keys(DOMAINS).length, 1), "发展维度"),
    context: {
      setting: member(context.setting, SETTINGS, "环境"), familiarity: member(context.familiarity, FAMILIARITY, "熟悉度"),
      activity: nullable(context.activity, "活动"), people: nullable(context.people, "在场者"),
      antecedent: nullable(context.antecedent, "先行情境"), response: nullable(context.response, "他人回应"), outcome: nullable(context.outcome, "后续经过")
    },
    behavior: str(input.behavior, "行为原文"),
    signals: list(input.signals, (value) => {
      const signal = obj(value, ["code", "excerpt"], "行为编码");
      return { code: member(signal.code, SIGNALS, "行为码"), excerpt: str(signal.excerpt, "编码原文") };
    }, "行为编码", 16),
    childExpression: expression ? { text: str(expression.text, "孩子表达"), fidelity: member(expression.fidelity, { verbatim: "", recalled: "", paraphrase: "" }, "表达保真度") } : null,
    recordedBy: writer(input.recordedBy), supersedes: input.supersedes === null ? null : id(input.supersedes)
  };
}
function analysis(value: unknown): AgentAnalysis {
  const input = obj(value, ["id", "domain", "title", "question", "claim", "conditions", "alternatives", "limitations", "followUps", "supportingIds", "counterIds", "theoryIds", "generatedAt", "generatedBy", "basedOnRevision", "supersedes"], "Agent分析");
  return {
    id: id(input.id), domain: member(input.domain, DOMAINS, "分析维度"),
    title: str(input.title, "分析标题", 200), question: str(input.question, "分析问题"),
    claim: str(input.claim, "条件性解释"), conditions: str(input.conditions, "适用情境"),
    alternatives: list(input.alternatives, (item) => str(item, "其他解释"), "其他解释", 10, 1),
    limitations: list(input.limitations, (item) => str(item, "局限"), "局限", 10, 1),
    followUps: list(input.followUps, (item) => str(item, "待了解问题"), "待了解问题", 10, 1),
    supportingIds: unique(list(input.supportingIds, id, "支持材料", 100, 1), "支持材料"),
    counterIds: unique(list(input.counterIds, id, "反例材料", 100), "反例材料"),
    theoryIds: unique(list(input.theoryIds, (item) => member(item, THEORIES, "理论ID"), "理论引用", 6, 1), "理论引用"),
    generatedAt: timestamp(input.generatedAt), generatedBy: writer(input.generatedBy),
    basedOnRevision: integer(input.basedOnRevision, "分析所据修订"),
    supersedes: input.supersedes === null ? null : id(input.supersedes)
  };
}
function cardRefs(value: unknown): ResearchTopic["cardRefs"] {
  const refs = list(value, (value) => {
    const ref = obj(value, ["id", "version"], "科学知识卡引用");
    const cardId = id(ref.id), version = integer(ref.version, "知识卡版本");
    const card = scienceCard(cardId);
    if (!card || version < 1 || version > card.version) throw new Error("知识卡ID或版本无效，先读取kb cards。");
    return { id: cardId, version };
  }, "知识卡引用", 20, 1);
  unique(refs.map((ref) => ref.id), "知识卡引用");
  return refs;
}
function topic(value: unknown): ResearchTopic {
  const input = obj(value, ["id", "title", "question", "domain", "scope", "status", "cardRefs", "createdAt", "createdBy", "supersedes"], "问题专题");
  return {
    id: id(input.id), title: str(input.title, "专题标题", 200), question: str(input.question, "专题问题"),
    domain: member(input.domain, DOMAINS, "专题维度"), scope: str(input.scope, "专题边界"),
    status: member(input.status, { open: "", paused: "", closed: "" }, "专题状态"),
    cardRefs: cardRefs(input.cardRefs), createdAt: timestamp(input.createdAt), createdBy: writer(input.createdBy),
    supersedes: input.supersedes === null ? null : id(input.supersedes)
  };
}
function run(value: unknown): ResearchRun {
  const input = obj(value, ["id", "topicId", "inputRevision", "status", "readObservationIds", "outputAnalysisIds", "cardRefs", "comparison", "counterSearch", "limitations", "changeReason", "finishedAt", "performedBy"], "分析任务记录");
  return {
    id: id(input.id), topicId: id(input.topicId), inputRevision: integer(input.inputRevision, "任务输入修订"),
    status: member(input.status, { completed: "", insufficient: "", cancelled: "" }, "任务状态"),
    readObservationIds: unique(list(input.readObservationIds, id, "读取材料", 20000), "读取材料"),
    outputAnalysisIds: unique(list(input.outputAnalysisIds, id, "分析输出", 100), "分析输出"),
    cardRefs: cardRefs(input.cardRefs), comparison: str(input.comparison, "可比性核对"),
    counterSearch: str(input.counterSearch, "反例查找范围"), limitations: list(input.limitations, (item) => str(item, "任务局限"), "任务局限", 10, 1),
    changeReason: str(input.changeReason, "理解变化原因"), finishedAt: timestamp(input.finishedAt), performedBy: writer(input.performedBy)
  };
}
export function currentTopics(kb: KnowledgeBase): ResearchTopic[] {
  const replaced = new Set((kb.topics || []).map((item) => item.supersedes));
  return (kb.topics || []).filter((item) => !replaced.has(item.id));
}
export function topicHistory(kb: KnowledgeBase, topicId: string): ResearchTopic[] {
  const all = kb.topics || [];
  const history: ResearchTopic[] = [];
  let item = all.find((entry) => entry.id === topicId);
  while (item) {
    history.unshift(item);
    item = all.find((entry) => entry.id === item?.supersedes);
  }
  return history;
}
export function runNeedsReview(kb: KnowledgeBase, item: ResearchRun): boolean {
  const active = new Set(activeObservations(kb).map((entry) => entry.id));
  const parent = currentTopics(kb).find((topic) => topic.id === item.topicId);
  return item.inputRevision + 1 !== kb.revision || !parent
    || item.readObservationIds.some((id) => !active.has(id))
    || [...item.cardRefs, ...parent.cardRefs].some((ref) => scienceCard(ref.id)?.version !== ref.version);
}
export function activeObservations(kb: KnowledgeBase): Observation[] {
  const replaced = new Set(kb.observations.map((item) => item.supersedes));
  return kb.observations.filter((item) => !replaced.has(item.id));
}
export function currentAnalyses(kb: KnowledgeBase): AgentAnalysis[] {
  const replaced = new Set(kb.analyses.map((item) => item.supersedes));
  return kb.analyses.filter((item) => !replaced.has(item.id));
}
export function analysisNeedsReview(kb: KnowledgeBase, item: AgentAnalysis): boolean {
  const active = new Set(activeObservations(kb).map((item) => item.id));
  return item.basedOnRevision !== kb.revision || [...item.supportingIds, ...item.counterIds].some((id) => !active.has(id))
    || (kb.runs || []).some((run) => run.outputAnalysisIds.includes(item.id) && runNeedsReview(kb, run));
}
export function validateKnowledge(value: unknown): KnowledgeBase {
  const input = obj(value, ["schemaVersion", "revision", "updatedAt", "child", "sources", "observations", "analyses", "topics", "runs"], "知识库");
  if (input.schemaVersion !== "1.0") throw new Error("不支持此知识库版本。");
  const kb: KnowledgeBase = {
    schemaVersion: "1.0", revision: integer(input.revision, "修订号"),
    updatedAt: input.updatedAt === null ? null : timestamp(input.updatedAt), child: child(input.child),
    sources: list(input.sources, source, "来源", 10000),
    observations: list(input.observations, observation, "观察", 20000),
    analyses: list(input.analyses, analysis, "分析", 2000),
    ...(input.topics !== undefined ? { topics: list(input.topics, topic, "问题专题", 2000) } : {}),
    ...(input.runs !== undefined ? { runs: list(input.runs, run, "任务记录", 2000) } : {})
  };
  if (kb.revision === 0 && (kb.sources.length || kb.observations.length || kb.analyses.length || kb.topics?.length || kb.runs?.length)) throw new Error("非空知识库必须有已提交修订号。");
  if (kb.revision > 0 && kb.updatedAt === null) throw new Error("已提交知识库必须有更新时间。");
  unique([...kb.sources, ...kb.observations, ...kb.analyses, ...(kb.topics || []), ...(kb.runs || [])].map((item) => item.id), "全部实体ID");
  const sources = new Map(kb.sources.map((item) => [item.id, item]));
  const priorObservations = new Map<string, Observation>();
  const revised = new Set<string>();
  for (const item of kb.observations) {
    const parent = sources.get(item.sourceId);
    if (!parent || !parent.content.includes(item.sourceExcerpt)) throw new Error(`观察 ${item.id} 的来源或原文片段不匹配。`);
    if (item.sourceLocator && (item.sourceLocator.start >= item.sourceLocator.end || item.sourceLocator.end > parent.content.length
      || parent.content.slice(item.sourceLocator.start, item.sourceLocator.end) !== item.sourceExcerpt)) throw new Error("原文定位须与来源片段精确匹配；坐标为UTF-16半开区间。");
    if (!item.sourceExcerpt.includes(item.behavior)) throw new Error(`观察 ${item.id} 的行为必须是来源片段中的原文，不把Agent解释伪装成观察。`);
    unique(item.signals.map((signal) => signal.code), "同一观察的行为码");
    if (item.signals.some((signal) => !item.sourceExcerpt.includes(signal.excerpt))) throw new Error(`观察 ${item.id} 的行为编码缺少原文依据。`);
    if (item.signals.some((signal) => signal.code === "unknown") && item.signals.length !== 1) throw new Error("未知行为不能同时附带已知行为码。");
    if (item.childExpression && !item.sourceExcerpt.includes(item.childExpression.text)) throw new Error(`观察 ${item.id} 的孩子表达必须保留来源中已有的文字，不能补全原话。`);
    if (kb.child.birthMonth && item.occurredOn && item.occurredOn.slice(0, 7) < kb.child.birthMonth) throw new Error("观察日期早于已知出生年月，请核对来源。");
    if (item.supersedes && (!priorObservations.has(item.supersedes) || revised.has(item.supersedes))) throw new Error("观察更正必须指向已有未被更正的观察，禁止分叉或循环。");
    if (item.supersedes) revised.add(item.supersedes);
    priorObservations.set(item.id, item);
  }
  const priorAnalyses = new Map<string, AgentAnalysis>();
  const revisedAnalyses = new Set<string>();
  for (const item of kb.analyses) {
    if (item.basedOnRevision < 1 || item.basedOnRevision > kb.revision) throw new Error("分析所据修订不能超前或为0。");
    if (item.basedOnRevision === kb.revision && [...item.supportingIds, ...item.counterIds].some((id) => revised.has(id))) {
      throw new Error("本次分析不能把已经更正的观察作为当前依据。");
    }
    if ([...item.supportingIds, ...item.counterIds].some((id) => !priorObservations.has(id))) throw new Error(`分析 ${item.id} 引用了不存在的观察。`);
    if ([...item.supportingIds, ...item.counterIds].some((id) => priorObservations.get(id)!.recordedAt > item.generatedAt)) throw new Error("分析形成时间不能早于其引用材料的录入时间。");
    if (item.supportingIds.some((id) => item.counterIds.includes(id))) throw new Error("同一观察不能同时作为支持与反例。");
    if (item.supersedes && (!priorAnalyses.has(item.supersedes) || priorAnalyses.get(item.supersedes)?.domain !== item.domain || revisedAnalyses.has(item.supersedes))) throw new Error("分析修订须指向同维度的已有最新分析。");
    if (item.supersedes) revisedAnalyses.add(item.supersedes);
    priorAnalyses.set(item.id, item);
  }
  const topics = new Map<string, ResearchTopic>();
  const revisedTopics = new Set<string>();
  for (const item of kb.topics || []) {
    const previous = item.supersedes ? topics.get(item.supersedes) : null;
    if (item.supersedes && (!previous || previous.domain !== item.domain || previous.createdAt > item.createdAt || revisedTopics.has(item.supersedes))) throw new Error("专题修订须按时间引用同维度的已有最新专题，不允许分叉。");
    if (item.supersedes) revisedTopics.add(item.supersedes);
    topics.set(item.id, item);
  }
  const claimedOutputs = new Set<string>();
  const taskScopes = new Set<string>();
  for (const item of kb.runs || []) {
    const taskScope = `${item.topicId}:${item.inputRevision}`;
    if (taskScopes.has(taskScope)) throw new Error("同一专题在同一输入修订只能提交一条任务记录，避免当前结论与取消／不足状态冲突。");
    taskScopes.add(taskScope);
    const parent = topics.get(item.topicId);
    if (!parent || parent.createdAt > item.finishedAt) throw new Error("任务必须引用已有专题，完成时间不能早于专题。");
    if (item.inputRevision >= kb.revision) throw new Error("任务输入修订必须早于提交后的知识修订。");
    if (item.status === "completed" ? !item.outputAnalysisIds.length : item.outputAnalysisIds.length) throw new Error("完成任务须有分析输出；材料不足或取消任务不附带结论。");
    if (item.status !== "cancelled" && !item.readObservationIds.length) throw new Error("分析或材料不足记录须列出读取的材料。");
    for (const ref of item.readObservationIds) {
      const observed = priorObservations.get(ref);
      if (!observed || observed.recordedAt > item.finishedAt) throw new Error("任务读取材料不存在或晚于任务完成时间。");
    }
    for (const ref of item.outputAnalysisIds) {
      const output = priorAnalyses.get(ref);
      if (!output || claimedOutputs.has(ref) || output.domain !== parent.domain || output.basedOnRevision !== item.inputRevision + 1
        || output.generatedAt > item.finishedAt || output.generatedBy.name !== item.performedBy.name || output.generatedBy.tool !== item.performedBy.tool
        || [...output.supportingIds, ...output.counterIds].some((id) => !item.readObservationIds.includes(id))) throw new Error("任务输出须唯一关联同修订、同维度、同署名的分析，所有依据须在读取清单中。");
      const theories = new Set(item.cardRefs.flatMap((ref) => scienceCard(ref.id)!.theoryIds));
      if (output.theoryIds.some((id) => !theories.has(id))) throw new Error("任务知识卡未覆盖分析所引用的理论。");
      claimedOutputs.add(ref);
    }
  }
  return kb;
}
export function parseKnowledge(text: string): KnowledgeBase {
  if (new TextEncoder().encode(text).byteLength > MAX_KNOWLEDGE_BYTES) throw new Error("知识库超过10MB上限。");
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("知识库不是有效JSON，未以空数据替代。"); }
  return validateKnowledge(parsed);
}
export function applyKnowledgeBatch(current: KnowledgeBase, value: unknown, now = new Date().toISOString()): KnowledgeBase {
  const input = obj(value, ["schemaVersion", "expectedRevision", "writer", "child", "sources", "observations", "analyses", "deleteObservationIds", "deleteSourceIds", "deleteAnalysisIds", "topics", "runs", "deleteTopicIds", "deleteRunIds"], "写入批次");
  if (input.schemaVersion !== "1.0") throw new Error("批次版本无效。");
  if (integer(input.expectedRevision, "预期修订号") !== current.revision) throw new Error("知识库已变化，请重新读取后生成批次，不覆盖其他Agent写入。");
  const author = writer(input.writer);
  const sources = list(input.sources, source, "新增来源", 1000);
  const observations = list(input.observations, observation, "新增观察", 2000);
  const nextRevision = current.revision + 1;
  const analyses = list(input.analyses, (value) => {
    const entry = obj(value, ["id", "domain", "title", "question", "claim", "conditions", "alternatives", "limitations", "followUps", "supportingIds", "counterIds", "theoryIds", "generatedAt", "generatedBy", "supersedes"], "批次分析");
    return analysis({ ...entry, basedOnRevision: nextRevision });
  }, "新增分析", 100);
  const topics = input.topics === undefined ? [] : list(input.topics, topic, "新增专题", 100);
  const runs = input.runs === undefined ? [] : list(input.runs, run, "新增任务记录", 100);
  for (const entry of [...sources.map((item) => item.recordedBy), ...observations.map((item) => item.recordedBy), ...analyses.map((item) => item.generatedBy), ...topics.map((item) => item.createdBy), ...runs.map((item) => item.performedBy)]) {
    if (entry.name !== author.name || entry.tool !== author.tool) throw new Error("本批次新增实体的Agent署名必须与writer一致。");
  }
  const deleteSources = new Set(unique(list(input.deleteSourceIds, id, "删除来源ID", 1000), "删除来源ID"));
  const deleteObservations = new Set(unique(list(input.deleteObservationIds, id, "删除观察ID", 2000), "删除观察ID"));
  const deleteAnalyses = new Set(unique(list(input.deleteAnalysisIds, id, "删除分析ID", 2000), "删除分析ID"));
  const deleteTopics = new Set(unique(list(input.deleteTopicIds === undefined ? [] : input.deleteTopicIds, id, "删除专题ID", 2000), "删除专题ID"));
  const deleteRuns = new Set(unique(list(input.deleteRunIds === undefined ? [] : input.deleteRunIds, id, "删除任务ID", 2000), "删除任务ID"));
  if (runs.some((item) => item.inputRevision !== current.revision || item.outputAnalysisIds.some((id) => !analyses.some((entry) => entry.id === id)))) throw new Error("新增任务须基于当前输入修订，输出必须为同批次新增分析。");
  if ([...topics, ...runs].some((item) => item.cardRefs.some((ref) => scienceCard(ref.id)!.version !== ref.version))) throw new Error("新增专题与任务必须引用当前知识卡版本。");
  for (const [ids, entries] of [[deleteSources, current.sources], [deleteObservations, current.observations], [deleteAnalyses, current.analyses], [deleteTopics, current.topics || []], [deleteRuns, current.runs || []]] as const) {
    if ([...ids].some((id) => !entries.some((entry) => entry.id === id))) throw new Error("删除目标不存在于当前修订，拒绝看似成功的删除。");
  }
  for (const entry of current.observations) {
    if (deleteSources.has(entry.sourceId) || entry.supersedes && deleteObservations.has(entry.supersedes)) deleteObservations.add(entry.id);
  }
  for (const entry of current.analyses) {
    if ([...entry.supportingIds, ...entry.counterIds].some((id) => deleteObservations.has(id))
      || entry.supersedes && deleteAnalyses.has(entry.supersedes)) deleteAnalyses.add(entry.id);
  }
  for (const entry of current.topics || []) {
    if (entry.supersedes && deleteTopics.has(entry.supersedes)) deleteTopics.add(entry.id);
  }
  for (const entry of current.runs || []) {
    if (deleteTopics.has(entry.topicId) || entry.readObservationIds.some((id) => deleteObservations.has(id))
      || entry.outputAnalysisIds.some((id) => deleteAnalyses.has(id))) deleteRuns.add(entry.id);
  }
  if (input.child !== undefined && child(input.child).id !== current.child.id && current.revision > 0) throw new Error("一个知识库只对应一个孩子，不能通过批次更换孩子ID。");
  const next = validateKnowledge({
    ...current, revision: nextRevision, updatedAt: timestamp(now),
    child: input.child === undefined ? current.child : child(input.child),
    sources: [...current.sources.filter((entry) => !deleteSources.has(entry.id)), ...sources],
    observations: [...current.observations.filter((entry) => !deleteObservations.has(entry.id)), ...observations],
    analyses: [...current.analyses.filter((entry) => !deleteAnalyses.has(entry.id)), ...analyses],
    ...(current.topics !== undefined || input.topics !== undefined ? { topics: [...(current.topics || []).filter((entry) => !deleteTopics.has(entry.id)), ...topics] } : {}),
    ...(current.runs !== undefined || input.runs !== undefined ? { runs: [...(current.runs || []).filter((entry) => !deleteRuns.has(entry.id)), ...runs] } : {})
  });
  if (!sources.length && !observations.length && !analyses.length && !topics.length && !runs.length && !deleteSources.size && !deleteObservations.size && !deleteAnalyses.size && !deleteTopics.size && !deleteRuns.size
    && JSON.stringify(next.child) === JSON.stringify(current.child)) throw new Error("批次没有任何变更，不创建空修订。");
  const oldIds = new Set([...current.sources, ...current.observations, ...current.analyses, ...(current.topics || []), ...(current.runs || [])].map((entry) => entry.id));
  if ([...sources, ...observations, ...analyses, ...topics, ...runs].some((entry) => oldIds.has(entry.id))) throw new Error("新增实体不能复用已有或本批次删除的ID；更正请用新ID和supersedes。");
  if (new TextEncoder().encode(JSON.stringify(next)).byteLength > MAX_KNOWLEDGE_BYTES) throw new Error("写入后知识库超过10MB，未保存。");
  return next;
}
