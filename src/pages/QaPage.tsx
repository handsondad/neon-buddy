import { useEffect, useRef, type CSSProperties, type ReactNode, type TouchEvent } from "react";
import type { QaRecord, Show } from "../qa/types.ts";
import { ageRange, categoryById } from "../qa/vocab.ts";
import type { Who } from "../qa/voice.ts";
import { RECORDS, STORY_TITLES, storyUrl, thumbUrl } from "../records/index.ts";
import { Icon } from "./Icon.tsx";
import { buildGroups, byAge, groupOf, neighbors } from "./timeline.ts";
import { useNarration } from "./useNarration.ts";
import { wallMemory } from "./wallMemory.ts";

/** 手指横着划过这么远才算翻页，免得上下滚动时误翻 */
const SWIPE = 60;

const NAMES: Record<Who, string> = { nian: "小念", dad: "爸爸" };

type BubbleProps = { who: Who; face: string; index: number; speaking: boolean; onListen?: () => void; children: ReactNode };

function Bubble({ who, face, index, speaking, onListen, children }: BubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (speaking) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [speaking]);
  return (
    <div ref={ref} className={`qa-line is-${who}${speaking ? " speaking" : ""}`} style={{ "--i": index } as CSSProperties}>
      <img className="qa-avatar" src={`avatars/${who}-${face}.webp`} alt="" />
      <div className="qa-bubble">
        <span className="qa-name">
          {NAMES[who]}
          {onListen && (
            <button type="button" className="qa-listen" onClick={onListen} aria-label={`从${NAMES[who]}这句开始听`}>
              {speaking ? "🔊" : "▶"}
            </button>
          )}
        </span>
        {children}
      </div>
    </div>
  );
}

function ShowBox({ show }: { show: Show }) {
  return (
    <ol className="qa-steps" aria-label="图解">
      {show.frames.map((frame) => (
        <li key={frame.label}>
          <span aria-hidden="true">{frame.icon}</span>
          <small>{frame.label}</small>
        </li>
      ))}
    </ol>
  );
}

export function QaPage({ record }: { record: QaRecord }) {
  const { prev, next, index, total } = neighbors(RECORDS, record.id);
  const prevHref = prev ? `#/q/${prev.id}` : null;
  const nextHref = next ? `#/q/${next.id}` : null;
  const touch = useRef<{ x: number; y: number } | null>(null);
  const cat = categoryById(record.category);
  const same = RECORDS.filter((r) => r.category === record.category && r.id !== record.id).sort(byAge);
  const last = record.dialogue.length - 1;
  const voice = useNarration(record);
  const playing = voice.now !== null;
  const speaking = (turn: number, who: Who) => voice.now?.turn === turn && voice.now.who === who;

  // 回首页时，绳子展开到这一件所在的那个年纪、选中它；分类筛选里没有它就回到全部
  useEffect(() => {
    if (wallMemory.category && wallMemory.category !== record.category) wallMemory.category = null;
    const list = wallMemory.category ? RECORDS.filter((r) => r.category === wallMemory.category) : RECORDS;
    wallMemory.open = groupOf(buildGroups(list), record.id)?.key ?? null;
    wallMemory.picked = `r:${record.id}`;
  }, [record.id, record.category]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowLeft" && prevHref) location.hash = prevHref;
      else if (e.key === "ArrowRight" && nextHref) location.hash = nextHref;
      else if (e.key === "Escape") location.hash = "#/";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref]);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touch.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const to = dx < 0 ? nextHref : prevHref;
    if (to) location.hash = to;
  };

  const listen = (turn: number, who: Who) => (voice.voiced ? () => voice.play(voice.indexOf(turn, who)) : undefined);

  return (
    <div className="app qa" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="topbar">
        <a className="btn ghost" href="#/">← 回到绳子</a>
        <span className="meta">{index} / {total}</span>
      </div>

      <header className="qa-head" key={record.id}>
        <Icon record={record} className="qa-icon" />
        <div className="qa-head-info">
          <p className="when">
            <span className="chip">常见 {ageRange(record.age)}</span>
            <a className="chip cat-chip" style={{ ["--cat" as string]: cat.color }} href="#/" onClick={() => { wallMemory.category = cat.id; }}>
              {cat.emoji} {cat.name}
            </a>
          </p>
          <h1>{record.title}</h1>
          <p className="trigger">{record.trigger}</p>
          {voice.voiced && (
            <button type="button" className={playing ? "btn ghost" : "btn"} onClick={() => (playing ? voice.stop() : voice.play())} aria-pressed={playing}>
              {playing ? "⏸ 先停一下" : "▶ 听小念和爸爸聊"}
            </button>
          )}
        </div>
      </header>

      <section className="qa-chat" aria-label="小念和爸爸的问答" key={`chat-${record.id}`}>
        {record.dialogue.map((turn, i) => (
          <div key={i} className="qa-turn">
            <Bubble who="nian" face={i === last ? "proud" : "thinking"} index={i * 2} speaking={speaking(i, "nian")} onListen={listen(i, "nian")}>
              <p>{turn.nian}</p>
            </Bubble>
            <Bubble who="dad" face="happy" index={i * 2 + 1} speaking={speaking(i, "dad")} onListen={listen(i, "dad")}>
              <p>{turn.dad}</p>
              {turn.show && <ShowBox show={turn.show} />}
            </Bubble>
          </div>
        ))}
      </section>

      {record.story && (
        <a className="qa-story" href={storyUrl(record.story)} target="_blank" rel="noreferrer">
          <img src={thumbUrl(record.story)} alt="" loading="lazy" />
          <span>
            <small>📚 小念家也有过这样一天</small>
            <b>《{STORY_TITLES[record.story]}》</b>
            <span>去漫画书里看看 →</span>
          </span>
        </a>
      )}

      <section className="parent" aria-labelledby="parent-title">
        <h2 id="parent-title">👨‍👩‍👦 给大人</h2>
        <p>{record.parentTip}</p>
        <h3>爸爸参考了什么</h3>
        <ul className="lenses">
          {record.sources.map((s) => (
            <li key={s.url}>
              <b>{s.says}</b>
              <span className="lens-who"><a href={s.url} target="_blank" rel="noreferrer">{s.who} · {s.title}</a></span>
              <span className="lens-limit">不能说明：{s.limit}</span>
            </li>
          ))}
        </ul>
      </section>

      {same.length > 0 && (
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title">{cat.emoji} {cat.name}，小念还想问</h2>
          <div className="kids">
            {same.map((r) => (
              <a key={r.id} className="kid" href={`#/q/${r.id}`}><span className="kid-age">{ageRange(r.age)}</span>{r.title}</a>
            ))}
          </div>
        </section>
      )}

      <nav className="pager" aria-label="按年龄换一件">
        {prevHref ? <a className="btn ghost" href={prevHref}>← 小一点时的事</a> : <button className="btn ghost" disabled>← 小一点时的事</button>}
        {nextHref ? <a className="btn" href={nextHref}>大一点时的事 →</a> : <a className="btn" href="#/">回到绳子</a>}
      </nav>
      <p className="hint">左右滑动或按 ← → 换一件，Esc 回到绳子</p>

      {playing && (
        <button type="button" className="qa-player" onClick={voice.stop}>
          ⏸ {NAMES[voice.now!.who]}在说 · 第 {voice.now!.turn + 1} 轮
        </button>
      )}
    </div>
  );
}
