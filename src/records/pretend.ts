import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "pretend", name: "假装游戏", icon: "🍌", category: "curious",
  age: { from: 18 },
  title: "为什么我会把香蕉当电话，还会有想象的朋友？",
  trigger: "小念把一根香蕉贴在耳朵上「喂？」地打起电话，还说沙发上坐着一个谁也看不见的好朋友",
  dialogue: [
    {
      nian: "爸爸，我会把香蕉当电话，还跟看不见的朋友说话。我是不是分不清真的假的？",
      dad: "你分得清。科学家说，孩子假装的时候，心里其实知道真实是什么样：香蕉还是香蕉，只是你玩的时候把它当电话。这种假装游戏常常一岁到一岁半就开始了，先是把一样东西当成另一样，三到五岁玩得最多，世界各地的孩子都会。",
    },
    {
      nian: "假装游戏一岁就开始了？那么小，怎么知道妈妈是在假装？",
      dad: "科学家也好奇这个。他们请妈妈和一岁半的宝宝一起「吃点心」：一次真的吃，一次假装吃。结果妈妈假装的时候，笑得更多、笑得更久，也更常看着宝宝。宝宝很可能就是看着这些笑，慢慢明白了「这是在玩」。",
      show: { kind: "steps", frames: [{ icon: "🥣", label: "妈妈假装吃" }, { icon: "😄", label: "笑得又多又久" }, { icon: "👶", label: "宝宝：这是玩！" }] },
    },
    {
      nian: "看着笑就明白了？那我那个看不见的朋友，也是在玩吗？",
      dad: "是的，那也是一种想象游戏。有科学家问了一百个六七岁的孩子，发现到七岁时，大约三个孩子里有两个有过想象的朋友：有看不见的小孩，有小狗、松鼠，还有一只七英寸高的大象。男孩和女孩一样多，很平常。",
    },
    {
      nian: "想象的朋友很平常？那我上了小学，还会有吗？",
      dad: "有可能。以前大家以为上小学就没了，结果研究发现，六七岁的孩子玩想象的朋友，和三四岁时一样多，只是朋友常常换成新的。假装游戏平均要到十一岁左右才慢慢不玩，有的大人演戏，其实也是一种假装。",
    },
    {
      nian: "换成新的朋友，好好玩！那假装游戏会让我变聪明吗？",
      dad: "说实话，科学家还不确定。有一组科学家把几十年的研究都看了一遍，发现很多说法证据不够：假装游戏也许有帮助，也许只是孩子爱玩、大人爱陪的时候顺带发生的。不过有一点很清楚：它好玩，而且是你自己想出来的。",
    },
    {
      nian: "它好玩，那爸爸可以和我一起假装吗？",
      dad: "当然可以！你当司机，爸爸当乘客；你说香蕉是电话，爸爸就接起来「喂」。你的想象朋友来吃饭，爸爸也跟他打个招呼。你来当导演，爸爸照着演。",
    },
    {
      nian: "我懂了！我把香蕉当电话、有想象的朋友，是在玩假装游戏。我心里知道是假装，玩起来可开心了！",
      dad: "对！今晚就请你的想象朋友，也一起来听故事吧。",
    },
  ],
  parentTip: "假装游戏多在 12–18 个月从以物代物开始，3–5 岁最丰富；想象伙伴在学龄儿童中也很常见，男孩女孩都有。Lillard 等 2013 年的综述认为，现有证据不足以说明假装游戏对语言、创造力等有独特的因果作用。所以不必把它当成「练能力」的任务，顺着孩子玩、做个好观众就好。如果孩子的想象内容一直让他害怕，或影响日常生活，可以和儿科医生聊聊。",
  sources: [
    {
      who: "Lillard 等（2013）",
      title: "The impact of pretend play on children's development: A review of the evidence",
      url: "https://doi.org/10.1037/a0029321",
      says: "综述几十年研究：没有足够证据说明假装游戏对语言、创造力、社交等发展有独特的、关键的作用。",
      limit: "不是说假装游戏没用，而是现有研究还说不清它的作用。",
    },
    {
      who: "Lillard（2017）",
      title: "Why Do the Children (Pretend) Play?",
      url: "https://doi.org/10.1016/j.tics.2017.08.001",
      says: "假装游戏常在 12–18 个月从以物代物开始，3–5 岁最盛，平均约 11 岁停止；各种文化里都有。",
      limit: "是一篇观点文章，假装游戏到底有什么用，还没有定论。",
    },
    {
      who: "Lillard & Witherington（2004）",
      title: "Mothers' Behavior Modifications During Pretense and Their Possible Signal Value for Toddlers",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3334333/",
      says: "妈妈和 18 个月宝宝假装吃点心时，比真吃时笑得更多更久、更常看宝宝，这些可能帮宝宝认出「这是假装」。",
      limit: "只说明妈妈的笑可能是信号，不能证明宝宝就是靠它分辨的。",
    },
    {
      who: "华盛顿大学新闻（2004），介绍 Taylor 等的研究",
      title: "Two-thirds of school-age children have an imaginary companion by age 7",
      url: "https://www.washington.edu/news/2004/12/06/two-thirds-of-school-age-children-have-an-imaginary-companion-by-age-7/",
      says: "追踪 100 个孩子：到 7 岁约 65% 有过想象的朋友，学龄儿童和学龄前一样常见，7 岁时男孩女孩一样多。",
      limit: "是美国一个地区的孩子，算不算想象朋友，取决于研究者的标准。",
    },
  ],
};

export default record;
