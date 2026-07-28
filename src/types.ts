export type EventType = "meal" | "sleep" | "outdoor" | "learning" | "emotion" | "social";
export type CaregiverRole = "parent" | "grandparent" | "teacher" | "relative";
export type StageKey = "newborn" | "explorer" | "communicator";
export type StatKey = "safety" | "trust" | "curiosity" | "mood";
export type LifeSkillKey = "mealRoutine" | "sleepRoutine" | "tidyUp" | "requesting" | "conflictRepair";

export interface Stats {
  safety: number;
  trust: number;
  curiosity: number;
  mood: number;
}

export interface MemoryItem {
  id?: string;
  day: number;
  type: EventType;
  caregiverRole: CaregiverRole;
  intensity: number;
  detail: string;
  title: string;
  response: string;
  createdAt: string;
}

export interface HandoffSummaryEntry {
  day: number;
  eventType: EventType;
  caregiverRole: CaregiverRole;
  sceneLabel: string;
  triggerCue: string;
  effectiveAction: string;
  avoidAction: string;
  schoolToHome: string;
  homeToSchool: string;
  createdAt: string;
}

export interface TaskRewardHistoryEntry {
  day: number;
  taskId: string;
  taskTitle: string;
  level: string;
  combo: number;
  message: string;
  createdAt: string;
}

export interface TaskRewardBriefHistoryEntry {
  id: string;
  sourceId?: string;
  day: number;
  createdAt: string;
  audience: "parent" | "teacher";
  format: "plain" | "markdown";
  title: string;
  filterSummary: string;
  content: string;
  recordCount?: number;
  highestCombo?: number;
  activeStreak?: number;
  weekDelta?: number;
  monthDelta?: number;
}

export interface SuggestionFeedbackState {
  kept: number;
  dismissed: number;
  learned: number;
  lastDismissed: string;
}

export interface SuggestionHistoryEntry {
  id: string;
  action: "applied" | "kept" | "dismissed" | "learned";
  source?: "learned" | "generated" | "template";
  content: string;
  createdAt: string;
}

export interface AppState {
  childName: string;
  day: number;
  stage: StageKey;
  stats: Stats;
  skillProgress: Record<LifeSkillKey, number>;
  taskProgress: Record<string, boolean>;
  taskRewardHistory: TaskRewardHistoryEntry[];
  taskRewardBriefHistory: TaskRewardBriefHistoryEntry[];
  taskRewardBriefFavorites: TaskRewardBriefHistoryEntry[];
  recentEventTemplates: Record<EventType, string[]>;
  eventDrafts: Record<EventType, string>;
  eventSuggestionFeedback: Record<EventType, SuggestionFeedbackState>;
  eventSuggestionLearned: Record<EventType, string[]>;
  eventSuggestionHistory: Record<EventType, SuggestionHistoryEntry[]>;
  eventSuggestionSourceFilter: Record<EventType, "all" | "learned" | "generated" | "template">;
  eventSuggestionKeywordFilter: Record<EventType, string>;
  eventSuggestionRefillMode: Record<EventType, "replace" | "append">;
  eventRefillUndoDetail: Record<EventType, string | null>;
  storyProgress: Record<string, Record<string, number>>;
  storyLastVariant: Record<string, string>;
  handoffHistory: HandoffSummaryEntry[];
  memories: MemoryItem[];
}

export type StoryVariantIntensity = "low" | "high" | "any";

export interface StoryWorldVariant {
  key: string;
  label: string;
  preferredRoles: CaregiverRole[];
  intensity: StoryVariantIntensity;
  signalShift: string;
  choiceShift: string;
  echoLines: string[];
  memoryTag: string;
}

export interface HandoffTemplate {
  triggerCue: string;
  effectiveAction: string;
  avoidAction: string;
  schoolToHome: string;
  homeToSchool: string;
}

export interface StageItem {
  key: StageKey;
  minDay: number;
  text: string;
}

export interface StageMilestone {
  day: number;
  title: string;
  description: string;
}

export interface StageArc {
  title: string;
  mission: string;
  caregiverGuidance: string;
  focusEvents: EventType[];
  milestones: StageMilestone[];
}

