import type { QaRecord } from "../qa/types.ts";
import afraidDark from "./afraid-dark.ts";
import angryHit from "./angry-hit.ts";
import babble from "./babble.ts";
import babyMemory from "./baby-memory.ts";
import bestAtAll from "./best-at-all.ts";
import bigTantrum from "./big-tantrum.ts";
import callNoHear from "./call-no-hear.ts";
import callSelfBaby from "./call-self-baby.ts";
import cantSay from "./cant-say.ts";
import copyYou from "./copy-you.ts";
import doItMyself from "./do-it-myself.ts";
import dreams from "./dreams.ts";
import helpOut from "./help-out.ts";
import hugCalm from "./hug-calm.ts";
import jealous from "./jealous.ts";
import justRight from "./just-right.ts";
import knewBut from "./knew-but.ts";
import littleLie from "./little-lie.ts";
import loseCry from "./lose-cry.ts";
import mirrorMe from "./mirror-me.ts";
import missMom from "./miss-mom.ts";
import mixSounds from "./mix-sounds.ts";
import myToy from "./my-toy.ts";
import nameFeeling from "./name-feeling.ts";
import peekaboo from "./peekaboo.ts";
import pointShow from "./point-show.ts";
import praiseSmart from "./praise-smart.ts";
import pretend from "./pretend.ts";
import sameStory from "./same-story.ts";
import sayNo from "./say-no.ts";
import screenStop from "./screen-stop.ts";
import selfTalk from "./self-talk.ts";
import shotHurt from "./shot-hurt.ts";
import shyBlush from "./shy-blush.ts";
import smellFirst from "./smell-first.ts";
import statueGame from "./statue-game.ts";
import stranger from "./stranger.ts";
import teaseDad from "./tease-dad.ts";
import throwDrop from "./throw-drop.ts";
import tryAgain from "./try-again.ts";
import waitCandy from "./wait-candy.ts";
import whatYouKnow from "./what-you-know.ts";
import whyWhy from "./why-why.ts";
import yummyToes from "./yummy-toes.ts";

/** 全部记录；首页按 age.from 重新排 */
export const RECORDS: readonly QaRecord[] = [
  // 认识我自己
  mirrorMe, yummyToes, doItMyself, sayNo, shyBlush, smellFirst, justRight, praiseSmart, bestAtAll,
  // 心情和脾气
  bigTantrum, hugCalm, afraidDark, jealous, loseCry, shotHurt, nameFeeling,
  // 我和别人
  missMom, stranger, copyYou, helpOut, myToy, teaseDad, whatYouKnow, littleLie,
  // 好奇和想象
  peekaboo, throwDrop, whyWhy, sameStory, pretend, tryAgain, babyMemory, dreams,
  // 管住自己
  waitCandy, screenStop, angryHit, knewBut, statueGame, callNoHear,
  // 学说话
  pointShow, babble, callSelfBaby, selfTalk, cantSay, mixSounds,
];

export function recordById(id: string): QaRecord | undefined {
  return RECORDS.find((r) => r.id === id);
}

/** 《小念家的漫画书》里这些故事的标题，和 storyverse 的 story.ts 一致 */
export const STORY_TITLES: Readonly<Record<string, string>> = {
  "yummy-toes": "小脚丫好吃吗", "do-it-myself": "宝宝自己来！", ning: "拧！", "smell-first": "小小食物鉴赏家",
  "tidy-guard": "秩序小卫士", "little-genius": "小念的记忆力", vaccine: "勇敢的小念", "little-guitar": "小念的吉他组合",
  "little-helper": "暖心的小大人", "puzzle-time": "拼图和破坏大王", "broken-chair": "小念是个破坏王", "story-time": "闪电麦坤是谁？",
  "balance-board": "会变的大木板", "watch-ads": "看广告！", "high-chair": "餐椅不是跷跷板", "big-glasses": "小念的大眼镜",
  "big-name": "小小复读机",
};

/** 漫画书封面的小图：相对路径，部署在子路径下也能用 */
export const thumbUrl = (story: string) => `comics/${story}/thumb.webp`;

/** 《小念家的漫画书》里的那一页 */
export const storyUrl = (story: string, page = 0) => `https://handsondad.github.io/storyverse/#/read/${story}/${page}`;
