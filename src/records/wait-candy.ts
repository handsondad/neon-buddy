import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "wait-candy", name: "等一会儿再吃", icon: "🍬", category: "control",
  age: { from: 36, to: 72 },
  title: "让我等一会儿再吃糖，为什么那么难？",
  trigger: "糖就放在桌上，妈妈说「吃完饭再吃」，小念盯着糖，手伸过去又缩回来",
  dialogue: [
    {
      nian: "爸爸，糖就在眼前，我老是忍不住想吃，我是不是太馋了？",
      dad: "不是太馋，是等待本来就很难。好吃的就在眼前，心里像有个小喇叭一直喊「快吃快吃」。科学家专门请四岁左右的孩子玩过「等糖」游戏，很多孩子都觉得难：有的等了很久，有的一会儿就吃了。大人也常常忍不住呢。",
    },
    {
      nian: "科学家的等糖游戏是怎么玩的？",
      dad: "大人在桌上放一块棉花糖，告诉孩子：「我出去一下，等我回来，你就能吃两块；等不住就摇铃，我马上回来，可只能吃这一块。」然后大人走出房间。结果呢，好吃的露在眼前时，孩子们平均等不到六分钟；把它盖起来，平均能等十一分钟多。",
      show: { kind: "steps", frames: [{ icon: "🍬", label: "糖放在桌上" }, { icon: "🔔", label: "等不住就摇铃" }, { icon: "⏳", label: "等大人回来" }, { icon: "🎉", label: "就有两块糖" }] },
    },
    {
      nian: "盖起来就能等更久？那还有什么办法？",
      dad: "有！科学家偷偷看那些等得久的孩子，发现他们会自己想办法：捂上眼睛，趴在胳膊上，小声唱歌，用手脚编游戏，有的还想睡一觉。还有个妙招：不去想它有多香多脆，而是把咸饼干棍想成一根根小木头。这样一想，孩子们能等十三分钟还多。",
    },
    {
      nian: "想成小木头就好等了？那会等的孩子，长大是不是就更厉害？",
      dad: "以前有研究这么说过，可后来别的科学家找了更多、更不一样的家庭，重新做了一遍，发现这种关系小多了；再把家里的情况、小时候学东西快不快算进去，就只剩一点点。所以四岁时等了几分钟，说明不了以后会怎么样。",
    },
    {
      nian: "说明不了以后，那等不等得住，还跟什么有关系？",
      dad: "还跟你信不信大人有关系。有个实验，大人先答应给孩子拿新蜡笔、新贴纸，一组真的拿来了，另一组却说「对不起，没有了」。接着玩等棉花糖：大人说话算数的那组，平均等了十二分钟；大人说话不算数的那组，平均只等了三分钟。",
    },
    {
      nian: "说话算数的那组等得久，是因为他们相信糖真的会来吗？",
      dad: "科学家觉得很可能是这样。孩子心里会悄悄算一笔账：要是等了也白等，还不如先吃掉这块。所以等不住，不一定是管不住自己，也可能是心里不踏实。还有，四岁的孩子常常想把糖摆在眼前、一直想着它，大一点才慢慢学会把糖藏起来、去想别的。",
    },
    {
      nian: "我明白了！把糖藏起来、想点别的，就好等多了。爸爸妈妈说话算数，我也更愿意等。",
      dad: "说得对！下次要等，咱们一起把糖放进盒子里，再一起唱首歌。",
    },
  ],
  parentTip: "心理学叫它延迟满足。Mischel 等发现，把奖励挡住、自己转移注意、换个想法看奖励，学龄前孩子能等得更久。等待也取决于信任：大人先守信，孩子等得更久（Kidd 等）。早年说「等得久的孩子以后更出色」，Watts 等 2018 年用更大更多样的样本重做，关联只有原来一半，控制家庭背景等后又少了约三分之二，别把一次等糖当成预测。家里可以把诱惑收起来、陪孩子找事做、答应的事做到。",
  sources: [
    {
      who: "Mischel、Shoda & Rodriguez（1989）",
      title: "Delay of Gratification in Children",
      url: "https://bingschool.stanford.edu/sites/bingschool/files/1989_mischeletal.pdf",
      says: "奖励露在眼前，学龄前孩子平均等不到6分钟，盖起来能等11分钟以上；想好玩的事、把奖励想成别的东西也能等更久。",
      limit: "孩子都来自斯坦福大学附近；实验室里等几分钟，不代表孩子平时怎样。",
    },
    {
      who: "Kidd、Palmeri & Aslin（2013）",
      title: "Rational snacking: Young children's decision-making on the marshmallow task is moderated by beliefs about environmental reliability",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3730121/",
      says: "28个三岁半到快六岁的孩子：大人先守信，孩子平均等约12分钟；大人先失信，平均只等约3分钟。",
      limit: "样本很小，只看了实验前的一次经历，不说明孩子平时信不信大人。",
    },
    {
      who: "Watts、Duncan & Quan（2018）",
      title: "Revisiting the Marshmallow Test: A Conceptual Replication Investigating Links Between Early Delay of Gratification and Later Outcomes",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6050075/",
      says: "用更大、更多样的样本重做：四岁等待时间和15岁成绩的关联只有原研究一半，控制家庭背景等后再少约三分之二。",
      limit: "关联小不等于学会等待没用；也不能用一次等糖预测孩子将来。",
    },
  ],
};

export default record;
