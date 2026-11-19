export type CategoryId = "me" | "feel" | "others" | "curious" | "control" | "talk";

export type Category = {
  readonly id: CategoryId;
  readonly emoji: string;
  readonly name: string;
  /** 小念眼里这一类是什么 */
  readonly kidHook: string;
  /** 大人眼里这一类在讲什么 */
  readonly dadLens: string;
  readonly color: string;
};

export const CATEGORIES: readonly Category[] = [
  {
    id: "me", emoji: "🪞", name: "认识我自己", color: "#ffb36b",
    kidHook: "镜子里的是我吗？为什么什么都想自己来？被大家看着为什么会害羞？",
    dadLens: "自我意识：认出自己、想自己做主、慢慢知道「我是什么样的」",
  },
  {
    id: "feel", emoji: "🌦️", name: "心情和脾气", color: "#7fb3ff",
    kidHook: "为什么会突然发脾气？为什么怕黑？哭的时候抱一抱为什么就好了？",
    dadLens: "情绪与调节：感受从哪来，又怎么在大人的帮助下平静下来",
  },
  {
    id: "others", emoji: "🤝", name: "我和别人", color: "#6fd39a",
    kidHook: "妈妈一走为什么就哭？为什么总想学大人？为什么不想分玩具？",
    dadLens: "关系与社会认知：依恋、模仿、分享，慢慢懂得别人心里想的和我不一样",
  },
  {
    id: "curious", emoji: "🔍", name: "好奇和想象", color: "#b48cff",
    kidHook: "为什么爱扔东西？为什么老问为什么？为什么记不得小时候的事？",
    dadLens: "认知与学习：像小科学家一样试、想、记，还会假装和想象",
  },
  {
    id: "control", emoji: "🚦", name: "管住自己", color: "#ff7a8a",
    kidHook: "等一会儿再吃糖为什么那么难？生气为什么想打人？动画为什么停不下来？",
    dadLens: "自我控制：等一等、停一停、换个做法，这个本领长得最慢",
  },
  {
    id: "talk", emoji: "💬", name: "说话和表达", color: "#ffc75a",
    kidHook: "不会说话时怎么让大人明白？玩的时候为什么自言自语？",
    dadLens: "语言与表达：从指一指、咿咿呀呀，到用话说出心里的事",
  },
];

export const categoryById = (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!;

/** 「8个月」「1岁」「1岁半」「2岁3个月」 */
export function monthsText(months: number): string {
  if (months < 12) return `${months}个月`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!rest) return `${years}岁`;
  return rest === 6 ? `${years}岁半` : `${years}岁${rest}个月`;
}

/** 「8个月–1岁半」「3岁起」「刚出生起」 */
export function ageRange(age: { from: number; to?: number }): string {
  const from = age.from === 0 ? "刚出生" : monthsText(age.from);
  return age.to === undefined ? `${from}起` : `${from}–${monthsText(age.to)}`;
}

/** 绳子上按「常在几岁冒出来」分组 */
export const AGE_BANDS: readonly { readonly key: string; readonly name: string; readonly below: number }[] = [
  { key: "under-1", name: "1岁前", below: 12 },
  { key: "age-1", name: "1岁多", below: 24 },
  { key: "age-2", name: "2岁多", below: 36 },
  { key: "age-3", name: "3岁多", below: 48 },
  { key: "age-4", name: "4、5岁", below: 72 },
  { key: "age-6", name: "6岁起", below: Infinity },
];

export const bandOf = (months: number) => AGE_BANDS.find((b) => months < b.below)!;
