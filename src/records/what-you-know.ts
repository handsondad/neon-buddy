import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "what-you-know", name: "你也知道吧", icon: "🍫", category: "others",
  age: { from: 36, to: 72 },
  title: "我为什么以为别人都知道我知道的事？",
  trigger: "妈妈刚进门，小念就喊「它又跑掉啦！」妈妈问谁跑了，小念一愣：「你不知道吗？」",
  dialogue: [
    {
      nian: "爸爸，我说「它又跑掉了」，妈妈问谁跑了。她怎么会不知道？是我没说清吗？",
      dad: "你心里有件事还没想通：我知道的事，别人不一定知道。小猫跑掉的时候妈妈不在家，她没看见，当然不知道。小孩子常常以为，自己脑袋里的事，别人也都知道。这在三四岁时特别常见，不是你笨。",
    },
    {
      nian: "我知道的别人不一定知道？科学家是怎么发现的？",
      dad: "科学家讲了个小故事：小男孩把巧克力放进一个柜子，出去玩了。他不在时，妈妈把巧克力挪到另一个柜子。再问孩子：小男孩回来，会去哪个柜子找？三四岁的孩子没有一个答对；四到六岁的，一半多答对；六到九岁的，大多数都答对了。",
      show: { kind: "steps", frames: [{ icon: "🍫", label: "放进第一个柜子" }, { icon: "🚪", label: "小男孩出门" }, { icon: "🔄", label: "妈妈挪了地方" }, { icon: "❓", label: "他回来找哪儿？" }] },
    },
    {
      nian: "三四岁的孩子没有一个答对？为什么会答错呀？",
      dad: "因为你自己知道巧克力被挪走了，这件事太清楚，就很难再从小男孩的眼睛看出去。他没看见，脑袋里的巧克力还在老地方。能想到「别人心里想的，可能和真的不一样」，是个很大的本领。一百七十多个研究合起来看，各个国家的孩子都是在上幼儿园这几年，从大多答错变成大多答对。",
    },
    {
      nian: "从大多答错变成答对，那他们自己想错过的事，自己记得吗？",
      dad: "常常也记不得！科学家拿出一个糖果盒，看起来装着糖，打开一看，里面是铅笔。再问孩子：没打开的时候，你以为里面是什么？很多三岁的孩子说「铅笔」，好像自己一直就知道；大多数五岁的孩子会老实说「我以为是糖」。",
      show: { kind: "steps", frames: [{ icon: "🍬", label: "像是糖果盒" }, { icon: "✏️", label: "里面是铅笔" }, { icon: "❓", label: "刚才你以为？" }, { icon: "🤔", label: "三岁常说铅笔" }] },
    },
    {
      nian: "好像一直就知道？那我捉迷藏只蒙住眼睛，也是这个原因吗？",
      dad: "有点像，又不太一样。科学家问两到四岁的孩子：戴上眼罩，别人能看见你吗？很多孩子说看不见「我」，可又说看得见我的身体和头。他们好像觉得，两个人眼睛对上了，才算真看见了「我」。所以蒙住眼睛，就觉得自己藏好了。",
    },
    {
      nian: "觉得藏好了，别人其实看得见。那我怎么才能让别人听懂我说的事？",
      dad: "说之前先想一想：他刚才在不在？他看见了没有？要是没看见，就从头讲：「刚才小猫从门缝跑出去了。」爸爸妈妈也会多问你：「你觉得他知道吗？他会怎么想？」想得多了，你就越来越会站到别人那边看了。",
    },
    {
      nian: "我明白了！我知道的事，别人没看见就不知道。说话前先想想他在不在，再从头讲给他听！",
      dad: "说得好！下次讲新鲜事之前，先问一句：「你知道吗？」",
    },
  ],
  parentTip: "幼儿常把自己知道的当成别人也知道。经典错误信念任务（Wimmer & Perner，1983）和「糖果盒里是铅笔」任务（Gopnik & Astington，1988）显示，三岁孩子多答错，四到五岁前后逐渐答对；Wellman 等（2001）汇总 178 项研究，各国都有这个转变。这是心理理论发展的一部分，不是孩子不讲理。讲故事时可以问「他知道吗」「他会怎么想」。2–4 岁孩子蒙眼就觉得藏好了，研究者另有解释（Russell 等，2012）。",
  sources: [
    {
      who: "Wimmer & Perner（1983）",
      title: "Beliefs about beliefs: Representation and constraining function of wrong beliefs in young children's understanding of deception",
      url: "https://doi.org/10.1016/0010-0277(83)90004-5",
      says: "主角不在时东西被挪走，问他回来去哪儿找：3–4 岁没有一个两次都答对，4–6 岁 57%，6–9 岁 86% 答对。",
      limit: "早期研究，靠讲故事和口头回答，更小的孩子可能心里懂却答不出。",
    },
    {
      who: "Wellman, Cross & Watson（2001）",
      title: "Meta-Analysis of Theory-of-Mind Development: The Truth about False Belief",
      url: "https://doi.org/10.1111/1467-8624.00304",
      says: "汇总 178 项错误信念研究：不论在哪个国家、题目怎么改，学龄前孩子都从低于猜测水平变成高于猜测水平。",
      limit: "汇总的是口头回答的任务，不能说明更小的孩子完全不懂。",
    },
    {
      who: "Gopnik & Astington（1988）",
      title: "Children's Understanding of Representational Change and Its Relation to the Understanding of False Belief and the Appearance-Reality Distinction",
      url: "https://doi.org/10.1111/j.1467-8624.1988.tb03192.x",
      says: "糖果盒里装的是铅笔：问孩子刚才以为里面是什么，多数 3 岁孩子答错，多数 5 岁孩子答对；作者认为 4 岁前后开始能想到不同的看法。",
      limit: "样本是加拿大托儿所的孩子，用的都是会骗人的物品。",
    },
    {
      who: "Russell, Gee & Bullard（2012）",
      title: "Why Do Young Children Hide by Closing Their Eyes? Self-Visibility and the Developing Concept of Self",
      url: "https://doi.org/10.1080/15248372.2011.594826",
      says: "很多 2–4 岁孩子认为蒙住眼睛「自己」就看不见了，身体却看得见；作者推测他们觉得要两人目光相对才算看见对方。",
      limit: "对原因的解释是推测，和懂不懂别人知道什么不是一回事。",
    },
  ],
};

export default record;
