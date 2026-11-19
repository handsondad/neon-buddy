/**
 * 首页绳子展开到哪一岁、选中的是哪一件、按哪一类在看。放在模块里，看完问答回来还在；
 * 刷新页面才清空，回到默认（全部，展开最近的一件）。
 */
import type { CategoryId } from "../qa/vocab.ts";

export const wallMemory: { open?: string | null; picked?: string; category?: CategoryId | null } = {};
