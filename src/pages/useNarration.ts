import { useCallback, useEffect, useRef, useState } from "react";
import type { QaRecord } from "../qa/types.ts";
import { clipUrl, linesFor, type Line } from "../qa/voice.ts";

/** 一句读完，停这么久再读下一句，像两个人在聊天 */
const GAP = 350;

/**
 * 从某一句开始，按顺序把小念和爸爸的配音读下去；同一时间只有一句在响。
 * 换一条问答、离开页面、切到后台，都会停下。
 */
export function useNarration(record: QaRecord) {
  const lines = linesFor(record);
  // 记下是哪一条在读：换到下一条时，停下之前那一下不会把上一条的句子标到新页面上
  const [playing, setNow] = useState<{ id: string; line: Line } | null>(null);
  const now = playing?.id === record.id ? playing.line : null;
  const audio = useRef<HTMLAudioElement | null>(null);
  const ahead = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number>();
  const run = useRef(0);

  const stop = useCallback(() => {
    run.current += 1;
    window.clearTimeout(timer.current);
    audio.current?.pause();
    setNow(null);
  }, []);

  const play = useCallback((from = 0) => {
    if (!lines) return;
    stop();
    const id = run.current;
    const player = (audio.current ??= Object.assign(new Audio(), { preload: "auto" }));
    const say = (i: number) => {
      if (id !== run.current) return;
      const line = lines[i];
      if (!line) { setNow(null); return; }
      setNow({ id: record.id, line });
      player.src = clipUrl(record.id, line);
      // 先把下一句拿下来，两句之间不用再等网络
      const after = lines[i + 1];
      if (after) (ahead.current ??= Object.assign(new Audio(), { preload: "auto" })).src = clipUrl(record.id, after);
      player.onended = () => { timer.current = window.setTimeout(() => say(i + 1), GAP); };
      player.onerror = () => { if (id === run.current) setNow(null); };
      player.play().catch(() => { if (id === run.current) setNow(null); });
    };
    say(Math.max(0, from));
  }, [lines, record.id, stop]);

  useEffect(() => stop, [record.id, stop]);
  useEffect(() => {
    const onHidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [stop]);

  /** 第几轮的谁在第几句（从 0 数），给「从这句开始听」用 */
  const indexOf = (turn: number, who: Line["who"]) => turn * 2 + (who === "dad" ? 1 : 0);

  return { voiced: !!lines, now, play, stop, indexOf };
}
