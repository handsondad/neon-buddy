import { useEffect, useState, type ReactNode } from "react";
import { analysisNeedsReview, currentTopics, runNeedsReview, topicHistory, type AgentAnalysis, type KnowledgeBase, type ResearchRun } from "../lib/knowledge";
import { DOMAINS, FAMILIARITY, SETTINGS, THEORIES } from "../lib/knowledgeFramework";
import { scienceCard, type ScienceCard } from "../lib/scienceCards";

export const CARD_KINDS = { concept: "概念卡", observation: "观察指引", method: "分析方法" } as const;

export function ScienceCardView({ card, citedVersion }: { card: ScienceCard; citedVersion?: number }) {
  return <details className="ke-science-card">
    <summary>{CARD_KINDS[card.kind]} · {card.title} <small>v{card.version}</small></summary>
    {citedVersion !== undefined && citedVersion !== card.version && <p className="ke-warning">引用的是v{citedVersion}，以下为当前v{card.version}，不是当时版本的原文。需要重新核对。</p>}
    <p>{card.summary}</p><p><b>适用背景</b> {card.applicability}</p>
    <h4>Agent 应核对的问题</h4>{card.prompts.map((text) => <p key={text}>{text}</p>)}
    <div className="ke-field-list">{card.fields.map((field) => <code key={field}>{field}</code>)}</div>
    {card.limits.map((text) => <p className="ke-warning" key={text}>{text}</p>)}
    <p className="ke-kicker">产品整理指引 · 不是量表／个体结论 · {card.id}</p>
    {card.theoryIds.map((id) => <a className="ke-theory-link" key={id} href={THEORIES[id].url} target="_blank" rel="noreferrer">{THEORIES[id].author} ↗</a>)}
  </details>;
}

function RunInputs({ kb, run, onSource }: { kb: KnowledgeBase; run: ResearchRun; onSource: (id: string) => void }) {
  const [page, setPage] = useState(0);
  return <details className="ke-run-inputs"><summary>读取材料与知识卡（Agent声明） · {run.readObservationIds.length}项观察</summary>
    <div className="ke-evidence-grid">{run.readObservationIds.slice(page * 20, page * 20 + 20).map((id) => {
      const observation = kb.observations.find((item) => item.id === id)!;
      return <button className="ke-evidence compact" type="button" key={id} onClick={() => onSource(id)}>
        <small>{observation.occurredOn || "发生日期未知"} · {SETTINGS[observation.context.setting]} · {FAMILIARITY[observation.context.familiarity]}</small>
        <strong>{observation.behavior}</strong><small>观察 → 来源原文 ↗</small>
      </button>;
    })}</div>
    {run.readObservationIds.length > 20 && <div className="ke-actions"><button type="button" disabled={!page} onClick={() => setPage(page - 1)}>上一组读取材料</button><span>{page + 1} / {Math.ceil(run.readObservationIds.length / 20)}</span><button type="button" disabled={(page + 1) * 20 >= run.readObservationIds.length} onClick={() => setPage(page + 1)}>下一组读取材料</button></div>}
    {run.cardRefs.map((ref) => <ScienceCardView key={ref.id} card={scienceCard(ref.id)!} citedVersion={ref.version} />)}
  </details>;
}

