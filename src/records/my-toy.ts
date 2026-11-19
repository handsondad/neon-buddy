import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "my-toy", name: "我的玩具", icon: "🧸", category: "others",
  age: { from: 24, to: 96 },
  title: "我为什么不想把玩具分给别人？",
  trigger: "小朋友来家里玩，伸手要拿小念的小汽车，小念一把抱在怀里大喊「我的！」",
  dialogue: [
    {
      nian: "爸爸，我不想把小汽车分给别人，我是不是很小气？",
      dad: "不是小气。你心里刚长出一个很重要的想法：「这是我的」。小汽车是你的，你正玩得高兴，有人伸手来拿，你当然想护住它。很多两三岁的孩子都会紧紧抱着自己的东西喊「我的」，这是在长大。",
    },
    {
      nian: "护住我的东西，那别人的东西被拿走，我也会着急吗？",
      dad: "到三岁左右就会了。科学家让一只手偶去拿东西，有时拿小朋友的，有时拿别人的，有时拿它自己的。两岁的孩子主要是自己的东西被拿才着急；三岁的孩子看到手偶拿别人的东西，也会出声拦着。",
    },
    {
      nian: "知道东西是谁的，那为什么我还是不想分？",
      dad: "因为知道「是谁的」，和愿意分出去，是两件事。分享要舍得自己少一点，还要会等，还要想到别人的心情，这些都得慢慢学。很多爸爸妈妈以为两岁就该会分享，其实这些本事大多要到三岁半到四岁才慢慢长出来。",
    },
    {
      nian: "要慢慢学，那长大一点的孩子就愿意分了吗？",
      dad: "会越来越在乎公平。科学家请三到八岁的孩子分糖：可以自己拿两颗、对方一颗没有，也可以一人一颗。三四岁的孩子，十个里大约九个选自己拿两颗；到七八岁，差不多一半愿意让出一颗。这个年纪，大多数孩子都想两边一样多。",
      show: { kind: "steps", frames: [{ icon: "🍬", label: "分糖游戏" }, { icon: "👦", label: "三四岁：我两颗" }, { icon: "🧒", label: "七八岁：一人一颗" }] },
    },
    {
      nian: "两边一样多才公平？那妈妈硬要我把小汽车给别人，我为什么会大哭？",
      dad: "因为东西被硬拿走，你只会更怕失去它，下次抱得更紧。研究小孩子的专家建议，别逼小孩子分享，改成「轮流」：你先玩，玩够了再给他；也可以用小闹钟，铃一响就换人。你知道东西还会回到你手里，就没那么怕了。",
      show: { kind: "steps", frames: [{ icon: "🚗", label: "我先玩" }, { icon: "⏰", label: "铃响了" }, { icon: "🔄", label: "换你玩" }, { icon: "😊", label: "等会儿还回来" }] },
    },
    {
      nian: "轮流玩，可要是我等不及，想去抢别人的怎么办？",
      dad: "等待对谁都难，想抢很正常，可是抢和打都不行。你可以说：「我能玩一会儿吗？」要是他还没玩够，你就先玩别的，等他玩完。爸爸会陪你等，告诉你：等着真不容易，你在努力呢。",
    },
    {
      nian: "我明白了！我护着小汽车，是因为我刚知道「这是我的」。分享要慢慢学，先从轮流玩、努力等一等开始！",
      dad: "说得对！下次朋友来，先说好谁先玩、玩多久。",
    },
  ],
  parentTip: "两三岁的孩子开始有清楚的所有权意识，三岁左右还会维护别人的东西（Rossano 等，2011）。舍得自己少拿、讲究公平是慢慢发展的：Fehr 等（2008）发现三四岁大多选自己多拿，七八岁多数偏好平均。专家不建议强迫低龄孩子分享，可以先教轮流、用计时器、允许先玩够一轮，同时制止抢夺和打人，说出等待一方的难受。大人自己示范分享也很重要。",
  sources: [
    {
      who: "Rossano, Rakoczy & Tomasello（2011）",
      title: "Young children's understanding of violations of property rights",
      url: "https://doi.org/10.1016/j.cognition.2011.06.007",
      says: "手偶拿走或扔掉东西时，2 岁和 3 岁孩子都会为自己的东西抗议；只有 3 岁孩子还会为别人的东西抗议。",
      limit: "只测了德国城市里的 2、3 岁孩子，抗议多少也和性格有关。",
    },
    {
      who: "ZERO TO THREE",
      title: "Helping Young Children With Sharing",
      url: "https://www.zerotothree.org/resource/helping-young-children-with-sharing/",
      says: "不愿分享在幼儿很正常，分享的本事多在 3.5–4 岁发展；可以制止抢打、给孩子玩够一轮、用计时器、说出等待的难受。",
      limit: "是给家长的建议文章，不是一项具体研究。",
    },
    {
      who: "Fehr, Bernhard & Rockenbach（2008）",
      title: "Egalitarianism in young children",
      url: "https://www.nature.com/articles/nature07155",
      says: "让 3–8 岁孩子分糖：要让出一颗才能一人一颗时，3–4 岁约 9%、7–8 岁约 45% 愿意；7–8 岁多数偏好两边一样多。",
      limit: "测的是瑞士孩子和照片上的匿名孩子，孩子也更偏向同校的人。",
    },
    {
      who: "Anna Freud 中心",
      title: "Sharing",
      url: "https://www.annafreud.org/resources/under-fives-wellbeing/common-difficulties/sharing/",
      says: "幼儿刚开始懂「我的」；逼他们交出东西，反而会更紧张、更想抓着不放。对三岁以下多讲「轮流」，少讲「分享」。",
      limit: "是儿童心理机构的建议，没有给出具体实验数据。",
    },
  ],
};

export default record;
