import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Onboarding } from "./components/Onboarding";
import { Settings } from "./components/Settings";
import { Dashboard } from "./components/Dashboard";
import { EventForm } from "./components/EventForm";
import { Profile } from "./components/Profile";
import { Reports } from "./components/Reports";
import { Timeline } from "./components/Timeline";
import { appConfig } from "./config/appConfig";
import { createCloudRepository } from "./lib/cloudRepository";
import { sanitizeCopy } from "./lib/ethics";
import {
  DEFAULT_ACCOUNT_ID,
  loadCurrentAccountId,
  loadState,
  normalizeAccountId,
  persistCurrentAccountId,
  saveState,
  hasCompletedOnboarding,
  markOnboardingComplete,
  getAccountStorageKey
} from "./lib/storage";
import {
  calcAverageIntensity,
  calcBestStatDelta,
  calcTopRole,
  calcTopType,
  getWeekMemories,
  buildHandoffSummary,
  getHighlights,
  calcStageProgress,
  getActiveSkillGoals,
  getMemoriesForWindow,
  getHandoffEntriesForWindow,
  getUnlockedBadgesInWindow,
  resolveStage,
  normalizeAppState,
  buildFeedback,
  formatHandoffEntry,
  formatGrowthReport,
  formatHandoffReport,
  formatTaskRewardEntry,
  formatTaskRewardHistorySummary,
  formatTaskRewardSchoolBrief,
  formatTaskRewardSchoolBriefMarkdown,
  formatTaskRewardBriefHistorySummary,
  formatTaskRewardFavoritesMarkdownSummary,
  formatSelectedTaskRewardFavoritesMarkdown,
  buildDailyAchievementCard,
  buildReportFileName,
  buildPrintableReportHtml,
  resolveReportDayWindow,
  resolveTaskRewardLevel,
  buildTaskRewardMessage
} from "./lib/summary";
import type {
  AppState,
  CaregiverRole,
  CloudSnapshot,
  EventType,
  FeedbackView,
  HandoffSummaryEntry,
  MemoryItem,
  SuggestionFeedbackState,
  SuggestionHistoryEntry,
  TaskRewardBriefHistoryEntry,
  TaskRewardHistoryEntry
} from "./types";

import type { TabKey } from "./components/Sidebar";

interface AchievementBadge {
  key: string;
  title: string;
  tone: string;
  description: string;
  unlockRule: string;
  nextStep: string;
  unlocked: boolean;
  unlockedDay: number | null;
}

interface GrowthTask {
  id: string;
  title: string;
  description: string;
  source: string;
  badgeKey?: string;
}

interface TaskRewardState {
  taskId: string;
  taskTitle: string;
  message: string;
  combo: number;
  level: string;
}

const achievementBadges: AchievementBadge[] = [
  { key: "day7", title: "一周陪伴", tone: "青铜", description: "坚持记录一周", unlockRule: "连续记录7天", nextStep: "继续坚持", unlocked: false, unlockedDay: null },
  { key: "day14", title: "两周守护", tone: "白银", description: "连续记录两周", unlockRule: "连续记录14天", nextStep: "坚持到一个月", unlocked: false, unlockedDay: null },
  { key: "day30", title: "满月成长", tone: "黄金", description: "连续记录一个月", unlockRule: "连续记录30天", nextStep: "开启新阶段", unlocked: false, unlockedDay: null },
  { key: "day100", title: "百日见证", tone: "黄金", description: "完成100天记录", unlockRule: "记录满100天", nextStep: "继续成长", unlocked: false, unlockedDay: null }
];

const growthTasks: GrowthTask[] = [
  { id: "task1", title: "晨间问候", description: "每天早上主动问候孩子", source: "日常习惯" },
  { id: "task2", title: "睡前故事", description: "每天晚上讲一个故事", source: "亲子时光" },
  { id: "task3", title: "情绪命名", description: "帮助孩子识别和表达情绪", source: "情绪教育" },
  { id: "task4", title: "复盘对话", description: "和孩子一起回顾当天", source: "成长反思" },
  { id: "task5", title: "表扬具体", description: "用具体语言表扬孩子的努力", source: "正向激励" },
  { id: "task6", title: "共同游戏", description: "和孩子一起玩15分钟", source: "亲子互动" }
];

const quickEventTemplates: Record<EventType, string[]> = {
  meal: [
    "吃饭前有点抗拒，我先示范一口，再一起完成了三口。",
    "今天尝试新食物，先闻再舔，最后愿意小口尝试。",
    "中途分心，我把任务拆小后，他能继续坐在餐桌前。"
  ],
  sleep: [
    "入睡前情绪上来，我抱着轻拍并重复固定口令，慢慢安静。",
    "今天午睡提前做了固定流程，上床后翻身次数明显减少。",
    "夜醒后先陪伴再放下，能在短时间内再次入睡。"
  ],
  outdoor: [
    "出门前先约定规则，现场能主动提醒自己排队等待。",
    "滑梯轮换时有点急，我先命名情绪再给替代动作，冲突变少。",
    "户外探索后回顾了一个小发现，他愿意主动表达。"
  ],
  learning: [
    "任务拆成两步后，他能独立完成第一步并请求第二步帮助。",
    "今天遇到难点先停一下复述目标，再继续尝试，专注时间更长。",
    "完成后做了简短复盘，他能说出自己最有效的做法。"
  ],
  emotion: [
    "情绪爆发时先抱住并说出感受，等平稳后再讨论规则。",
    "今天能在提醒下说出“我现在生气”，再选择冷静角。",
    "冲突后一起复盘触发点，并约定下次可替代动作。"
  ],
  social: [
    "同伴互动中出现争抢，我引导轮流后能恢复合作。",
    "被拒绝后有点失落，先共情再练习重说请求。",
    "今天主动打招呼并维持简短对话，社交信心有进步。"
  ]
};

