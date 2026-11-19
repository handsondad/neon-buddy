/**
 * 一条记录 = 一个心里的现象 + 小念问、爸爸答。
 * 小念从自己身上的一件事发问，爸爸回答；小念接着爸爸刚说的话追问，一问一答讲到心理学研究发现了什么，
 * 最后小念用自己的话总结。爸爸讲的每一件「科学家发现」，都要能在 sources 里找到出处。
 */
import type { CategoryId } from "./vocab.ts";

export type StepFrame = { readonly icon: string; readonly label: string };

/** 爸爸讲「一步一步」时配的小图解：2–4 格，每格一个 emoji 加 ≤10 个字 */
export type Show = { readonly kind: "steps"; readonly frames: readonly StepFrame[] };

export type Turn = {
  /** 小念：第一句说那件事，之后每句接着爸爸上一句里的词追问；最后一句以「我懂了」「我明白了」开头总结 */
  readonly nian: string;
  /** 爸爸：20–170 个字，第一句先回答 */
  readonly dad: string;
  readonly show?: Show;
};

/** 爸爸参考的研究：只写能公开查到、自己打开看过的 */
export type Source = {
  /** 「Mischel 等（1989）」「美国儿科学会」 */
  readonly who: string;
  /** 论文或页面的原标题 */
  readonly title: string;
  readonly url: string;
  /** 用大白话说研究发现了什么，≤80 字 */
  readonly says: string;
  /** 它不能说明什么，≤60 字 */
  readonly limit: string;
};

export type QaRecord = {
  /** 小写字母和短横线，也是配音目录名 */
  readonly id: string;
  /** 绳子上的短名，≤8 个字 */
  readonly name: string;
  /** 绳子上没有漫画图时的大图标 */
  readonly icon: string;
  /** 小念的问题，带「？」，≤28 个字 */
  readonly title: string;
  /** 小念遇到的那件事，一句话，具体到场景，≤50 个字 */
  readonly trigger: string;
  readonly category: CategoryId;
  /** 这件事常在几个月大前后冒出来（研究里说的大致范围，每个孩子早晚不一样）；绳子按 from 分组 */
  readonly age: { readonly from: number; readonly to?: number };
  /** 5–8 轮 */
  readonly dialogue: readonly Turn[];
  /** 给大人：研究怎么看、家里可以怎么做、什么情况要找专业的人 */
  readonly parentTip: string;
  /** 1–4 条 */
  readonly sources: readonly Source[];
  /** 《小念家的漫画书》里真有过的同一类事：故事 id；图在 public/comics/<id>/，npm run comics 生成 */
  readonly story?: string;
};
