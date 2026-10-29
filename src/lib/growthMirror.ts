import { filterEvents, type GrowthEvent, type GrowthJournal, type GrowthUnderstanding, type Topic } from "./growth.ts";

const RESPONSIVE = { title: "Harvard · 回应式互动（婴幼儿）", url: "https://developingchild.harvard.edu/key-concept/serve-and-return/" };
const MOTIVATION = { title: "自我决定理论 · 自主、胜任与联结", url: "https://selfdeterminationtheory.org/theory/" };
const PERSPECTIVES = { title: "多报告者评估综述（2015）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4486608/" };

export const LENSES: Record<Topic, {
  title: string; focus: string; principle: string; questions: string[];
  tryNext: string; source: { title: string; url: string };
}> = {
  emotion: {
    title: "情绪与安全感", focus: "什么情况下，他更能表达和恢复？",
    principle: "回应孩子发出的信号，比把一次哭泣解释成性格更有帮助。回应式互动研究主要面向婴幼儿，不能据此推断某个孩子的依恋类型。",
    questions: ["之前发生了什么？是否有疲倦、陌生或变化等尚未记录的背景？", "他发出了什么信号？大人怎样回应，之后发生了什么？", "有没有相似情境却表现不同的经历？孩子自己怎样解释？"],
    tryNext: "在合适的时候先听他如何描述当时的感受，不强迫命名情绪或回答。",
    source: RESPONSIVE
  },
  relationships: {
    title: "关系与联结", focus: "和谁在一起、在什么环境里，他更自在？",
    principle: "不同观察者的描述不一致，可能与场景和视角有关，不代表某一方不可信。不能用家庭里的表现替代对所有关系的判断。",
    questions: ["是在熟悉的人群还是新环境？他如何发起、加入或退出互动？", "家人、同伴与孩子自己的叙述有哪些差异？", "有没有自在相处的例子，而不只看冲突？"],
    tryNext: "给孩子选择加入或先观察的空间，了解他希望别人如何回应。",
    source: PERSPECTIVES
  },
  autonomy: {
    title: "自主与表达", focus: "他想自己决定什么，又希望获得什么帮助？",
    principle: "自我决定理论关注自主、胜任和联结的支持条件。自主不等于任其独自完成，也不能把拒绝直接解释为叛逆。",
    questions: ["当时有哪些真实可选的选项？孩子是否理解限制？", "他说的是不愿意、不会，还是想换一种方式？原话是什么？", "有选择或协助时，发生过哪些不同的经历？"],
    tryNext: "在安全边界内提供少量真实选择，并允许孩子请求帮助。",
    source: MOTIVATION
  },
  curiosity: {
    title: "兴趣与探索", focus: "什么吸引他主动靠近、提问和再次尝试？",
    principle: "兴趣和主动性与活动及支持环境有关。被记录的爱好不是天赋测评，也不能据此规划孩子的一生。",
    questions: ["是他自己发起，还是大人安排？具体吸引他的是什么？", "有没有隔一段时间主动回来继续的片段？", "他何时不想继续？是否有另一种兴趣或参与方式？"],
    tryNext: "跟随他当下的一个问题，留一点自由探索的时间，不急着检验成果。",
    source: MOTIVATION
  },
  persistence: {
    title: "挑战与支持", focus: "面对困难时，什么支持让他愿意继续或调整？",
    principle: "胜任感的支持是动机研究的一个视角。一次放弃或坚持都不等于稳定的意志品质，任务难度和可获得的帮助也需要被看见。",
    questions: ["任务对当时的他是否合适？他已经尝试了什么？", "成人给了提示、示范、等待还是代做？之后怎样？", "哪些困难他愿意再试，哪些他选择停下？"],
    tryNext: "询问他希望获得提示、一起做还是暂时休息；不以坚持时间给孩子打分。",
    source: MOTIVATION
  },
  everyday: {
    title: "日常与幸福时刻", focus: "哪些普通的相处，是他愿意留住的？",
    principle: "关系中的回应与联结值得关注，理解孩子不应只从问题行为出发。这不是幸福指数，也不要求每天都有积极事件。",
    questions: ["孩子主动分享或邀请你的是什么？你怎样回应？", "他喜欢的日常节奏是什么？有哪些不喜欢或想改变的地方？", "哪些是大人觉得美好，哪些是孩子自己说喜欢？"],
    tryNext: "留意一次孩子主动发起的分享，用适合其表达方式的回应接住它。",
    source: RESPONSIVE
  }
};

function dayNumber(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "0001-01-01"
    || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error("请选择有效日期。");
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

export function mirrorPeriods(from: string, to: string) {
  const start = dayNumber(from);
  const end = dayNumber(to);
  if (start > end) throw new Error("开始日期不能晚于结束日期。");
  const previousStart = new Date((start - (end - start + 1)) * 86_400_000).toISOString().slice(0, 10);
  const previousEnd = new Date((start - 1) * 86_400_000).toISOString().slice(0, 10);
  return { from, to, previous: previousStart < "0001-01-01" || previousStart.length !== 10 ? null : { from: previousStart, to: previousEnd } };
}

export function periodEvidence(events: GrowthEvent[], from: string, to: string, topic: Topic | "" = "") {
  mirrorPeriods(from, to);
  return filterEvents(events, { keyword: "", from, to, topic });
}

export function currentUnderstandings(journal: GrowthJournal): GrowthUnderstanding[] {
  const superseded = new Set(journal.understandings?.map((item) => item.supersedes).filter(Boolean));
  return (journal.understandings || []).filter((item) => !superseded.has(item.id)).slice().reverse();
}

export function understandingWarnings(item: GrowthUnderstanding, journal: GrowthJournal): string[] {
  const events = journal.events.filter((event) => [...item.evidenceIds, ...item.counterEvidenceIds].includes(event.id));
  const warnings: string[] = [];
  if (!item.counterEvidenceIds.length) warnings.push("尚未附上反例；不代表不存在反例。");
  if (events.every((event) => !event.childQuote.trim() && !event.perspectives.some((p) => p.kind === "child" && p.response !== "skip" && p.content.trim()))) {
    warnings.push("引用材料缺少孩子自己的表达，不把成人理解当作孩子意见。");
  }
  if (events.some((event) => event.perspectives.some((p) => p.createdAt > item.createdAt))) {
    warnings.push("引用经历有后来的补充，请重新核对这份理解。");
  }
  if (new Set(events.map((event) => event.observer)).size < 2) warnings.push("记录者视角有限，尚不足以代表其他情境。");
  return warnings;
}
