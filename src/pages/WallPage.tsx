import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { QaRecord } from "../qa/types.ts";
import { CATEGORIES, ageRange, categoryById, monthsText, type CategoryId } from "../qa/vocab.ts";
import { RECORDS } from "../records/index.ts";
import { Icon } from "./Icon.tsx";
import { COMPACT, buildGroups, byAge, groupOf, layoutLine, sizeFor, visibleSlots, type Group, type Slot } from "./timeline.ts";
import { wallMemory } from "./wallMemory.ts";

/** 鼠标按住挪过这么多像素才算拖绳子，不算点 */
const DRAG = 5;

const slotKey = (s: Slot) => (s.kind === "record" ? `r:${s.record.id}` : `g:${s.group.key}`);
const firstOf = (records: readonly QaRecord[]) => [...records].sort(byAge)[0];

export function WallPage() {
  const [category, setCategory] = useState<CategoryId | null>(() => wallMemory.category ?? null);
  const records = useMemo(() => (category ? RECORDS.filter((r) => r.category === category) : RECORDS), [category]);
  const groups = useMemo(() => buildGroups(records), [records]);

  const scroller = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // 少给两个像素，免得小数取整后多出一截能滑的地方
    const ro = new ResizeObserver(() => setRoom(Math.max(0, el.clientWidth - 2)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const size = sizeFor(room);

  // 一进来展开最小的那个年纪；看完问答回来，绳子还是刚才的样子
  const [open, setOpen] = useState<string | null>(() => {
    if (wallMemory.open !== undefined) return wallMemory.open;
    const first = firstOf(records);
    return first ? groupOf(groups, first.id)?.key ?? null : null;
  });
  const [picked, setPicked] = useState<string | null>(() => {
    if (wallMemory.picked) return wallMemory.picked;
    const first = firstOf(records);
    return first ? `r:${first.id}` : null;
  });
  const [peek, setPeek] = useState<string | null>(null);

  const { items, width } = useMemo(() => layoutLine(visibleSlots(groups, open), room, size), [groups, open, room, size]);
  const keys = items.map((it) => slotKey(it.slot));
  const fallback = open ? `g:${open}` : keys[keys.length - 1];
  const chosen = picked && keys.includes(picked) ? picked : fallback ?? null;
  const shown = peek && keys.includes(peek) ? peek : chosen;
  const shownGroup = shown?.startsWith("g:") ? groups.find((g) => g.key === shown.slice(2)) : undefined;
  const shownRecord = shown?.startsWith("r:") ? records.find((r) => r.id === shown.slice(2)) : undefined;

  useEffect(() => {
    wallMemory.open = open;
    wallMemory.picked = chosen ?? undefined;
    wallMemory.category = category;
  }, [open, chosen, category]);

  const pickCategory = (next: CategoryId | null) => {
    const list = next ? RECORDS.filter((r) => r.category === next) : RECORDS;
    const first = firstOf(list);
    setCategory(next);
    setOpen(first ? groupOf(buildGroups(list), first.id)?.key ?? null : null);
    setPicked(first ? `r:${first.id}` : null);
  };

  // 跟着刚打开的那个年纪走：旗子放得下就露出来；选中的那一件也要整个露出来
  const moved = useRef(false);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !room) return;
    const flag = items.find((it) => it.slot.kind === "flag");
    let left = flag ? flag.x - size.flagW / 2 - size.gap : 0;
    const sel = items.find((it) => slotKey(it.slot) === chosen);
    if (sel) left = Math.max(left, sel.x + size.tagW / 2 + size.gap - el.clientWidth);
    el.scrollTo({ left: Math.max(0, left), behavior: moved.current ? "smooth" : "auto" });
    moved.current = true;
  }, [open, category, width, room]);

  const toggle = (g: Group) => {
    setOpen(open === g.key ? null : g.key);
    setPicked(`g:${g.key}`);
  };

  const [edges, setEdges] = useState({ left: false, right: false });
  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (el) setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 });
  }, []);
  useEffect(updateEdges, [items, room, updateEdges]);

  // 没有滚动条：电脑上按住拖、或者滚轮，都能让绳子左右走；手机上手指直接滑
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let drag: { x: number; left: number; moved: boolean } | null = null;
    let draggedAt = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button === 0) drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > DRAG) {
        drag.moved = true;
        el.classList.add("dragging");
      }
      if (drag.moved) el.scrollLeft = drag.left - dx;
    };
    const up = () => {
      pressing.current = false;
      if (drag?.moved) draggedAt = Date.now();
      drag = null;
      el.classList.remove("dragging");
    };
    // 拖完松手时浏览器会补一个点击，别让它打开、收起或者选中
    const click = (e: MouseEvent) => {
      if (Date.now() - draggedAt < 80) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      // 滚到头了就让页面接着上下滚
      if (max <= 0 || (e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("wheel", wheel);
    };
  }, []);

  // 鼠标一按下按钮就拿到焦点；按着拖绳子时别因为这个把起点那张选中
  const pressing = useRef(false);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = keys[keys.indexOf(chosen ?? "") + (e.key === "ArrowLeft" ? -1 : 1)];
    if (!next) return;
    e.preventDefault();
    setPicked(next);
    setPeek(null);
    document.getElementById(`slot-${next}`)?.focus();
  };

  const slotProps = (key: string) => ({
    id: `slot-${key}`,
    role: "option",
    "aria-selected": key === chosen,
    tabIndex: key === chosen ? 0 : -1,
    onMouseEnter: () => setPeek(key),
    onPointerDown: () => { pressing.current = true; },
    onFocus: () => { if (!pressing.current) setPicked(key); },
  });

  const rope = `M ${size.pad / 2},${size.top} Q ${width / 2},${size.top + size.sag * 2} ${width - size.pad / 2},${size.top}`;
  const lineRef = useRef<HTMLElement>(null);

  return (
    <div className="app">
      <header className="hero">
        <h1>小念认识自己</h1>
        <p>我为什么会这样？小念问，爸爸答，一起看看心理学家发现了什么。</p>
      </header>

      <nav className="cats" aria-label="按心理分类看">
        <button type="button" className={category ? "cat" : "cat on"} aria-pressed={!category} onClick={() => pickCategory(null)}>
          全部 <b>{RECORDS.length}</b>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={category === c.id ? "cat on" : "cat"} aria-pressed={category === c.id}
            style={{ ["--cat" as string]: c.color }} onClick={() => pickCategory(category === c.id ? null : c.id)}>
            <span aria-hidden="true">{c.emoji}</span> {c.name} <b>{RECORDS.filter((r) => r.category === c.id).length}</b>
          </button>
        ))}
      </nav>

      <section ref={lineRef} className={`line${size === COMPACT ? " compact" : ""}${edges.left ? " more-left" : ""}${edges.right ? " more-right" : ""}`} aria-label="按常在几岁冒出来挂的事">
        <div className="line-scroll" ref={scroller} onScroll={updateEdges}>
          <div className="line-track" style={{ width, height: size.rowH }} onMouseLeave={() => setPeek(null)}>
            <svg className="rope" width={width} height={size.top + size.sag + 20} aria-hidden="true">
              <path d={rope} />
            </svg>
            <span className="pole" style={{ left: size.pad / 2 - 9, height: size.rowH - 24 }} aria-hidden="true" />
            <span className="pole" style={{ left: width - size.pad / 2 - 9, height: size.rowH - 24 }} aria-hidden="true" />
            <div role="listbox" aria-label="按常在几岁冒出来挂的事" aria-orientation="horizontal" onKeyDown={onKey}>
              {items.map(({ slot, x, y, tilt, color }) => {
                const key = slotKey(slot);
                const on = key === shown;
                const top = size.top + y;
                if (slot.kind === "flag") {
                  const g = slot.group;
                  return (
                    <button key={key} {...slotProps(key)} className={`banner${on ? " on" : ""}`} aria-expanded="true"
                      aria-label={`${g.name}，${g.records.length} 件事，点一下收起`}
                      style={{ left: x - size.flagW / 2, top: top - 4, width: size.flagW }} onClick={() => toggle(g)}>
                      <span className="banner-cloth">
                        <span className="banner-name">{g.name}</span>
                        <span className="banner-count">{g.records.length} 件</span>
                        <span className="banner-fold">‹ 收起</span>
                      </span>
                    </button>
                  );
                }
                if (slot.kind === "bundle") {
                  const g = slot.group;
                  return (
                    <button key={key} {...slotProps(key)} className={`tag bundle${on ? " on" : ""}`} aria-expanded="false"
                      aria-label={`${g.name}，${g.records.length} 件事，点开`}
                      style={{ left: x - size.bundleW / 2, top: top - 10, width: size.bundleW }} onClick={() => toggle(g)}>
                      <span className="peg" aria-hidden="true" />
                      <span className="card" style={{ background: color, ["--tilt" as string]: `${tilt}deg` }}>
                        <span className="bundle-name">{g.name}</span>
                        <span className="stack" aria-hidden="true">
                          {g.records.slice(0, 4).map((r) => <Icon key={r.id} record={r} className="mini" />)}
                        </span>
                        <span className="bundle-count">{g.records.length} 件 · 点开</span>
                      </span>
                    </button>
                  );
                }
                const r = slot.record;
                const cat = categoryById(r.category);
                return (
                  <button key={key} {...slotProps(key)} className={on ? "tag on" : "tag"}
                    style={{ left: x - size.tagW / 2, top: top - 10, width: size.tagW }}
                    onClick={() => setPicked(key)} onDoubleClick={() => { location.hash = `#/q/${r.id}`; }}>
                    <span className="peg" aria-hidden="true" />
                    <span className="card" style={{ background: color, ["--tilt" as string]: `${tilt}deg` }}>
                      <Icon record={r} className="thumb" />
                      <span className="day">{r.age.from === 0 ? "刚出生" : monthsText(r.age.from)}起</span>
                      <span className="name"><span className="name-cat" aria-label={cat.name}>{cat.emoji}</span>{r.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className="line-hint">拖一拖绳子 · 点年龄牌子打开，点旗子收起 · 双击看小念和爸爸怎么聊</p>
      </section>

      {shownGroup ? (
        <GroupPreview group={shownGroup} isOpen={open === shownGroup.key} onToggle={() => toggle(shownGroup)} />
      ) : shownRecord ? <Preview record={shownRecord} /> : null}

      <section className="cat-board" aria-labelledby="cat-board-title">
        <h2 id="cat-board-title">按心里的事分一分</h2>
        <div className="cat-grid">
          {CATEGORIES.map((c) => {
            const list = RECORDS.filter((r) => r.category === c.id);
            return (
              <button key={c.id} type="button" className={category === c.id ? "cat-card on" : "cat-card"} style={{ ["--cat" as string]: c.color }}
                onClick={() => { pickCategory(c.id); lineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
                <span className="cat-card-head"><span aria-hidden="true">{c.emoji}</span>{c.name}<b>{list.length} 件</b></span>
                <span className="cat-card-hook">{c.kidHook}</span>
                <span className="cat-card-lens">{c.dadLens}</span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="about">
        爸爸讲的都是心理学家研究过的发现，每一条后面都附着出处。绳子上的年纪，是研究里说这件事常冒出来的时候；
        每个孩子早一点、晚一点都很常见，不是考试的分数线。
      </p>

      <section className="series">
        <p>同一个小念，还有</p>
        <div className="series-links">
          <a className="btn ghost" href="https://handsondad.github.io/storyverse/">📚 小念家的漫画书</a>
          <a className="btn ghost" href="https://handsondad.github.io/kids-gallery/">🖼️ 小念的画廊</a>
          <a className="btn ghost" href="https://handsondad.github.io/bodyverse/">🚀 身体奇遇记</a>
        </div>
      </section>
    </div>
  );
}

function GroupPreview({ group, isOpen, onToggle }: { group: Group; isOpen: boolean; onToggle: () => void }) {
  return (
    <article className="preview group-preview" key={group.key} aria-live="polite">
      <div className="mosaic" data-count={Math.min(group.records.length, 6)} aria-hidden="true">
        {group.records.slice(0, 6).map((r) => (
          <a key={r.id} href={`#/q/${r.id}`} tabIndex={-1}><Icon record={r} className="mini" /></a>
        ))}
      </div>
      <div className="preview-info">
        <p className="when">常在这个年纪冒出来</p>
        <h2>{group.name}</h2>
        <p>有 {group.records.length} 件事，小念想问问爸爸：</p>
        <div className="kids">
          {group.records.map((r) => (
            <a key={r.id} className="kid" href={`#/q/${r.id}`}><span aria-hidden="true">{categoryById(r.category).emoji}</span> {r.name}</a>
          ))}
        </div>
        <button type="button" className="btn" onClick={onToggle}>{isOpen ? "在绳子上收起" : "在绳子上打开"}</button>
      </div>
    </article>
  );
}

function Preview({ record }: { record: QaRecord }) {
  const cat = categoryById(record.category);
  return (
    <article className="preview" key={record.id} aria-live="polite">
      <a className="preview-photo" href={`#/q/${record.id}`} aria-label={`看问答：${record.title}`}>
        <Icon record={record} className="preview-pic" />
      </a>
      <div className="preview-info">
        <p className="when">
          <span className="chip">常见 {ageRange(record.age)}</span>
          <span className="chip cat-chip" style={{ ["--cat" as string]: cat.color }}>{cat.emoji} {cat.name}</span>
        </p>
        <h2>{record.title}</h2>
        <p>{record.trigger}</p>
        <a className="btn" href={`#/q/${record.id}`}>听小念问爸爸 →</a>
      </div>
    </article>
  );
}
