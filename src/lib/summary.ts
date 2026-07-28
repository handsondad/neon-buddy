import type { AppConfig, MemoryItem, StatKey, StageKey, LifeSkillKey, FeedbackView, HandoffSummaryEntry, AchievementBadge } from "../types";

export function getWeekMemories(memories: MemoryItem[], currentDay: number): MemoryItem[] {
  const startDay = Math.max(1, currentDay - 6);
  return memories.filter((memory) => memory.day >= startDay && memory.day <= currentDay);
}

export function calcTopType(weekMemories: MemoryItem[]): string {
  const counter: Record<string, number> = {};
  weekMemories.forEach((item) => {
    counter[item.type] = (counter[item.type] || 0) + 1;
  });
  return Object.entries(counter).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

export function calcTopRole(weekMemories: MemoryItem[]): string {
  const counter: Record<string, number> = {};
  weekMemories.forEach((item) => {
    counter[item.caregiverRole] = (counter[item.caregiverRole] || 0) + 1;
  });
  return Object.entries(counter).sort((a, b) => b[1] - a[1])[0]?.[0] || "parent";
}

export function calcAverageIntensity(weekMemories: MemoryItem[]): string {
  if (!weekMemories.length) {
    return "0.0";
  }
  const total = weekMemories.reduce((sum, item) => sum + item.intensity, 0);
  return (total / weekMemories.length).toFixed(1);
}

export function calcBestStatDelta(weekMemories: MemoryItem[], appConfig: AppConfig): [StatKey, number] {
  const delta: Record<StatKey, number> = {
    safety: 0,
    trust: 0,
    curiosity: 0,
    mood: 0
  };

  weekMemories.forEach((memory) => {
    const rule = appConfig.eventRules[memory.type];
    if (!rule) {
      return;
    }
    const weight = memory.intensity - 2;
    (Object.keys(delta) as StatKey[]).forEach((key) => {
      delta[key] += rule.effect[key] * weight;
    });
  });

  const sorted = Object.entries(delta).sort((a, b) => b[1] - a[1])[0] as [StatKey, number];
  return sorted || ["safety", 0];
}

export function buildHandoffSummary(memories: MemoryItem[]): {
  sceneLabel: string;
  triggerCue: string;
  effectiveAction: string;
  avoidAction: string;
  schoolToHome: string;
  homeToSchool: string;
} {
  if (!memories.length) {
    return {
      sceneLabel: "日常场景",
      triggerCue: "等待记录",
      effectiveAction: "等待记录",
      avoidAction: "等待记录",
      schoolToHome: "",
      homeToSchool: ""
    };
  }

  const latest = memories[0];
  return {
    sceneLabel: `最近：${latest.type}`,
    triggerCue: "需要关注的触发点",
    effectiveAction: "已验证的有效做法",
    avoidAction: "需要避免的做法",
    schoolToHome: "",
    homeToSchool: ""
  };
}

export function getHighlights(memories: MemoryItem[]): MemoryItem[] {
  return memories.slice(0, 5);
}

export function calcStageProgress(day: number, stage: StageKey): number {
  const stageDays: Record<StageKey, number> = { newborn: 30, explorer: 60, communicator: 100 };
  const daysInStage = stageDays[stage] || 30;
  const startDay = stage === "newborn" ? 1 : stage === "explorer" ? 31 : 91;
  const currentInStage = Math.max(0, day - startDay + 1);
  return Math.min(100, Math.round((currentInStage / daysInStage) * 100));
}

export function getActiveSkillGoals(day: number): Array<{ key: LifeSkillKey; title: string; targetCount: number; coachingTip: string }> {
  const goals: Array<{ key: LifeSkillKey; title: string; targetCount: number; coachingTip: string }> = [
    { key: "mealRoutine", title: "用餐习惯", targetCount: 30, coachingTip: "建立规律的用餐时间" },
    { key: "sleepRoutine", title: "睡眠规律", targetCount: 30, coachingTip: "建立固定的睡前仪式" },
    { key: "tidyUp", title: "整理习惯", targetCount: 20, coachingTip: "引导孩子自己整理玩具" },
    { key: "requesting", title: "表达需求", targetCount: 25, coachingTip: "鼓励用语言表达需求" },
    { key: "conflictRepair", title: "冲突修复", targetCount: 15, coachingTip: "学习解决冲突的方法" }
  ];
  return goals;
}

export function getMemoriesForWindow(memories: MemoryItem[], window: { startDay: number; endDay: number }): MemoryItem[] {
  return memories.filter((m) => m.day >= window.startDay && m.day <= window.endDay);
}

export function getHandoffEntriesForWindow(entries: HandoffSummaryEntry[], window: { startDay: number; endDay: number }): HandoffSummaryEntry[] {
  return entries.filter((e) => e.day >= window.startDay && e.day <= window.endDay);
}

export function getUnlockedBadgesInWindow(badges: AchievementBadge[], window: { startDay: number; endDay: number }): AchievementBadge[] {
  return badges.filter((b) => b.unlocked && b.unlockedDay !== null && b.unlockedDay >= window.startDay && b.unlockedDay <= window.endDay);
}

export function resolveStage(day: number): StageKey {
  if (day <= 30) return "newborn";
  if (day <= 90) return "explorer";
  return "communicator";
}

export function normalizeAppState(state: any): any {
  return state;
}

export function buildFeedback(
  eventType: string,
  caregiverRole: string,
  intensity: number,
  detail: string,
  childName: string,
  day: number,
  skillProgress: Record<LifeSkillKey, number>,
  storyProgress: Record<string, Record<string, number>>,
  storyLastVariant: Record<string, string>
): FeedbackView {
  return {
    childText: "",
    roleTip: "",
    narrative: "",
    hint: "",
    detail: detail,
    roleLabel: caregiverRole,
    seasonThemeTitle: "",
    seasonFestivalName: "",
    seasonAtmosphere: "",
    seasonCue: "",
    seasonBranchPrompt: "",
    familyTone: "",
    familyHandoff: "",
    skillTitle: "",
    skillProgressText: "",
    skillCoachingTip: "",
    skillCompletionHint: "",
    storyTitle: "",
    storyPremise: "",
    storySignal: "",
    storyChoice: "",
    storyVariantLabel: "",
    storyEcho: "",
    storyMemoryTag: "",
    storyProgressText: "",
    storyUnlockedText: "",
    storyNextGoal: "",
    handoffTrigger: "",
    handoffEffective: "",
    handoffAvoid: "",
    handoffDirection: "",
    emotionLabel: "",
    emotionRecognition: "",
    emotionAcceptance: "",
    emotionGuidance: [],
    expertTitle: "",
    expertInsight: "",
    expertTips: [],
    expertSource: ""
  };
}

export function formatHandoffEntry(entry: HandoffSummaryEntry): string {
  return [
    `第 ${entry.day} 天 - ${entry.sceneLabel}`,
    `触发点：${entry.triggerCue}`,
    `有效做法：${entry.effectiveAction}`,
    `避免做法：${entry.avoidAction}`
  ].join("\n");
}

export function formatGrowthReport(params: any): string {
  return "# 成长报告\n\n内容待生成";
}

export function formatHandoffReport(params: any): string {
  return "# 家校交接报告\n\n内容待生成";
}

export function formatTaskRewardEntry(entry: { day: number; taskTitle: string; level: string; combo: number; message: string }): string {
  return `第 ${entry.day} 天 - ${entry.taskTitle}（${entry.level} · 连击 ${entry.combo}）\n${entry.message}`;
}

export function formatTaskRewardHistorySummary(entries: any[], levelFilter: string, timeFilter: string, day: number): string {
  return "奖励历史摘要";
}

export function formatTaskRewardSchoolBrief(params: any): string {
  return "家校奖励简报";
}

export function formatTaskRewardSchoolBriefMarkdown(params: any): string {
  return "# 家校奖励简报\n\n内容待生成";
}

export function formatTaskRewardBriefHistorySummary(entries: any[], audienceFilter: string, formatFilter: string): string {
  return "简报历史摘要";
}

export function formatTaskRewardFavoritesMarkdownSummary(entries: any[], keyword: string): string {
  return "# 收藏夹汇总\n\n内容待生成";
}

export function formatSelectedTaskRewardFavoritesMarkdown(entries: any[]): string {
  return "# 选中收藏汇总\n\n内容待生成";
}

export function buildDailyAchievementCard(params: any): string {
  return `## ${params.childName} 的第 ${params.day} 天\n\n任务完成：${params.completedTaskCount}/${params.taskTotal}\n连击：${params.taskCombo}\n等级：${params.rewardLevel}`;
}

export function buildReportFileName(kind: string, accountId: string, day: number, rangeToken: string): string {
  return `${kind}-${accountId}-day${day}-${rangeToken}.md`;
}

export function buildPrintableReportHtml(preview: any, childName: string, accountId: string, day: number): string {
  return `<html><body><pre>${preview.content}</pre></body></html>`;
}

export function resolveReportDayWindow(range: string, currentDay: number, startStr: string, endStr: string): { startDay: number; endDay: number; label: string; token: string } | null {
  const startDay = parseInt(startStr) || 1;
  const endDay = parseInt(endStr) || currentDay;
  
  if (range === "custom" && (startDay > endDay || endDay > currentDay)) {
    return null;
  }

  const windows: Record<string, { startDay: number; endDay: number; label: string; token: string }> = {
    last7: { startDay: Math.max(1, currentDay - 6), endDay: currentDay, label: "最近7天", token: "last7" },
    last14: { startDay: Math.max(1, currentDay - 13), endDay: currentDay, label: "最近14天", token: "last14" },
    last30: { startDay: Math.max(1, currentDay - 29), endDay: currentDay, label: "最近30天", token: "last30" },
    month: { startDay: Math.max(1, currentDay - 29), endDay: currentDay, label: "本月", token: "month" },
    all: { startDay: 1, endDay: currentDay, label: "全部", token: "all" },
    custom: { startDay, endDay, label: `第${startDay}-${endDay}天`, token: `custom-${startDay}-${endDay}` }
  };

  return windows[range] || null;
}

export function resolveTaskRewardLevel(combo: number): string {
  if (combo >= 10) return "黄金";
  if (combo >= 5) return "白银";
  return "青铜";
}

export function buildTaskRewardMessage(taskTitle: string, combo: number, level: string): string {
  return `完成「${taskTitle}」，获得 ${level} 奖励，当前连击 ${combo}！`;
}

export function resolveStageText(stage: string): string {
  const texts: Record<string, string> = {
    newborn: "新生儿期",
    explorer: "探索期",
    communicator: "交流期"
  };
  return texts[stage] || stage;
}

export function resolveNextStageText(stage: string): string {
  const nextStages: Record<string, string> = {
    newborn: "探索期（第31天开始）",
    explorer: "交流期（第91天开始）",
    communicator: "持续成长中"
  };
  return nextStages[stage] || "";
}