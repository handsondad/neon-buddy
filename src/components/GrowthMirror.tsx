import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  TOPICS, PERSPECTIVES, SOURCES, CHILD_RESPONSES, appendPerspective, filterEvents, localDate,
  parseJournal, removeEvent, removeUnderstanding, validateJournal,
  type GrowthEvent, type GrowthJournal, type GrowthUnderstanding as Understanding, type EventFilters, type PerspectiveKind, type ChildResponse
} from "../lib/growth";
import {
  MAX_BACKUP_SIZE, clearJournal, errorMessage, inspectJournal, journalChanged, journalStorageKey, serializeBackup, spaceId, writeJournal,
  type JournalInspection
} from "../lib/growthRepository";
import { eventAnchor } from "../lib/growthReview";
import { GrowthReview } from "./GrowthReview";
import { GrowthUnderstanding } from "./GrowthUnderstanding";
import { JournalIcon } from "./JournalIcon";
import { JournalIndex } from "./JournalIndex";
import "./growthMirror.css";

function load(space: string): JournalInspection {
  try {
    return inspectJournal(window.localStorage, space);
  } catch (error) {
    return { snapshot: null, revision: undefined, error: `无法读取档案，已停止写入以保护原数据。${errorMessage(error)}` };
  }
}

function value(form: FormData, name: string): string {
  const item = form.get(name);
  return typeof item === "string" ? item.trim() : "";
}