export interface EventRule {
  title: string;
  narrative: string;
  effect: Stats;
}

export interface CaregiverRoleTemplate {
  label: string;
  highIntensityTemplate: string;
  normalTemplate: string;
}

export interface EthicalCopy {
  replacements: Array<{ from: string; to: string }>;
  blockedKeywords: string[];
  fallbackLine: string;
  hint: string;
}

export interface ExpertCard {
  title: string;
  insight: string;
  source: string;
  actionTips: string[];
}

export interface FamilyRoleGuide {
  tone: string;
  handoff: string;
}

export interface EmotionEducationGuide {
  emotionLabel: string;
  recognition: string;
  acceptance: string;
  guidance: string[];
}

export interface ThemeWindow {
  startDay: number;
  endDay: number;
}

export interface SeasonalTheme {
  id: string;
  title: string;
  seasonTag: string;
  festivalName: string;
  atmosphere: string;
  caregiverCue: string;
  microChallenge: string;
  memoryBranchPrompts: string[];
  window: ThemeWindow;
}

export interface LifeSkillGoal {
  key: LifeSkillKey;
  title: string;
  relatedEvents: EventType[];
  stageFocus: StageKey[];
  targetCount: number;
  coachingTip: string;
  completionHint: string;
}

export interface StoryWorldBranch {
  id: string;
  title: string;
  stageFocus: StageKey[];
  triggerEvents: EventType[];
  targetCount: number;
  premise: string;
  currentSignal: string;
  caregiverChoice: string;
  memoryTag: string;
  variants: StoryWorldVariant[];
}

export interface CloudConfig {
  mode: "mock-local" | "http";
  apiBase: string;
  timeoutMs: number;
}

export interface AppConfig {
  cloud: CloudConfig;
  stageMap: StageItem[];
  stageArcs: Record<StageKey, StageArc>;
  statLabels: Record<StatKey, string>;
  caregiverRoles: Record<CaregiverRole, CaregiverRoleTemplate>;
  roleEventTips: Record<CaregiverRole, Record<EventType, string>>;
  eventRules: Record<EventType, EventRule>;
  emotionEducation: Record<EventType, EmotionEducationGuide>;
  seasonalThemes: SeasonalTheme[];
  familyRoleGuides: Record<CaregiverRole, FamilyRoleGuide>;
  lifeSkillGoals: Record<LifeSkillKey, LifeSkillGoal>;
  storyWorldBranches: StoryWorldBranch[];
  handoffTemplates: Record<EventType, HandoffTemplate>;
  ethicalCopy: EthicalCopy;
  expertCards: Record<EventType | "default", ExpertCard>;
}

export interface CloudSnapshot {
  id: string;
  createdAt: string;
  day: number;
  memoriesCount: number;
  data: AppState;
}

export interface FeedbackView {
  childText: string;
  roleTip: string;
  narrative: string;
  hint: string;
  detail: string;
  roleLabel: string;
  seasonThemeTitle: string;
  seasonFestivalName: string;
  seasonAtmosphere: string;
  seasonCue: string;
  seasonBranchPrompt: string;
  familyTone: string;
  familyHandoff: string;
  skillTitle: string;
  skillProgressText: string;
  skillCoachingTip: string;
  skillCompletionHint: string;
  storyTitle: string;
  storyPremise: string;
  storySignal: string;
  storyChoice: string;
  storyVariantLabel: string;
  storyEcho: string;
  storyMemoryTag: string;
  storyProgressText: string;
  storyUnlockedText: string;
  storyNextGoal: string;
  handoffTrigger: string;
  handoffEffective: string;
  handoffAvoid: string;
  handoffDirection: string;
  emotionLabel: string;
  emotionRecognition: string;
  emotionAcceptance: string;
  emotionGuidance: string[];
  expertTitle: string;
  expertInsight: string;
  expertTips: string[];
  expertSource: string;
}

export interface AchievementBadge {
  key: string;
  title: string;
  tone: string;
  description: string;
  unlockRule: string;
  nextStep: string;
  unlocked: boolean;
  unlockedDay: number | null;
}

export interface GrowthTask {
  id: string;
  title: string;
  description: string;
  source: string;
  badgeKey?: string;
}