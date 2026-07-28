import type { AppState } from "../types";

interface HeaderProps {
  accountId: string;
  state: AppState;
  onNextDay: () => void;
  onClearState: () => void;
}

export function Header({ accountId, state, onNextDay, onClearState }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div className="brand-text">
          <h1 className="brand-title">成长实验场</h1>
          <p className="brand-subtitle">记录真实育儿时刻，见证孩子成长</p>
        </div>
      </div>

      <div className="header-center">
        <div className="day-badge">
          <span className="day-label">第</span>
          <span className="day-number">{state.day}</span>
          <span className="day-label">天</span>
        </div>
        <span className="child-name">{state.childName}</span>
      </div>

      <div className="header-actions">
        <span className="account-info">账号: {accountId}</span>
        <button className="btn btn-secondary" onClick={onNextDay}>
          进入下一天
        </button>
        <button className="btn btn-danger" onClick={onClearState}>
          清空记录
        </button>
      </div>
    </header>
  );
}
