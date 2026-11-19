import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "babble", name: "哒哒哒", icon: "🎶", category: "talk",
  age: { from: 6, to: 12 },
  title: "我小时候为什么一直「哒哒哒」地自己说？",
  trigger: "八个月大的小念躺在小床上，「哒哒哒」「巴巴巴」念个不停，没人跟他说话也念",
  dialogue: [
    {
      nian: "爸爸，我小时候老是「哒哒哒」「巴巴巴」，又不是在说话，我在干什么呀？",
      dad: "你在练习说话呀！大概六七个月起，很多宝宝会把「d」和「a」这样的声音拼在一起，一串一串地念：「哒哒哒」「妈妈妈」。听着像乱说，其实是在练嘴巴、舌头和声音怎么一起动。这就是「咿呀学语」。",
    },
    {
      nian: "练嘴巴？那我自己练就好了，为什么还要大人跟我说话？",
      dad: "因为大人一回应，你练得更快。科学家请妈妈们陪八个月大的宝宝玩：一组妈妈在宝宝一出声就马上笑、靠近、摸摸他；另一组妈妈笑和摸的次数一样多，可时间和宝宝出声对不上。结果第一组宝宝的声音很快更像说话了。",
      show: { kind: "steps", frames: [{ icon: "👶", label: "宝宝出声" }, { icon: "😊", label: "妈妈马上笑" }, { icon: "🔁", label: "宝宝再出声" }, { icon: "🗣️", label: "更像说话" }] },
    },
    {
      nian: "时间对不上就不行？为什么非得马上笑？",
      dad: "因为马上回应，宝宝才知道「是我的声音让妈妈笑了」。这像打乒乓球，你发一个球，对面接住打回来，你就想再发。那些宝宝后来发出更多「ba」「da」这种清清楚楚的音，不再只是「啊——」。有些小鸟学唱歌，也靠大鸟这样回应。",
    },
    {
      nian: "像打乒乓球？那大人跟宝宝说话，为什么总是尖尖的、拖得长长的？",
      dad: "那叫「宝宝腔」：声音高一点，说得慢一点，起起伏伏像唱歌，世界上很多地方的大人都会这样说。科学家教一些爸爸妈妈多用宝宝腔、多和孩子你一句我一句，这些孩子到一岁半时，说出的词比没学的家庭更多。",
    },
    {
      nian: "宝宝腔这么有用？那要是一个宝宝一直不哒哒哒，是不是就学不会说话？",
      dad: "没那么简单。每个宝宝开始咿呀的时间不一样，早的三个月，大多十个月以前就会了。科学家发现，耳朵听不见的宝宝，咿呀会晚很多，因为他们听不到自己和别人的声音。所以宝宝到十个月左右还不会这样念，最好带他去查查耳朵。",
    },
    {
      nian: "耳朵这么重要！那现在我跟小宝宝玩，可以怎么做？",
      dad: "先等宝宝出声，再马上笑着回他，学学他的声音，或者接一句真话：「哒哒？你在找爸爸吗？」然后停一停，把「球」还给他。你一句、我一句，就是你们最早的聊天。",
      show: { kind: "steps", frames: [{ icon: "👂", label: "等宝宝出声" }, { icon: "😊", label: "马上回他" }, { icon: "⏸️", label: "停一停等他" }] },
    },
    {
      nian: "我懂了！我小时候哒哒哒，是在练说话。大人马上回我，像打乒乓球，我就越练越像说话了！",
      dad: "对！下次见到小宝宝，你也可以跟他打一场「声音乒乓球」。",
    },
  ],
  parentTip: "标准咿呀（canonical babbling，如「ba-ba」「da-da」这样成形的音节）在听力正常的婴儿中多于 3–10 个月出现，最常见在 7 个月前后。研究显示，大人在孩子出声后立刻回应，以及使用音调高、语速慢、起伏大的「宝宝腔」（parentese）并多轮来回，和孩子发声更成熟、词汇更多有关。若孩子 10 个月左右还没有这样的音节，或对声音反应少，建议尽快请儿科医生安排听力评估。",
  sources: [
    {
      who: "Goldstein、King 和 West（2003）",
      title: "Social interaction shapes babbling: Testing parallels between birdsong and speech",
      url: "https://www.pnas.org/doi/10.1073/pnas.1332441100",
      says: "30 名约 8 个月的宝宝：妈妈在宝宝出声后马上笑、靠近、抚摸，宝宝的声音更多、更像说话；时间对不上的同样回应没有这个效果。",
      limit: "是一次短时间的实验室研究，不能说明回应慢一点的孩子就学不会说话。",
    },
    {
      who: "Eilers 和 Oller（1994）",
      title: "Infant vocalizations and the early diagnosis of severe hearing impairment",
      url: "https://www.jpeds.com/article/S0022-3476(94)70303-5/abstract",
      says: "听力正常的宝宝在 3–10 个月开始标准咿呀，最常见 7 个月；重度听力受损的宝宝多在 11 个月以后。",
      limit: "咿呀晚提示要查听力，本身不是诊断；样本是美国宝宝。",
    },
    {
      who: "Ferjan Ramírez、Lytle 和 Kuhl（2020）",
      title: "Parent coaching increases conversational turns and advances infant language development",
      url: "https://www.pnas.org/doi/10.1073/pnas.1921653117",
      says: "给 6 个月宝宝的父母做辅导，他们更多用宝宝腔、和孩子来回对话，孩子 18 个月时说的词更多。",
      limit: "71 个家庭，只追踪到 18 个月，不能说明长远效果。",
    },
  ],
};

export default record;
