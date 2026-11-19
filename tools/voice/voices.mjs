// 小念和爸爸的配音设置，和《身体奇遇记》一样。改了这里或改了问答文字，都要重新跑 `npm run voice`。
import { createHash } from "node:crypto";

export const voices = {
  nian: { voice: "zh-CN-YunxiaNeural", rate: "+0%" },
  dad: { voice: "zh-CN-YunxiNeural", rate: "-5%" },
};

/** 同一个声音读同一句话，指纹就不变；文字或声音一改，旧音频就算过期 */
export function clipHash(who, text) {
  const { voice, rate } = voices[who];
  return createHash("sha1").update(`${voice}|${rate}|${text}`).digest("hex").slice(0, 12);
}

export const clipKey = (record, turn, who) => `${record}/${turn}-${who}`;
