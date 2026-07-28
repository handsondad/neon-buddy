import type { AppState, StageKey, LifeSkillKey, AchievementBadge, GrowthTask, TaskRewardHistoryEntry, TaskRewardBriefHistoryEntry } from "../types";
import { appConfig } from "../config/appConfig";
import { calcStageProgress, getActiveSkillGoals, resolveStageText, resolveNextStageText } from "../lib/summary";

interface ProfileProps {
  state: AppState;
  activeSkillGoals: ReturnType<typeof getActiveSkillGoals>;
  achievementBadges: AchievementBadge[];
  growthTasks: GrowthTask[];
  taskCombo: number;
  taskReward: { taskId: string; taskTitle: string; message: string; combo: number; level: string } | null;
  filteredRewardHistory: TaskRewardHistoryEntry[];
  recentTaskRewardBriefHistory: TaskRewardBriefHistoryEntry[];
  onSaveChildName: () => void;
  onToggleTask: (taskId: string) => void;
  onCopyTaskRewardHistory: (entry: TaskRewardHistoryEntry) => void;
  onCopyDailyAchievementCard: () => void;
}

export function Profile({
  state,
  activeSkillGoals,
  achievementBadges,
  growthTasks,
  taskCombo,
  taskReward,
  filteredRewardHistory,
  recentTaskRewardBriefHistory,
  onSaveChildName,
  onToggleTask,
  onCopyTaskRewardHistory,
  onCopyDailyAchievementCard
}: ProfileProps) {
  const stageProgress = calcStageProgress(state.day, state.stage as StageKey);
  const activeArc = appConfig.stageArcs[state.stage as StageKey];
  const completedMilestones = activeArc.milestones.filter((item) => state.day >= item.day).length;
  const stageFocusTitles = activeArc.focusEvents.map((event) => appConfig.eventRules[event].title);
  const nextStageText = resolveNextStageText(state.stage);
  const completedTaskCount = growthTasks.filter((task) => state.taskProgress[task.id]).length;
  const taskProgressPercent = growthTasks.length ? Math.round((completedTaskCount / growthTasks.length) * 100) : 0;
  const unlockedBadges = achievementBadges.filter((item) => item.unlocked).sort((a, b) => (a.unlockedDay || 999) - (b.unlockedDay || 999));

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-info">
          <h2>成长档案</h2>
          <div className="child-name-section">
            <span className="label">名字</span>
            <div className="name-display">
              <strong>{state.childName}</strong>
              <button className="btn btn-sm" onClick={onSaveChildName}>修改</button>
            </div>
          </div>
        </div>
        <div className="stage-info">
          <span className="stage-label">成长阶段</span>
          <span className="stage-value">{resolveStageText(state.stage)}</span>
        </div>
      </div>

      <div className="stats-section">
        <h3>成长指标</h3>
        <div className="stats-grid">
          {(Object.keys(state.stats) as Array<keyof AppState["stats"]>).map((key) => (
            <div key={key} className="stat-item">
              <span className="stat-label">{appConfig.statLabels[key]}</span>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${state.stats[key]}%` }} />
              </div>
              <span className="stat-value">{Math.round(state.stats[key])}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stage-section">
        <h3>成长主线</h3>
        <div className="stage-card">
          <div className="stage-header">
            <span className="stage-title">{activeArc.title}</span>
            <span className="stage-progress-text">{stageProgress}%</span>
          </div>
          <p className="stage-mission">{activeArc.mission}</p>
          <div className="stage-progress-bar">
            <div className="stage-progress-fill" style={{ width: `${stageProgress}%` }} />
          </div>
          <p className="stage-meta">{completedMilestones}/{activeArc.milestones.length} 里程碑已达成</p>
          <div className="stage-guidance">
            <p><strong>照护建议：</strong>{activeArc.caregiverGuidance}</p>
            <p><strong>本阶段重点：</strong>{stageFocusTitles.join("、")}</p>
            <p><strong>下一阶段：</strong>{nextStageText}</p>
          </div>
          <div className="milestones-list">
            {activeArc.milestones.map((milestone) => (
              <div key={`${state.stage}-${milestone.day}`} className={`milestone-item ${state.day >= milestone.day ? "done" : "pending"}`}>
                <span className="milestone-day">第 {milestone.day} 天</span>
                <span className="milestone-status">{state.day >= milestone.day ? "已达成" : "进行中"}</span>
                <h4 className="milestone-title">{milestone.title}</h4>
                <p className="milestone-desc">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="skills-section">
        <h3>生活技能</h3>
        <div className="skills-grid">
          {activeSkillGoals.map((goal) => {
            const count = state.skillProgress[goal.key as LifeSkillKey];
            const percent = Math.min(100, Math.round((count / goal.targetCount) * 100));
            return (
              <div key={goal.key} className="skill-card">
                <div className="skill-header">
                  <span className="skill-title">{goal.title}</span>
                  <span className="skill-progress">{count}/{goal.targetCount}</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <p className="skill-tip">{goal.coachingTip}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="achievements-section">
        <h3>成长勋章墙</h3>
        <div className="achievements-header">
          <span className="achievements-count">{unlockedBadges.length}/{achievementBadges.length} 已点亮</span>
        </div>
        <div className="achievements-grid">
          {achievementBadges.map((badge) => (
            <div key={badge.key} className={`achievement-card ${badge.unlocked ? "unlocked" : "locked"}`}>
              <span className="achievement-tone">{badge.tone}</span>
              <h4 className="achievement-title">{badge.title}</h4>
              <p className="achievement-desc">{badge.description}</p>
              <p className="achievement-rule"><strong>解锁条件：</strong>{badge.unlockRule}</p>
              <p className="achievement-next"><strong>下一步：</strong>{badge.nextStep}</p>
              <p className="achievement-day">{badge.unlockedDay ? `获得于第 ${badge.unlockedDay} 天` : "尚未获得"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="tasks-section">
        <h3>成长任务系统</h3>
        <div className="tasks-header">
          <span className="tasks-count">{completedTaskCount}/{growthTasks.length} 已完成</span>
          <button className="btn btn-sm" onClick={onCopyDailyAchievementCard}>复制今日成就卡</button>
        </div>
        <div className="tasks-progress">
          <div className="tasks-progress-bar">
            <div className="tasks-progress-fill" style={{ width: `${taskProgressPercent}%` }} />
          </div>
          <span className="tasks-progress-text">任务进度 {taskProgressPercent}% · 当前连击 {taskCombo}</span>
        </div>
        {taskReward && (
          <div className="task-reward-banner">
            <h4>任务奖励：{taskReward.taskTitle}</h4>
            <span className="task-reward-level">{taskReward.level}</span>
            <p>{taskReward.message}</p>
          </div>
        )}
        <div className="tasks-list">
          {growthTasks.map((task) => (
            <div key={task.id} className={`task-item ${state.taskProgress[task.id] ? "done" : "todo"}`}>
              <div className="task-header">
                <div>
                  <h4 className="task-title">{task.title}</h4>
                  <span className="task-source">来源：{task.source}</span>
                </div>
                <button className="btn btn-sm" onClick={() => onToggleTask(task.id)}>
                  {state.taskProgress[task.id] ? "撤销" : "完成"}
                </button>
              </div>
              <p className="task-desc">{task.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rewards-section">
        <h3>奖励历史</h3>
        <div className="rewards-list">
          {filteredRewardHistory.slice(0, 6).map((entry, index) => (
            <div key={`${entry.createdAt}-${entry.taskId}-${index}`} className="reward-item">
              <div className="reward-header">
                <div>
                  <span className="reward-day">第 {entry.day} 天</span>
                  <span className="reward-time">{entry.createdAt}</span>
                </div>
                <button className="btn btn-sm" onClick={() => onCopyTaskRewardHistory(entry)}>复制</button>
              </div>
              <h4 className="reward-title">{entry.taskTitle}</h4>
              <p><strong>等级：</strong>{entry.level} · 连击 {entry.combo}</p>
              <p>{entry.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="brief-history-section">
        <h3>简报历史</h3>
        <div className="brief-list">
          {recentTaskRewardBriefHistory.map((entry) => (
            <div key={entry.id} className="brief-item">
              <div className="brief-header">
                <span className="brief-day">第 {entry.day} 天</span>
                <span className="brief-time">{entry.createdAt}</span>
              </div>
              <h4 className="brief-title">{entry.title}</h4>
              <p className="brief-filter">{entry.filterSummary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
