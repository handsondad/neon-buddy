/**
 * 小念和爸爸的配音，由 `npm run voice` 生成到 public/voice/<记录id>/<轮次>-<nian|dad>.mp3。
 * 声音和《身体奇遇记》一样：小念 zh-CN-YunxiaNeural，爸爸 zh-CN-YunxiNeural（tools/voice/voices.mjs）。
 */
import manifest from "./voice-manifest.json";
import type { QaRecord } from "./types.ts";

export type Who = "nian" | "dad";
export type Line = { readonly turn: number; readonly who: Who };

const clips = (manifest as { clips: Record<string, { hash: string; seconds: number }> }).clips;

export const clipKey = (id: string, turn: number, who: Who) => `${id}/${turn}-${who}`;

/** 一条问答的每一句都配过音才能播；按顺序排好：小念、爸爸、小念、爸爸…… */
export function linesFor(record: QaRecord): Line[] | undefined {
  const lines = record.dialogue.flatMap((_, turn): Line[] => [{ turn, who: "nian" }, { turn, who: "dad" }]);
  return lines.every((l) => clips[clipKey(record.id, l.turn, l.who)]) ? lines : undefined;
}

export const clipUrl = (id: string, line: Line) => `voice/${clipKey(id, line.turn, line.who)}.mp3`;
