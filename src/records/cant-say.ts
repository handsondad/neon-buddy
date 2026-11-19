import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "cant-say", name: "说不出来", icon: "😣", category: "talk",
  age: { from: 18, to: 36 },
  title: "说不出来的时候，我为什么急得想哭？",
  trigger: "两岁的小念想要柜子上的小汽车，说不清，「嗯嗯」地指，爸爸拿错了，他哭着跺脚",
  dialogue: [
    {
      nian: "爸爸，我小时候想要东西又说不出来，就急得大哭。我是不是脾气特别坏？",
      dad: "不是脾气坏，是你心里装满了想说的话，嘴巴却还跟不上。想要的东西明明就在那儿，大人偏偏拿错，换谁都会急。一到三岁的孩子发脾气最多，过了三岁，大多会慢慢好起来。",
    },
    {
      nian: "嘴巴跟不上？那会说的话少，是不是就更容易急？",
      dad: "科学家确实发现了这种关系。他们问了两千位妈妈：孩子会说多少个词，多久发一次脾气。结果会说的词越少，大发脾气常常越多；两岁多还说得很少的孩子，脾气特别大的可能差不多多一倍。不过这只是「常常」，不是每个孩子都这样。",
    },
    {
      nian: "说得很少就脾气大？那为什么会说话了，就不那么急了？",
      dad: "因为话是一个好帮手。科学家让孩子等八分钟才能打开一个礼物，妈妈在旁边忙，从一岁半一直看到四岁。说话好、进步快的孩子，三岁时会好好地去找妈妈说，四岁时会自己找别的事想一想、玩一玩，到四岁生气得更少。",
      show: { kind: "steps", frames: [{ icon: "🎁", label: "礼物要等" }, { icon: "🗣️", label: "找妈妈说" }, { icon: "🧸", label: "找点别的玩" }, { icon: "😌", label: "没那么气了" }] },
    },
    {
      nian: "找妈妈说就不气了？那我小时候哭，是不是故意跟爸爸作对？",
      dad: "不是故意的。你特别想让爸爸明白，可试了一次又一次，爸爸还是猜错，那股着急就一下子冒出来。哭和跺脚，其实也在「说话」：我太着急了，快帮帮我。科学家也说，发脾气的原因不止一种，累了、饿了都会让人更容易急。",
    },
    {
      nian: "哭也是在说话？那我说不出来的时候，除了哭还能怎么办？",
      dad: "可以先用别的办法「说」：指一指、拉着大人去看、点头摇头，或者做个小手势。大人也可以帮你：先说出你的心情，「你很着急，想要那个」，再给你两个选择挑一挑：「是小汽车，还是小球？」",
      show: { kind: "steps", frames: [{ icon: "👉", label: "指一指" }, { icon: "💬", label: "大人说出心情" }, { icon: "✌️", label: "两个里挑一个" }] },
    },
    {
      nian: "两个选择真好！那要是一个小朋友一直说得很少呢？",
      dad: "每个孩子开口的早晚差别很大。不过要是两岁多了还说不到五十个词，也不会把两个词连起来说，就值得请医生看看，还有专门帮孩子练说话的老师。早点有人帮忙，孩子就能少着急一点。",
    },
    {
      nian: "我懂了！我小时候急得哭，是因为心里的话太多、嘴巴还跟不上。会说的话多了，我就能把着急说出来了！",
      dad: "说得对！下次着急了，先深吸一口气，说「爸爸，我很着急」。",
    },
  ],
  parentTip: "1–3 岁发脾气很常见，3 岁后多会好转。研究发现，会说的词较少的幼儿发脾气更频繁、更激烈；语言能力好、增长快的孩子到 4 岁更会求助和转移注意，愤怒更少。这些是相关，效应不大，原因不止一种。家里可以帮孩子说出感受、给两个选择、鼓励用手势。若 24–30 个月时会说的词少于 50 个、还不会两词连用，或发脾气频繁剧烈、伤人伤己，可以找儿科医生，必要时转介言语治疗师。",
  sources: [
    {
      who: "Manning 等（2019）",
      title: "Relations Between Toddler Expressive Language and Temper Tantrums in a Community Sample",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7946112/",
      says: "2001 位妈妈报告：会说的词越少，发脾气越频繁激烈；24–30 个月说话晚的孩子，严重发脾气的风险约是 1.96 倍。",
      limit: "一次性问卷、效应小，不能说明说话少是发脾气的唯一原因。",
    },
    {
      who: "Roben、Cole 和 Armstrong（2013）",
      title: "Longitudinal Relations Among Language Skills, Anger Expression, and Regulatory Strategies in Early Childhood",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3620964/",
      says: "追踪 120 名孩子从 18 到 48 个月：语言好、进步快的孩子，等礼物时更会找妈妈或转移注意，四岁时生气更少。",
      limit: "样本来自同一地区、背景相近的家庭；是相关，不能证明语言直接让人少生气。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Top Tips for Surviving Tantrums",
      url: "https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Temper-Tantrums.aspx",
      says: "发脾气是正常发展的一部分，1–3 岁最多，3 岁后多会好转；累了饿了更容易发，可以给小选择、转移注意。",
      limit: "是儿科医生的经验建议，不是对某个孩子的评估。",
    },
    {
      who: "美国疾病控制与预防中心 CDC",
      title: "Milestones by 15 Months",
      url: "https://www.cdc.gov/act-early/milestones/15-months.html",
      says: "建议大人说出孩子可能的感受，教孩子用指、挥手等简单手势「说」出想要什么。",
      limit: "是给家长的一般建议，不是诊断工具。",
    },
  ],
};

export default record;
