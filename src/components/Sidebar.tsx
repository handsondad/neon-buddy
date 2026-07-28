type TabKey = "dashboard" | "record" | "profile" | "reports" | "timeline";

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "概览", icon: "home" },
  { key: "record", label: "记录事件", icon: "edit" },
  { key: "profile", label: "成长档案", icon: "user" },
  { key: "reports", label: "报告中心", icon: "file-text" },
  { key: "timeline", label: "时间线", icon: "clock" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {tab.icon === "home" && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
              {tab.icon === "edit" && <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />}
              {tab.icon === "user" && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />}
              {tab.icon === "file-text" && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />}
              {tab.icon === "clock" && <circle cx="12" cy="12" r="10" />}
            </svg>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="version-info">
          <span className="version-label">版本</span>
          <span className="version-number">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
