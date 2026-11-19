import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "smell-first", name: "先闻一闻", icon: "👃", category: "me",
  age: { from: 18, to: 72 },
  title: "吃新东西，我为什么要先闻一闻、不敢吃？",
  trigger: "桌上第一次出现芦笋，小念凑过去闻了又闻，筷子举了半天，还是放下了",
  dialogue: [
    {
      nian: "爸爸，碰到没吃过的东西，我总要先闻一闻，还不敢吃，是不是太挑食了？",
      dad: "这不叫挑食。科学家给它起了个名字，意思是「怕吃新东西」。差不多一岁半到两岁起，很多孩子都会这样，两岁到六岁最明显。先闻一闻、看一看，是身体里一个很古老的保护本领在工作。",
    },
    {
      nian: "保护本领？它要保护我什么？",
      dad: "保护你别乱吃东西。很久很久以前，小孩一会走路，就能自己摸到野果、野草，有的有毒。所以很多科学家认为，人慢慢有了这样的本领：没见过的食物，先别急着吃。苦味的东西，小宝宝一生下来就不爱。",
    },
    {
      nian: "先别急着吃，所以我才先闻一闻、看一看？",
      dad: "对！科学家发现，怕吃新东西的孩子，常常还没尝就决定了：看着不像平常吃的、闻着怪怪的，就推开。绿色的蔬菜常常第一个被推开。可是一旦尝了一口，觉得还不错，这份害怕就会变小。",
      show: { kind: "steps", frames: [{ icon: "👀", label: "看一看" }, { icon: "👃", label: "闻一闻" }, { icon: "👅", label: "舔一小口" }, { icon: "😋", label: "原来还不错" }] },
    },
    {
      nian: "尝一口害怕就变小，那要尝多少次才会喜欢？",
      dad: "常常要好多次。英国科学家请爸爸妈妈每天给孩子尝一小口他不爱吃的蔬菜，连着十四天。后来这些孩子比没尝的孩子更喜欢这种菜，也吃得更多。科学家估计，有的食物要尝上十几次，才会被孩子接受。",
    },
    {
      nian: "要尝十几次！那大人逼我吃，是不是就快一点？",
      dad: "逼着吃反而会慢。被逼的时候心里害怕、难受，这种不舒服会跟着那道菜一起被记住，下次更不想吃。好办法是：每次只放一小口在盘子里，旁边有你爱吃的菜；你可以先看、先闻、先舔一舔，这些都算试过了。",
    },
    {
      nian: "闻一闻也算试过了？那我以后都会这么怕吗？",
      dad: "不会一直这么怕。孩子吃过、见过的东西越来越多，新东西就越来越少，害怕也会慢慢变小。不过每个人都有自己不爱吃的东西，大人也一样，这很正常。",
    },
    {
      nian: "我懂了！我先闻一闻，是身体在保护我。多看、多闻、多尝几小口，新东西就会变成老朋友！",
      dad: "说得好！明天的新菜，我们先比赛谁闻出的味道多。",
    },
  ],
  parentTip: "食物新恐惧（food neophobia）常在 18–24 个月出现，2–6 岁最明显，之后逐渐减弱。孩子多半凭看和闻就拒绝；一次不错的品尝会降低恐惧，有的食物要尝 10–15 次以上才接受。每天给一小口，和熟悉的食物放在一起，允许只看、只闻、只舔，不逼也不哄。如果孩子能吃的食物种类特别少，或生长发育让你担心，可以和儿科医生聊聊。",
  sources: [
    {
      who: "Dovey 等（2008）",
      title: "Food neophobia and 'picky/fussy' eating in children: A review",
      url: "https://www.sciencedirect.com/science/article/pii/S0195666307003716",
      says: "怕吃新食物多在 2–6 岁最明显，被认为是避免误食有毒东西的本能；孩子常凭外观就拒绝；可能要约 15 次好的尝试才接受。",
      limit: "是综述，「15 次」只有有限数据支持，每个孩子不同。",
    },
    {
      who: "Wardle 等（2003）",
      title: "Increasing children's acceptance of vegetables; a randomized trial of parent-led exposure",
      url: "https://pubmed.ncbi.nlm.nih.gov/12781165/",
      says: "156 个 2–6 岁孩子的家长每天给孩子尝一口不爱吃的蔬菜，连续 14 天后，孩子更喜欢它、也吃得更多。",
      limit: "只看了一种蔬菜和短期效果，不说明以后会一直爱吃。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Taste, Touch, Explore: Make Nutritious Food Fun for Young Eaters",
      url: "https://www.healthychildren.org/English/healthy-living/nutrition/Pages/taste-touch-explore-make-nutritious-food-fun-for-young-eaters.aspx",
      says: "新食物可能要接触 13 次以上才被接受；放在盘里、摸一摸、闻一闻、舔一舔都算「试一试」。",
      limit: "是育儿建议，次数是大致的。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "How do I help my picky eater try more healthy foods?",
      url: "https://www.healthychildren.org/english/tips-tools/ask-the-pediatrician/pages/how-do-i-help-my-picky-eater-try-more-foods.aspx",
      says: "很多孩子在 18 个月到 2 岁间开始不喜欢陌生食物；不要逼，也不要另做饭，继续一小份一小份地提供。",
      limit: "是儿科医生的建议文章，不是专门的研究。",
    },
  ],
  story: "smell-first",
};

export default record;
