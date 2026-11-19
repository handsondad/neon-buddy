import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "knew-but", name: "知道还要做", icon: "🪑", category: "control",
  age: { from: 36, to: 72 },
  title: "妈妈说会摔，我为什么还要做？",
  trigger: "妈妈说「别蹬桌子，会摔的」，小念嘴上答应，脚还是把椅子蹬得翘起来",
  dialogue: [
    {
      nian: "爸爸，妈妈说会摔，我也知道，可我还是想蹬，我是不是故意不听话？",
      dad: "爸爸不觉得你是故意的。「知道」和「做到」，在小孩心里是两件事，中间还隔着一段路。脑子里记住了规矩，手脚却被好玩的事拉着走。科学家专门研究过这件事，发现三岁左右的孩子常常这样，一点也不奇怪。",
    },
    {
      nian: "科学家是怎么研究知道和做到的？",
      dad: "他们拿出一叠卡片，上面有蓝色的小卡车、红色的星星。先让孩子按颜色分，孩子分得很好。然后说：「现在换个玩法，按形状分。」大多数三岁孩子还是照老规矩按颜色分。可你问他「按形状分，卡车放哪边？」，他能指对！",
      show: { kind: "steps", frames: [{ icon: "🎨", label: "先按颜色分" }, { icon: "🔄", label: "换成按形状" }, { icon: "👉", label: "新规矩能指对" }, { icon: "🃏", label: "手还按老的分" }] },
    },
    {
      nian: "能指对，手还按老规矩分？为什么会这样？",
      dad: "科学家说，刚才一直做的事，会把注意力牢牢粘住，像车开得正快，不好马上拐弯。有个办法很灵：让三岁孩子每分一张，先大声说出「形状」，大多数就能分对了。三到五岁这几年，这个拐弯的本事长得特别快，到五岁，多数孩子都能换过来。",
    },
    {
      nian: "大声说出来就能分对？那妈妈说会摔，我也大声说一遍有用吗？",
      dad: "可能有点用，爸爸不敢保证。卡片游戏在安静的房间里，蹬椅子可好玩多了，拉着你的劲更大。还有科学家问过四到六岁的孩子家里有哪些安全规矩，提醒一下，他们大多都知道；可是受不受伤，跟知不知道关系不大，跟守不守规矩、有没有大人看着关系更大。",
    },
    {
      nian: "有没有大人看着关系更大？那我是不是要一直有人管？",
      dad: "不是一直管，是你还在练的时候，大人先帮你当一会儿「刹车」。好比学骑车，开始有人扶着，后来慢慢松手。危险的事，大人会先拦一下，再清楚地告诉你该怎么做，比如「让椅子腿都放在地上」，比光说「别蹬」更容易做到。",
    },
    {
      nian: "比光说「别蹬」更容易做到，那我自己能做什么？",
      dad: "你可以试试给自己当个小提醒：想蹬之前先停一下，小声说一遍「椅子腿着地」，就像分卡片时大声说「形状」那样。要是没忍住，也别急着说自己不行，想想下次哪一步可以先停下来。",
    },
    {
      nian: "我明白了！知道和做到中间隔着一段路。我可以先停一下，把规矩说出来，大人也会帮我当刹车。",
      dad: "说得真好！下次吃饭前，咱们一起说：「四条腿，都着地！」",
    },
  ],
  parentTip: "Zelazo 等用维度变化卡片分类（DCCS）发现，多数三岁孩子能说出新规则，却仍按旧规则分，五岁左右大多能转换；让孩子每次说出规则能帮助转换（Kirkham 等）。这属于执行功能里抑制和灵活转换的发展。Morrongiello 等发现，4–6 岁孩子知不知道安全规则并不预测受伤，遵守程度和大人看护才相关。危险的事靠看护和环境兜底，给明确的「该怎么做」，而不只是说「别」。",
  sources: [
    {
      who: "Zelazo、Frye & Rapus（1996）",
      title: "An age-related dissociation between knowing rules and using them",
      url: "https://experts.umn.edu/en/publications/an-age-related-dissociation-between-knowing-rules-and-using-them-2/",
      says: "换成新规则后，多数三岁孩子仍按旧规则分卡片，可问起新规则时能指对位置；只练一次旧规则也会这样。",
      limit: "是实验室里的卡片游戏，不能直接说明孩子在家为什么不听。",
    },
    {
      who: "Kirkham、Cruess & Diamond（2003）",
      title: "Helping children apply their knowledge to their behavior on a dimension-switching task",
      url: "https://onlinelibrary.wiley.com/doi/10.1111/1467-7687.00300",
      says: "让三岁孩子每分一张先说出按什么分，大多数就能换过来；作者认为难点是注意力被旧规则「粘住」。",
      limit: "只测了卡片游戏，大声说规矩在家里管不管用还不知道。",
    },
    {
      who: "Morrongiello、Midgett & Shields（2001）",
      title: "Don't Run With Scissors: Young Children's Knowledge of Home Safety Rules",
      url: "https://pubmed.ncbi.nlm.nih.gov/11181886/",
      says: "4–6岁孩子经提示能认出约九成家里的安全规则，但知道多少不预测受伤；守不守规则和大人看护才相关。",
      limit: "受伤和看护都靠家长报告，是相关不是因果。",
    },
    {
      who: "美国疾病控制与预防中心（CDC）",
      title: "Tips for Giving Directions",
      url: "https://www.cdc.gov/parenting-toddlers/directions/good-directions.html",
      says: "告诉孩子该做什么，不只说「别」：孩子把椅子往后翘时，可以说「请让椅子好好待在地上」。",
      limit: "是给家长的做法建议，不保证孩子每次都照做。",
    },
  ],
  story: "high-chair",
};

export default record;
