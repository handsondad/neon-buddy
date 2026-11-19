// trigger 取自漫画书《闪电麦坤是谁？》ideas.md「发生了什么」：一岁九个月时每晚要听故事，一讲故事就找这本书
import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "same-story", name: "百听不厌", icon: "📖", category: "curious",
  age: { from: 12 },
  title: "为什么一个故事我听一百遍也不腻？",
  trigger: "小念每晚睡前都要听故事，一到讲故事的时候，就去找那本讲闪电麦坤的书",
  dialogue: [
    {
      nian: "爸爸，那本闪电麦坤的书我听了好多好多遍，还想听。我是不是很奇怪？",
      dad: "一点也不奇怪。很多小朋友都有一本「听不腻」的书，一岁多就会一遍遍拿来要大人讲。你喜欢汽车，这本书又讲汽车，爸爸猜，你每听一遍，心里都美滋滋的。",
    },
    {
      nian: "每次都一样，为什么还美滋滋的？",
      dad: "就是因为一样呀！听熟了，你就能猜到下一页是什么，然后——真的是！这种「我猜对了」的感觉特别开心，也特别安心。美国儿科学会说，同一本书读很多遍，小朋友会学着预料后面发生什么，享受猜对的快乐。",
    },
    {
      nian: "猜对了很安心，可我老听旧的，是不是就学不到新东西了？",
      dad: "正好相反！科学家给三岁多的小朋友讲故事，故事里藏着几个新词，是一些怪东西的名字。一组孩子把同一个故事听三遍，另一组听三个不同的故事，新词听到的次数一样多。过了几天再考，听同一个故事的孩子记得牢；听不同故事的，几乎一个也没记住。",
      show: { kind: "steps", frames: [{ icon: "📕", label: "同一个故事听三遍" }, { icon: "📚", label: "三个不同故事" }, { icon: "🏆", label: "同一个记得牢" }] },
    },
    {
      nian: "听同一个故事反而记得牢？为什么呀？",
      dad: "科学家猜，故事熟了，你就不用再费劲记「后来发生什么」，省下的力气，正好用来注意新词、新东西。而且每听一遍，你注意到的可能都不一样：这次看车轮，下次看路边的树。",
    },
    {
      nian: "每听一遍都不一样？那爸爸讲错一个字，我怎么马上就听出来了？",
      dad: "因为故事已经牢牢住进你的脑子里了！研究故事的人早就发现，孩子听熟了的故事，大人念得不一样，他们会马上纠正。这说明你一直在跟着听，心里在对答案。",
    },
    {
      nian: "故事住进脑子里了，那我会不会一直只想听这一本？",
      dad: "大多不会。研究孩子读书的科学家说，这一阵会过去，有一天会有新的最爱。在那之前，我们每次换个玩法：这次你来接下一句，下次找找图里的小东西，也可以再找几本讲汽车的书。",
    },
    {
      nian: "我懂了！我爱听同一个故事，是因为猜得到、很安心，还能记住新词。我们每次换个玩法讲！",
      dad: "好！今晚你来讲前半本，爸爸来讲后半本，好不好？",
    },
  ],
  parentTip: "幼儿反复要求同一本书很常见。重复让孩子能预料情节，带来安心和掌控感；Horst 等的小样本实验发现，3 岁儿童反复听同一个故事，比听不同故事更能记住新词。可以顺着孩子读，每次换一个关注点：停下来让孩子接下一句、聊图画、联系生活，再慢慢提供同主题的新书。",
  sources: [
    {
      who: "Horst, Parsons & Bryan（2011）",
      title: "Get the Story Straight: Contextual Repetition Promotes Word Learning from Storybooks",
      url: "https://www.frontiersin.org/articles/10.3389/fpsyg.2011.00017/full",
      says: "3 岁孩子一周里听同一个故事三遍，比听三个不同故事更能记住新词，几天后还记得；新词次数两组一样。",
      limit: "只有 16 个英国孩子，用的是专门编的故事和新词。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Creating Positive Experiences for Toddlers & Preschool-Age Children",
      url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/Creating-Positive-Experiences-for-Toddlers-&-Preschool-Age-Children.aspx",
      says: "同一本书读很多遍，幼儿会学着预料后面发生什么，享受猜对的快乐；可预料的睡前程序让孩子安心。",
      limit: "是给家长的建议，不是专门研究重复读书的实验。",
    },
    {
      who: "Herbert & Duursma（2018），The Conversation",
      title: "There's a reason your child wants to read the same book over and over again",
      url: "https://theconversation.com/theres-a-reason-your-child-wants-to-read-the-same-book-over-and-over-again-105733",
      says: "发展心理学家介绍：重复让孩子更好地记住，每次能注意到不同的东西；这一阵会过去，会有新的最爱。",
      limit: "是科普文章，引用的研究多在实验室里做。",
    },
    {
      who: "ZERO TO THREE",
      title: "Read Early and Often",
      url: "https://www.zerotothree.org/resource/read-early-and-often/",
      says: "9–18 个月的幼儿可能有一本总要大人讲的书；可以在熟悉的句子前停一停，让孩子接下去。",
      limit: "是按年龄给的大致建议，每个孩子早晚不一样。",
    },
  ],
  story: "story-time",
};

export default record;
