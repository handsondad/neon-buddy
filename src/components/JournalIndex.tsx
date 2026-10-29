import { useEffect, useMemo, useRef, useState } from "react";
import { TOPICS, localDate, type EventFilters, type GrowthEvent } from "../lib/growth";
import { groupJournalMonths, monthDays, monthLabel, shiftMonth } from "../lib/journalView";
import { JournalIcon } from "./JournalIcon";

export function JournalIndex({ events, calendarEvents, total, selectedId, filters, onFilters, onSelect, onNew, disabled, unavailable }: {
  events: GrowthEvent[];
  calendarEvents: GrowthEvent[];
  total: number;
  selectedId: string | null;
  filters: EventFilters;
  onFilters: (filters: EventFilters) => void;
  onSelect: (eventId: string) => void;
  onNew: () => void;
  disabled: boolean;
  unavailable: boolean;
}) {
  const [mode, setMode] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const [advanced, setAdvanced] = useState(false);
  const [page, setPage] = useState(0);
  const body = useRef<HTMLFieldSetElement>(null);
  const pageCount = Math.max(1, Math.ceil(events.length / 50));
  const activePage = Math.min(page, pageCount - 1);
  const groups = useMemo(() => groupJournalMonths(events.slice(activePage * 50, (activePage + 1) * 50)), [events, activePage]);
  const dates = useMemo(() => monthDays(month), [month]);
  const counts = useMemo(() => {
    const count = new Map<string, number>();
    for (const event of calendarEvents) count.set(event.occurredOn, (count.get(event.occurredOn) || 0) + 1);
    return count;
  }, [calendarEvents]);
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const unsupportedDate = [filters.from, filters.to].some((date) => date && !/^\d{4}-\d{2}-\d{2}$/.test(date));
  const hasFilters = Boolean(filters.keyword || filters.topic || filters.from || filters.to);
  const rangeLabel = filters.from === filters.to && filters.from
    ? filters.from : `${filters.from || "最早"} — ${filters.to || "最新"}`;

  useEffect(() => {
    const date = filters.from || filters.to || localDate();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) setMonth(date.slice(0, 7));
  }, [filters.from, filters.to]);

  useEffect(() => { setPage(0); }, [filters.keyword, filters.topic, filters.from, filters.to]);
  useEffect(() => {
    const index = events.findIndex((event) => event.id === selectedId);
    if (index >= 0) setPage(Math.floor(index / 50));
  }, [selectedId, events]);
  useEffect(() => { body.current?.scrollTo({ top: 0 }); }, [activePage]);

  function moveMonth(delta: number) {
    const next = shiftMonth(month, delta);
    setMonth(next);
    const days = monthDays(next).filter((day): day is string => day !== null);
    onFilters({ ...filters, from: days[0], to: days[days.length - 1] });
  }

  return (
    <section className="journal-index" aria-labelledby="timeline-heading">
      <header className="journal-index-toolbar">
        <h2 id="timeline-heading" className="mirror-sr-only">回忆长廊</h2>
        <JournalIcon name="book" size={23} />
        <div className="journal-view-switch" role="group" aria-label="浏览方式">
          <button type="button" disabled={disabled} className={mode === "list" ? "active" : ""} aria-pressed={mode === "list"}
            aria-label="列表视图" title="列表视图" onClick={() => setMode("list")}><JournalIcon name="list" /></button>
          <button type="button" disabled={disabled} className={mode === "calendar" ? "active" : ""} aria-pressed={mode === "calendar"}
            aria-label="日历视图" title="日历视图" onClick={() => setMode("calendar")}><JournalIcon name="calendar" /></button>
        </div>
        <button type="button" disabled={disabled} className="journal-icon-button" aria-label="展开日期与主题筛选" aria-expanded={advanced}
          title="日期与主题筛选" onClick={() => setAdvanced(!advanced)}><JournalIcon name="settings" /></button>
      </header>
      <fieldset ref={body} disabled={disabled} className="journal-index-body">
        <legend className="mirror-sr-only">记录检索与选择</legend>
        <div className="journal-search">
          <JournalIcon name="search" size={17} />
          <input type="search" aria-label="搜索经历与视角" placeholder="搜索经历、原话或视角"
            value={filters.keyword} onChange={(e) => onFilters({ ...filters, keyword: e.target.value })} />
        </div>
        <div className="journal-advanced" hidden={!advanced}>
          <label>筛选主题<select value={filters.topic} onChange={(e) => {
            const topic = e.target.value;
            if (topic === "" || Object.prototype.hasOwnProperty.call(TOPICS, topic)) onFilters({ ...filters, topic: topic as EventFilters["topic"] });
          }}><option value="">全部主题</option>{Object.entries(TOPICS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <div className="mirror-form-grid">
            <label>开始日期<input type="date" min="0001-01-01" max="9999-12-31" value={filters.from} onChange={(e) => onFilters({ ...filters, from: e.target.value })} /></label>
            <label>结束日期<input type="date" min="0001-01-01" max="9999-12-31" value={filters.to} onChange={(e) => onFilters({ ...filters, to: e.target.value })} /></label>
          </div>
        </div>
        {mode === "calendar" && <div className="journal-calendar" aria-label="按发生日期浏览">
          <div className="journal-calendar-heading">
            <button type="button" className="journal-icon-button" aria-label="上个月" disabled={month === "0001-01"} onClick={() => moveMonth(-1)}><JournalIcon name="left" size={17} /></button>
            <label><span className="mirror-sr-only">浏览月份</span><input type="month" value={month} min="0001-01" max="9999-12" onChange={(e) => {
              const next = e.target.value;
              if (/^\d{4}-(0[1-9]|1[0-2])$/.test(next) && next >= "0001-01") {
                setMonth(next);
                const days = monthDays(next).filter((day): day is string => day !== null);
                onFilters({ ...filters, from: days[0], to: days[days.length - 1] });
              }
            }} /></label>
            <button type="button" className="journal-icon-button" aria-label="下个月" disabled={month === "9999-12"} onClick={() => moveMonth(1)}><JournalIcon name="right" size={17} /></button>
          </div>
          <div className="journal-calendar-grid">
            {["一", "二", "三", "四", "五", "六", "日"].map((day) => <span className="journal-weekday" key={day}>{day}</span>)}
            {dates.map((day, index) => day
              ? <button type="button" key={day} aria-label={`${day}，${counts.get(day) || 0}段记录`}
                aria-pressed={filters.from === day && filters.to === day}
                className={`${day === localDate() ? "is-today" : ""} ${filters.from === day && filters.to === day ? "selected" : ""}`}
                onClick={() => onFilters({ ...filters, from: day, to: day })}>
                {Number(day.slice(8))}<span className={counts.has(day) ? "calendar-dot has-entries" : "calendar-dot"} />
              </button> : <span key={`empty-${index}`} />)}
          </div>
          <p className="mirror-meta">圆点表示有记录，不是行为频率。点击日期查看。</p>
        </div>}
        {unavailable && <p className="mirror-error">资料尚不可用或已在其他窗口变化，请在档案与数据中重新载入。旧列表已停用。</p>}
        <div className="journal-index-count" hidden={unavailable}>
          <span>{events.length} / {total} 段记录</span>
          {hasFilters && <button type="button" className="journal-text-button" onClick={() => onFilters({ keyword: "", topic: "", from: "", to: "" })}>重置筛选</button>}
        </div>
        {(filters.from || filters.to || filters.topic) && <p className="journal-active-filter">
          {filters.from || filters.to ? rangeLabel : "全部时间"}{filters.topic ? ` · ${TOPICS[filters.topic]}` : ""}
        </p>}
        {invalidRange && <p role="alert" className="mirror-error">开始日期不能晚于结束日期。</p>}
        {unsupportedDate && <p role="alert" className="mirror-error">筛选日期仅支持0001至9999年。</p>}
        {!unavailable && !events.length && !invalidRange && !unsupportedDate && <div className="journal-index-empty">
          <JournalIcon name={hasFilters ? "search" : "book"} size={30} />
          <h3>{total ? "没有匹配的经历" : "还没有成长记录"}</h3>
          <p>{total ? "试着调整关键词、日期或主题。" : "从一个开心的小瞬间开始，普通日常也值得被记住。"}</p>
          {!total && <button type="button" className="journal-text-button" onClick={onNew}>写下第一段经历</button>}
        </div>}
        {groups.map((group) => <section key={group.key} className="journal-month-group" aria-label={monthLabel(group.key)}>
          <h3>{group.label}</h3>
          {group.events.map((event) => {
            const date = new Date(`${event.occurredOn}T12:00:00`);
            return <button type="button" key={event.id} className={`journal-entry-row ${event.id === selectedId ? "selected" : ""}`}
              aria-current={event.id === selectedId ? "true" : undefined} onClick={() => onSelect(event.id)}>
              <span className="journal-entry-date"><span>{date.toLocaleDateString("zh-CN", { weekday: "short" })}</span><strong>{Number(event.occurredOn.slice(8))}</strong></span>
              <span className="journal-entry-preview"><strong>{event.title}</strong><span>{event.observation}</span>
                <small>{TOPICS[event.topic]}{event.perspectives.length ? ` · ${event.perspectives.length} 个补充视角` : ""}</small>
              </span>
            </button>;
          })}
        </section>)}
        {pageCount > 1 && <nav className="journal-pagination" aria-label="记录列表分页">
          <button type="button" className="mirror-secondary" disabled={activePage === 0} onClick={() => setPage(activePage - 1)}>上一页</button>
          <span aria-live="polite">第 {activePage + 1} / {pageCount} 页 · 每页50段</span>
          <button type="button" className="mirror-secondary" disabled={activePage === pageCount - 1} onClick={() => setPage(activePage + 1)}>下一页</button>
        </nav>}
      </fieldset>
      <footer className="journal-index-footer">记录真实经历，而不是给成长打分。</footer>
    </section>
  );
}
