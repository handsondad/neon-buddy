import type { AppState, EventType, MemoryItem, HandoffSummaryEntry, CaregiverRole } from "../types";
import { appConfig } from "../config/appConfig";
import { calcTopType, calcTopRole, calcAverageIntensity, calcBestStatDelta } from "../lib/summary";
import { buildHandoffSummary, getHighlights } from "../lib/summary";

interface DashboardProps {
  state: AppState;
  weekMemories: MemoryItem[];
  handoffSummary: ReturnType<typeof buildHandoffSummary>;
  recentHandoffEntries: HandoffSummaryEntry[];
  onCopyHandoff: (entry: HandoffSummaryEntry) => void;
  onRecord: () => void;
}

export function Dashboard({ state, weekMemories, handoffSummary, recentHandoffEntries, onCopyHandoff, onRecord }: DashboardProps) {
  const topType = calcTopType(weekMemories) as EventType | "";
  const topRole = calcTopRole(weekMemories) as CaregiverRole;
  const avgIntensity = calcAverageIntensity(weekMemories);
  const bestDelta = calcBestStatDelta(weekMemories, appConfig);
  const highlights = getHighlights(weekMemories);

  const getRoleLabel = (role: string) => {
    const roleKey = role as CaregiverRole;
    return appConfig.caregiverRoles[roleKey]?.label || role;
  };

  return (
    <div className="dashboard">
      <div className="daily-loop-card">
        <div>
          <span className="eyebrow">今日陪伴 · 第 {state.day} 天</span>
          <h2>{weekMemories.length ? "今天已经留下足迹" : "给今天留下一条真实记录"}</h2>
          <p>{weekMemories.length ? "回看最近一次反馈，选择一个小动作继续陪伴。" : "记录一件吃饭、睡眠、情绪或互动时刻，预计 3 分钟完成。"}</p>
        </div>
        <button className="btn btn-primary" onClick={onRecord}>{weekMemories.length ? "继续记录" : "开始记录"}</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{weekMemories.length}</span>
            <span className="stat-label">本周记录</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{topType ? appConfig.eventRules[topType].title : "暂无"}</span>
            <span className="stat-label">高频场景</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{getRoleLabel(topRole)}</span>
            <span className="stat-label">主陪伴者</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{avgIntensity}</span>
            <span className="stat-label">平均强度</span>
          </div>
        </div>
      </div>

      <div className="handoff-card">
        <div className="card-header">
          <h3>家校协同摘要</h3>
          <span className="badge">{handoffSummary.sceneLabel}</span>
        </div>
        <div className="handoff-grid">
          <div className="handoff-item">
            <span className="handoff-label">高频触发点</span>
            <p>{handoffSummary.triggerCue}</p>
          </div>
          <div className="handoff-item">
            <span className="handoff-label">有效做法</span>
            <p>{handoffSummary.effectiveAction}</p>
          </div>
          <div className="handoff-item">
            <span className="handoff-label">需避免</span>
            <p>{handoffSummary.avoidAction}</p>
          </div>
          <div className="handoff-item">
            <span className="handoff-label">学校 → 家庭</span>
            <p>{handoffSummary.schoolToHome}</p>
          </div>
          <div className="handoff-item">
            <span className="handoff-label">家庭 → 学校</span>
            <p>{handoffSummary.homeToSchool}</p>
          </div>
        </div>
      </div>

      <div className="trend-card">
        <div className="card-header">
          <h3>本周趋势</h3>
        </div>
        {weekMemories.length === 0 ? (
          <p className="empty-state">本周还没有记录，先写下第一条真实事件吧。</p>
        ) : (
          <div className="trend-content">
            <div className="trend-item">
              <span className="trend-label">{appConfig.statLabels[bestDelta[0]]}</span>
              <span className={`trend-value ${bestDelta[1] > 0 ? "positive" : bestDelta[1] < 0 ? "negative" : "neutral"}`}>
                {bestDelta[1] > 0 ? "+" : ""}{bestDelta[1]}
              </span>
            </div>
            <p className="trend-desc">建议：继续保持稳定回应，在高频场景里强化陪伴一致性。</p>
          </div>
        )}
      </div>

      <div className="highlights-card">
        <div className="card-header">
          <h3>关键记忆</h3>
        </div>
        {highlights.length === 0 ? (
          <p className="empty-state">暂无关键记忆。</p>
        ) : (
          <div className="highlights-list">
            {highlights.map((item: MemoryItem) => (
              <div key={`${item.createdAt}-${item.detail}`} className="highlight-item">
                <div className="highlight-header">
                  <span className="highlight-day">第 {item.day} 天</span>
                  <span className="highlight-role">{getRoleLabel(item.caregiverRole)}</span>
                  <span className="highlight-intensity">强度 {item.intensity}</span>
                </div>
                <h4 className="highlight-title">{item.title}</h4>
                <p className="highlight-detail">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="handoff-history-card">
        <div className="card-header">
          <h3>交接历史</h3>
          <span className="badge">最近 {recentHandoffEntries.length} 条</span>
        </div>
        {recentHandoffEntries.length === 0 ? (
          <p className="empty-state">还没有交接快照，先记录一条真实事件。</p>
        ) : (
          <div className="handoff-history-list">
            {recentHandoffEntries.map((entry, index) => (
              <div key={`${entry.createdAt}-${entry.eventType}-${index}`} className="handoff-history-item">
                <div className="handoff-history-header">
                  <div>
                    <span className="handoff-history-day">第 {entry.day} 天</span>
                    <span className="handoff-history-role">{getRoleLabel(entry.caregiverRole)}</span>
                  </div>
                  <button className="btn btn-sm" onClick={() => onCopyHandoff(entry)}>复制摘要</button>
                </div>
                <h4 className="handoff-history-title">{entry.sceneLabel}</h4>
                <div className="handoff-history-content">
                  <p><strong>触发点：</strong>{entry.triggerCue}</p>
                  <p><strong>有效做法：</strong>{entry.effectiveAction}</p>
                  <p><strong>避免做法：</strong>{entry.avoidAction}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}