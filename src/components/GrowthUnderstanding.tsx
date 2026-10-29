import { useMemo, useState, type FormEvent } from "react";
import { TOPICS, SOURCES, localDate, type GrowthEvent, type GrowthJournal, type GrowthUnderstanding as Understanding, type Topic } from "../lib/growth";
import { currentUnderstandings, LENSES, mirrorPeriods, periodEvidence, understandingWarnings } from "../lib/growthMirror";

type Mode = "overview" | "understand" | "changes";
const emptyDraft = () => ({ author: "", statement: "", alternative: "", question: "", support: "", status: "exploring" as Understanding["status"] });
function initialFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 89);
  return localDate(date);
}

export function GrowthUnderstanding({ journal, mode, unavailable, dirty, onDirty, onMode, onSource, onRecord, onSave, onDelete }: {
  journal: GrowthJournal; mode: Mode; unavailable: boolean; dirty: boolean;
  onDirty: (dirty: boolean) => void; onMode: (mode: Mode) => void;
  onSource: (id: string) => void; onRecord: () => void;
  onSave: (item: Understanding) => boolean; onDelete: (id: string) => void;
}) {
  const [topic, setTopic] = useState<Topic>("emotion");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(localDate);
  const [draft, setDraft] = useState(emptyDraft);
  const [selected, setSelected] = useState<Record<string, "evidence" | "counter">>({});
  const [supersedes, setSupersedes] = useState<string>();
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scope = useMemo(() => {
    try {
      if (to > localDate()) throw new Error("成长镜像只回看已经发生的经历，结束日期不能晚于今天。");
      return { periods: mirrorPeriods(from, to), error: "" };
    } catch (error) {
      return { periods: null, error: error instanceof Error ? error.message : "时间范围无效。" };
    }
  }, [from, to]);
  const periods = scope.periods;
  const current = periods && !unavailable ? periodEvidence(journal.events, from, to) : [];
  const focused = current.filter((event) => event.topic === topic);
  const previous = periods?.previous && !unavailable ? periodEvidence(journal.events, periods.previous.from, periods.previous.to, topic) : [];
  const notes = unavailable ? [] : currentUnderstandings(journal);
  const scopedNotes = notes.filter((item) => item.from <= to && item.to >= from);
  const materials = (showAll ? current : focused);
  const lens = LENSES[topic];
  const draftInvalid = Object.keys(selected).some((id) => !journal.events.some((event) => event.id === id))
    || Boolean(supersedes && !journal.understandings?.some((item) => item.id === supersedes));
  const canSave = !unavailable && Boolean(periods) && !draftInvalid;

  function reset() {
    setDraft(emptyDraft()); setSelected({}); setSupersedes(undefined); setPage(0); onDirty(false);
  }
  function leaveDraft(action: () => void) {
    if (dirty && !window.confirm("更换理解主题、时间或修订对象会放弃这份未保存的理解。是否继续？")) return;
    reset(); action();
  }
  function explore(next: Topic) {
    if (next !== topic) leaveDraft(() => { setTopic(next); onMode("understand"); });
    else onMode("understand");
  }
  function revise(item: Understanding) {
    leaveDraft(() => {
      setTopic(item.topic); setFrom(item.from); setTo(item.to);
      setDraft({ author: item.author, statement: item.statement, alternative: item.alternative, question: item.question, support: item.support, status: item.status });
      setSelected(Object.fromEntries([...item.evidenceIds.map((id) => [id, "evidence"] as const), ...item.counterEvidenceIds.map((id) => [id, "counter"] as const)]));
      setShowAll(true); setSupersedes(item.id); onDirty(true); onMode("understand");
    });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    if (onSave({
      ...draft, author: draft.author.trim(), statement: draft.statement.trim(), alternative: draft.alternative.trim(),
      question: draft.question.trim(), support: draft.support.trim(),
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), topic, from, to,
      evidenceIds: Object.keys(selected).filter((id) => selected[id] === "evidence"),
      counterEvidenceIds: Object.keys(selected).filter((id) => selected[id] === "counter"),
      ...(supersedes ? { supersedes } : {})
    })) reset();
  }
  function evidence(event: GrowthEvent) {
    return <article className="understanding-evidence" key={event.id}>
      <header><strong>{event.title}</strong><time>{event.occurredOn}</time></header>
      <p className="mirror-meta">{event.observer} · {SOURCES[event.source]} · {TOPICS[event.topic]}</p>
      <dl>
        <dt>情境</dt><dd>{event.context || "尚未记录，不补全背景。"}</dd>
        <dt>可观察的行为</dt><dd>{event.observation}</dd>
        <dt>孩子的表达 · 记录者提供</dt><dd>{event.childQuote || "没有原话，不推测孩子的想法。"}</dd>
      </dl>
      {event.interpretation && <p className="understanding-caution">记录者原有理解（待确认）：{event.interpretation}</p>}
      {event.support && <p>当时记录的支持设想（不代表已经实施）：{event.support}</p>}
      {event.perspectives.map((item) => <blockquote key={item.id}>
        <strong>{item.kind === "child" ? "孩子视角 · 由录入者提供" : item.kind === "correction" ? "更正／不同理解" : "成人视角"} · {item.author}</strong>
        <p>{item.response === "skip" ? "孩子选择暂不回答；不猜测原因。" : item.content || "未附文字。"}
          {item.response === "disagree" && "（录入者标注：有不同理解）"}</p>
        <small>补充于 {new Date(item.createdAt).toLocaleString("zh-CN")}，不等于当时已经知道。</small>
      </blockquote>)}
      <button type="button" className="journal-text-button" onClick={() => onSource(event.id)}>查看完整来源与补充 →</button>
    </article>;
  }
  function note(item: Understanding) {
    const warnings = understandingWarnings(item, journal);
    return <article className="understanding-note" key={item.id}>
      <span className="mirror-tag">{TOPICS[item.topic]} · {item.status === "working" ? "当前工作理解，仍可推翻" : "探索中的假设"}</span>
      <h3>{item.statement}</h3>
      <p className="mirror-meta">{item.from} — {item.to} · {item.author} 于 {new Date(item.createdAt).toLocaleString("zh-CN")}整理 · 非AI或心理评估结论</p>
      <p><strong>另一种解释：</strong>{item.alternative}</p>
      <p><strong>还需要了解：</strong>{item.question}</p>
      {item.support && <p><strong>下一次支持尝试：</strong>{item.support}</p>}
      <div className="understanding-citations">
        {item.evidenceIds.map((id, i) => <button type="button" key={id} onClick={() => onSource(id)}>依据 {i + 1} · {journal.events.find((event) => event.id === id)?.title}</button>)}
        {item.counterEvidenceIds.map((id, i) => <button type="button" key={id} onClick={() => onSource(id)}>反例 {i + 1} · {journal.events.find((event) => event.id === id)?.title}</button>)}
      </div>
      {warnings.map((warning) => <p className="understanding-caution" key={warning}>{warning}</p>)}
      <div className="mirror-actions">
        {notes.some((latest) => latest.id === item.id) && <button className="mirror-secondary" type="button" onClick={() => revise(item)}>带着新依据修订</button>}
        <button className="mirror-danger" type="button" disabled={dirty} title={dirty ? "请先保存或放弃理解草稿" : undefined} onClick={() => onDelete(item.id)}>删除此理解及后续修订</button>
      </div>
    </article>;
  }
  return <section className="understanding-workspace" aria-label="成长理解工作区">
    <header className="understanding-heading">
      <span className="mirror-eyebrow">GROWING · NOT DEFINING</span>
      <h2>{mode === "overview" ? `${unavailable ? "孩子" : journal.childName || "孩子"}的成长镜像` : mode === "changes" ? "看见阶段与情境的不同" : "一起理解，而不是急着定义"}</h2>
      <p>{mode === "overview" ? "不是一份性格定论，而是由真实经历、不同声音和可修正的理解组成的动态画像。"
        : mode === "changes" ? "把同一主题的两个时期并排回看。系统不把样本多少或表达差异换算成成长分数。"
          : "沿着心理学观察框架，核对情境、寻找反例、留下待核实的理解，再回到真实交流中。这里没有自动心理分析。"}</p>
    </header>
    <div className="understanding-scope">
      <label>本阶段开始<input aria-label="镜像开始日期" type="date" value={from} max={localDate()} onChange={(e) => leaveDraft(() => setFrom(e.target.value))} /></label>
      <label>本阶段结束<input aria-label="镜像结束日期" type="date" value={to} max={localDate()} onChange={(e) => leaveDraft(() => setTo(e.target.value))} /></label>
      <span>只描述这个时期；没有记录 ≠ 没有发生。</span>
    </div>
    {scope.error && <p role="alert" className="mirror-error">{scope.error}</p>}
    {unavailable && <p role="alert" className="mirror-error">档案已变化，旧画像、依据和理解已停用。请先保留输入并重新载入。</p>}
    {unavailable && dirty && <section className="understanding-empty"><h3>未保存的理解草稿 · 仅供复制</h3>
      {Object.entries(draft).map(([key, text]) => <label key={key}>{({ author: "整理者", statement: "阶段理解", alternative: "其他解释", question: "待了解问题", support: "支持尝试", status: "状态" })[key]}<textarea readOnly value={text} /></label>)}
      <button type="button" className="mirror-secondary" onClick={() => leaveDraft(() => {})}>已复制，放弃此草稿</button>
    </section>}
    {!unavailable && periods && <>
      {mode === "overview" && <>
        <div className="understanding-hero">
          <div className="understanding-orbit" aria-hidden="true"><span>成长中的<br />独特的自己</span><i /><i /><i /></div>
          <div><h3>先看见这个人，再看见一条条经历</h3>
            <p>从情绪、关系、自主、兴趣、挑战和快乐六个窗口，了解他在什么环境下如何表达、需要什么支持。它们是观察入口，不是六项能力测评。</p>
            <button type="button" className="mirror-primary" onClick={() => onMode("understand")}>从一个想了解的问题开始</button>
          </div>
        </div>
        <div className="understanding-domains">
          {(Object.keys(LENSES) as Topic[]).map((key) => {
            const items = current.filter((event) => event.topic === key);
            const understanding = scopedNotes.find((item) => item.topic === key);
            const expression = items.find((event) => event.childQuote.trim());
            return <button type="button" key={key} className="understanding-domain" onClick={() => explore(key)}>
              <span className="mirror-eyebrow">{items.length ? "有经历可回看" : "尚待了解"}</span>
              <h3>{LENSES[key].title}</h3><p>{LENSES[key].focus}</p>
              {understanding ? <div className="understanding-domain-insight"><small>家庭整理的阶段理解 · 可修正</small><p>{understanding.statement}</p></div>
                : expression ? <div className="understanding-domain-insight"><small>孩子原话 · 记录者提供，非画像结论</small><p>“{expression.childQuote}”</p></div>
                  : <div className="understanding-domain-insight"><p>{items.length ? "已有素材，但尚未形成阶段理解。一起看看情境和其他解释。" : "暂时未知。不根据缺失记录补全孩子的样子。"}</p></div>}
              <span className="understanding-domain-link">进入这个理解窗口 →</span>
            </button>;
          })}
        </div>
        <section className="understanding-synthesis"><h3>我们目前怎样理解他</h3>
          <p>下面由家庭核对依据后整理；“当前工作理解”也不等于事实或孩子认可。</p>
          {scopedNotes.length ? scopedNotes.map(note) : <div className="understanding-empty">还没有本阶段的理解。不急着生成一个“像他”的人；先从一个真实情境，形成第一份有依据的描述。
            <div className="mirror-actions"><button type="button" className="mirror-secondary" onClick={() => onMode("understand")}>开始理解</button><button type="button" className="mirror-secondary" onClick={onRecord}>补充一段经历</button></div>
          </div>}
        </section>
      </>}
      {mode !== "overview" && <>
        <label className="understanding-topic">这次想了解哪个方面？<select value={topic} onChange={(e) => {
          const next = e.target.value;
          if (Object.prototype.hasOwnProperty.call(LENSES, next)) leaveDraft(() => { setTopic(next as Topic); setShowAll(false); });
        }}>{(Object.keys(LENSES) as Topic[]).map((key) => <option key={key} value={key}>{LENSES[key].title} · {LENSES[key].focus}</option>)}</select></label>
        <aside className="understanding-lens">
          <span className="mirror-eyebrow">心理学视角 · 通用知识，不是对这个孩子的评估</span>
          <h3>{lens.focus}</h3><p>{lens.principle}</p>
          <ol>{lens.questions.map((question) => <li key={question}>{question}</li>)}</ol>
          <p><strong>可选择的小尝试：</strong>{lens.tryNext} 不适合就跳过，不承诺效果。</p>
          <a href={lens.source.url} target="_blank" rel="noreferrer">框架来源：{lens.source.title} ↗</a>
        </aside>
        {mode === "changes" ? <>
          <div className="understanding-comparison">
            <section><h3>之前的等长时期</h3><p>{periods.previous ? `${periods.previous.from} — ${periods.previous.to}` : "超出支持的日历范围。"}</p>
              {previous.length ? previous.slice(0, 20).map(evidence) : <p className="understanding-empty">这个时期没有该主题的资料，不能比较变化。</p>}
              {previous.length > 20 && <p>展示最近20段，完整材料在经历与依据中按日期查看。</p>}</section>
            <section><h3>本阶段</h3><p>{from} — {to}</p>
              {focused.length ? focused.slice(0, 20).map(evidence) : <p className="understanding-empty">本阶段没有该主题的资料，不能说明能力或行为减少。</p>}
              {focused.length > 20 && <p>展示最近20段，完整材料在经历与依据中按日期查看。</p>}</section>
          </div>
          <div className="understanding-empty"><strong>比较的是材料，不是“进步或退步”</strong><p>先核对环境、活动、记录者和孩子表达是否可比。年龄、原因和变化方向不能从记录数量推出。</p>
            <button type="button" className="mirror-primary" onClick={() => onMode("understand")}>带着这些不同，整理阶段理解</button></div>
        </> : <>
          <section><h3>1 · 看情境，也听不同的声音</h3>
            <p>先阅读原文，再选择支持这次理解的依据和不符合它的反例。可跨主题比较，不自动选择材料。</p>
            <label className="mirror-checkbox-label"><input type="checkbox" checked={showAll} onChange={(e) => { setShowAll(e.target.checked); setPage(0); }} />也查看本阶段其他主题的经历</label>
            <div className="understanding-materials">
              {materials.slice(page * 20, page * 20 + 20).map((event) => <div key={event.id}>{evidence(event)}
                <label>这段经历在本次理解中的作用<select aria-label={`材料作用：${event.title}`} value={selected[event.id] || ""} onChange={(e) => {
                  const role = e.target.value;
                  setSelected((previous) => {
                    const next = { ...previous }; delete next[event.id];
                    if (role === "evidence" || role === "counter") next[event.id] = role;
                    return next;
                  }); onDirty(true);
                }}><option value="">不引用</option><option value="evidence">支持理解的依据</option><option value="counter">反例／不同情境</option></select></label>
              </div>)}
              {!materials.length && <div className="understanding-empty"><p>没有可用经历。心理学框架不能替代孩子的真实材料。</p><button className="mirror-secondary" type="button" onClick={onRecord}>补充这个情境的经历</button></div>}
            </div>
            {materials.length > 20 && <div className="mirror-actions"><button type="button" disabled={!page} onClick={() => setPage(page - 1)}>上一组</button><span>{page + 1} / {Math.ceil(materials.length / 20)}</span><button type="button" disabled={(page + 1) * 20 >= materials.length} onClick={() => setPage(page + 1)}>下一组</button></div>}
          </section>
          <section className="understanding-synthesis"><h3>2 · 形成可修正的理解，而非固定标签</h3>
            <p>这是家庭自行整理的理解，不是系统分析结果。至少一项依据；其他解释和待核实问题也必须保留。</p>
            <p className="mirror-meta">已选依据 {Object.values(selected).filter((role) => role === "evidence").length} 项 · 反例 {Object.values(selected).filter((role) => role === "counter").length} 项（每类最多100项）{supersedes && " · 正在追加修订，旧版本保留"}</p>
            {draftInvalid && <p className="mirror-error" role="alert">已选依据或被修订的理解已删除，不能保存这份过期理解。请先复制草稿，放弃后重新选择依据。</p>}
            <div className="understanding-citations">{Object.entries(selected).map(([id, role]) => <button type="button" key={id}
              onClick={() => { setSelected((previous) => { const next = { ...previous }; delete next[id]; return next; }); onDirty(true); }}
              aria-label={`移除引用：${journal.events.find((event) => event.id === id)?.title}`}>
              {role === "evidence" ? "依据" : "反例"} · {journal.events.find((event) => event.id === id)?.title || "已删除的来源"} ×
            </button>)}</div>
            <form onSubmit={submit} onChange={() => onDirty(true)}>
              <label>由谁整理 *<input maxLength={60} required value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></label>
              <label>在这些情境中，我们目前的理解是…… *<textarea rows={3} maxLength={8000} required placeholder="描述条件和具体表现，例如：在熟悉的伙伴身边，他会主动提出玩法；不写“他就是外向的人”。" value={draft.statement} onChange={(e) => setDraft({ ...draft, statement: e.target.value })} /></label>
              <label>也可能有另一种解释…… *<textarea rows={2} maxLength={8000} required placeholder="哪些环境差异、遗漏信息或不同意见，可能改变这个理解？" value={draft.alternative} onChange={(e) => setDraft({ ...draft, alternative: e.target.value })} /></label>
              <label>还想通过交流或观察了解什么？ *<textarea rows={2} maxLength={8000} required placeholder="先问孩子愿不愿意聊；不愿意就不追问，不把沉默当作认可。" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} /></label>
              <label>下次可以怎样支持？（可选）<textarea rows={2} maxLength={8000} value={draft.support} onChange={(e) => setDraft({ ...draft, support: e.target.value })} /></label>
              <label>这份理解的状态<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value === "working" ? "working" : "exploring" })}><option value="exploring">探索中，还需要了解</option><option value="working">作为当前工作理解，仍可被推翻</option></select></label>
              {dirty && <p className="mirror-draft-status">理解草稿尚未保存，普通面板切换会保留；刷新或关闭会丢失。</p>}
              <div className="mirror-actions"><button className="mirror-primary" type="submit" disabled={!canSave}>保存到成长镜像</button>
                <button className="mirror-secondary" type="button" disabled={!dirty} onClick={() => leaveDraft(() => {})}>放弃本次理解输入</button>
                <button className="mirror-secondary" type="button" onClick={() => onMode("changes")}>对照前一个阶段</button></div>
            </form>
          </section>
          <section className="understanding-synthesis"><h3>3 · 回来核对，而不是一次定型</h3>
            <p>新的表达、反例或更正出现后，可以追加修订；旧版保留。孩子对原经历的认可不等于认可这份理解。</p>
            {notes.filter((item) => item.topic === topic).map(note)}
            {!notes.some((item) => item.topic === topic) && <p>这个方面还没有阶段理解。</p>}
            <button className="mirror-secondary" type="button" onClick={() => setShowHistory(!showHistory)}>{showHistory ? "收起" : "查看"}修订前的理解</button>
            {showHistory && (journal.understandings || []).filter((item) => item.topic === topic && !notes.some((latest) => latest.id === item.id)).slice().reverse().map(note)}
          </section>
        </>}
      </>}
    </>}
  </section>;
}
