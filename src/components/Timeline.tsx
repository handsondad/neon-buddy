import type { AppState, MemoryItem } from "../types";
import { appConfig } from "../config/appConfig";

interface TimelineProps {
  state: AppState;
}

export function Timeline({ state }: TimelineProps) {
  const groupedMemories = state.memories.reduce((acc, memory) => {
    const key = `day-${memory.day}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(memory);
    return acc;
  }, {} as Record<string, MemoryItem[]>);

  const sortedDays = Object.keys(groupedMemories).sort((a, b) => {
    const dayA = parseInt(a.split("-")[1]);
    const dayB = parseInt(b.split("-")[1]);
    return dayB - dayA;
  });

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h2>成长时间线</h2>
        <span className="timeline-count">共 {state.memories.length} 条记录</span>
      </div>

      {state.memories.length === 0 ? (
        <div className="empty-timeline">
          <p>还没有记录，先添加第一条真实事件吧。</p>
        </div>
      ) : (
        <div className="timeline-content">
          {sortedDays.map((dayKey) => {
            const day = parseInt(dayKey.split("-")[1]);
            const dayMemories = groupedMemories[dayKey];
            return (
              <div key={dayKey} className="timeline-day">
                <div className="day-header">
                  <div className="day-badge">
                    <span className="day-number">第 {day} 天</span>
                  </div>
                  <span className="day-count">{dayMemories.length} 条记录</span>
                </div>
                <div className="day-memories">
                  {dayMemories.map((memory, index) => (
                    <div key={`${memory.createdAt}-${index}`} className="memory-card">
                      <div className="memory-header">
                        <span className="memory-time">{memory.createdAt}</span>
                        <span className="memory-role">{appConfig.caregiverRoles[memory.caregiverRole].label}</span>
                        <span className={`memory-intensity intensity-${memory.intensity}`}>强度 {memory.intensity}</span>
                      </div>
                      <h3 className="memory-title">{memory.title}</h3>
                      <p className="memory-detail">{memory.detail}</p>
                      <p className="memory-response">{memory.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