function download(content: string, filename: string, mime = "application/json"): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EventForm({ onSave, onDirty, onDiscard, dirty, blocked }: {
  onSave: (event: unknown) => boolean;
  onDirty: () => void;
  onDiscard: () => void;
  dirty: boolean;
  blocked: boolean;
}) {
  const savedReset = useRef(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (onSave({
      id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      occurredOn: value(fields, "occurredOn"), title: value(fields, "title"),
      topic: value(fields, "topic"), source: value(fields, "source"),
      observer: value(fields, "observer"), context: value(fields, "context"),
      observation: value(fields, "observation"), childQuote: value(fields, "childQuote"),
      interpretation: value(fields, "interpretation"), support: value(fields, "support"),
      question: value(fields, "question"), perspectives: []
    })) {
      savedReset.current = true;
      form.reset();
      savedReset.current = false;
    }
  }

  return (
    <section className="mirror-panel" aria-labelledby="record-heading">
      <div className="mirror-section-heading">
        <span className="mirror-eyebrow">留下一个真实时刻</span>
        <h2 id="record-heading">记录一件事</h2>
        <p>不必每天打卡。快乐、好奇和普通日常，也值得被记住。带 * 的为必填。</p>
      </div>
      <form onSubmit={submit} onChange={onDirty} onReset={(event) => {
        if (savedReset.current) return;
        if (dirty && !window.confirm("放弃这份未保存的记录输入？已保存的经历不受影响。")) {
          event.preventDefault();
          return;
        }
        onDiscard();
      }}>
        <div className="mirror-form-grid">
          <label>发生日期 *<input name="occurredOn" type="date" defaultValue={localDate()} max={localDate()} required /></label>
          <label>主题 *<select name="topic" defaultValue="everyday">
            {Object.entries(TOPICS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></label>
          <label>记录者称呼 *<input name="observer" maxLength={60} placeholder="可以只写“爸爸”或“我”" required /></label>
          <label>来源 *<select name="source">
            {Object.entries(SOURCES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></label>
        </div>
        <label>给这段经历起个名字 *<input name="title" maxLength={100} placeholder="例如：第一次加入公园里的积木游戏" required /></label>
        <label>当时的情境<input name="context" maxLength={8000} placeholder="在哪里、和谁、之前发生了什么？不必填写具体地址或真实姓名。" /></label>
        <label>观察事实 *<textarea name="observation" rows={4} maxLength={8000} required placeholder="记录看见或听见的行为，尽量不写“他就是……”之类的定论。" /></label>
        <label>孩子的原话（可选）<textarea name="childQuote" rows={2} maxLength={8000} placeholder="只写确实记得的话；不确定就留空，不替孩子补全。" /></label>
        <details className="mirror-details">
          <summary>再留一点理解与问题（可选）</summary>
          <p>以下内容是记录者的想法，不是对孩子的事实判断或专业评估。</p>
          <label>我的理解 · 待确认<textarea name="interpretation" rows={2} maxLength={8000} /></label>
          <label>下次可以尝试的支持<textarea name="support" rows={2} maxLength={8000} /></label>
          <label>以后想听孩子说的问题<textarea name="question" rows={2} maxLength={8000} /></label>
        </details>
        {dirty && <p className="mirror-draft-status" role="status">有未保存的输入 · 未自动保存，关闭页面会丢失。</p>}
        <div className="mirror-actions">
          <button className="mirror-primary" type="submit" disabled={blocked}>保存这段经历</button>
          <button className="mirror-secondary" type="reset" disabled={!dirty}>放弃本次记录输入</button>
        </div>
      </form>
    </section>
  );
}

function EventCard({ event, onAppend, onDelete, onDirty, onDiscard, dirty, blocked }: {
  event: GrowthEvent;
  onAppend: (kind: PerspectiveKind, form: FormData) => boolean;
  onDelete: () => void;
  onDirty: () => void;
  onDiscard: () => void;
  dirty: boolean;
  blocked: boolean;
}) {
  const [kind, setKind] = useState<PerspectiveKind>("child");
  const [response, setResponse] = useState<ChildResponse | "">("");
  const savedReset = useRef(false);
  function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (onAppend(kind, new FormData(submitEvent.currentTarget))) {
      savedReset.current = true;
      submitEvent.currentTarget.reset();
      savedReset.current = false;
      setResponse("");
    }
  }
  return (
    <article className="mirror-event" id={eventAnchor(event.id)} tabIndex={-1}>
      <div hidden={blocked}>
      <div className="mirror-event-top"><time dateTime={event.occurredOn}>{event.occurredOn}</time><span className="mirror-tag">{TOPICS[event.topic]}</span></div>
      <h2>{event.title}</h2>
      <p className="mirror-meta">记录者：{event.observer} · {SOURCES[event.source]} · 录入于 {new Date(event.createdAt).toLocaleString("zh-CN")}</p>
      <dl>
        {event.context && <><dt>当时的情境</dt><dd>{event.context}</dd></>}
        <dt>{event.source === "reported" ? "转述的观察 · 未核实" : "记录的观察事实"}</dt><dd>{event.observation}</dd>
        <dt>孩子的原话 · 记录者提供，未核实</dt><dd>{event.childQuote || "没有记录原话，不作推测。"}</dd>
        {event.interpretation && <><dt>记录者的理解 · 待确认</dt><dd className="mirror-hypothesis">{event.interpretation}</dd></>}
        {event.support && <><dt>可尝试的支持 · 不是效果承诺</dt><dd>{event.support}</dd></>}
        {event.question && <><dt>留待以后询问</dt><dd>{event.question}</dd></>}
      </dl>
      {event.perspectives.length > 0 && <section className="mirror-perspectives" aria-label="后来的补充与不同视角">
        <h4>后来，我们有了新的理解</h4>
        {event.perspectives.map((item) => <div key={item.id} className="mirror-perspective">
          <strong>{PERSPECTIVES[item.kind]}</strong>
          {item.response && <p><strong>{CHILD_RESPONSES[item.response]}</strong> · 由录入者标注，非身份验证</p>}
          <p className="mirror-meta">{item.author} · {SOURCES[item.source]} · {new Date(item.createdAt).toLocaleString("zh-CN")}</p>
          <p>{item.content || "没有附加文字，不推测原因。"}</p>
        </div>)}
      </section>}
      </div>
      {blocked && <h2>未提交的补充草稿</h2>}
      <details className="mirror-details">
        <summary>补充视角或更正这段经历</summary>
        <p>保留原记录，允许不同理解并存。视角由当前使用者录入，系统未验证作者身份；孩子可以不参与。</p>
        <form onSubmit={submit} onChange={onDirty} onReset={(submitEvent) => {
          if (savedReset.current) return;
          if (dirty && !window.confirm("放弃这份未保存的补充输入？已保存的视角不受影响。")) {
            submitEvent.preventDefault();
            return;
          }
          setKind("child");
          setResponse("");
          onDiscard();
        }}>
          <label>补充类型<select value={kind} onChange={(e) => {
            const selected = e.target.value;
            if (selected === "child" || selected === "adult" || selected === "correction") setKind(selected);
          }}>
            {Object.entries(PERSPECTIVES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></label>
          <div className="mirror-form-grid">
            <label>这是谁的视角 *<input name="author" maxLength={60} required placeholder="例如：孩子本人（由爸爸代录）" /></label>
            <label>表达来源<select name="source">
              {Object.entries(SOURCES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
          </div>
          {kind === "child" && <label>孩子的参与选择（由录入者标注）
            <select name="response" value={response} onChange={(e) => {
              const next = e.target.value;
              if (next === "" || Object.prototype.hasOwnProperty.call(CHILD_RESPONSES, next)) setResponse(next as ChildResponse | "");
            }}>
              <option value="">自由补充，不标注认可状态</option>
              {Object.entries(CHILD_RESPONSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>}
          {kind === "child" && response === "skip" && <p>只保存“暂不回答”的选择，不保存此表单中的表达内容，不追问原因。</p>}
          <label hidden={kind === "child" && response === "skip"}>
            补充内容{kind !== "child" || !response ? " *" : "（可选）"}<textarea name="content" rows={3} maxLength={8000}
              disabled={kind === "child" && response === "skip"} required={kind !== "child" || !response}
              placeholder="可以写：我当时并不是害怕，而是想先看看……" />
          </label>
          {dirty && <p className="mirror-draft-status" role="status">这份补充尚未保存，普通面板切换会保留输入。</p>}
          <div className="mirror-actions">
            <button type="submit" className="mirror-primary" disabled={blocked}>保留这个视角</button>
            <button type="reset" className="mirror-secondary" disabled={!dirty}>放弃本次补充输入</button>
          </div>
        </form>
      </details>
      <button className="mirror-danger" disabled={blocked} onClick={onDelete}>删除这段经历及其视角</button>
    </article>
  );
}

export function GrowthMirror() {
  const [pane, setPane] = useState<"overview" | "understand" | "changes" | "evidence" | "entry" | "compose" | "review" | "settings">("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileIndex, setMobileIndex] = useState(false);
  const [space, setSpace] = useState("family");
  const [spaceInput, setSpaceInput] = useState("family");
  const [loaded, setLoaded] = useState(() => load("family"));
  const [externalChange, setExternalChange] = useState(false);
  const [recoveryAcknowledged, setRecoveryAcknowledged] = useState(false);
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<Record<string, boolean>>({});
  const [formKey, setFormKey] = useState(0);
  const [importing, setImporting] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({ keyword: "", topic: "", from: "", to: "" });
  const [sourceTarget, setSourceTarget] = useState<{ eventId: string } | null>(null);
  const snapshot = loaded.snapshot;
  const journal = snapshot?.journal;
  const dirty = Object.values(drafts).some(Boolean);
  const draftCount = Object.values(drafts).filter(Boolean).length;
  const rangeInvalid = Boolean(filters.from && filters.to && filters.from > filters.to)
    || [filters.from, filters.to].some((date) => date && !/^\d{4}-\d{2}-\d{2}$/.test(date));
  const events = useMemo(() => journal && !rangeInvalid && !externalChange ? filterEvents(journal.events, filters) : [], [journal, filters, rangeInvalid, externalChange]);
  const allEvents = useMemo(() => journal ? filterEvents(journal.events, { keyword: "", topic: "", from: "", to: "" }) : [], [journal]);
  const calendarEvents = useMemo(() => journal && !externalChange ? filterEvents(journal.events, { ...filters, from: "", to: "" }) : [], [journal, filters, externalChange]);
  const selectedEvent = journal?.events.find((event) => event.id === selectedId);
  const indexVisible = pane === "entry" || pane === "evidence" || mobileIndex;
  const title = pane === "compose" ? "补充成长素材" : pane === "review" ? "原文检索与导出"
    : pane === "understand" ? "理解工作室" : pane === "changes" ? "阶段对照"
    : pane === "settings" ? "档案与数据" : pane === "entry" && selectedEvent && !externalChange ? selectedEvent.occurredOn
    : pane === "evidence" ? "经历与依据" : "成长镜像";

  useEffect(() => {
    function check(event?: StorageEvent) {
      if (event && event.storageArea !== window.localStorage) return;
      if (event && event.key !== null && event.key !== journalStorageKey(space)) return;
      if (loaded.revision === undefined) return;
      try {
        if (journalChanged(window.localStorage, space, loaded.revision)) {
          setExternalChange(true);
          setMessage("");
        }
      } catch (error) {
        setExternalChange(true);
        setLoaded((previous) => ({ ...previous, error: `无法核对当前档案，请保留输入后重新载入。${errorMessage(error)}` }));
      }
    }
    const onResume = () => check();
    const onVisibility = () => { if (document.visibilityState === "visible") check(); };
    window.addEventListener("storage", check);
    window.addEventListener("focus", onResume);
    window.addEventListener("pageshow", onResume);
    document.addEventListener("visibilitychange", onVisibility);
    check();
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("focus", onResume);
      window.removeEventListener("pageshow", onResume);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [space, loaded.revision]);

  function openPane(next: typeof pane) {
    setPane(next);
    setMobileIndex(false);
  }

  function browse() {
    setFilters({ keyword: "", topic: "", from: "", to: "" });
    setPane("evidence");
    setMobileIndex(true);
  }

  function selectEvent(eventId: string) {
    setSelectedId(eventId);
    setPane("entry");
    setMobileIndex(false);
  }

  function markDraft(key: string, value: boolean) {
    setDrafts((previous) => ({ ...previous, [key]: value }));
  }

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    if (dirty) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (pane === "compose") document.querySelector<HTMLInputElement>('.journal-composer input[name="title"]')?.focus();
    else document.querySelector(".journal-detail-scroll")?.scrollTo({ top: 0 });
  }, [pane, selectedId]);

  useEffect(() => {
    if (!sourceTarget) return;
    const element = document.getElementById(eventAnchor(sourceTarget.eventId));
    if (element) {
      element.focus({ preventScroll: true });
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sourceTarget]);

  function mayLeave() {
    return !dirty || window.confirm("存在尚未保存的输入。继续会离开当前表单，请先复制需要保留的内容。是否继续？");
  }

  function commit(next: GrowthJournal, recovering = false): boolean {
    try {
      if (externalChange || loaded.revision === undefined) throw new Error("请先复制未保存内容并重新载入，当前档案不可写入。");
      if (!snapshot && !recovering) throw new Error("原档案不可读取，只能通过已确认的备份恢复。");
      if (journalChanged(window.localStorage, space, loaded.revision)) {
        setExternalChange(true);
        throw new Error("此空间已在其他窗口变化，请保留输入后重新载入。");
      }
      const saved = writeJournal(window.localStorage, space, next, loaded.revision);
      setLoaded({ snapshot: saved, revision: saved.revision, error: "" });
      setMessage("已保存到此浏览器。没有上传，也没有生成心理评分。");
      return true;
    } catch (error) {
      setLoaded((previous) => ({ ...previous, error: `未保存。${errorMessage(error)}` }));
      setMessage("");
      return false;
    }
  }

  function attempt(operation: () => boolean): boolean {
    try {
      return operation();
    } catch (error) {
      setLoaded((previous) => ({ ...previous, error: errorMessage(error) }));
      setMessage("");
      return false;
    }
  }

  function reload(nextSpace: string) {
    if (!mayLeave()) return;
    const next = load(nextSpace);
    setLoaded(next);
    setExternalChange(false);
    setRecoveryAcknowledged(false);
    setSpace(nextSpace);
    setSpaceInput(nextSpace);
    setDrafts({});
    setFormKey((key) => key + 1);
    setFilters({ keyword: "", topic: "", from: "", to: "" });
    setSourceTarget(null);
    setSelectedId(null);
    setPane("overview");
    setMobileIndex(false);
    setMessage(next.snapshot ? `已打开本地空间 ${nextSpace}。空间不是登录账号。` : "");
  }

  function saveEvent(event: unknown): boolean {
    if (!journal) return false;
    return attempt(() => {
      const next = validateJournal({ ...journal, events: [event, ...journal.events] });
      const saved = commit(next);
      if (saved) {
        markDraft("record", false);
        const savedEvent = next.events[0];
        setFilters({ keyword: "", topic: "", from: "", to: "" });
        selectEvent(savedEvent.id);
      }

      return saved;
    });
  }

  function saveUnderstanding(item: Understanding): boolean {
    if (!journal) return false;
    return attempt(() => {
      const saved = commit(validateJournal({ ...journal, understandings: [...(journal.understandings || []), item] }));
      if (saved) setMessage("阶段理解已保存到成长镜像。它是家庭整理的可修正假设，不是心理评估或孩子认可。");
      return saved;
    });
  }

  function addPerspective(eventId: string, kind: PerspectiveKind, fields: FormData): boolean {
    if (!journal) return false;
    return attempt(() => {
      const source = value(fields, "source");
      if (source !== "observed" && source !== "reported") throw new Error("请选择有效的视角来源。");
      const response = value(fields, "response");
      if (response && !Object.prototype.hasOwnProperty.call(CHILD_RESPONSES, response)) throw new Error("孩子参与选择无效。");
      const saved = commit(appendPerspective(journal, eventId, {
        id: crypto.randomUUID(), createdAt: new Date().toISOString(), kind,
        author: value(fields, "author"), content: response === "skip" ? "" : value(fields, "content"),
        source,
        ...(kind === "child" && response ? { response: response as ChildResponse } : {})
      }));
      if (saved) markDraft(`perspective:${eventId}`, false);
      return saved;
    });
  }

  async function restore(file: File) {
    setImporting(true);
    try {
      if (loaded.revision === undefined || externalChange) throw new Error("请先重新载入，以核对需要替换的原资料。");
      if (!snapshot && !recoveryAcknowledged) throw new Error("请先下载或自行保留原始资料，并确认允许替换损坏档案。");
      if (file.size > MAX_BACKUP_SIZE) throw new Error("备份文件不能超过5MB。");
      const restored = parseJournal(await file.text());
      if (!mayLeave()) return;
      if (!window.confirm(`用备份中的 ${restored.events.length} 条经历替换当前空间？不会合并。请先导出当前档案。`)) return;
      if (commit(restored, !snapshot)) {
        setRecoveryAcknowledged(false);
        setDrafts({});
        setFormKey((key) => key + 1);
        setFilters({ keyword: "", topic: "", from: "", to: "" });
        setSelectedId(null);
        setPane("overview");
        setMobileIndex(false);
        setMessage("备份已恢复到当前本地空间，未上传。");
      }
    } catch (error) {
      setLoaded((previous) => ({ ...previous, error: `恢复失败，原档案未被替换。${errorMessage(error)}` }));
      setMessage("");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className={`growth-mirror journal-shell ${!indexVisible ? "mirror-focused" : ""} ${mobileIndex ? "show-mobile-index" : ""}`}>
      <aside className="journal-sidebar" aria-label="成长镜像导航">
        <div className="journal-brand"><span className="journal-brand-mark"><JournalIcon name="book" size={23} /></span>
          <div><h1>成长镜像</h1><span>NEON BUDDY</span><small className="journal-brand-local">本地原型 · 未加密</small></div>
        </div>
        <button type="button" className="journal-new-button" disabled={!journal || importing} onClick={() => openPane("compose")}>
          <JournalIcon name="plus" size={18} /><span>记录一个时刻</span>{drafts.record && <span className="journal-draft-dot" title="有未保存的输入" />}
        </button>
        <nav className="journal-nav" aria-label="工作空间导航">
          <button type="button" disabled={importing} aria-current={pane === "overview" ? "page" : undefined}
            className={pane === "overview" ? "active" : ""} onClick={() => openPane("overview")}><JournalIcon name="sun" /><span>成长镜像</span></button>
          <button type="button" disabled={importing} aria-current={pane === "understand" ? "page" : undefined}
            className={pane === "understand" ? "active" : ""} onClick={() => openPane("understand")}><JournalIcon name="review" /><span>理解工作室</span>{drafts.understanding && <span className="journal-draft-dot" />}</button>
          <button type="button" disabled={importing} aria-current={pane === "changes" ? "page" : undefined}
            className={pane === "changes" ? "active" : ""} onClick={() => openPane("changes")}><JournalIcon name="calendar" /><span>阶段对照</span></button>
          <button type="button" disabled={importing} aria-current={pane === "review" ? "page" : undefined}
            className={pane === "review" ? "active" : ""} onClick={() => openPane("review")}><JournalIcon name="book" /><span>原文检索与导出</span></button>
          <button type="button" disabled={importing} aria-current={pane === "settings" ? "page" : undefined}
            className={pane === "settings" ? "active" : ""} onClick={() => openPane("settings")}><JournalIcon name="settings" /><span>档案与数据</span></button>
        </nav>
        <div className="journal-sidebar-section">
          <p className="journal-section-label">理解的素材</p>
          <button type="button" disabled={importing} className={`journal-notebook-link ${pane === "evidence" || pane === "entry" ? "active" : ""}`}
            onClick={() => browse()} aria-current={pane === "evidence" || pane === "entry" ? "page" : undefined}>
            <span className="journal-book-dot" /><span>经历与依据</span><small>{externalChange ? "—" : journal?.events.length || 0}</small>
          </button>
          <p className="journal-space-caption">本地空间 · {space}</p>
        </div>
        <div className="journal-sidebar-bottom">
          <div className="journal-sidebar-note"><JournalIcon name="shield" size={18} /><div><strong>只在此浏览器保存</strong><p>本地原型 · 未加密<br />不是心理评估或儿童账号</p></div></div>
          <p className="journal-sidebar-motto">理解成长，不定义孩子。</p>
        </div>
      </aside>
      <JournalIndex key={`index-${space}-${formKey}`} events={events} calendarEvents={calendarEvents} total={externalChange ? 0 : journal?.events.length || 0}
        selectedId={pane === "entry" ? selectedId : null} filters={filters} onFilters={setFilters}
        onSelect={selectEvent} onNew={() => openPane("compose")} disabled={!journal || importing || externalChange}
        unavailable={externalChange || !journal} />
      <main className="journal-detail" aria-label="成长理解工作区">
        <header className="journal-detail-toolbar">
          <button type="button" className="journal-icon-button journal-mobile-back" aria-label="返回记录列表" onClick={() => setMobileIndex(true)}><JournalIcon name="back" /></button>
          <span>{title}</span>
          <div className="journal-toolbar-actions">
            <span className="journal-local-label"><span />仅此浏览器 · 未加密</span>
            <button type="button" className="journal-add-button" disabled={!journal || importing} aria-label="新增成长记录"
              title="新增成长记录" onClick={() => openPane("compose")}><JournalIcon name="plus" size={23} /></button>
          </div>
        </header>
        <div className="journal-detail-scroll">
          <div className="journal-feedback">
            {externalChange && <div role="alert" className="mirror-error mirror-external-change">
              <strong>此空间的资料已在其他窗口变化，当前旧记录及引用已停用。</strong>
              <p>未保存输入仍在；请先复制需要保留的内容，或主动放弃输入。重新载入后再继续保存与检索。</p>
              <button type="button" className="mirror-secondary" disabled={importing} onClick={() => reload(space)}>保留所需内容后重新载入</button>
            </div>}
            {loaded.error && <div role="alert" className="mirror-error">{loaded.error}</div>}
            {message && <div role="status" className="mirror-status">{message}<button type="button" className="journal-icon-button" aria-label="关闭操作提示" onClick={() => setMessage("")}><JournalIcon name="close" size={15} /></button></div>}
          </div>
          {!journal && pane !== "settings" && <section className="mirror-panel"><h2>原始档案未被覆盖</h2><p>读取失败时已停止写入。请保留浏览器数据，可在“档案与数据”中重新载入或打开其他空间。</p>
            <button type="button" className="mirror-secondary" onClick={() => openPane("settings")}>打开档案与数据</button>
          </section>}
          {journal && <fieldset className="mirror-workspace" disabled={importing}>
            <legend className="mirror-sr-only">成长档案工作空间</legend>
            <div hidden={pane !== "overview" && pane !== "understand" && pane !== "changes"}>
              <GrowthUnderstanding key={`understanding-${space}-${formKey}`} journal={journal}
                mode={pane === "understand" || pane === "changes" ? pane : "overview"}
                unavailable={externalChange} dirty={Boolean(drafts.understanding)}
                onDirty={(value) => markDraft("understanding", value)} onMode={openPane}
                onRecord={() => openPane("compose")} onSource={(eventId) => {
                  setFilters({ keyword: "", topic: "", from: "", to: "" });
                  selectEvent(eventId); setSourceTarget({ eventId });
                }}
                onSave={saveUnderstanding}
                onDelete={(id) => {
                  if (window.confirm("删除这份阶段理解及其后续修订？原始经历不受影响，已导出的副本不会自动删除。")) {
                    attempt(() => commit(removeUnderstanding(journal, id)));
                  }
                }} />
            </div>
            {pane === "evidence" && <section className="mirror-panel"><span className="mirror-eyebrow">理解的素材，而非产品的终点</span><h2>每份理解，都能回到真实经历</h2>
              <p>从列表选择一段经历，查看原话、情境和不同视角。记录是成长镜像的依据，不要求每天写日记。</p>
              <button type="button" className="mirror-primary" onClick={() => openPane("understand")}>回到理解工作室</button></section>}
            <div className="journal-composer" hidden={pane !== "compose"}>
              <EventForm key={`${space}-${formKey}`} onSave={saveEvent} onDirty={() => markDraft("record", true)}
                onDiscard={() => markDraft("record", false)} dirty={Boolean(drafts.record)} blocked={externalChange} />
            </div>
            <div key={`events-${space}-${formKey}`} className="journal-entry-details" hidden={pane !== "entry"}>
              {allEvents.filter((event) => event.id === selectedId || drafts[`perspective:${event.id}`]).map((event) => <div key={event.id} hidden={event.id !== selectedId}><EventCard event={event}
                onDirty={() => markDraft(`perspective:${event.id}`, true)}
                onDiscard={() => markDraft(`perspective:${event.id}`, false)} dirty={Boolean(drafts[`perspective:${event.id}`])} blocked={externalChange}
                onAppend={(kind, fields) => addPerspective(event.id, kind, fields)}
                onDelete={() => {
                  if (window.confirm(`删除“${event.title}”及全部补充视角，以及引用它的阶段理解和后续修订？无法撤销；已导出的文件不受影响。`)) {
                    if (attempt(() => commit(removeEvent(journal, event.id)))) {
                      markDraft(`perspective:${event.id}`, false);
                      setSelectedId(null);
                      setPane("overview");
                    }
                  }
                }} /></div>)}
              {!selectedEvent && <section className="mirror-panel"><h2>选择一段经历</h2><p>从记录列表打开一个时刻。</p></section>}
            </div>
            <div hidden={pane !== "review"}>
              <GrowthReview key={`review-${space}-${formKey}`} journal={journal} unavailable={externalChange}
                onSource={(eventId) => {
                  setFilters({ keyword: "", topic: "", from: "", to: "" });
                  selectEvent(eventId);
                  setSourceTarget({ eventId });
                }}
                onExport={(content, filename) => {
                  attempt(() => {
                    download(content, filename, "text/markdown");
                    setMessage("已发起回顾下载。文件为明文，删除原记录不会自动删除已下载文件。");
                    return true;
                  });
                }} />
            </div>
          </fieldset>}
          <div hidden={pane !== "settings"} className="journal-settings">
            <section className="mirror-panel mirror-space">
              <span className="mirror-eyebrow">档案与数据</span><h2>管理成长镜像的资料</h2>
              <p>数据由你保管。空间仅用于此浏览器内分组，不是登录或访问权限。</p>
              <form onSubmit={(event) => {
                event.preventDefault();
                attempt(() => { reload(spaceId(spaceInput)); return true; });
              }}>
                <label>本地空间ID<input value={spaceInput} maxLength={24} disabled={importing} onChange={(event) => setSpaceInput(event.target.value)} required /></label>
                <button type="submit" className="mirror-secondary" disabled={importing}>打开空间</button>
                <button type="button" className="mirror-secondary" disabled={importing} onClick={() => reload(space)}>重新载入</button>
              </form>
              <p className="mirror-meta">当前空间：{space}</p>
              {draftCount > 0 && <p className="mirror-draft-status">还有 {draftCount} 处未保存输入。请返回相应表单保存、复制或主动放弃；刷新不会保留草稿。</p>}
              {externalChange && <div className="mirror-actions">
                {drafts.record && <button type="button" className="mirror-secondary" onClick={() => openPane("compose")}>打开未保存的记录输入</button>}
                {drafts.understanding && <button type="button" className="mirror-secondary" onClick={() => openPane("understand")}>打开未保存的理解草稿</button>}
                {allEvents.filter((event) => drafts[`perspective:${event.id}`]).map((event, index) => <button
                  type="button" key={event.id} className="mirror-secondary" onClick={() => selectEvent(event.id)}>打开未保存的补充 {index + 1}</button>)}
              </div>}
            </section>
            {journal && <fieldset className="mirror-workspace" disabled={importing}>
              <legend className="mirror-sr-only">档案设置与备份</legend>
              <section className="mirror-panel">
                <h3>镜像中的称呼</h3>
                <form key={`name-${space}-${formKey}`} className="mirror-name-form" onChange={() => markDraft("name", true)}
                  onReset={(event) => {
                    if (drafts.name && !window.confirm("放弃未保存的昵称修改？")) { event.preventDefault(); return; }
                    markDraft("name", false);
                  }} onSubmit={(event) => {
                  event.preventDefault();
                  const nickname = value(new FormData(event.currentTarget), "childName");
                  if (attempt(() => commit({ ...journal, childName: nickname }))) {
                    markDraft("name", false);
                    const input = event.currentTarget.querySelector<HTMLInputElement>('[name="childName"]');
                    if (input) { input.defaultValue = nickname; input.value = nickname; }
                  }
                }}>
                  <label>档案昵称（可留空）<input name="childName" defaultValue={journal.childName} maxLength={60} placeholder="不必使用真实姓名" /></label>
                  <button type="submit" className="mirror-secondary" disabled={externalChange}>保存昵称</button>
                  <button type="reset" className="mirror-secondary" disabled={!drafts.name}>放弃昵称修改</button>
                </form>
              </section>
              <section className="mirror-panel journal-danger-zone">
                <h3>选择遗忘</h3><p>清空仅作用于此浏览器当前空间，无法撤销。已下载的备份或回顾文件需要自行删除。</p>
                <button type="button" className="mirror-danger" disabled={externalChange} onClick={() => {
                  if (!snapshot || !mayLeave() || !window.confirm(`清空空间 ${space} 的昵称、全部经历、视角和阶段理解？此操作无法撤销。`)) return;
                  attempt(() => {
                    const cleared = clearJournal(window.localStorage, space, snapshot.revision);
                    setLoaded({ snapshot: cleared, revision: cleared.revision, error: "" }); setDrafts({}); setFormKey((key) => key + 1);
                    setSelectedId(null); setPane("overview"); setMobileIndex(false);
                    setFilters({ keyword: "", topic: "", from: "", to: "" });
                    setMessage("已清空此浏览器当前空间。已下载的备份仍需自行删除。"); return true;
                  });
                }}>清空当前空间</button>
              </section>
            </fieldset>}
            <section className="mirror-panel journal-backups">
              <h3>备份与恢复</h3>
              <p>完整档案为可恢复的明文JSON（最多5MB），包含当前空间全部经历、视角、阶段理解及修订。请自行确认下载文件已保存；应用无法替你验证下载。</p>
              <p className="mirror-meta">请始终使用相同地址打开应用：主机名或端口变化会进入另一份浏览器存储，不代表原资料被删除。迁移地址前先导出，之后再恢复。</p>
              <div className="mirror-actions">
                <button type="button" className="mirror-secondary" disabled={!journal || importing || externalChange} onClick={() => attempt(() => {
                  if (!journal) throw new Error("档案不可读取，请使用原始副本下载。");
                  download(serializeBackup(journal), `growth-mirror-${space}-${localDate()}.json`);
                  setMessage("已发起明文JSON下载，请自行确认文件保存成功。"); return true;
                })}>导出完整档案</button>
                <button type="button" className="mirror-secondary" disabled={loaded.revision == null || importing || externalChange} onClick={() => attempt(() => {
                  if (typeof loaded.revision !== "string") throw new Error("没有可下载的原始资料。");
                  download(loaded.revision, `growth-mirror-${space}-original-${localDate()}.txt`, "text/plain");
                  setMessage("已发起原始文本副本下载，请自行确认保存。文件可能损坏，不能视为已校验的JSON备份。"); return true;
                })}>下载原始资料副本</button>
              </div>
              {!snapshot && loaded.revision !== undefined && <div className="mirror-recovery">
                <p>原档案损坏或版本不受支持。先下载原始文本副本，也可在其他空间恢复备份，避免替换这里的原资料。</p>
                <label className="mirror-checkbox-label"><input type="checkbox" checked={recoveryAcknowledged}
                  disabled={importing || externalChange} onChange={(event) => setRecoveryAcknowledged(event.target.checked)} />
                  <span>我已自行保留原始资料，并确认允许用备份替换当前不可读取的档案。</span></label>
              </div>}
              <label className="mirror-file">从JSON备份恢复<input type="file" accept=".json,application/json"
                disabled={importing || externalChange || loaded.revision === undefined || !snapshot && !recoveryAcknowledged}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void restore(file);
                }} /></label>
              {importing && <p role="status">正在校验并恢复备份，请等待完成。</p>}
              {loaded.revision === undefined && <p role="alert" className="mirror-error">无法访问浏览器存储，不能安全下载原始资料或恢复。请检查浏览器权限后重新载入。</p>}
            </section>
            <section className="mirror-notice" aria-label="隐私与使用边界">
              <strong>本地原型 · 不是心理评估</strong>
              <p>不接入AI或云端，记录未加密，同设备使用者可能访问。请少填敏感信息，定期导出；清除浏览器数据可能丢失档案。</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