export function ResearchTopics({ kb, chosenId, onChoose, onSource, renderAnalysis }: {
  kb: KnowledgeBase;
  chosenId: string;
  onChoose: (id: string) => void;
  onSource: (id: string) => void;
  renderAnalysis: (item: AgentAnalysis, stale: boolean) => ReactNode;
}) {
  const topics = currentTopics(kb);
  const selected = topics.find((item) => item.id === chosenId || topicHistory(kb, item.id).some((version) => version.id === chosenId)) || topics[0];
  useEffect(() => {
    if (selected && chosenId !== selected.id) onChoose(selected.id);
  }, [selected, chosenId, onChoose]);
  if (!selected) return <div className="ke-empty">还没有持续追踪的问题。让 Agent 按科学知识卡从已授权材料中建立一个具体专题；不需要在网页填写，也不为填满维度制造问题。</div>;
  const history = topicHistory(kb, selected.id);
  const ids = new Set(history.map((item) => item.id));
  const runs = (kb.runs || []).filter((item) => ids.has(item.topicId)).slice().sort((a, b) => b.finishedAt.localeCompare(a.finishedAt) || (kb.runs || []).indexOf(b) - (kb.runs || []).indexOf(a));
  const latest = runs[0];
  return <>
    <div className="ke-notice">专题展示自己的完整材料与任务历史，不受其他页面日期／维度筛选影响。知识卡是通用科学指引，孩子的材料与解释保存在独立私有库中。</div>
    <label>持续追踪的问题<select aria-label="问题专题" value={selected.id} onChange={(event) => onChoose(event.target.value)}>{topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <section className="ke-topic-heading">
      <span className="ke-badge">{({ open: "持续了解中", paused: "暂停追踪", closed: "已结束追踪" })[selected.status]} · 不是结论认证</span>
      <h3>{selected.title}</h3><p className="ke-claim">{selected.question}</p><p><b>边界</b> {selected.scope}</p>
      <small>{DOMAINS[selected.domain].name} · {selected.createdBy.name} · {new Date(selected.createdAt).toLocaleString("zh-CN")}</small>
      {!latest && <p className="ke-warning">尚无分析任务记录，不补写当前结论。</p>}
      {latest && (runNeedsReview(kb, latest) || latest.status !== "completed") && <p className="ke-warning">{runNeedsReview(kb, latest) ? "知识或专题已变化，最近任务也需复核；历史解释不作为当前理解。" : latest.status === "insufficient" ? "最近任务认为材料不足，暂不形成结论。" : "最近任务已取消，未形成结论。"}</p>}
    </section>
    <section className="ke-section"><h3>这个问题如何借助科学知识</h3>
      <p>展开查看定义、适用背景、观察问题和限制；这些指引不能替孩子下结论。</p>
      {selected.cardRefs.map((ref) => {
        const card = scienceCard(ref.id);
        return card ? <ScienceCardView key={ref.id} card={card} citedVersion={ref.version} /> : null;
      })}
    </section>
    <section className="ke-section"><h3>理解如何改变 · 任务与依据</h3>
      <p>这是Agent声明的执行摘要与输入清单，不是内部思维链，也不能证明Agent真实读过或解释成立。历史记录可能因授权删除而不完整。</p>
      {runs.map((run) => {
        const stale = runNeedsReview(kb, run);
        return <article className={`ke-research-run ${stale ? "stale" : ""}`} key={run.id}>
          <div className="ke-row"><span className="ke-badge">{({ completed: "已提交分析", insufficient: "材料不足 · 暂不下结论", cancelled: "已取消 · 无分析输出" })[run.status]}</span><small>{new Date(run.finishedAt).toLocaleString("zh-CN")} · 输入revision {run.inputRevision}</small></div>
          {stale && <p className="ke-warning">历史任务 · 依据／专题可能已变化，需重新核对。</p>}
          <h4>这次为什么改变或保留理解</h4><p>{run.changeReason}</p>
          <h4>情境与时期是否可比</h4><p>{run.comparison}</p>
          <h4>在哪些材料中查找过反例</h4><p>{run.counterSearch}</p>
          <RunInputs key={run.id} kb={kb} run={run} onSource={onSource} />
          <h4>本次局限</h4>{run.limitations.map((text) => <p key={text}>{text}</p>)}
          {run.outputAnalysisIds.map((id) => {
            const item = kb.analyses.find((item) => item.id === id)!;
            return renderAnalysis(item, stale || analysisNeedsReview(kb, item));
          })}
          <p className="ke-kicker">{run.performedBy.name} · {run.performedBy.tool} · {run.id}</p>
        </article>;
      })}
    </section>
    {history.length > 1 && <details className="ke-science-card"><summary>专题问题与边界的历史</summary>{history.map((item) => <article key={item.id}><h4>{item.title}</h4><p>{item.question}</p><p>{item.scope}</p><small>{item.id} · {item.createdAt}</small></article>)}</details>}
  </>;
}
