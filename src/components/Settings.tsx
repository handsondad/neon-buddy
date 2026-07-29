import type { AppState } from "../types";
import { appConfig } from "../config/appConfig";

interface SettingsProps {
  accountId: string;
  state: AppState;
  onExport: () => void;
  onDelete: () => void;
}

export function Settings({ accountId, state, onExport, onDelete }: SettingsProps) {
  return (
    <div className="settings-page">
      <h2>设置与隐私</h2>
      <p className="page-description">管理本地数据、账号和反馈安全边界。</p>
      <div className="settings-grid">
        <section className="settings-card">
          <h3>隐私与数据</h3>
          <p>当前账号：<strong>{accountId}</strong></p>
          <p>已记录 {state.memories.length} 条事件。默认保存于当前浏览器，不会自动上传。</p>
          <div className="settings-actions">
            <button className="btn btn-secondary" onClick={onExport}>导出我的数据</button>
            <button className="btn btn-danger" onClick={onDelete}>删除本地数据</button>
          </div>
        </section>
        <section className="settings-card">
          <h3>安全边界</h3>
          <p>反馈用于陪伴记录与日常观察，不构成医疗、心理诊断或治疗建议。</p>
          <p>文案过滤：已启用（{appConfig.ethicalCopy.blockedKeywords.length} 类敏感词规则）</p>
          <p>云同步模式：{appConfig.cloud.mode === "mock-local" ? "本地模拟，未连接真实云端" : "HTTP 云端"}</p>
        </section>
      </div>
    </div>
  );
}
