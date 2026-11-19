import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "call-self-baby", name: "宝宝自己来", icon: "🙋", category: "talk",
  age: { from: 18, to: 36 },
  title: "我为什么说「宝宝自己来」，不说「我」？",
  trigger: "两岁的小念推开爸爸的手，大声说「宝宝自己来！」，说的「宝宝」就是他自己",
  dialogue: [
    {
      nian: "爸爸，我小时候老说「宝宝自己来」「宝宝要喝奶」，怎么不说「我」呀？是不是很笨？",
      dad: "一点也不笨，反而很聪明。大人天天叫你「宝宝」，你就学会了：这个名字说的是我。很多孩子学说话，都是先用自己的名字说自己，过一阵子才换成「我」。差不多一岁半到两岁，「我」「你」才慢慢冒出来。",
    },
    {
      nian: "名字一下就学会了，为什么「我」就那么难？",
      dad: "因为「我」是一个会变来变去的词。爸爸说「我」，指的是爸爸；你说「我」，指的是你。妈妈对你说「你」，指的是你；你对妈妈说「你」，指的却是妈妈。谁在说话，这个词就跟着谁跑。名字可不会这样变。",
      show: { kind: "steps", frames: [{ icon: "🧔", label: "爸爸说「我」" }, { icon: "👉", label: "指的是爸爸" }, { icon: "👦", label: "你说「我」" }, { icon: "👉", label: "指的是你" }] },
    },
    {
      nian: "跟着谁跑？那我小时候有没有弄错过？",
      dad: "很多孩子都弄错过。有的孩子会说「你要抱抱」，意思是「我要抱抱」，因为大人对他说话总说「你」，他就以为「你」是自己的另一个名字。科学家说，这在普通孩子身上很常见，大多两岁半左右就理顺了。",
    },
    {
      nian: "两岁半就理顺了？那我是怎么弄明白的，是大人教的吗？",
      dad: "很多是你自己「偷听」学会的！科学家请一岁多孩子的爸爸妈妈玩一个游戏：一组只指着孩子说「你」、指着自己说「我」；另一组还让孩子看爸爸妈妈互相指着说。只有看过爸爸妈妈互相说的孩子，学的时候才一点不错。",
    },
    {
      nian: "偷听也能学会？难怪我听爸爸妈妈互相叫名字，也跟着叫爸爸的名字，是这样学会的吗？",
      dad: "对，就是这样！你听见妈妈这样叫爸爸，就知道这个名字说的是爸爸。科学家还发现，家里的老二常常更早用对「我」「你」，别的说话本领却差不多，可能是因为他们天天听哥哥姐姐和爸妈说话。",
    },
    {
      nian: "天天听就会了，那大人跟小宝宝说话，是说「宝宝」好，还是说「你」好？",
      dad: "两样都可以用。有研究发现，爸爸妈妈有时叫孩子名字、有时说「你」，有时说「妈妈」、有时说「我」，孩子反而更容易学会「我」和「你」。还有，不用急着纠正：你说「宝宝自己来」，大人接一句「好，你自己来」，就很好。",
    },
    {
      nian: "我懂了！「我」是个跟着说话的人跑的词，比名字难。我是听大人互相说话，慢慢学会的！",
      dad: "说得对！下回听见小宝宝说「宝宝要」，你就知道他正在学这个难词。",
    },
  ],
  parentTip: "幼儿多在 18–22 个月开始用「我」，随后是「你」，约 30 个月基本掌握；在这之前用名字或「宝宝」称呼自己很常见，偶尔「你」「我」颠倒也是正常的学习过程。孩子会从旁听大人之间的对话学人称，大人名字和代词混着用也有帮助。不必刻意纠正，自然地用对的说法复述即可。若三岁后仍总是颠倒，又有说话很少、很少看人或和人互动等让你担心的情况，可以咨询儿科医生或言语治疗师。",
  sources: [
    {
      who: "Petitto（1987）",
      title: "On the autonomy of language and gesture: Evidence from the acquisition of personal pronouns in American Sign Language",
      url: "https://www.laura-ann-petitto.com/images/assets/publications/Publications/1987_Petitto_Cognition.pdf",
      says: "文中综述：孩子先用名字说自己，「我」约 18–22 个月出现，「你」稍后，约 30 个月理顺；你我颠倒在普通孩子中也常见。",
      limit: "她自己观察的只是两名学手语的孩子；年龄是大致范围，不是标准。",
    },
    {
      who: "Oshima-Takane（1988）",
      title: "Children learn from speech not addressed to them: the case of personal pronouns",
      url: "https://doi.org/10.1017/s0305000900012071",
      says: "18 名快学会人称的孩子：只有看过父母互相指着说「我」「你」的那组，模仿时没出错。",
      limit: "是说英语孩子的小实验，不能说明学中文的「我」「你」完全一样。",
    },
    {
      who: "Oshima-Takane、Goodz 和 Derevensky（1996）",
      title: "Birth Order Effects on Early Language Development: Do Secondborn Children Learn from Overheard Speech?",
      url: "https://academic.oup.com/chidev/article-abstract/67/2/621/8285459",
      says: "21 个月时，老二用「我」「你」比老大更成熟，其他说话能力没有差别。",
      limit: "每组 16 人，不能说明老大和老二谁说话更好。",
    },
    {
      who: "Smiley、Chang 和 Allhoff（2011）",
      title: "Can Toddy Give Me an Orange? Parent Input and Young Children's Production of I and You",
      url: "https://doi.org/10.1080/15475441.2010.499495",
      says: "父母说自己、说孩子时名字和代词混着用，孩子更容易学会「我」和「你」。",
      limit: "只分析了 11 个英语家庭的录音，是相关，不是实验。",
    },
  ],
  story: "big-name",
};

export default record;
