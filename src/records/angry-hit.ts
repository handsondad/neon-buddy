import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "angry-hit", name: "生气想打人", icon: "😠", category: "control",
  age: { from: 12, to: 60 },
  title: "生气的时候，我为什么想打人？",
  trigger: "小朋友抢走了小念的小汽车，小念一着急，伸手就推了他一把",
  dialogue: [
    {
      nian: "爸爸，我一生气就想打人，我是不是坏孩子？",
      dad: "不是坏孩子。生气的时候想动手，很多小朋友都有过。心里的火一下子冒上来，「还给我」「别抢」这些话还没想好，手已经伸出去了，手比嘴快。想打人不等于你坏，只是那股劲还没学会换个出口。",
    },
    {
      nian: "手比嘴快？那很多小朋友都这样吗？",
      dad: "是的。加拿大的科学家跟着五百多个家庭，从宝宝五个月大一直问到三岁半，问孩子会不会打人、咬人、踢人。结果发现，大多数孩子一岁多就会用手脚「解决问题」了，只有不到三成的孩子几乎不动手。",
    },
    {
      nian: "一岁多就开始了？那会一直这样下去吗？",
      dad: "不会一直这样。跟着很多孩子长大的研究发现，动手的次数一般在两岁半到三岁半最多，然后一年年变少，大多数孩子上小学以前就学会了用别的办法。科学家说，孩子不用谁教就会动手，要慢慢学的，是怎么不动手。",
      show: { kind: "steps", frames: [{ icon: "🌱", label: "一岁多开始" }, { icon: "⛰️", label: "两三岁最多" }, { icon: "📉", label: "慢慢变少" }] },
    },
    {
      nian: "慢慢学会不动手，是怎么学会的？",
      dad: "靠一点点长出来的本事：会说话了，能说「我生气」「还给我」；火冲上来时，能停一下；还会换个法子，比如找大人帮忙、轮流玩。这些都是在和小朋友一起玩、被大人一次次教的时候练出来的，不是一下子就会。",
    },
    {
      nian: "被大人教的时候，要是大人也打我一下，我是不是就记住了？",
      dad: "打孩子不是好办法。儿科医生建议，大人不打孩子，自己用平静的办法对付生气，孩子会照着学；要是大人一生气就动手，孩子学到的反而是「生气就能打」。大人该做的，是先把你们分开，等都平静了，再教你下次怎么说、怎么做。",
    },
    {
      nian: "等都平静了，下次我又生气，可以怎么做？",
      dad: "先让手停住，然后用嘴说：「我很生气！这是我的！」也可以转过身走开，去找大人帮忙。等没那么气了，再想办法，比如轮流玩、换个玩具。生气没有错，谁都会生气，只是别让它从手上跑出去。",
      show: { kind: "steps", frames: [{ icon: "✋", label: "手先停住" }, { icon: "🗣️", label: "说「我生气」" }, { icon: "🚶", label: "转身找大人" }] },
    },
    {
      nian: "我懂了！想打人是因为手比嘴快，很多小朋友都这样。我可以先停住手，用嘴说出来，再去找大人帮忙。",
      dad: "对！下次生气了，就大声说「我很生气」，爸爸听得见。",
    },
  ],
  parentTip: "身体攻击多在 1–2 岁出现，频率在 30–42 个月前后最高，之后逐年下降，多数孩子入学前学会替代办法（Tremblay）。孩子之间差别很大。孩子动手时先制止、分开，等平静后帮他说出感受，教他用语言、走开、找大人或轮流来解决；大人以身作则，不打孩子。如果到上学年龄仍频繁伤人，或家里冲突多、照顾的人压力很大，可以找儿科医生或专业人员聊聊。",
  sources: [
    {
      who: "Tremblay 等（2004）",
      title: "Physical aggression during early childhood: trajectories and predictors",
      url: "https://pubmed.ncbi.nlm.nih.gov/15231972/",
      says: "魁北克572个家庭，在孩子17、30、42个月时问打、咬、踢：约28%几乎不动手，多数孩子入学前学会别的办法。",
      limit: "靠妈妈回答问卷；说的是群体趋势，不能判断某个孩子以后怎样。",
    },
    {
      who: "Tremblay，儿童早期发展百科（2022）",
      title: "The Development and Prevention of Physical Aggression",
      url: "https://www.child-encyclopedia.com/aggression/according-experts/development-and-prevention-physical-aggression",
      says: "多数孩子一到两岁开始动手，次数在30–42个月前后最多，之后稳步下降；孩子要学的是不用身体攻击。",
      limit: "讲的是大多数孩子的走向，每个孩子早晚和多少差别很大。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "10 Tips to Prevent Aggressive Behavior in Young Children",
      url: "https://www.healthychildren.org/English/ages-stages/toddler/pages/Aggressive-Behavior.aspx",
      says: "幼儿还管不住生气，要教他用话说出感受；动手时把孩子分开到平静；教他坚定地说「不」、转身走开、商量。",
      limit: "是给家长的做法建议，不是专门检验这些办法的实验。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "What's the Best Way to Discipline My Child?",
      url: "https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/pages/Disciplining-Your-Child.aspx",
      says: "教幼儿不打、不咬；大人不打孩子，用不动手的方式处理冲突给孩子做榜样；告诉学龄前孩子生气可以，但不能伤人。",
      limit: "是给家长的建议，没有说某个办法对每个孩子都管用。",
    },
  ],
};

export default record;
