import { useEffect, useMemo, useRef, useState } from "react";
import { activeObservations, analysisNeedsReview, parseKnowledge, type AgentAnalysis, type KnowledgeBase, type Observation } from "../lib/knowledge";
import { analyzeKnowledge, approximateAge } from "../lib/knowledgeAnalysis";
import { DOMAINS, FAMILIARITY, SETTINGS, SIGNALS, SOURCE_KINDS, THEORIES, type DomainId } from "../lib/knowledgeFramework";
import "./knowledgeExplorer.css";
import { SCIENCE_CARDS } from "../lib/scienceCards";
import { ResearchTopics, ScienceCardView } from "./ResearchTopics";

type View = "mirror" | "topics" | "contexts" | "time" | "framework" | "agent";
const views: { id: View; label: string; caption: string }[] = [
  { id: "mirror", label: "成长镜像", caption: "当前理解与依据" },
  { id: "topics", label: "持续理解的问题", caption: "问题、反例与理解变化" },
  { id: "contexts", label: "情境与行为", caption: "看见环境中的不同" },
  { id: "time", label: "成长脉络", caption: "年龄、经历与新理解" },
  { id: "framework", label: "科学知识框架", caption: "理论如何组织材料" },
  { id: "agent", label: "Agent 接入", caption: "知识库写入约定" }
];
const fidelity = { verbatim: "来源标注为原话，未核实", recalled: "回忆转述，不是逐字转录", paraphrase: "来源中的概述，不作原话" };
function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function KnowledgeExplorer() {
  const [view, setView] = useState<View>("mirror");
  const [topicId, setTopicId] = useState("");
  const [example, setExample] = useState(false);
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [domain, setDomain] = useState<DomainId | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sourceVisible, setSourceVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthA, setMonthA] = useState("");
  const [monthB, setMonthB] = useState("");
  const [evidencePage, setEvidencePage] = useState(0);
  const request = useRef(0);
  useEffect(() => {
    if (!selectedId) return;
    const previous = document.activeElement;
    const drawer = document.querySelector<HTMLElement>(".ke-drawer");
    const close = drawer?.querySelector<HTMLButtonElement>("button");
    close?.focus();
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") { setSelectedId(null); return; }
      if (event.key !== "Tab" || !drawer) return;
      const buttons = [...drawer.querySelectorAll<HTMLElement>("button, a[href], [tabindex='0']")].filter((element) => element.getClientRects().length);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keys);
    return () => { document.removeEventListener("keydown", keys); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [selectedId]);
  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;
    const token = ++request.current;
    let text = "";
    setKb(null); setError(""); setSelectedId(null);
    async function read() {
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 8000);
      try {
        const response = await fetch(`/api/knowledge${example ? "?example=1" : ""}`, { cache: "no-store", signal: controller.signal });
        const raw = await response.text();
        if (!response.ok) {
          let message = `读取失败（HTTP ${response.status}）。`;
          try { const body = JSON.parse(raw); if (typeof body.error === "string") message = body.error; } catch { /* Non-JSON HTTP error is still surfaced. */ }
          throw new Error(message);
        }
        const envelope: unknown = JSON.parse(raw);
        if (!envelope || typeof envelope !== "object" || !("dataset" in envelope) || envelope.dataset !== (example ? "example" : "private") || !("knowledge" in envelope)) throw new Error("知识API响应契约不匹配。");
        const next = parseKnowledge(JSON.stringify(envelope.knowledge));
        if (!active || token !== request.current) return;
        if (raw !== text) {
          text = raw; setKb(next); setSelectedId(null); setSourceVisible(false); setEvidencePage(0);
        }
        setError("");
      } catch (error) {
        if (!active || token !== request.current) return;
        text = ""; setKb(null); setSelectedId(null);
        setError(error instanceof Error ? error.message : "无法读取知识库。");
      } finally { window.clearTimeout(timeout); }
    }
    void read();
    const interval = window.setInterval(() => { void read(); }, 10000);
    return () => { active = false; controller?.abort(); window.clearInterval(interval); };
  }, [example, refresh]);
  const model = useMemo(() => {
    if (!kb) return { data: null, error: "" };
    try { return { data: analyzeKnowledge(kb, { domain, from, to }), error: "" }; }
    catch (error) { return { data: null, error: error instanceof Error ? error.message : "分析范围无效。" }; }
  }, [kb, domain, from, to]);
  const data = model.data;
  const selected = kb?.observations.find((item) => item.id === selectedId);
  const selectedSource = kb?.sources.find((item) => item.id === selected?.sourceId);
  const activeIds = new Set(kb ? activeObservations(kb).map((item) => item.id) : []);
  const scopeFiltered = Boolean(domain || from || to);
  const undatedOutsideScope = kb && (from || to) ? activeObservations(kb).filter((item) => item.occurredOn === null && (!domain || item.domains.includes(domain))).length : 0;
  function source(id: string) { setSelectedId(id); setSourceVisible(false); }
  function navigate(next: View) { setView(next); setSelectedId(null); }
  function evidence(item: Observation, compact = false) {
    const parent = kb?.sources.find((entry) => entry.id === item.sourceId);
    return <button type="button" className={`ke-evidence ${compact ? "compact" : ""}`} key={item.id} onClick={() => source(item.id)}>
      <span className="ke-kicker">{item.occurredOn || "发生日期未知"} · {approximateAge(kb?.child.birthMonth || null, item.occurredOn)}</span>
      <strong>{item.behavior}</strong>
      {!compact && <p>{item.context.activity || "活动未知"} · {SETTINGS[item.context.setting]} · {FAMILIARITY[item.context.familiarity]}</p>}
      <small>{parent?.reporter} · {parent ? SOURCE_KINDS[parent.kind] : "来源未知"} · 查看原文 ↗</small>
    </button>;
  }
  function analysis(item: AgentAnalysis, stale: boolean, outside = false) {
    const superseded = kb?.analyses.some((entry) => entry.supersedes === item.id);
    return <article className={`ke-analysis ${stale ? "stale" : ""}`} key={item.id}>
      <div className="ke-row"><span className="ke-badge">{superseded ? "已修订 · 历史解释" : stale ? "依据或框架已变化 · 待重新分析" : "Agent 条件性解释 · 不是事实"}</span><small>{DOMAINS[item.domain].name}</small></div>
      <h3>{item.title}</h3><p className="ke-question">{item.question}</p><p className="ke-claim">{item.claim}</p>
      <p><b>适用范围</b> {item.conditions}</p>
      <div className="ke-citations">{item.supportingIds.map((id, i) => <button type="button" key={id} onClick={() => source(id)}>依据 {i + 1}</button>)}
        {item.counterIds.map((id, i) => <button type="button" key={id} onClick={() => source(id)}>反例 {i + 1}</button>)}</div>
      {outside && <p className="ke-warning">这份解释还引用了筛选范围之外的材料，不代表只基于当前可见片段。</p>}
      {stale && <p className="ke-warning">解释基于 revision {item.basedOnRevision}，当前为 {kb?.revision}；材料、专题或知识卡版本需重新核对。它仅作为历史假设，不继续当作当前画像。</p>}
      {!kb?.runs?.some((run) => run.outputAnalysisIds.includes(item.id)) && <p className="ke-kicker">未附任务记录：不能据此知道Agent检查过哪些材料与反例。</p>}
      <details><summary>其他解释、局限与下一步了解</summary>
        <h4>可能的其他解释</h4>{item.alternatives.map((text, i) => <p key={i}>{text}</p>)}
        <h4>材料与推断的局限</h4>{item.limitations.map((text, i) => <p key={i}>{text}</p>)}
        {!item.counterIds.length && <p className="ke-warning">尚无附带反例，不代表没有反例。</p>}
        <h4>可以继续了解什么</h4>{item.followUps.map((text, i) => <p key={i}>{text}</p>)}
        <h4>引用的理论（不等于验证了个体解释）</h4>
        {item.theoryIds.map((id) => <a className="ke-theory-link" key={id} href={THEORIES[id].url} target="_blank" rel="noreferrer">{THEORIES[id].name} ↗</a>)}
      </details>
      <footer>{item.generatedBy.name} · {item.generatedBy.tool} · {new Date(item.generatedAt).toLocaleString("zh-CN")}<br />孩子未被视为认可此解释 · {item.id}</footer>
    </article>;
  }
  return <div className="ke-shell">
    <aside className="ke-sidebar">
      <div className="ke-brand"><span className="ke-logo">◌</span><div><h1>成长镜像</h1><small>NEON BUDDY · KNOWLEDGE</small></div></div>
      <p className="ke-motto">从真实材料，逐渐理解<br />一个不断成长的人。</p>
      <nav aria-label="知识探索导航">{views.map((item) => <button type="button" key={item.id} className={view === item.id ? "active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => navigate(item.id)}><strong>{item.label}</strong><small>{item.caption}</small></button>)}</nav>
      <div className="ke-sidebar-bottom"><span className="ke-badge">只读分析界面</span><p>资料由你选择的 Agent 按契约维护。这里不需要填写观察或分析表单。</p><small>本机文件 · 未加密<br />不是诊断、人格复制或预测工具</small></div>
    </aside>
    <main className="ke-main">
      <header className="ke-toolbar"><span>{views.find((item) => item.id === view)?.label}</span>
        <div><button type="button" onClick={() => { setExample(!example); setDomain(""); setFrom(""); setTo(""); setTopicId(""); }}>{example ? "返回我的知识库" : "查看合成示例"}</button><button type="button" onClick={() => setRefresh(refresh + 1)}>重新读取</button></div>
      </header>
      {example && <div className="ke-demo" role="status">演示模式：所有孩子、材料和分析均为合成示例，不是实际模型结果。与私有知识库完全分开，不写入你的数据。</div>}
      <div className="ke-content">
        <section className="ke-heading"><span className="ke-kicker">EVIDENCE · CONTEXT · DEVELOPMENT</span>
          <h2>{view === "mirror" ? `${kb?.child.alias || "孩子"}的成长镜像` : views.find((item) => item.id === view)?.label}</h2>
          <p>{view === "mirror" ? "让经历成为有结构的知识，让理解随着年龄、新情境和新的声音持续更新。"
            : view === "topics" ? "围绕具体问题积累证据、比较解释，看到理解为什么改变，而不只是保存最后一句结论。"
            : view === "contexts" ? "在什么环境、与谁、做什么、前后发生什么——先比较材料，不把情境差异压成性格标签。"
              : view === "time" ? "把发生时间、近似月龄和材料放回一起看。不把记录增多当作能力提升。"
                : view === "framework" ? "理论不是装饰标签：它决定要保存哪些信息、建立什么关系，以及哪些推断必须止步。"
                  : "任何能读写本地文件、执行命令的通用 Agent，都可以遵循同一协议维护知识库。网页不承担内容录入。"}</p>
        </section>
        {error && <div className="ke-error" role="alert">{error}<p>旧画像和分析已停用；10秒后重试，也可点击重新读取。不会把损坏资料当作空库。</p></div>}
        {!kb && !error && <p role="status">正在读取本机知识库……</p>}
        {kb && <div className="ke-revision"><span>{example ? "合成数据" : "私有文件知识库"} · revision {kb.revision}</span><span>{kb.updatedAt ? `更新于 ${new Date(kb.updatedAt).toLocaleString("zh-CN")}` : "尚无Agent提交"} · 每10秒检查更新</span></div>}
        {view !== "framework" && view !== "agent" && view !== "topics" && kb && <>
          <div className="ke-scope" aria-label="分析范围">
            <label>观察窗口<select value={domain} onChange={(e) => { setDomain(e.target.value as DomainId | ""); setEvidencePage(0); }}><option value="">全部发展维度</option>{Object.entries(DOMAINS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></label>
            <label>发生时间起<input type="date" aria-label="发生时间起" max={today()} value={from} onChange={(e) => { setFrom(e.target.value); setEvidencePage(0); }} /></label>
            <label>发生时间止<input type="date" aria-label="发生时间止" max={today()} value={to} onChange={(e) => { setTo(e.target.value); setEvidencePage(0); }} /></label>
            {scopeFiltered && <button type="button" onClick={() => { setDomain(""); setFrom(""); setTo(""); setEvidencePage(0); }}>清除筛选</button>}
          </div>
          {model.error && <p className="ke-error" role="alert">{model.error}</p>}
          {undatedOutsideScope > 0 && <p className="ke-warning">还有{undatedOutsideScope}项发生日期未知的相关材料，未被分配到当前时间范围。清除日期筛选可查看。</p>}
        </>}
        {data && view === "mirror" && <>
          <section className="ke-overview">
            <div className="ke-person" aria-hidden="true"><span>成长中的<br />独特的自己</span><i /><i /><i /></div>
            <div><span className="ke-kicker">不是固定人格，而是可修正的理解</span><h3>材料 → 情境关系 → 阶段解释</h3>
              <p>{data.observations.length ? `当前范围有 ${data.observations.length} 项材料，来自 ${data.sources.length} 份来源。它们是选择性记录，不是生活的完整样本。` : "知识库还是空的。先让你的 Agent 按科学框架整理材料，而不是在网页上填表，也不凭空生成一个孩子。"}
              </p><div className="ke-actions"><button type="button" className="primary" onClick={() => navigate(data.observations.length ? "contexts" : "agent")}>{data.observations.length ? "探索情境与行为" : "查看 Agent 写入约定"}</button><button type="button" onClick={() => navigate("framework")}>了解理论与结构</button></div></div>
          </section>
          <section className="ke-section"><h3>围绕问题，持续理解</h3><p>不仅看维度，也回看具体问题怎样经过材料、反例和重新分析而改变。</p><button type="button" onClick={() => navigate("topics")}>查看持续追踪的问题</button></section>
          <div className="ke-domains">{data.domains.map((item) => {
            const insight = data.analyses.find((analysis) => analysis.domain === item.id && !analysis.needsReview);
            return <button type="button" className="ke-domain" key={item.id} onClick={() => { setDomain(item.id); setEvidencePage(0); }}>
              <span className="ke-kicker">{item.observationIds.length ? "有材料可探索" : "尚待了解"}</span><h3>{item.name}</h3><p>{item.question}</p>
              <div>{insight ? <><small>Agent 条件性解释</small><p>{insight.claim}</p></> : <p>{item.observationIds.length ? "材料已入库，尚无基于最新修订的Agent解释。" : "没有材料，不补写特质，不显示虚构评分。"}</p>}</div>
              <small>理论基础 · {item.theories.map((id) => THEORIES[id].name.split("：")[0]).join(" / ")}</small>
            </button>;
          })}</div>
          <section className="ke-section"><div className="ke-section-title"><h3>目前有哪些有依据的解释</h3><span>Agent 提供分析，系统检查结构与引用</span></div>
            {!data.analyses.length && <div className="ke-empty">还没有这个范围的Agent分析。应用会自动组织时间、情境和行为编码；条件性解释需要你的Agent读取全库、核对理论和反例后提交，不由关键词匹配假扮心理分析。</div>}
            {data.analyses.map((item) => analysis(item, item.needsReview, item.outsideScope))}
            {kb && kb.analyses.some((item) => !data.analyses.some((current) => current.id === item.id)) && <button type="button" onClick={() => setShowHistory(!showHistory)}>{showHistory ? "收起" : "查看"}完整分析档案（含旧版及范围外）</button>}
            {showHistory && kb?.analyses.filter((item) => !data.analyses.some((current) => current.id === item.id)).slice().reverse().map((item) => analysis(item, analysisNeedsReview(kb, item), true))}
          </section>
          <section className="ke-section"><h3>还不能确定什么</h3>{data.gaps.map((gap) => <p className="ke-gap" key={gap}>{gap}</p>)}
            {!data.gaps.length && <p className="ke-gap">结构字段齐全也不代表样本充分、分析正确或获得了孩子认可。</p>}</section>
        </>}
        {view === "topics" && kb && <ResearchTopics kb={kb} chosenId={topicId} onChoose={setTopicId} onSource={source} renderAnalysis={analysis} />}
        {data && view === "contexts" && <>
          <div className="ke-notice"><b>自动生成的是材料关系，不是心理结论。</b> 按明确的环境、熟悉度和行为码分组；编码由Agent从原文提取。计数只说明库里有这些片段，不表示行为发生率。相同熟悉度也不等于相同活动。</div>
          <div className="ke-contexts">{data.contexts.map((group) => <section key={group.key} className="ke-context">
            <div className="ke-section-title"><h3>{group.label}</h3><small>{group.observations.length}项材料</small></div>
            <div className="ke-signal-map">{group.signals.map((signal) => <div key={signal.code}><strong>{signal.label}</strong><span>{signal.ids.length}项材料</span><div>{signal.ids.map((id, i) => <button type="button" key={id} onClick={() => source(id)} aria-label={`${signal.label}依据${i + 1}`}>●</button>)}</div></div>)}</div>
            {group.observations.slice(0, 3).map((item) => evidence(item, true))}
            {group.observations.length > 3 && <p>更多材料见下方原始依据。</p>}
          </section>)}</div>
          {!data.contexts.length && <div className="ke-empty">这个范围没有材料。可通过Agent添加，不在网页里补写。</div>}
          <section className="ke-section"><h3>原始依据</h3><div className="ke-evidence-grid">{data.observations.slice(evidencePage * 20, evidencePage * 20 + 20).map((item) => evidence(item))}</div>
            {data.observations.length > 20 && <div className="ke-actions"><button disabled={!evidencePage} onClick={() => setEvidencePage(evidencePage - 1)}>上一组</button><span>{evidencePage + 1} / {Math.ceil(data.observations.length / 20)}</span><button disabled={(evidencePage + 1) * 20 >= data.observations.length} onClick={() => setEvidencePage(evidencePage + 1)}>下一组</button></div>}</section>
        </>}
        {data && view === "time" && <>
          <div className="ke-notice">出生年月{kb?.child.birthMonth ? `为 ${kb.child.birthMonth}，月龄按年月差近似计算，有约一个月误差` : "未知，不自动猜测年龄"}。不套用统一年龄阶段、里程碑达标率或“进步曲线”；Agent解释需要核对不同时间的材料是否可比。</div>
          <section className="ke-period-compare">{[0, 1].map((side) => {
            const value = side === 0 ? monthA : monthB;
            const chosen = data.months.find((month) => month.month === value) || data.months[side === 0 ? 0 : data.months.length - 1];
            return <div className="ke-period" key={side}><label>{side === 0 ? "回看较早材料" : "对照另一个时期"}<select aria-label={side === 0 ? "对照月份一" : "对照月份二"} value={chosen?.month || ""} onChange={(e) => side === 0 ? setMonthA(e.target.value) : setMonthB(e.target.value)}>{data.months.map((month) => <option key={month.month} value={month.month}>{month.month} · {month.age}</option>)}</select></label>
              {chosen ? <><p className="ke-kicker">{chosen.age} · 原始片段，非阶段定论</p>{chosen.observations.slice(0, 10).map((item) => evidence(item))}{chosen.observations.length > 10 && <p>这里只列出10项，请在情境页按月份筛选查看全部。</p>}</> : <p>尚无有日期的材料可对照。</p>}</div>;
          })}</section>
          {data.unknownDates > 0 && <p className="ke-warning">日期未知的{data.unknownDates}项仍保留在知识库；设定时间筛选后不会归入某一时期。</p>}
          <section className="ke-section"><h3>解释也有自己的时间</h3><p>记录分析形成时所据的知识修订，不把后来的了解冒充当时已经知道。</p>
            {data.analyses.map((item) => analysis(item, item.needsReview, item.outsideScope))}
            {!data.analyses.length && <p className="ke-empty">暂无Agent提交的阶段解释。</p>}</section>
        </>}
        {view === "framework" && <>
          <div className="ke-ontology"><span>原始来源</span><b>→</b><span>有情境的观察</span><b>→</b><span>多维行为与时间关系</span><b>→</b><span>可撤回的Agent解释</span></div>
          <div className="ke-notice">这是研究支持下的产品知识框架，不是标准化测评模型。维度与行为码是本项目的操作化设计，不能声称是学界统一分类。理论适用范围、个体证据与解释有效性必须分别审查。</div>
          <section className="ke-section"><h3>可复用的科学知识卡</h3><p>概念、观察指引和分析方法分别呈现。卡片随代码独立维护，不含孩子资料；引用时记录ID和版本。Agent可运行 <code>npm run kb -- cards</code> 读取同一份目录。</p>
            {SCIENCE_CARDS.map((card) => <ScienceCardView key={card.id} card={card} />)}
          </section>
          <section className="ke-section"><h3>为什么收集这些信息</h3><div className="ke-framework-grid">{Object.entries(THEORIES).map(([id, theory]) => <article className="ke-theory" key={id}><span className="ke-kicker">{id}</span><h3>{theory.name}</h3><p>{theory.principle}</p>
            <div className="ke-field-list">{theory.fields.map((field) => <code key={field}>{field}</code>)}</div><p className="ke-warning">{theory.limit}</p>
            <a href={theory.url} target="_blank" rel="noreferrer">{theory.author} ↗</a></article>)}</div></section>
          <section className="ke-section"><h3>从理论到观察维度</h3><div className="ke-framework-grid">{Object.entries(DOMAINS).map(([id, item]) => <article className="ke-theory" key={id}><code>{id}</code><h3>{item.name}</h3><p>{item.question}</p><small>{item.theories.map((id) => THEORIES[id].name).join(" / ")}</small></article>)}</div></section>
          <section className="ke-section"><h3>行为词表：只编码可观察的动作</h3><div className="ke-field-list">{Object.entries(SIGNALS).map(([id, name]) => <code key={id}>{id} · {name}</code>)}</div><p>每个代码必须带原文片段；没有适合的代码可留空。禁止将“内向、叛逆、焦虑、聪明”等解释写进行为词表。</p></section>
        </>}
        {view === "agent" && <>
          <div className="ke-agent-contract"><h3>让你已有的 Agent 整理，不要求你换工具</h3><p>Agent读取仓库里的协议与科学框架，按结构提取材料、分析并提交批次。本应用不绑定某个模型，也不会自动把儿童资料发送给外部服务。</p>
            <pre>{`先阅读 AGENTS.md、docs\\KNOWLEDGE_FRAMEWORK.md\n和 docs\\AGENT_KNOWLEDGE_PROTOCOL.md。\n运行 kb cards 获取科学知识卡；读取当前库与修订号。\n围绕已有专题或建立具体问题，按约定整理我授权的材料。\n事实保留原文与位置；未知用 null；分析与事实分开。\n任务记录声明读取材料、反例范围、可比性及理解变化原因。\n材料不足可以不提交结论。先验证，再通过 kb apply 提交。`}</pre>
            <p>使用任何外部Agent前，仍需你自行决定它能接触哪些材料及其数据留存条件。通用Agent能力不等于自动取得孩子的数据授权。</p>
          </div>
          <section className="ke-section"><h3>稳定的本机接口</h3><pre>{`npm run kb -- cards\nnpm run kb -- show\nnpm run kb -- schema --batch\nnpm run kb -- validate --file knowledge\\private\\batch.json\nnpm run kb -- apply --file knowledge\\private\\batch.json`}</pre>
            <p>每个批次携带 expectedRevision。写入先拿锁、全量校验，再原子替换；并发冲突、非法引用或损坏文件都会失败，不覆盖旧库。</p>
            <div className="ke-framework-grid"><article className="ke-theory"><h3>资料在哪里？</h3><code>knowledge\private\current.json</code><p>私有目录已被Git忽略；不进入前端构建，不放入 public。网页通过本机只读API每10秒读取，不需要重新构建。</p></article>
              <article className="ke-theory"><h3>分析由谁做？</h3><p>应用确定性地组织情境、行为、月龄与来源；通用Agent结合理论提出有条件的解释、反例、局限和后续问题，仍须人核对。引用校验不证明心理解释正确。</p></article>
              <article className="ke-theory"><h3>如何随成长更新？</h3><p>新材料追加，错误观察用新ID更正。新材料使旧分析待复核；Agent重读后追加分析版本。删除源材料同步删除依赖解释。</p></article>
              <article className="ke-theory"><h3>以前的数据呢？</h3><p>旧浏览器档案未被删除，也未自动改写成科学知识库。旧资料缺少本契约的来源和情境，迁移必须由Agent逐条核对，不自动编造缺失字段。</p></article></div>
          </section>
        </>}
        <footer className="ke-page-footer">理解会改变，孩子不被定型。缺失材料不是缺失能力；解释不是诊断，也不代表孩子同意。</footer>
      </div>
    </main>
    {selected && selectedSource && <div className="ke-drawer-backdrop" onClick={() => setSelectedId(null)}>
      <aside className="ke-drawer" role="dialog" aria-modal="true" aria-label="原始依据与知识关系" onClick={(event) => event.stopPropagation()}>
        <div className="ke-row"><span className="ke-kicker">从分析回到材料</span><button type="button" onClick={() => setSelectedId(null)}>关闭来源</button></div>
        {!activeIds.has(selected.id) && <p className="ke-warning">此观察已被更正，仅作为历史依据查看。</p>}
        <h2>{selected.behavior}</h2><p>{selected.occurredOn || "发生日期未知"} · {approximateAge(kb?.child.birthMonth || null, selected.occurredOn)}</p>
        <p className="ke-kicker">记录时间 {new Date(selected.recordedAt).toLocaleString("zh-CN")} · {selected.id}</p>
        <h3>情境与经过 · Agent结构化提取，未独立核实</h3><dl>
          <dt>环境 / 熟悉度</dt><dd>{SETTINGS[selected.context.setting]} / {FAMILIARITY[selected.context.familiarity]}</dd>
          {(["activity", "people", "antecedent", "response", "outcome"] as const).map((field) => <div key={field}><dt>{({ activity: "活动", people: "在场者", antecedent: "之前发生什么", response: "他人怎样回应", outcome: "后续经过" })[field]}</dt><dd>{selected.context[field] || "未知，没有补全"}</dd></div>)}
        </dl>
        <h3>孩子表达</h3>{selected.childExpression ? <><blockquote>{selected.childExpression.text}</blockquote><small>{fidelity[selected.childExpression.fidelity]}</small></> : <p>没有可追溯的表达，不代孩子发言。</p>}
        <h3>来源原文片段</h3><blockquote>{selected.sourceExcerpt}</blockquote><p>{selectedSource.reporter} · {SOURCE_KINDS[selectedSource.kind]}</p>
        <p className="ke-kicker">来源采集于 {new Date(selectedSource.capturedAt).toLocaleString("zh-CN")}，与发生时间分开。</p>
        {selected.sourceLocator ? <p className="ke-kicker">来源版本ID {selectedSource.id} · UTF-16位置 [{selected.sourceLocator.start}, {selected.sourceLocator.end}) · 仅证明片段匹配，不证明解释有效</p> : <p className="ke-warning">旧材料没有精确位置；仅校验片段存在，不自动猜测重复片段中的位置。</p>}
        <button type="button" onClick={() => setSourceVisible(!sourceVisible)}>{sourceVisible ? "收起" : "查看"}完整来源文本</button>{sourceVisible && <pre>{selected.sourceLocator ? <>{selectedSource.content.slice(0, selected.sourceLocator.start)}<mark>{selectedSource.content.slice(selected.sourceLocator.start, selected.sourceLocator.end)}</mark>{selectedSource.content.slice(selected.sourceLocator.end)}</> : selectedSource.content}</pre>}
        <h3>结构化关系</h3><div className="ke-field-list">{selected.domains.map((id) => <span key={id}>{DOMAINS[id].name}</span>)}{selected.signals.map((signal) => <span key={signal.code} title={signal.excerpt}>{SIGNALS[signal.code]}</span>)}</div>
        <p className="ke-kicker">提取者 {selected.recordedBy.name} · {selected.recordedBy.tool}</p>
        {selected.supersedes && <button type="button" onClick={() => source(selected.supersedes!)}>查看被更正的观察</button>}
        {kb?.observations.filter((item) => item.supersedes === selected.id).map((item) => <button type="button" key={item.id} onClick={() => source(item.id)}>查看后来的更正</button>)}
        <h3>哪些解释引用了它？</h3>{kb?.analyses.filter((item) => [...item.supportingIds, ...item.counterIds].includes(selected.id)).map((item) => <p key={item.id}>{item.title} · revision {item.basedOnRevision}</p>)}
      </aside>
    </div>}
  </div>;
}
