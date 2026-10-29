import { applyKnowledgeBatch, emptyKnowledge } from "../src/lib/knowledge.ts";

export function exampleKnowledge() {
  const writer = { name: "合成示例 Agent", tool: "手工编写的虚构示例；不是实际模型分析" };
  const rows = [
    { id: "early-new", date: "2026-01-10", domain: "relationships", setting: "community", familiarity: "new", activity: "第一次参加积木小组",
      text: "【合成】第一次参加积木小组，他站在旁边看了一会儿，说“我想先看看”。爸爸介绍了规则，后来他加入了搭桥。",
      behavior: "他站在旁边看了一会儿", code: "observes", quote: "我想先看看", response: "爸爸介绍了规则", outcome: "后来他加入了搭桥" },
    { id: "early-known", date: "2026-01-20", domain: "relationships", setting: "home", familiarity: "familiar", activity: "和熟悉伙伴搭积木",
      text: "【合成】在家和熟悉伙伴搭积木，他主动邀请伙伴搭桥，说“我们一起搭”。伙伴答应了，两人继续搭了一会儿。",
      behavior: "他主动邀请伙伴搭桥", code: "initiates", quote: "我们一起搭", response: "伙伴答应了", outcome: "两人继续搭了一会儿" },
    { id: "late-known", date: "2026-10-10", domain: "relationships", setting: "learning", familiarity: "familiar", activity: "熟悉小组中的搭建活动",
      text: "【合成】熟悉小组中的搭建活动开始时，他提出一起搭桥，说“你做这边好吗”。一位伙伴同意了，另一位伙伴想搭房子。",
      behavior: "他提出一起搭桥", code: "initiates", quote: "你做这边好吗", response: "一位伙伴同意了", outcome: "另一位伙伴想搭房子" },
    { id: "late-new", date: "2026-10-20", domain: "relationships", setting: "community", familiarity: "new", activity: "新的桌游小组",
      text: "【合成】在新的桌游小组，他问主持人怎么玩，说“我不知道这个规则”。主持人示范了一轮，他随后加入。",
      behavior: "他问主持人怎么玩", code: "asks_help", quote: "我不知道这个规则", response: "主持人示范了一轮", outcome: "他随后加入" },
    { id: "counter", date: "2026-10-22", domain: "relationships", setting: "home", familiarity: "familiar", activity: "熟悉伙伴来访",
      text: "【合成】熟悉伙伴来访，他说“我现在想一个人拼”，没有加入伙伴的游戏。家人接受他的选择，后续没有记录。",
      behavior: "没有加入伙伴的游戏", code: "declines", quote: "我现在想一个人拼", response: "家人接受他的选择", outcome: null },
    { id: "explore", date: "2026-10-24", domain: "exploration", setting: "home", familiarity: "familiar", activity: "搭建桥梁",
      text: "【合成】桥塌了以后，他换了两块宽积木，说“这样会不会稳一点”。大人没有接手，他重新搭起了桥。",
      behavior: "他换了两块宽积木", code: "changes_strategy", quote: "这样会不会稳一点", response: "大人没有接手", outcome: "他重新搭起了桥" }
  ];
  const batch = {
    schemaVersion: "1.0", expectedRevision: 0, writer,
    child: { id: "synthetic-child", alias: "合成示例 · 非真实孩子", birthMonth: "2021-06" },
    sources: rows.map((row) => ({
      id: `src-${row.id}`, kind: row.id === "late-known" ? "educator" : "caregiver",
      reporter: row.id === "late-known" ? "合成教育者" : "合成家长",
      capturedAt: `${row.date}T12:00:00.000Z`, content: row.text, recordedBy: writer
    })),
    observations: rows.map((row) => ({
      id: `obs-${row.id}`, sourceId: `src-${row.id}`, sourceExcerpt: row.text,
      sourceLocator: { start: 0, end: row.text.length },
      occurredOn: row.date, recordedAt: `${row.date}T12:00:00.000Z`,
      domains: row.domain === "exploration" ? ["exploration", "attention", "agency"] : ["relationships", "communication"],
      context: {
        setting: row.setting, familiarity: row.familiarity, activity: row.activity,
        people: row.id === "explore" ? "孩子与大人" : "孩子、同伴或成人", antecedent: null,
        response: row.response, outcome: row.outcome
      },
      behavior: row.behavior, signals: [{ code: row.code, excerpt: row.behavior }],
      childExpression: { text: row.quote, fidelity: "recalled" },
      recordedBy: writer, supersedes: null
    })),
    analyses: [{
      id: "analysis-context", domain: "relationships", title: "熟悉度、规则理解与参与方式",
      question: "这些材料是否支持“他不愿和新伙伴玩”的解释？",
      claim: "这些片段更支持保留情境差异，而不是把不立即加入解释成稳定性格。新场景中既有先观察，也有主动询问；熟悉场景中也有选择独处。",
      conditions: "仅限2026年1月与10月已提供的积木、桌游和来访片段；活动、记录者和时间并不完全可比。",
      alternatives: ["可能与规则是否清楚、活动偏好或当时想独处有关，现有材料不能区分这些解释。"],
      limitations: ["片段是家长和教育者的选择性叙述，不是行为发生率。", "未持续记录当时状态，也不能把前后差异归因为年龄或成人支持。"],
      followUps: ["在自然出现的新活动中，保留孩子愿意表达的参与偏好，以及规则说明前后的真实经过；无需为了验证假设制造情境。"],
      supportingIds: ["obs-early-new", "obs-early-known", "obs-late-new", "obs-late-known"],
      counterIds: ["obs-counter"], theoryIds: ["temperament", "motivation", "informants"],
      generatedAt: "2026-10-25T12:00:00.000Z", generatedBy: writer, supersedes: null
    }],
    deleteObservationIds: [], deleteSourceIds: [], deleteAnalysisIds: []
  };
  const cardRefs = ["concept-reactivity", "concept-support-needs", "concept-informant-context", "method-context-comparison", "method-alternatives", "method-longitudinal"].map((id) => ({ id, version: 1 }));
  const topic = {
    id: "topic-participation", title: "不同情境中，他如何选择参与？",
    question: "参与方式与熟悉度、规则理解和活动偏好有什么关系？",
    domain: "relationships", scope: "仅比较已授权的2026年1月与10月自然片段；不推断人格或因果。",
    status: "open", cardRefs, createdAt: "2026-10-25T12:00:00.000Z", createdBy: writer, supersedes: null
  };
  const initialAnalysis = {
    ...batch.analyses[0], id: "analysis-context-initial", counterIds: [],
    claim: "已提供片段中，熟悉活动出现主动邀请，新活动出现观察和询问；目前应保留情境差异，不能据此认定稳定性格。",
    limitations: ["目前只有四个参与片段，尚未看到熟悉场景选择不参与的材料。", "活动、来源和时间不同，无法判断熟悉度的独立作用。"]
  };
  const initialRun = {
    id: "run-initial", topicId: topic.id, inputRevision: 0, status: "completed",
    readObservationIds: initialAnalysis.supportingIds, outputAnalysisIds: [initialAnalysis.id], cardRefs,
    comparison: "对比两段新活动和两段熟悉活动；任务与报告者不同，不能隔离熟悉度。",
    counterSearch: "查找首次提供的四段材料中的主动参与与退出；没有看到明确不参加片段，不代表不存在。",
    limitations: ["这只是手工编写的合成任务记录，不是实际工具执行证明。"],
    changeReason: "首次整理参与问题，保留情境假设而不定义特质。",
    finishedAt: "2026-10-25T12:00:00.000Z", performedBy: writer
  };
  const initial = applyKnowledgeBatch(emptyKnowledge(), {
    ...batch, sources: batch.sources.slice(0, 4), observations: batch.observations.slice(0, 4),
    analyses: [initialAnalysis], topics: [topic], runs: [initialRun]
  }, "2026-10-25T12:00:00.000Z");
  return applyKnowledgeBatch(initial, {
    ...batch, expectedRevision: 1, sources: batch.sources.slice(4), observations: batch.observations.slice(4),
    analyses: [{ ...batch.analyses[0], generatedAt: "2026-10-25T13:00:00.000Z", supersedes: initialAnalysis.id }],
    runs: [{
      ...initialRun, id: "run-counter-review", inputRevision: 1,
      readObservationIds: batch.observations.map((item) => item.id), outputAnalysisIds: ["analysis-context"],
      comparison: "重新核对熟悉伙伴来访时不参加、陌生桌游时询问后加入；不同活动不可当作同条件试验。",
      counterSearch: "核对本示例全部六段材料，明确把熟悉场景中选择独处作为反例，不再只按熟悉度归纳。",
      changeReason: "新增熟悉场景选择独处的材料，收窄原解释：熟悉度不足以概括参与方式，活动偏好和规则理解仍需区分。",
      finishedAt: "2026-10-25T13:00:00.000Z"
    }]
  }, "2026-10-25T13:00:00.000Z");
}