const defaultState: AppState = {
  childName: "小洋人",
  day: 1,
  stage: "newborn",
  stats: { safety: 56, trust: 52, curiosity: 48, mood: 50 },
  skillProgress: { mealRoutine: 0, sleepRoutine: 0, tidyUp: 0, requesting: 0, conflictRepair: 0 },
  taskProgress: {},
  taskRewardHistory: [],
  taskRewardBriefHistory: [],
  taskRewardBriefFavorites: [],
  recentEventTemplates: { meal: [], sleep: [], outdoor: [], learning: [], emotion: [], social: [] },
  eventDrafts: { meal: "", sleep: "", outdoor: "", learning: "", emotion: "", social: "" },
  eventSuggestionFeedback: {
    meal: { kept: 0, dismissed: 0, learned: 0, lastDismissed: "" },
    sleep: { kept: 0, dismissed: 0, learned: 0, lastDismissed: "" },
    outdoor: { kept: 0, dismissed: 0, learned: 0, lastDismissed: "" },
    learning: { kept: 0, dismissed: 0, learned: 0, lastDismissed: "" },
    emotion: { kept: 0, dismissed: 0, learned: 0, lastDismissed: "" },
    social: { kept: 0, dismissed: 0, learned: 0, lastDismissed: "" }
  },
  eventSuggestionLearned: { meal: [], sleep: [], outdoor: [], learning: [], emotion: [], social: [] },
  eventSuggestionHistory: { meal: [], sleep: [], outdoor: [], learning: [], emotion: [], social: [] },
  eventSuggestionSourceFilter: { meal: "all", sleep: "all", outdoor: "all", learning: "all", emotion: "all", social: "all" },
  eventSuggestionKeywordFilter: { meal: "", sleep: "", outdoor: "", learning: "", emotion: "", social: "" },
  eventSuggestionRefillMode: { meal: "replace", sleep: "replace", outdoor: "replace", learning: "replace", emotion: "replace", social: "replace" },
  eventRefillUndoDetail: { meal: null, sleep: null, outdoor: null, learning: null, emotion: null, social: null },
  storyProgress: {},
  storyLastVariant: {},
  handoffHistory: [],
  memories: []
};

const emptyFeedback: FeedbackView = {
  childText: "", roleTip: "", narrative: "", hint: "", detail: "", roleLabel: "",
  seasonThemeTitle: "", seasonFestivalName: "", seasonAtmosphere: "", seasonCue: "", seasonBranchPrompt: "",
  familyTone: "", familyHandoff: "", skillTitle: "", skillProgressText: "", skillCoachingTip: "", skillCompletionHint: "",
  storyTitle: "", storyPremise: "", storySignal: "", storyChoice: "", storyVariantLabel: "", storyEcho: "",
  storyMemoryTag: "", storyProgressText: "", storyUnlockedText: "", storyNextGoal: "",
  handoffTrigger: "", handoffEffective: "", handoffAvoid: "", handoffDirection: "",
  emotionLabel: "", emotionRecognition: "", emotionAcceptance: "", emotionGuidance: [],
  expertTitle: "", expertInsight: "", expertTips: [], expertSource: ""
};

function buildStructuredEventDetail(detail: string): string {
  const normalized = detail.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  const sentenceParts = normalized.replace(/\n+/g, "，").split(/[。！？!?；;，,]/).map((item) => item.trim()).filter(Boolean);
  const parts = sentenceParts.length ? sentenceParts : normalized.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const trigger = parts[0] || "";
  const action = parts[1] || "";
  const result = parts.slice(2).join("；");
  return [`触发：${trigger || ""}`, `应对：${action || ""}`, `结果：${result || ""}`].join("\n");
}

function buildNextEventSuggestion(
  eventType: EventType,
  memories: MemoryItem[],
  learnedSamples: Record<EventType, string[]>,
  feedbackMap: Record<EventType, SuggestionFeedbackState>
): { text: string; source: "learned" | "generated" | "template"; reason: string } {
  const feedback = feedbackMap[eventType];
  const learned = (learnedSamples[eventType] || []).find((item) => item && item !== feedback.lastDismissed);
  if (learned) {
    return { text: learned, source: "learned", reason: "优先使用你学习过的改写表达。" };
  }
  const latestSameType = memories.find((item) => item.type === eventType);
  if (!latestSameType) {
    const fallback = quickEventTemplates[eventType][0] || "";
    if (fallback && fallback !== feedback.lastDismissed) {
      return { text: fallback, source: "template", reason: "当前类型暂无历史记录，先使用默认模板。" };
    }
    const nextTemplate = quickEventTemplates[eventType].find((item) => item !== feedback.lastDismissed) || "";
    return { text: nextTemplate, source: "template", reason: "已避开不合适句式，回退到备用模板。" };
  }
  const source = latestSameType.detail.replace(/触发：|应对：|结果：/g, "").replace(/\s+/g, " ").trim();
  const shortSource = source.length > 26 ? `${source.slice(0, 26)}...` : source;
  const generated = `承接上次“${shortSource}”，这次我先____，孩子____，最后____。`;
  if (generated !== feedback.lastDismissed) {
    return { text: generated, source: "generated", reason: "基于同类型最近记录自动生成。" };
  }
  const nextTemplate = quickEventTemplates[eventType].find((item) => item !== feedback.lastDismissed) || generated;
  return { text: nextTemplate, source: "template", reason: "生成句被标记不合适，已自动切换模板。" };
}

