import { activeObservations, analysisNeedsReview, currentAnalyses, knowledgeDate, type KnowledgeBase, type Observation } from "./knowledge.ts";
import { DOMAINS, FAMILIARITY, SETTINGS, SIGNALS, type DomainId } from "./knowledgeFramework.ts";

export interface KnowledgeScope { domain: DomainId | ""; from: string; to: string }
export function selectKnowledge(kb: KnowledgeBase, scope: KnowledgeScope): Observation[] {
  if (scope.from) knowledgeDate(scope.from);
  if (scope.to) knowledgeDate(scope.to);
  if (scope.from && scope.to && scope.from > scope.to) throw new Error("开始日期不能晚于结束日期。");
  return activeObservations(kb).filter((item) =>
    (!scope.domain || item.domains.includes(scope.domain))
    && (!scope.from || item.occurredOn !== null && item.occurredOn >= scope.from)
    && (!scope.to || item.occurredOn !== null && item.occurredOn <= scope.to)
  ).sort((a, b) => (b.occurredOn || "").localeCompare(a.occurredOn || "") || b.recordedAt.localeCompare(a.recordedAt));
}
export function approximateAge(birthMonth: string | null, on: string | null): string {
  if (!birthMonth || !on) return "月龄未知";
  const months = (Number(on.slice(0, 4)) - Number(birthMonth.slice(0, 4))) * 12 + Number(on.slice(5, 7)) - Number(birthMonth.slice(5, 7));
  if (months < 0) return "出生年月需核对";
  return `约${Math.floor(months / 12)}岁${months % 12}个月`;
}
export function analyzeKnowledge(kb: KnowledgeBase, scope: KnowledgeScope) {
  const observations = selectKnowledge(kb, scope);
  const sourceIds = new Set(observations.map((item) => item.sourceId));
  const sources = kb.sources.filter((item) => sourceIds.has(item.id));
  const contexts = [...new Set(observations.map((item) => `${item.context.setting}:${item.context.familiarity}`))].map((key) => {
    const items = observations.filter((item) => `${item.context.setting}:${item.context.familiarity}` === key);
    return {
      key, label: `${SETTINGS[items[0].context.setting]} · ${FAMILIARITY[items[0].context.familiarity]}`,
      observations: items,
      signals: Object.keys(SIGNALS).flatMap((code) => {
        const matching = items.filter((item) => item.signals.some((signal) => signal.code === code));
        return matching.length ? [{ code, label: SIGNALS[code as keyof typeof SIGNALS], ids: matching.map((item) => item.id) }] : [];
      })
    };
  });
  const months = [...new Set(observations.filter((item) => item.occurredOn).map((item) => item.occurredOn!.slice(0, 7)))].sort().map((month) => ({
    month, age: approximateAge(kb.child.birthMonth, `${month}-01`),
    observations: observations.filter((item) => item.occurredOn?.startsWith(month))
  }));
  const currentIds = new Set(observations.map((item) => item.id));
  const analyses = currentAnalyses(kb).filter((item) => (!scope.domain || item.domain === scope.domain) && (
    !scope.from && !scope.to || [...item.supportingIds, ...item.counterIds].some((id) => currentIds.has(id))
  )).map((item) => ({
    ...item, needsReview: analysisNeedsReview(kb, item),
    outsideScope: [...item.supportingIds, ...item.counterIds].some((id) => !currentIds.has(id))
  }));
  const gaps: string[] = [];
  if (!observations.length) gaps.push("当前范围没有材料。未知不能被补写成孩子的特点。");
  if (!kb.child.birthMonth) gaps.push("未提供出生年月，只能按日历时间组织，不能作月龄比较。");
  if (sources.length && new Set(sources.map((source) => source.reporter)).size < 2) gaps.push("材料来自单一报告者，无法代表其他人的观察。");
  const unknownDates = observations.filter((item) => !item.occurredOn).length;
  if (unknownDates) gaps.push(`${unknownDates}项发生日期未知，未放入成长时间轴。`);
  const missingContext = observations.filter((item) => item.context.setting === "unknown" || item.context.familiarity === "unknown").length;
  if (missingContext) gaps.push(`${missingContext}项缺少环境或熟悉度，情境比较不完整。`);
  const missingAfter = observations.filter((item) => item.context.response === null || item.context.outcome === null).length;
  if (missingAfter) gaps.push(`${missingAfter}项缺少他人回应或后续，不能据此判断支持效果。`);
  if (observations.length && !observations.some((item) => item.childExpression)) gaps.push("缺少孩子表达。成人与Agent的解释不等于孩子本人的理解。");
  if (analyses.some((item) => !item.counterIds.length)) gaps.push("有分析尚未附反例；这不说明反例不存在。");
  if (analyses.some((item) => item.needsReview)) gaps.push("知识库在部分分析形成后发生变化，旧解释需要Agent重新核对。");
  return {
    observations, sources, contexts, months, analyses, gaps,
    unknownDates,
    domains: (Object.keys(DOMAINS) as DomainId[]).map((id) => ({
      id, ...DOMAINS[id],
      observationIds: observations.filter((item) => item.domains.includes(id)).map((item) => item.id),
      analysisCount: analyses.filter((item) => item.domain === id && !item.needsReview).length
    }))
  };
}
