import { useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import type { AppState, CaregiverRole, EventType, FeedbackView } from "../types";
import { appConfig } from "../config/appConfig";

interface EventFormProps {
  state: AppState;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClearDetail: (showMessage: boolean) => void;
  onChangeEventType: (type: EventType) => void;
  onFillFromLatestSameType: () => void;
  onApplyQuickTemplate: (text: string) => void;
  onStructureEventDetail: () => void;
  onApplySuggestedEventDetail: () => void;
  onKeepSuggestedEventDetail: () => void;
  onDismissSuggestedEventDetail: () => void;
  onLearnCurrentRewrite: () => void;
  latestFeedback: FeedbackView;
  suggestedEventDetail: string;
  suggestedEventSource: "learned" | "generated" | "template";
  suggestedEventReason: string;
  recentQuickTemplates: string[];
  orderedQuickTemplates: string[];
}

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

export function EventForm({
  state,
  onSubmit,
  onClearDetail,
  onChangeEventType,
  onFillFromLatestSameType,
  onApplyQuickTemplate,
  onStructureEventDetail,
  onApplySuggestedEventDetail,
  onKeepSuggestedEventDetail,
  onDismissSuggestedEventDetail,
  onLearnCurrentRewrite,
  latestFeedback,
  suggestedEventDetail,
  suggestedEventSource,
  suggestedEventReason,
  recentQuickTemplates,
  orderedQuickTemplates
}: EventFormProps) {
  const eventTextRef = useRef<HTMLTextAreaElement>(null);
  
  const currentEventType = state.eventDrafts ? Object.keys(state.eventDrafts)[0] as EventType || "meal" : "meal";
  const currentDetail = state.eventDrafts[currentEventType] || "";

  const focusEventText = (moveToEnd: boolean = true) => {
    requestAnimationFrame(() => {
      const textArea = eventTextRef.current;
      if (!textArea) return;
      textArea.focus();
      if (moveToEnd) {
        const cursor = textArea.value.length;
        textArea.setSelectionRange(cursor, cursor);
      }
    });
  };

  const handleTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      const formElement = event.currentTarget.form;
      formElement?.requestSubmit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClearDetail(true);
      return;
    }
    if (event.altKey && (event.key === "r" || event.key === "R")) {
      event.preventDefault();
      onFillFromLatestSameType();
      return;
    }
    if (event.altKey && (event.key === "s" || event.key === "S")) {
      event.preventDefault();
      onStructureEventDetail();
      return;
    }
    if (event.altKey && (event.key === "n" || event.key === "N")) {
      event.preventDefault();
      onApplySuggestedEventDetail();
    }
  };

  return (
    <div className="event-form-container">
      <div className="form-section">
        <h2>记录真实事件</h2>
        <form className="event-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="eventType">事件类型</label>
            <select
              id="eventType"
              value={currentEventType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChangeEventType(e.target.value as EventType)}
              className="form-select"
            >
              <option value="meal">吃饭</option>
              <option value="sleep">睡眠</option>
              <option value="outdoor">户外活动</option>
              <option value="learning">学习探索</option>
              <option value="emotion">情绪时刻</option>
              <option value="social">社交互动</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="caregiverRole">照护者视角</label>
            <select
              id="caregiverRole"
              value="parent"
              className="form-select"
            >
              <option value="parent">家长</option>
              <option value="grandparent">祖辈</option>
              <option value="teacher">老师</option>
              <option value="relative">亲属</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="eventIntensity">当时强度：3</label>
            <input
              id="eventIntensity"
              type="range"
              min={1}
              max={5}
              value={3}
              className="form-range"
            />
            <div className="intensity-labels">
              <span>低</span>
              <span>中</span>
              <span>高</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventText">真实描述</label>
            <div className="quick-tools">
              {recentQuickTemplates.length > 0 && (
                <p className="tools-hint">最近使用：已置顶 {recentQuickTemplates.length} 条</p>
              )}
              {suggestedEventDetail && (
                <>
                  <div className="suggestion-box">
                    <span className="suggestion-label">下一条推荐：</span>
                    <p className="suggestion-text">{suggestedEventDetail}</p>
                    <div className="suggestion-meta">
                      <span className={`suggestion-source ${suggestedEventSource}`}>
                        {suggestedEventSource === "learned" ? "学习样本" : suggestedEventSource === "generated" ? "历史生成" : "模板回退"}
                      </span>
                      <span className="suggestion-reason">{suggestedEventReason}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="quick-templates">
                {orderedQuickTemplates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    className="template-chip"
                    onClick={() => onApplyQuickTemplate(template)}
                  >
                    {template}
                  </button>
                ))}
              </div>
              <div className="quick-actions">
                <button type="button" className="btn btn-secondary" onClick={onFillFromLatestSameType}>
                  复用同类型最近记录
                </button>
                <button type="button" className="btn btn-secondary" onClick={onApplySuggestedEventDetail}>
                  填入推荐
                </button>
                <button type="button" className="btn btn-secondary" onClick={onStructureEventDetail}>
                  一键整理三段
                </button>
                <button type="button" className="btn btn-outline" onClick={onKeepSuggestedEventDetail}>
                  保留推荐
                </button>
                <button type="button" className="btn btn-outline" onClick={onDismissSuggestedEventDetail}>
                  不合适
                </button>
                <button type="button" className="btn btn-outline" onClick={onLearnCurrentRewrite}>
                  学习当前改写
                </button>
              </div>
            </div>
            <textarea
              id="eventText"
              ref={eventTextRef}
              autoFocus
              rows={4}
              maxLength={220}
              value={currentDetail}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                const eventType = currentEventType;
                const nextDrafts = { ...state.eventDrafts, [eventType]: e.target.value };
              }}
              onKeyDown={handleTextKeyDown}
              placeholder="例如：今天午睡前一直哭，我抱着他哼歌，五分钟后慢慢安静下来。"
              className="form-textarea"
            />
            <p className="form-hint">
              已输入 {currentDetail.length}/220 · Ctrl/Cmd + Enter 提交 · Esc 清空 · Alt+R 复用同类型最近记录 · Alt+S 一键整理三段 · Alt+N 填入推荐
            </p>
          </div>

          <button type="submit" className="btn btn-primary">
            生成互动反馈
          </button>
        </form>
      </div>

      <div className="feedback-section">
        <h2>系统反馈</h2>
        {!latestFeedback.childText ? (
          <p className="empty-feedback">提交一条真实事件后，这里会出现孩子回应和育儿解释。</p>
        ) : (
          <div className="feedback-content">
            <div className="feedback-card child-response">
              <h3>孩子回应</h3>
              <p>{latestFeedback.childText}</p>
            </div>
            <div className="feedback-card role-tip">
              <h3>{latestFeedback.roleLabel}提示</h3>
              <p>{latestFeedback.roleTip}</p>
            </div>
            <div className="feedback-card psychology">
              <h3>心理学提示</h3>
              <p>{latestFeedback.narrative}</p>
            </div>
            <div className="feedback-card original-detail">
              <h3>你记录的真实事件</h3>
              <p>{latestFeedback.detail}</p>
            </div>
            <div className="feedback-card hint">
              <h3>陪伴原则</h3>
              <p>{latestFeedback.hint}</p>
            </div>

            {latestFeedback.seasonThemeTitle && (
              <div className="feedback-card seasonal">
                <h3>节日主题</h3>
                <p><strong>当前主题：</strong>{latestFeedback.seasonThemeTitle}</p>
                <p><strong>节奏观察：</strong>{latestFeedback.seasonAtmosphere}</p>
                <p><strong>照护提示：</strong>{latestFeedback.seasonCue}</p>
              </div>
            )}

            {latestFeedback.familyTone && (
              <div className="feedback-card family">
                <h3>家庭协同</h3>
                <p><strong>角色定位：</strong>{latestFeedback.familyTone}</p>
                <p><strong>交接建议：</strong>{latestFeedback.familyHandoff}</p>
              </div>
            )}

            {latestFeedback.skillTitle && (
              <div className="feedback-card skill">
                <h3>生活技能目标</h3>
                <p><strong>目标：</strong>{latestFeedback.skillTitle}</p>
                <p><strong>进度：</strong>{latestFeedback.skillProgressText}</p>
                <p><strong>建议：</strong>{latestFeedback.skillCoachingTip}</p>
              </div>
            )}

            {latestFeedback.storyTitle && (
              <div className="feedback-card story">
                <h3>世界观支线</h3>
                <p><strong>故事：</strong>{latestFeedback.storyTitle}</p>
                <p><strong>背景：</strong>{latestFeedback.storyPremise}</p>
                <p><strong>信号：</strong>{latestFeedback.storySignal}</p>
                <p><strong>抉择：</strong>{latestFeedback.storyChoice}</p>
              </div>
            )}

            {latestFeedback.handoffTrigger && (
              <div className="feedback-card handoff">
                <h3>家校交接</h3>
                <p><strong>触发点：</strong>{latestFeedback.handoffTrigger}</p>
                <p><strong>有效做法：</strong>{latestFeedback.handoffEffective}</p>
                <p><strong>避免做法：</strong>{latestFeedback.handoffAvoid}</p>
                <p><strong>交接方向：</strong>{latestFeedback.handoffDirection}</p>
              </div>
            )}

            {latestFeedback.emotionLabel && (
              <div className="feedback-card emotion">
                <h3>情绪教育</h3>
                <p><strong>主题：</strong>{latestFeedback.emotionLabel}</p>
                <p><strong>识别：</strong>{latestFeedback.emotionRecognition}</p>
                <p><strong>接纳：</strong>{latestFeedback.emotionAcceptance}</p>
                <ul>
                  {latestFeedback.emotionGuidance.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {latestFeedback.expertTitle && (
              <div className="feedback-card expert">
                <h3>专家卡片：{latestFeedback.expertTitle}</h3>
                <p><strong>适配视角：</strong>{latestFeedback.roleLabel}</p>
                <p>{latestFeedback.expertInsight}</p>
                <ul>
                  {latestFeedback.expertTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
                <p className="expert-source">参考来源：{latestFeedback.expertSource}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}