function appendSuggestionHistory(
  history: Record<EventType, SuggestionHistoryEntry[]>,
  eventType: EventType,
  action: SuggestionHistoryEntry["action"],
  content: string,
  source?: SuggestionHistoryEntry["source"]
): Record<EventType, SuggestionHistoryEntry[]> {
  const nextEntry: SuggestionHistoryEntry = {
    id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    action, source, content,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
  };
  return { ...history, [eventType]: [nextEntry, ...(history[eventType] || [])].slice(0, 20) };
}

export default function App() {
  const cloudRepo = useMemo(() => createCloudRepository(appConfig.cloud), []);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [accountId, setAccountId] = useState<string>(() => loadCurrentAccountId());
  const [state, setState] = useState<AppState>(() => normalizeAppState(loadState(loadCurrentAccountId(), defaultState)));
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !hasCompletedOnboarding(loadCurrentAccountId()));
  const [formEventType, setFormEventType] = useState<EventType>("meal");
  const [formDetail, setFormDetail] = useState("");
  const [formCaregiverRole, setFormCaregiverRole] = useState<CaregiverRole>("parent");
  const [formIntensity, setFormIntensity] = useState(3);
  const [accountInput, setAccountInput] = useState<string>("");
  const [cloudStatus, setCloudStatus] = useState({ message: "未执行操作", type: "" as "" | "ok" | "warn" });
  const [snapshots, setSnapshots] = useState<CloudSnapshot[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackView>(emptyFeedback);
  const [reportPreview, setReportPreview] = useState<{ kind: "growth" | "handoff"; title: string; content: string; rangeLabel: string; rangeToken: string } | null>(null);
  const [reportRange, setReportRange] = useState<"last7" | "last14" | "last30" | "month" | "all" | "custom">("last7");
  const [customRangeStart, setCustomRangeStart] = useState<string>("1");
  const [customRangeEnd, setCustomRangeEnd] = useState<string>("7");
  const [reportTemplateMode, setReportTemplateMode] = useState<"compact" | "detailed">("detailed");
  const [taskCombo, setTaskCombo] = useState<number>(0);
  const [taskReward, setTaskReward] = useState<TaskRewardState | null>(null);
  const [rewardLevelFilter, setRewardLevelFilter] = useState<"all" | "青铜" | "白银" | "黄金">("all");
  const [rewardTimeFilter, setRewardTimeFilter] = useState<"all" | "7" | "30">("all");
  const [rewardBriefAudience, setRewardBriefAudience] = useState<"parent" | "teacher">("parent");
  const [briefHistoryAudienceFilter, setBriefHistoryAudienceFilter] = useState<"all" | "parent" | "teacher">("all");
  const [briefHistoryFormatFilter, setBriefHistoryFormatFilter] = useState<"all" | "plain" | "markdown">("all");
  const [briefFavoriteKeyword, setBriefFavoriteKeyword] = useState<string>("");
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<string[]>([]);
  const [lastClearedBriefHistory, setLastClearedBriefHistory] = useState<TaskRewardBriefHistoryEntry[] | null>(null);

  const weekMemories = useMemo(() => getWeekMemories(state.memories, state.day), [state.memories, state.day]);
  const handoffSummary = useMemo(() => buildHandoffSummary(weekMemories), [weekMemories]);
  const activeSkillGoals = useMemo(() => getActiveSkillGoals(state.day), [state.day]);
  
  const recentHandoffEntries = useMemo(() => {
    const reportWindow = { startDay: Math.max(1, state.day - 7), endDay: state.day };
    return getHandoffEntriesForWindow(state.handoffHistory, reportWindow).slice(0, 5);
  }, [state.handoffHistory, state.day]);

  const suggestedEvent = useMemo(() => {
    return buildNextEventSuggestion(formEventType, state.memories, state.eventSuggestionLearned, state.eventSuggestionFeedback);
  }, [formEventType, state.memories, state.eventSuggestionLearned, state.eventSuggestionFeedback]);

  const orderedQuickTemplates = useMemo(() => {
    const recent = state.recentEventTemplates[formEventType] || [];
    const templates = quickEventTemplates[formEventType] || [];
    return [...new Set([...recent, ...templates])].slice(0, 5);
  }, [formEventType, state.recentEventTemplates]);

  const filteredRewardHistory = useMemo(() => {
    return state.taskRewardHistory.filter((entry) => {
      if (rewardLevelFilter !== "all" && entry.level !== rewardLevelFilter) return false;
      if (rewardTimeFilter === "7" && entry.day < state.day - 7) return false;
      if (rewardTimeFilter === "30" && entry.day < state.day - 30) return false;
      return true;
    });
  }, [state.taskRewardHistory, rewardLevelFilter, rewardTimeFilter, state.day]);

  const rewardHighestCombo = useMemo(() => Math.max(...filteredRewardHistory.map((e) => e.combo), 0), [filteredRewardHistory]);
  
  const rewardActiveStreak = useMemo(() => {
    if (!state.taskRewardHistory.length) return 0;
    const sorted = [...state.taskRewardHistory].sort((a, b) => b.day - a.day);
    let streak = 0;
    const today = state.day;
    for (let i = 0; i < 7; i++) {
      if (sorted.some((e) => e.day === today - i)) streak++;
      else break;
    }
    return streak;
  }, [state.taskRewardHistory, state.day]);

  const rewardWeekComparison = useMemo(() => {
    const lastWeek = state.taskRewardHistory.filter((e) => e.day >= state.day - 14 && e.day < state.day - 7);
    const thisWeek = state.taskRewardHistory.filter((e) => e.day >= state.day - 7 && e.day <= state.day);
    return { delta: thisWeek.length - lastWeek.length, thisWeek: thisWeek.length, lastWeek: lastWeek.length };
  }, [state.taskRewardHistory, state.day]);

  const rewardMonthComparison = useMemo(() => {
    const lastMonth = state.taskRewardHistory.filter((e) => e.day >= state.day - 60 && e.day < state.day - 30);
    const thisMonth = state.taskRewardHistory.filter((e) => e.day >= state.day - 30 && e.day <= state.day);
    return { delta: thisMonth.length - lastMonth.length, thisMonth: thisMonth.length, lastMonth: lastMonth.length };
  }, [state.taskRewardHistory, state.day]);

  const rewardDominantLevel = useMemo(() => {
    const levelCount: Record<string, number> = { "青铜": 0, "白银": 0, "黄金": 0 };
    filteredRewardHistory.forEach((e) => { if (levelCount[e.level]) levelCount[e.level]++; });
    return Object.entries(levelCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, [filteredRewardHistory]);

  const rewardLevelShareText = useMemo(() => {
    if (!filteredRewardHistory.length) return "暂无数据";
    const total = filteredRewardHistory.length;
    return ["青铜", "白银", "黄金"].map((level) => {
      const count = filteredRewardHistory.filter((e) => e.level === level).length;
      return `${level} ${Math.round((count / total) * 100)}%`;
    }).join(" · ");
  }, [filteredRewardHistory]);

  const recentTaskRewardBriefHistory = useMemo(() => state.taskRewardBriefHistory.slice(0, 10), [state.taskRewardBriefHistory]);

  const filteredTaskRewardBriefHistory = useMemo(() => {
    return state.taskRewardBriefHistory.filter((entry) => {
      if (briefHistoryAudienceFilter !== "all" && entry.audience !== briefHistoryAudienceFilter) return false;
      if (briefHistoryFormatFilter !== "all" && entry.format !== briefHistoryFormatFilter) return false;
      return true;
    }).slice(0, 10);
  }, [state.taskRewardBriefHistory, briefHistoryAudienceFilter, briefHistoryFormatFilter]);

  const filteredTaskRewardBriefFavorites = useMemo(() => {
    if (!briefFavoriteKeyword.trim()) return state.taskRewardBriefFavorites;
    const keyword = briefFavoriteKeyword.toLowerCase();
    return state.taskRewardBriefFavorites.filter((entry) =>
      entry.title.toLowerCase().includes(keyword) || entry.content.toLowerCase().includes(keyword)
    );
  }, [state.taskRewardBriefFavorites, briefFavoriteKeyword]);

  const completedTaskCount = useMemo(() => 
    growthTasks.filter((task) => state.taskProgress[task.id]).length, 
    [state.taskProgress]
  );

  const unlockedAchievementBadges = useMemo(() => {
    return achievementBadges.map((badge) => ({
      ...badge,
      unlocked: state.day >= parseInt(badge.key.replace("day", "")),
      unlockedDay: state.day >= parseInt(badge.key.replace("day", "")) ? state.day : null
    }));
  }, [state.day]);

  useEffect(() => {
    void refreshSnapshots(accountId);
  }, [accountId]);

  useEffect(() => {
    if (!state.memories.length) {
      setLatestFeedback(emptyFeedback);
      return;
    }
    const first = state.memories[0];
    const feedback = buildFeedback(
      first.type, first.caregiverRole, first.intensity, first.detail,
      state.childName, first.day, state.skillProgress, state.storyProgress, state.storyLastVariant
    );
    setLatestFeedback(feedback);
  }, [state.memories, state.childName, state.skillProgress, state.storyProgress, state.storyLastVariant]);

  async function refreshSnapshots(nextAccountId: string): Promise<void> {
    try {
      const list = await cloudRepo.listSnapshots(nextAccountId);
      setSnapshots(list.map((item: CloudSnapshot) => ({ id: item.id, createdAt: item.createdAt, day: item.day, memoriesCount: item.memoriesCount, data: item.data })));
    } catch {
      setSnapshots([]);
      setCloudStatus({ message: "读取快照失败", type: "warn" });
    }
  }

  function onSaveChildName(): void {
    const input = window.prompt("请输入新名字", state.childName)?.trim();
    if (!input) return;
    const nextState: AppState = { ...state, childName: input };
    setState(nextState);
    saveState(accountId, nextState);
  }

  function onNextDay(): void {
    const nextDay = state.day + 1;
    const nextState: AppState = { ...state, day: nextDay, stage: resolveStage(nextDay) };
    setState(nextState);
    saveState(accountId, nextState);
  }

  function onClearState(): void {
    const nextState = normalizeAppState({ ...defaultState });
    setState(nextState);
    saveState(accountId, nextState);
    setCloudStatus({ message: "已清空当前账号本地数据", type: "warn" });
  }

  function onCompleteOnboarding(name: string, stage: AppState["stage"], role: CaregiverRole): void {
    const stageDay = stage === "newborn" ? 1 : stage === "explorer" ? 31 : 91;
    const nextState = { ...state, childName: name, stage, day: stageDay };
    setState(nextState);
    saveState(accountId, nextState);
    setFormCaregiverRole(role);
    markOnboardingComplete(accountId);
    setShowOnboarding(false);
    setActiveTab("record");
    setCloudStatus({ message: "准备好了，写下第一条真实事件吧", type: "ok" });
  }

  function onExportData(): void {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neon-buddy-${accountId}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
    setCloudStatus({ message: "数据已导出", type: "ok" });
  }

  function onDeleteData(): void {
    if (!window.confirm("确定删除当前账号的本地数据吗？此操作不可撤销。")) return;
    localStorage.removeItem(getAccountStorageKey(accountId));
    const nextState = normalizeAppState({ ...defaultState });
    setState(nextState);
    setLatestFeedback(emptyFeedback);
    setShowOnboarding(true);
    setCloudStatus({ message: "本地数据已删除", type: "warn" });
  }

  async function onSwitchAccount(): Promise<void> {
    const normalized = normalizeAccountId(accountInput);
    if (!normalized) {
      setCloudStatus({ message: "账号 ID 仅支持字母、数字、下划线、中划线（2-24位）", type: "warn" });
      return;
    }
    saveState(accountId, state);
    persistCurrentAccountId(normalized);
    setAccountId(normalized);
    setState(normalizeAppState(loadState(normalized, defaultState)));
    setShowOnboarding(!hasCompletedOnboarding(normalized));
    setAccountInput("");
    setCloudStatus({ message: `已切换到账号 ${normalized}`, type: "ok" });
  }

  async function onCopyHandoff(entry: HandoffSummaryEntry): Promise<void> {
    try {
      await navigator.clipboard.writeText(formatHandoffEntry(entry));
      setCloudStatus({ message: `已复制第 ${entry.day} 天的交接摘要`, type: "ok" });
    } catch {
      setCloudStatus({ message: "复制失败", type: "warn" });
    }
  }

  function onGenerateGrowthReport(): void {
    const reportWindow = resolveReportDayWindow(reportRange, state.day, customRangeStart, customRangeEnd);
    if (!reportWindow) {
      setCloudStatus({ message: "自定义范围无效，请检查起止天数", type: "warn" });
      return;
    }
    const reportMemories = getMemoriesForWindow(state.memories, reportWindow);
    const reportTopType = calcTopType(reportMemories) as EventType | "";
    const reportTopRole = calcTopRole(reportMemories) as CaregiverRole | "parent";
    const reportAvgIntensity = calcAverageIntensity(reportMemories);
    const reportBestDelta = calcBestStatDelta(reportMemories, appConfig);
    const reportHandoffSummary = buildHandoffSummary(reportMemories);
    const activeArc = appConfig.stageArcs[state.stage as keyof typeof appConfig.stageArcs];
    const activeSeasonalTheme = appConfig.seasonalThemes[0];
    const activeStoryBranch = { key: "branch1", title: "成长主线" };
    const newUnlockedBadges = getUnlockedBadgesInWindow(unlockedAchievementBadges, reportWindow);
    const content = formatGrowthReport({
      accountId, state, reportRangeLabel: reportWindow.label, reportTemplateMode,
      reportMemories, topType: reportTopType, topRole: reportTopRole, avgIntensity: reportAvgIntensity,
      bestDelta: reportBestDelta, activeArc, activeSkillGoals, activeSeasonalTheme, activeStoryBranch,
      handoffSummary: reportHandoffSummary, newUnlockedBadges
    });
    setReportPreview({ kind: "growth", title: "成长报告", content, rangeLabel: reportWindow.label, rangeToken: reportWindow.token });
    setCloudStatus({ message: `已生成成长报告预览（${reportWindow.label}）`, type: "ok" });
  }

  function onGenerateHandoffReport(): void {
    const reportWindow = resolveReportDayWindow(reportRange, state.day, customRangeStart, customRangeEnd);
    if (!reportWindow) {
      setCloudStatus({ message: "自定义范围无效，请检查起止天数", type: "warn" });
      return;
    }
    const reportMemories = getMemoriesForWindow(state.memories, reportWindow);
    const reportHandoffEntries = getHandoffEntriesForWindow(state.handoffHistory, reportWindow).slice(0, 10);
    const newUnlockedBadges = getUnlockedBadgesInWindow(unlockedAchievementBadges, reportWindow);
    const content = formatHandoffReport({
      accountId, state, reportRangeLabel: reportWindow.label, reportTemplateMode,
      summary: buildHandoffSummary(reportMemories), recentEntries: reportHandoffEntries, newUnlockedBadges
    });
    setReportPreview({ kind: "handoff", title: "家校交接报告", content, rangeLabel: reportWindow.label, rangeToken: reportWindow.token });
    setCloudStatus({ message: `已生成家校交接报告预览（${reportWindow.label}）`, type: "ok" });
  }

  async function onCopyReport(): Promise<void> {
    if (!reportPreview) {
      setCloudStatus({ message: "请先生成一份报告", type: "warn" });
      return;
    }
    try {
      await navigator.clipboard.writeText(reportPreview.content);
      setCloudStatus({ message: `已复制${reportPreview.title}`, type: "ok" });
    } catch {
      setCloudStatus({ message: "复制报告失败", type: "warn" });
    }
  }

  function onDownloadReport(): void {
    if (!reportPreview) {
      setCloudStatus({ message: "请先生成一份报告", type: "warn" });
      return;
    }
    const blob = new Blob([reportPreview.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildReportFileName(reportPreview.kind, accountId, state.day, reportPreview.rangeToken);
    link.click();
    URL.revokeObjectURL(url);
    setCloudStatus({ message: `${reportPreview.title} 已下载为 Markdown`, type: "ok" });
  }

  function onPrintReport(): void {
    if (!reportPreview) {
      setCloudStatus({ message: "请先生成一份报告", type: "warn" });
      return;
    }
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=980,height=760");
    if (!printWindow) {
      setCloudStatus({ message: "打印窗口被浏览器拦截，请允许弹窗后重试", type: "warn" });
      return;
    }
    const html = buildPrintableReportHtml(reportPreview, state.childName, accountId, state.day);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setCloudStatus({ message: `${reportPreview.title} 已打开打印预览`, type: "ok" });
  }

  function onToggleTask(taskId: string): void {
    const task = growthTasks.find((item) => item.id === taskId);
    const currentDone = !!state.taskProgress[taskId];
    const nextTaskProgress: Record<string, boolean> = { ...state.taskProgress, [taskId]: !currentDone };
    let nextTaskRewardHistory = state.taskRewardHistory;

    if (!currentDone && task) {
      const nextCombo = taskCombo + 1;
      const level = resolveTaskRewardLevel(nextCombo);
      const entry: TaskRewardHistoryEntry = {
        day: state.day, taskId, taskTitle: task.title, level, combo: nextCombo,
        message: buildTaskRewardMessage(task.title, nextCombo, level),
        createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
      };
      nextTaskRewardHistory = [entry, ...state.taskRewardHistory].slice(0, 24);
      setTaskCombo(nextCombo);
      setTaskReward({ taskId, taskTitle: task.title, combo: nextCombo, level, message: entry.message });
      setCloudStatus({ message: `任务已完成：${task.title}（${level} · 连击 ${nextCombo}）`, type: "ok" });
    }

    if (currentDone && task) {
      setTaskCombo(0);
      setTaskReward(null);
      setCloudStatus({ message: `任务已撤销：${task.title}`, type: "warn" });
    }

    const nextState: AppState = { ...state, taskProgress: nextTaskProgress, taskRewardHistory: nextTaskRewardHistory };
    setState(nextState);
    saveState(accountId, nextState);
  }

  async function onCopyTaskRewardHistory(entry: TaskRewardHistoryEntry): Promise<void> {
    try {
      await navigator.clipboard.writeText(formatTaskRewardEntry(entry));
      setCloudStatus({ message: `已复制第 ${entry.day} 天的奖励记录`, type: "ok" });
    } catch {
      setCloudStatus({ message: "复制奖励记录失败", type: "warn" });
    }
  }

  async function onCopyDailyAchievementCard(): Promise<void> {
    const card = buildDailyAchievementCard({
      childName: state.childName, day: state.day, completedTaskCount,
      taskTotal: growthTasks.length, taskCombo,
      rewardLevel: taskReward?.level || resolveTaskRewardLevel(taskCombo),
      unlockedBadgesToday: unlockedAchievementBadges.filter((badge) => badge.unlockedDay === state.day).map((badge) => badge.title),
      topTaskTitle: taskReward?.taskTitle || growthTasks.find((task) => state.taskProgress[task.id])?.title || "持续推进中"
    });
    try {
      await navigator.clipboard.writeText(card);
      setCloudStatus({ message: "已复制今日成就卡", type: "ok" });
    } catch {
      setCloudStatus({ message: "复制今日成就卡失败", type: "warn" });
    }
  }

  function onSubmitEvent(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!formDetail.trim()) {
      setCloudStatus({ message: "请先输入事件描述", type: "warn" });
      return;
    }

    const memory: MemoryItem = {
      id: `${Date.now()}`,
      type: formEventType,
      caregiverRole: formCaregiverRole,
      intensity: formIntensity,
      detail: formDetail,
      title: appConfig.eventRules[formEventType].title,
      day: state.day,
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      response: ""
    };

    const feedback = buildFeedback(
      formEventType, formCaregiverRole, formIntensity, formDetail,
      state.childName, state.day, state.skillProgress, state.storyProgress, state.storyLastVariant
    );

    const handoffEntry: HandoffSummaryEntry = {
      day: state.day,
      eventType: formEventType,
      caregiverRole: formCaregiverRole,
      createdAt: memory.createdAt,
      sceneLabel: feedback.handoffTrigger || "日常场景",
      triggerCue: feedback.handoffTrigger || "日常触发",
      effectiveAction: feedback.handoffEffective || "有效做法",
      avoidAction: feedback.handoffAvoid || "避免做法",
      schoolToHome: feedback.handoffDirection || "",
      homeToSchool: ""
    };

    const nextState: AppState = {
      ...state,
      memories: [memory, ...state.memories],
      handoffHistory: [handoffEntry, ...state.handoffHistory].slice(0, 30)
    };

    setState(nextState);
    saveState(accountId, nextState);
    setLatestFeedback(feedback);
    setFormDetail("");
    setCloudStatus({ message: "事件记录成功", type: "ok" });
  }

  function onClearDetail(showMessage: boolean): void {
    if (!formDetail) return;
    const nextState: AppState = { ...state, eventDrafts: { ...state.eventDrafts, [formEventType]: "" } };
    setState(nextState);
    saveState(accountId, nextState);
    setFormDetail("");
    if (showMessage) setCloudStatus({ message: "已清空描述", type: "ok" });
  }

  function onChangeEventType(nextType: EventType): void {
    if (nextType === formEventType) return;
    const nextDrafts: Record<EventType, string> = { ...state.eventDrafts, [formEventType]: formDetail };
    const nextState: AppState = { ...state, eventDrafts: nextDrafts };
    setState(nextState);
    saveState(accountId, nextState);
    setFormEventType(nextType);
    setFormDetail(nextDrafts[nextType] || "");
  }

  function onFillFromLatestSameType(): void {
    const latestSameType = state.memories.find((item) => item.type === formEventType);
    if (!latestSameType) {
      setCloudStatus({ message: "当前类型还没有历史记录可复用", type: "warn" });
      return;
    }
    setFormDetail(latestSameType.detail);
    setCloudStatus({ message: "已填入同类型最近一次记录", type: "ok" });
  }

  function onApplyQuickTemplate(text: string): void {
    const nextRecent: Record<EventType, string[]> = {
      ...state.recentEventTemplates,
      [formEventType]: [text, ...state.recentEventTemplates[formEventType].filter((item) => item !== text)].slice(0, 3)
    };
    const nextState: AppState = { ...state, recentEventTemplates: nextRecent };
    setState(nextState);
    saveState(accountId, nextState);
    setFormDetail((prev) => prev.trim() ? `${prev.trim()} ${text}`.trim() : text);
  }

  function onStructureEventDetail(): void {
    const nextDetail = buildStructuredEventDetail(formDetail);
    if (!nextDetail) {
      setCloudStatus({ message: "先输入一段真实描述，再进行结构化", type: "warn" });
      return;
    }
    const nextState: AppState = { ...state, eventDrafts: { ...state.eventDrafts, [formEventType]: nextDetail } };
    setState(nextState);
    saveState(accountId, nextState);
    setFormDetail(nextDetail);
    setCloudStatus({ message: "已整理为触发-应对-结果三段", type: "ok" });
  }

  function onApplySuggestedEventDetail(): void {
    if (!suggestedEvent.text) {
      setCloudStatus({ message: "当前暂无推荐句", type: "warn" });
      return;
    }
    const nextDetail = formDetail.trim() ? `${formDetail.trim()}\n${suggestedEvent.text}` : suggestedEvent.text;
    const nextState: AppState = {
      ...state,
      eventDrafts: { ...state.eventDrafts, [formEventType]: nextDetail },
      eventSuggestionHistory: appendSuggestionHistory(state.eventSuggestionHistory, formEventType, "applied", suggestedEvent.text, suggestedEvent.source)
    };
    setState(nextState);
    saveState(accountId, nextState);
    setFormDetail(nextDetail);
    setCloudStatus({ message: "已填入推荐句", type: "ok" });
  }

  function onKeepSuggestedEventDetail(): void {
    if (!suggestedEvent.text) return;
    const current = state.eventSuggestionFeedback[formEventType];
    const nextState: AppState = {
      ...state,
      eventSuggestionFeedback: {
        ...state.eventSuggestionFeedback,
        [formEventType]: { ...current, kept: current.kept + 1, lastDismissed: "" }
      },
      eventSuggestionHistory: appendSuggestionHistory(state.eventSuggestionHistory, formEventType, "kept", suggestedEvent.text, suggestedEvent.source)
    };
    setState(nextState);
    saveState(accountId, nextState);
    setCloudStatus({ message: "已记录为有效推荐", type: "ok" });
  }

  function onDismissSuggestedEventDetail(): void {
    if (!suggestedEvent.text) return;
    const current = state.eventSuggestionFeedback[formEventType];
    const nextState: AppState = {
      ...state,
      eventSuggestionFeedback: {
        ...state.eventSuggestionFeedback,
        [formEventType]: { ...current, dismissed: current.dismissed + 1, lastDismissed: suggestedEvent.text }
      },
      eventSuggestionHistory: appendSuggestionHistory(state.eventSuggestionHistory, formEventType, "dismissed", suggestedEvent.text, suggestedEvent.source)
    };
    setState(nextState);
    saveState(accountId, nextState);
    setCloudStatus({ message: "已记录为不合适", type: "warn" });
  }

  function onLearnCurrentRewrite(): void {
    const currentText = formDetail.trim();
    if (!currentText) {
      setCloudStatus({ message: "先改写一段你的版本", type: "warn" });
      return;
    }
    const currentFeedback = state.eventSuggestionFeedback[formEventType];
    const nextLearned = [currentText, ...state.eventSuggestionLearned[formEventType].filter((item) => item !== currentText)].slice(0, 3);
    const nextState: AppState = {
      ...state,
      eventSuggestionLearned: { ...state.eventSuggestionLearned, [formEventType]: nextLearned },
      eventSuggestionFeedback: {
        ...state.eventSuggestionFeedback,
        [formEventType]: { ...currentFeedback, learned: currentFeedback.learned + 1, lastDismissed: "" }
      },
      eventSuggestionHistory: appendSuggestionHistory(state.eventSuggestionHistory, formEventType, "learned", currentText, "learned")
    };
    setState(nextState);
    saveState(accountId, nextState);
    setCloudStatus({ message: "已学习你的改写", type: "ok" });
  }

  return (
    <div className="app-container">
      <Header accountId={accountId} state={state} onNextDay={onNextDay} onClearState={onClearState} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          <div className="page-container">
            {activeTab === "dashboard" && (
              <Dashboard
                state={state}
                weekMemories={weekMemories}
                handoffSummary={handoffSummary}
                recentHandoffEntries={recentHandoffEntries}
                onCopyHandoff={onCopyHandoff}
                onRecord={() => setActiveTab("record")}
              />
            )}
            {activeTab === "record" && (
              <EventForm
                state={state}
                onSubmit={onSubmitEvent}
                onClearDetail={onClearDetail}
                onChangeEventType={onChangeEventType}
                onChangeDetail={setFormDetail}
                caregiverRole={formCaregiverRole}
                intensity={formIntensity}
                onChangeCaregiverRole={setFormCaregiverRole}
                onChangeIntensity={setFormIntensity}
                onFillFromLatestSameType={onFillFromLatestSameType}
                onApplyQuickTemplate={onApplyQuickTemplate}
                onStructureEventDetail={onStructureEventDetail}
                onApplySuggestedEventDetail={onApplySuggestedEventDetail}
                onKeepSuggestedEventDetail={onKeepSuggestedEventDetail}
                onDismissSuggestedEventDetail={onDismissSuggestedEventDetail}
                onLearnCurrentRewrite={onLearnCurrentRewrite}
                latestFeedback={latestFeedback}
                suggestedEventDetail={suggestedEvent.text}
                suggestedEventSource={suggestedEvent.source}
                suggestedEventReason={suggestedEvent.reason}
                recentQuickTemplates={state.recentEventTemplates[formEventType] || []}
                orderedQuickTemplates={orderedQuickTemplates}
              />
            )}
            {activeTab === "profile" && (
              <Profile
                state={state}
                activeSkillGoals={activeSkillGoals}
                achievementBadges={unlockedAchievementBadges}
                growthTasks={growthTasks}
                taskCombo={taskCombo}
                taskReward={taskReward}
                filteredRewardHistory={filteredRewardHistory}
                recentTaskRewardBriefHistory={recentTaskRewardBriefHistory}
                onSaveChildName={onSaveChildName}
                onToggleTask={onToggleTask}
                onCopyTaskRewardHistory={onCopyTaskRewardHistory}
                onCopyDailyAchievementCard={onCopyDailyAchievementCard}
              />
            )}
            {activeTab === "reports" && (
              <Reports
                state={state}
                weekMemories={weekMemories}
                onGenerateGrowthReport={onGenerateGrowthReport}
                onGenerateHandoffReport={onGenerateHandoffReport}
                onCopyReport={onCopyReport}
                onDownloadReport={onDownloadReport}
                onPrintReport={onPrintReport}
              />
            )}
            {activeTab === "timeline" && <Timeline state={state} />}
            {activeTab === "settings" && <Settings accountId={accountId} state={state} onExport={onExportData} onDelete={onDeleteData} />}
          </div>
          {showOnboarding && (
            <Onboarding initialName={state.childName} onComplete={onCompleteOnboarding} />
          )}
        </main>
      </div>
      <div className="cloud-status" style={{
        position: "fixed", bottom: 16, right: 16,
        padding: "8px 16px", borderRadius: 8,
        backgroundColor: cloudStatus.type === "ok" ? "#D1FAE5" : cloudStatus.type === "warn" ? "#FEF3C7" : "#E2E8F0",
        color: cloudStatus.type === "ok" ? "#059669" : cloudStatus.type === "warn" ? "#D97706" : "#64748B",
        fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        {cloudStatus.message}
      </div>
    </div>
  );
}