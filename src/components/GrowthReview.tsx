import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { TOPICS, SOURCES, filterEvents, localDate, type GrowthJournal, type Topic } from "../lib/growth";
import {
  EVIDENCE_LABELS, buildPeriodReview, formatReviewMarkdown,
  type Evidence, type EvidenceAnswer, type QuestionFocus, type QuestionRequest, type ReviewScope
} from "../lib/growthReview";
import { localRetrieval, retrieveFromRecords } from "../lib/growthRetrieval";
import { errorMessage } from "../lib/growthRepository";

interface Submission {
  journal: GrowthJournal;
  scope: ReviewScope;
  selection: string[];
  eventIds: string[];
  request: QuestionRequest;
}

interface RetrievalState {
  submission: Submission | null;
  status: "idle" | "loading" | "done" | "error" | "cancelled";
  answer: EvidenceAnswer | null;
  error: string;
}

function recentScope(): ReviewScope {
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { from: localDate(start), to: localDate(), topic: "" };
}

function EvidenceList({ evidence, onSource }: {
  evidence: Evidence[];
  onSource: (eventId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return <>
    <ol className="mirror-evidence-list">
      {(expanded ? evidence : evidence.slice(0, 6)).map((item) => <li
        key={JSON.stringify([item.eventId, item.field, item.perspectiveId])}
        className="mirror-evidence" data-source-event={item.eventId}>
        <strong>{item.label}</strong>
        <blockquote>{item.text || "没有附加文字，不推测原因。"}</blockquote>
        <p className="mirror-meta">{item.occurredOn} · {item.eventTitle}</p>
        <p className="mirror-meta">作者／记录者：{item.author} · {SOURCES[item.source]} · 录入于 {new Date(item.recordedAt).toLocaleString("zh-CN")}</p>
        <button type="button" className="mirror-secondary" onClick={() => onSource(item.eventId)}>查看原始记录</button>
      </li>)}
    </ol>
    {evidence.length > 6 && <button type="button" className="mirror-secondary" onClick={() => setExpanded(!expanded)}>
      {expanded ? "收起摘录" : `查看全部 ${evidence.length} 条摘录`}
    </button>}
  </>;
}

export function GrowthReview({ journal, onSource, onExport, unavailable = false }: {
  journal: GrowthJournal;
  unavailable?: boolean;
  onSource: (eventId: string) => void;
  onExport: (content: string, filename: string) => void;
}) {
  const [scope, updateScope] = useState<ReviewScope>(recentScope);
  const [question, setQuestion] = useState("");
  const [keyword, setKeyword] = useState("");
  const [focus, setFocus] = useState<QuestionFocus>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [invalidated, setInvalidated] = useState(false);
  const [retrieval, setRetrieval] = useState<RetrievalState>({
    submission: null, status: "idle", answer: null, error: ""
  });
  const controller = useRef<AbortController | null>(null);
  const [inputError, setInputError] = useState("");
  const result = useMemo(() => {
    if (unavailable) return { review: null, events: [], error: "" };
    try {
      return {
        review: buildPeriodReview(journal, scope),
        events: filterEvents(journal.events, { ...scope, keyword: "" }),
        error: ""
      };
    } catch (error) {
      return { review: null, events: [], error: errorMessage(error) };
    }
  }, [journal, scope, unavailable]);
  const review = result.review;
  const selected = new Set(selectedIds);
  const chosenIds = result.events.filter((event) => selected.has(event.id)).map((event) => event.id);
  const current = Boolean(!unavailable && submission && submission.journal === journal && submission.scope === scope && submission.selection === selectedIds);
  const stateCurrent = current && retrieval.submission === submission;
  const pending = stateCurrent && retrieval.status === "loading";
  const answer = stateCurrent ? retrieval.answer : null;
  const request = submission?.request;

  function setScope(next: ReviewScope) {
    updateScope(next);
    setSelectedIds([]);
    setVisibleCount(30);
  }

  useEffect(() => {
    if (!submission) return;
    if (!current) {
      setRetrieval({ submission: null, status: "idle", answer: null, error: "" });
      setSubmission(null);
      setInvalidated(true);
      return;
    }
    const activeController = new AbortController();
    controller.current = activeController;
    let active = true;
    setRetrieval({ submission, status: "loading", answer: null, error: "" });
    void retrieveFromRecords(submission.journal, submission.scope, submission.request, submission.eventIds, {
      signal: activeController.signal
    }).then((answer) => {
      if (active) setRetrieval({ submission, status: "done", answer, error: "" });
    }).catch((error: unknown) => {
      if (!active) return;
      setRetrieval({
        submission, status: activeController.signal.aborted ? "cancelled" : "error",
        answer: null, error: activeController.signal.aborted ? "" : errorMessage(error)
      });
    });
    return () => {
      active = false;
      activeController.abort();
      if (controller.current === activeController) controller.current = null;
    };
  }, [submission, current]);
  const categories = [
    { title: "观察记录", field: "observation" },
    { title: "孩子说过的话", field: "childQuote" },
    { title: "后来补充的不同视角", field: "perspective" },
    { title: "待确认的理解", field: "interpretation" },
    { title: "记录者提出的支持（效果未知）", field: "support" },
    { title: "仍想询问的问题", field: "question" }
  ] as const;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (unavailable) {
      setInputError("当前档案已变更，请保留输入后重新载入再检索。");
      return;
    }
    if (!question.trim()) {
      setInputError("请写下想回顾的问题，系统只提供记录摘录。");
      return;
    }
    if (!chosenIds.length) {
      setInputError("请先选择至少一段参与检索的经历。");
      return;
    }
    setInputError("");
    setInvalidated(false);
    setSubmission({
      journal, scope, selection: selectedIds, eventIds: chosenIds,
      request: { question: question.trim(), keyword: keyword.trim(), focus }
    });
  }

  return (
    <section className="mirror-panel mirror-review" aria-labelledby="review-heading">
      <div className="mirror-section-heading">
        <span className="mirror-eyebrow">带着依据回顾</span>
        <h2 id="review-heading">阶段回顾与成长问答</h2>
        <p>本地记录检索版，不接入大模型。只整理原文与来源，不解释内心、不判定人格，也不预测未来。</p>
      </div>
      {unavailable && <p role="status" className="mirror-error">已停止使用旧档案和引用。输入仍保留，请重新载入最新资料后再回顾。</p>}
      <div className="mirror-form-grid">
        <label>回顾开始日期<input type="date" value={scope.from} onChange={(e) => setScope({ ...scope, from: e.target.value })} /></label>
        <label>回顾结束日期<input type="date" value={scope.to} onChange={(e) => setScope({ ...scope, to: e.target.value })} /></label>
        <label>回顾主题<select value={scope.topic} onChange={(e) => {
          const topic = e.target.value;
          if (topic === "" || Object.prototype.hasOwnProperty.call(TOPICS, topic)) setScope({ ...scope, topic: topic as Topic | "" });
        }}>
          <option value="">全部主题</option>
          {Object.entries(TOPICS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <div className="mirror-actions">
          <button type="button" className="mirror-secondary" onClick={() => setScope(recentScope())}>近30天</button>
          <button type="button" className="mirror-secondary" onClick={() => setScope({ from: "", to: "", topic: "" })}>全部时间与主题</button>
        </div>
      </div>
      <p className="mirror-meta">当前回顾范围：{scope.from || "最早记录"} 至 {scope.to || "最新记录"} · {scope.topic ? TOPICS[scope.topic] : "全部主题"}。下方问答使用同一范围，与回忆长廊的筛选独立。</p>
      {result.error && <p role="alert" className="mirror-error">{result.error}</p>}
      {review && <>
        <div className="mirror-review-summary" aria-label="档案覆盖情况">
          <p>此范围共 <strong>{review.eventCount}</strong> 段记录，其中 <strong>{review.eventsWithLaterPerspectives}</strong> 段有后补视角。</p>
          <p className="mirror-meta">这是记录覆盖情况，不是行为发生率、能力等级或变化趋势；有补充不等于已确认存在矛盾。</p>
          {review.topics.length > 0 && <ul className="mirror-topic-list">{review.topics.map((item) => <li key={item.topic}>
            {TOPICS[item.topic]}：{item.count} 段记录
          </li>)}</ul>}
        </div>
        {!review.eventCount && <p className="mirror-empty">当前范围没有记录。可以调整时间或主题；系统不会补写缺失经历。</p>}
        {categories.map((category) => {
          const evidence = review.evidence.filter((item) => item.field === category.field);
          return <details className="mirror-details" key={category.field}>
            <summary>{category.title} · {evidence.length} 条摘录</summary>
            {evidence.length
              ? <EvidenceList evidence={evidence} onSource={onSource} />
              : <p>这个范围没有相关记录，不代表孩子没有相应经历或感受。</p>}
          </details>;
        })}
        <button type="button" className="mirror-secondary" onClick={() => onExport(
          formatReviewMarkdown(review), `growth-review-${localDate()}.md`
        )}>导出当前回顾（Markdown）</button>
      </>}
      <div className="mirror-question">
        <h3>带着一个问题找记录</h3>
        <p>例如“关于积木，孩子说过什么？”：问题用于说明回顾目的；请另外填写关键词“积木”，选择“孩子原话”。本版只做字面检索，不会理解整句问题或自动推理。</p>
        <div className="mirror-retrieval-service">
          <strong>{localRetrieval.label}</strong>
          <p>只处理你明确选择的素材，不上传、不接入模型。服务接口已独立；语义检索与生成尚未启用。</p>
        </div>
        <details className="mirror-details mirror-materials">
          <summary>选择参与问答检索的经历 · 已选 {chosenIds.length} / {result.events.length} 段</summary>
          <p>选择仅作用于下方问答，不改变上方阶段回顾或Markdown导出。选择某段经历后，仅所选记录类型的原文及其标题、情境、主题进入本地检索。</p>
          <p className="mirror-meta">未选择的记录不会作为检索素材。素材选择不是孩子授权或云端发送许可；切换回顾范围会清除选择，新增记录不会自动加入。</p>
          <div className="mirror-actions">
            <button type="button" className="mirror-secondary" disabled={!review || !result.events.length}
              onClick={() => setSelectedIds(result.events.map((event) => event.id))}>选择本范围全部经历</button>
            <button type="button" className="mirror-secondary" disabled={!selectedIds.length} onClick={() => setSelectedIds([])}>清除素材选择</button>
          </div>
          <div className="mirror-material-list">
            {result.events.slice(0, visibleCount).map((event) => <label key={event.id} className="mirror-material-option">
              <input type="checkbox" checked={selected.has(event.id)} onChange={(e) => {
                const checked = e.target.checked;
                setSelectedIds((ids) => checked ? [...ids, event.id] : ids.filter((id) => id !== event.id));
              }} />
              <span><strong>{event.title}</strong><small>{event.occurredOn} · {TOPICS[event.topic]} · {event.perspectives.length} 个补充视角</small></span>
            </label>)}
          </div>
          {result.events.length > visibleCount && <button type="button" className="mirror-secondary"
            onClick={() => setVisibleCount((count) => count + 30)}>再显示30段经历（共{result.events.length}段）</button>}
          {!result.events.length && <p>当前回顾范围没有可选经历。</p>}
        </details>
        <form onSubmit={submit}>
          <label>想回顾的问题 *<input maxLength={500} required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="关于积木，孩子说过什么？" /></label>
          <div className="mirror-form-grid">
            <label>检索关键词（可留空看此范围全部摘录）<input maxLength={100} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="积木" /></label>
            <label>想找哪类依据<select value={focus} onChange={(e) => {
              const next = e.target.value;
              if (next === "all" || Object.prototype.hasOwnProperty.call(EVIDENCE_LABELS, next)) setFocus(next as QuestionFocus);
            }}>
              <option value="all">全部记录类型（分别标注）</option>
              {Object.entries(EVIDENCE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
          </div>
          <div className="mirror-actions">
            <button type="submit" className="mirror-primary" disabled={!review || pending}>查找有出处的记录</button>
            {pending && <button type="button" className="mirror-secondary" onClick={() => controller.current?.abort()}>取消本次检索</button>}
            <span className="mirror-meta">本次素材：{chosenIds.length} 段经历</span>
          </div>
        </form>
        {inputError && <p role="alert" className="mirror-error">{inputError}</p>}
        {pending && <p role="status">正在本地检索所选素材……</p>}
        {stateCurrent && retrieval.status === "error" && <p role="alert" className="mirror-error">检索失败，未显示结果，也未切换其他服务。{retrieval.error}</p>}
        {stateCurrent && retrieval.status === "cancelled" && <p role="status">已取消本次检索，未保留结果。输入与素材选择仍在。</p>}
        {(invalidated || submission && !current) && <p role="status">档案、回顾范围或素材选择已变更，旧结果已失效。请确认素材后重新提交检索。</p>}
        {request && answer && <section className="mirror-answer" aria-labelledby="answer-heading">
          <h4 id="answer-heading">回顾问题：{request.question}</h4>
          <p className="mirror-meta">已提交的条件：关键词 {request.keyword || "（未限定）"} · {request.focus === "all" ? "全部记录类型" : EVIDENCE_LABELS[request.focus]}。修改问题或检索条件后需重新提交。</p>
          <p className="mirror-meta">素材：明确选择的 {submission?.eventIds.length} 段经历 · {localRetrieval.label}。</p>
          <p role="status">{answer.message}</p>
          {answer.status === "answered" && <>
            <p>找到 {answer.totalMatches} 条可引用摘录：</p>
            <EvidenceList evidence={answer.evidence} onSource={onSource} />
          </>}
          <p className="mirror-meta">档案、范围或素材选择变化时立即隐藏旧结果，取消尚未完成的任务；需重新提交。不保存问答历史、素材选择或检索索引。</p>
        </section>}
      </div>
    </section>
  );
}
