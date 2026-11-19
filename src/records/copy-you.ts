import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "copy-you", name: "学爸爸妈妈", icon: "🪞", category: "others",
  age: { from: 0 },
  title: "我为什么总学爸爸妈妈做事？",
  trigger: "爸爸在打电话，小念也拿起一块积木贴在耳朵边，学着爸爸「喂，喂」地说话",
  dialogue: [
    {
      nian: "爸爸，你打电话我也打，你扫地我也扫，我是不是没有自己的主意？",
      dad: "不是。学别人，正是小孩最厉害的本事之一。好多事没人能一句一句教会你，你就看着大人怎么做，再自己做一遍：怎么拿勺子、怎么说「喂」、怎么挥手说再见。看一遍就会一点，比自己瞎摸索快多了。",
    },
    {
      nian: "看着大人做就会了？那我多小就开始看着学了？",
      dad: "这个问题，科学家争了快五十年。1977 年，有人对着出生两三个星期的宝宝伸舌头、张嘴巴，说宝宝也跟着做。可 2016 年另一组科学家跟着一百多个宝宝，从一周大看到九周大，发现宝宝伸舌头，和大人做的是什么关系不大。到现在还在争。",
    },
    {
      nian: "科学家还在争？那我长到多大，就肯定会学了？",
      dad: "一岁多一点，就看得清清楚楚了。有个实验里，大人弯下腰，用额头碰一下桌上的小盒子，盒子就亮了。十四个月大的宝宝只能看，不让碰。过了一个星期再来，三个宝宝里有两个用额头去碰盒子；没看过的宝宝，一个也没这样做。",
      show: { kind: "steps", frames: [{ icon: "🙇", label: "大人用额头碰" }, { icon: "💡", label: "盒子亮了" }, { icon: "📅", label: "过了一星期" }, { icon: "👶", label: "宝宝也用额头" }] },
    },
    {
      nian: "用额头碰盒子多奇怪呀，我为什么连奇怪的样子也学？",
      dad: "因为在你眼里，大人认真做的每一步，可能都有用。科学家给三到五岁的孩子看一个透明盒子，大人取玩具前，先做几下明明没用的动作。孩子看得清清楚楚，还被提醒「只做有用的」，很多孩子还是照着全做一遍，连大人走开了也一样。",
    },
    {
      nian: "照着全做一遍，那我是不是有点傻？",
      dad: "一点也不傻，这是个聪明的办法。很多东西怎么用，光看是看不出门道的，先照着大人做，往往就做对了。科学家说，正因为你把大人认真做的每一步都当真，才会把多余的步骤也学去。偶尔多做两下，换来学东西特别快。",
    },
    {
      nian: "学东西特别快，那我长大了还会这样学吗？",
      dad: "会的。大人第一次用新东西，也常常是看别人怎么弄，就跟着怎么弄。所以你学爸爸妈妈，一点也不奇怪。这也提醒爸爸：你天天看着我呢，我做事要做个好样子；做得不对的地方，也要告诉你。",
    },
    {
      nian: "我明白了！我学爸爸妈妈，是因为看着做比自己瞎摸索快。连多余的步骤我也学，是因为我把你们做的每一步都当真了！",
      dad: "说得真好！下次你也可以问爸爸：这一步是干什么用的？",
    },
  ],
  parentTip: "模仿是幼儿学习的重要途径。新生儿会不会模仿仍有争议：Meltzoff 和 Moore（1977）报告 2–3 周大的婴儿会模仿伸舌、张嘴，Oostenbroek 等（2016）大样本纵向研究没有发现，此后双方仍在争论。到 14 个月，隔一周的延迟模仿已很确定。3–5 岁孩子还常「过度模仿」，把大人明显多余的动作也照做，研究者认为这是孩子把大人有意的动作都当成有原因的。家里可以放慢动作，说出每一步为什么这样做。",
  sources: [
    {
      who: "Meltzoff & Moore（1977）",
      title: "Imitation of Facial and Manual Gestures by Human Neonates",
      url: "https://doi.org/10.1126/science.198.4312.75",
      says: "报告 12–21 天大的婴儿会模仿大人伸舌头、张嘴等面部和手部动作。",
      limit: "样本小；后来的大样本研究没能重复，新生儿模仿至今有争议。",
    },
    {
      who: "Oostenbroek 等（2016）",
      title: "Comprehensive Longitudinal Study Challenges the Existence of Neonatal Imitation in Humans",
      url: "https://doi.org/10.1016/j.cub.2016.03.047",
      says: "跟踪 106 个婴儿在 1、3、6、9 周大时的反应，看大人做匹配动作和别的动作时，婴儿做出同样动作的次数差不多。",
      limit: "Meltzoff 等重新分析其数据后认为仍有伸舌模仿，争论未结束。",
    },
    {
      who: "Meltzoff（1988）",
      title: "Infant Imitation After a 1-Week Delay: Long-Term Memory for Novel Acts and Multiple Stimuli",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4137879/",
      says: "14 个月大的宝宝只看大人用额头碰亮灯箱，一周后约三分之二会照做，没看过的宝宝没有一个这样做。",
      limit: "只说明一岁多能隔很久模仿新动作，不说明更小时会不会。",
    },
    {
      who: "Lyons, Young & Keil（2007）",
      title: "The hidden structure of overimitation",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2148370/",
      says: "3–5 岁孩子看大人用多余动作打开透明盒子后，即使被提醒、独自一人，也常把多余动作照做；作者认为孩子把大人有意的动作都当成有用的。",
      limit: "在实验室用新奇的盒子做的，日常生活中的程度可能不同。",
    },
  ],
  story: "little-guitar",
};

export default record;
