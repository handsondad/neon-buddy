import { useState } from "react";
import type { CaregiverRole, StageKey } from "../types";

interface OnboardingProps {
  initialName: string;
  onComplete: (name: string, stage: StageKey, role: CaregiverRole) => void;
}

export function Onboarding({ initialName, onComplete }: OnboardingProps) {
  const [name, setName] = useState(initialName === "小洋人" ? "" : initialName);
  const [stage, setStage] = useState<StageKey>("newborn");
  const [role, setRole] = useState<CaregiverRole>("parent");

  return (
    <div className="onboarding-overlay">
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <span className="eyebrow">3 分钟开始</span>
        <h1 id="onboarding-title">记录一次真实互动，理解孩子多一点</h1>
        <p className="onboarding-lead">
          Neon Buddy 帮你把日常记录整理成温和、可执行的陪伴建议。它不是诊断、治疗或专业育儿咨询的替代品。
        </p>
        <div className="onboarding-note">
          <strong>隐私说明</strong>
          <span>数据默认只保存在当前设备，你可以随时导出或删除。</span>
        </div>
        <label className="form-group">
          <span>孩子的称呼</span>
          <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：小安" autoFocus />
        </label>
        <fieldset className="onboarding-options">
          <legend>当前成长阶段</legend>
          {[
            ["newborn", "2–3 岁 · 建立安全感"],
            ["explorer", "4–5 岁 · 主动探索"],
            ["communicator", "6–8 岁 · 表达与协商"]
          ].map(([value, label]) => (
            <label key={value}><input type="radio" checked={stage === value} onChange={() => setStage(value as StageKey)} />{label}</label>
          ))}
        </fieldset>
        <fieldset className="onboarding-options">
          <legend>今天以谁的视角记录</legend>
          {[
            ["parent", "家长"], ["grandparent", "祖辈"], ["teacher", "老师"], ["relative", "亲属"]
          ].map(([value, label]) => (
            <label key={value}><input type="radio" checked={role === value} onChange={() => setRole(value as CaregiverRole)} />{label}</label>
          ))}
        </fieldset>
        <button className="btn btn-primary onboarding-submit" disabled={!name.trim()} onClick={() => onComplete(name.trim(), stage, role)}>
          开始记录
        </button>
      </section>
    </div>
  );
}
