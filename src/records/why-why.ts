import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "why-why", name: "十万个为什么", icon: "❓", category: "curious",
  age: { from: 30 },
  title: "为什么我老爱问「为什么」？",
  trigger: "睡前小念一连问了爸爸好多个「为什么」，爸爸答完一个，他又接着问下一个",
  dialogue: [
    {
      nian: "爸爸，我老是问「为什么」，问个不停，你会不会嫌我烦？",
      dad: "不会，爸爸喜欢你问。爱问「为什么」，说明你的小脑袋在使劲想弄明白事情是怎么回事。很多小朋友都会经历这样一段，常常是两岁半以后，「为什么」一下子多起来，每个孩子早晚不一样。",
    },
    {
      nian: "为什么是两岁半以后？更小的时候我不问吗？",
      dad: "更小的时候你也问，只是问「这是什么」「在哪里」。科学家跟着一群小朋友，从两岁半看到三岁半：两岁半时，几乎听不到他们问「为什么」「怎么」；到三岁半，一大半孩子都问过了。先知道东西叫什么、在哪儿，再想知道它为什么会这样。",
      show: { kind: "steps", frames: [{ icon: "👉", label: "这是什么？" }, { icon: "📍", label: "在哪里？" }, { icon: "❓", label: "为什么？" }] },
    },
    {
      nian: "我问为什么，是真的想知道答案，还是想让你陪我说话？",
      dad: "科学家也想过这个问题。他们给三到五岁的小朋友看奇怪的故事和视频：一个女孩往冰激凌上浇番茄酱，一个阿姨用脚关灯。大人说出真正的原因，孩子常常点点头，接着问别的；大人只说「是啊，她用脚关的」，孩子就更常再问一遍，或者自己编个原因。",
    },
    {
      nian: "大人不说原因，我就再问一遍？那我是不是在故意捣乱？",
      dad: "不是捣乱，是你真想知道。这说明你分得清「回答了」和「没回答」。科学家还发现，两岁的小朋友就会这样：没得到解释，就追着再问。所以你问个不停的时候，可能是爸爸还没说到你想知道的那一点。",
    },
    {
      nian: "要是爸爸也不知道答案呢？",
      dad: "那爸爸就说「我也不知道，我们一起查」。不知道不丢人，科学家每天都在问自己不知道的事。有时候爸爸也会反过来问你：「你猜是为什么？」你自己想出来的原因，也很有意思。",
    },
    {
      nian: "我自己想出来的原因，要是错了怎么办？",
      dad: "错了也没关系，我们再去找证据：翻翻书、看一看、试一试。科学家也常常猜错，猜错了再改，就是在学。每改一次，你就多明白一点。",
    },
    {
      nian: "我明白了！我问为什么，是真的想知道原因。爸爸说出原因我就满意了，说不出来，我们就一起找证据！",
      dad: "对！问吧，爸爸接着。今天睡前，你最想问哪个为什么？",
    },
  ],
  parentTip: "「为什么」「怎么」这类解释性提问，多在两岁半以后出现并越来越多。Frazier 等发现，学龄前儿童得到因果解释后更常认同或追问相关问题，得不到就重复提问或自己解释，说明他们在主动寻找解释，不只是要关注。回答时尽量给出原因，简短也行；不知道就直说，一起查，或者反问「你怎么想」。",
  sources: [
    {
      who: "Frazier, Gelman & Wellman（2009）",
      title: "Preschoolers' Search for Explanatory Information Within Adult-Child Conversation",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2784636/",
      says: "2–5 岁孩子问为什么后，得到原因更常认同、接着追问；得不到原因更常再问一遍或自己给个解释。",
      limit: "样本是美国家庭的孩子，不说明孩子每次提问都只为求解释。",
    },
    {
      who: "Degotardi, Brand, Djonov & Sweller（2025）",
      title: "From 'what' to 'why': plotting the emergence and frequency of children's questions from 30 to 42 months of age",
      url: "https://www.tandfonline.com/doi/full/10.1080/1350293X.2025.2548293",
      says: "跟踪托育机构里 27 个孩子：30 个月时没人问为什么、怎么，到 42 个月 65% 问过，这类问题占比也越来越大。",
      limit: "只有 27 个澳大利亚孩子，每个孩子开始问的早晚差别很大。",
    },
    {
      who: "Tippenhauer, Janakiefski & Saylor（2026）",
      title: "Children's question asking: some answers and more questions",
      url: "https://academic.oup.com/cdpers/article/20/1/41/8413998",
      says: "综述：学龄前孩子问很多问题，得不到满意答案会接着问，是在主动找信息。",
      limit: "提问能不能直接让孩子学到更多、记得更牢，研究结果还不一致。",
    },
  ],
};

export default record;
