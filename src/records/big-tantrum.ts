import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "big-tantrum", name: "大发脾气", icon: "🌋", category: "feel",
  age: { from: 12, to: 48 },
  title: "为什么我会突然大发脾气，自己都停不下来？",
  trigger: "积木塔倒了，小念把积木一扔，躺在地上又踢又叫，谁劝都不听",
  dialogue: [
    {
      nian: "爸爸，我刚才躺在地上又踢又叫，自己都停不下来，我是不是坏孩子？",
      dad: "不是坏孩子。发脾气是心里的火一下子太大了，不是你故意捣乱。一两岁到三四岁的小朋友，差不多都会这样，有的多一点，有的少一点。连你自己都停不下来，是因为那股火来得又快又猛。",
    },
    {
      nian: "那股火为什么来得那么快？我心里到底发生了什么？",
      dad: "科学家请三百多个爸爸妈妈，把孩子发脾气的经过仔细写下来。他们发现里面藏着两种心情：一种是生气，一开头就冲到最高，又踢又叫；一种是伤心，慢慢多起来，哭着想要人抱。所以发到后来，你其实是在找安慰。",
      show: { kind: "steps", frames: [{ icon: "😠", label: "生气冲到最高" }, { icon: "😭", label: "慢慢变成伤心" }, { icon: "🤗", label: "想要人抱" }] },
    },
    {
      nian: "生气冲到最高的时候，为什么大人跟我讲道理，我一句也听不进去？",
      dad: "爸爸猜，是因为脑袋里管「停一停、想一想」的那个刹车，还在慢慢长。火冲上来时，刹车踩不住，道理也进不了耳朵。科学家说，这个刹车三到五岁长得特别快，要一直长到你长成大人。等火小一点，再讲道理才听得进。",
    },
    {
      nian: "刹车还在长，那我是不是会一直这样乱发脾气？",
      dad: "大多数孩子两三岁时发得最多，三岁以后慢慢变少，因为会说的话越来越多，能把「我不要」「我生气」说出来，就不用全靠踢和叫了。那个研究也发现，又踢又打的大火，年纪越大越少见。每个孩子早晚不一样。",
    },
    {
      nian: "大火越来越少，那我发脾气的时候，大人是不是不理我就好了？",
      dad: "大人不用跟你吵，也不会你一哭就什么都答应，不然你会以为发脾气才管用。好办法是：先保证安全，不让你打人、扔东西；在旁边静静等那股火过去，再抱抱你，说说刚才怎么了。累了饿了最容易发火，所以先让你吃饱睡好。",
      show: { kind: "steps", frames: [{ icon: "🛟", label: "先保证安全" }, { icon: "⏳", label: "等火过去" }, { icon: "🤗", label: "抱抱再说" }] },
    },
    {
      nian: "那股火过去以后，我自己能学点什么？",
      dad: "可以学着把火说出来：「我生气了！」「我想自己搭！」说出来，比踢和叫更快让人懂你。快要发火时，还可以跺跺脚、抱紧小熊、来爸爸这儿要个抱抱。爸爸生气时也会先深呼吸，做给你看。",
    },
    {
      nian: "我懂了！我发脾气不是因为我坏，是生气一下子太大，脑袋里的刹车还没长好。发到后来，我其实是想要人抱。",
      dad: "说得对！下次火冲上来，就喊一声「我生气了」，爸爸马上来。",
    },
  ],
  parentTip: "发脾气多从 1 岁多开始，2～3 岁最多，3 岁以后渐少。研究发现生气在开头最猛、随后下降，哭和求安慰逐渐增多，四分之三在 5 分钟内结束；抑制冲动等执行功能 3～5 岁进步最快。发作时先保证安全，不争吵也不一哭就让步，平静后帮孩子说出感受，保证吃饱睡好。如果 4 岁后仍越来越多、单次超过 15 分钟、一天好几次、伤人伤己或憋气晕厥，请找儿科医生。",
  sources: [
    {
      who: "Potegal & Davidson（2003）",
      title: "Temper Tantrums in Young Children: 1. Behavioral Composition",
      url: "https://pubmed.ncbi.nlm.nih.gov/12806225/",
      says: "分析 335 个 18–60 个月孩子发脾气的家长记录：里面有生气和伤心两种成分；最猛烈的生气随年龄减少。",
      limit: "靠家长事后写下的经过，样本多是美国中产家庭。",
    },
    {
      who: "Potegal、Kosorok & Davidson（2003）",
      title: "Temper Tantrums in Young Children: 2. Tantrum Duration and Temporal Organization",
      url: "https://pubmed.ncbi.nlm.nih.gov/12806226/",
      says: "四分之三的脾气在 5 分钟内结束；生气在开头最高、随后下降，哭和找人安慰慢慢增多。",
      limit: "说的是平均规律，不能说明某一次为什么发、该怎么办。",
    },
    {
      who: "哈佛大学儿童发展中心",
      title: "Building the Brain's 「Air Traffic Control」 System: How Early Experiences Shape the Development of Executive Function",
      url: "https://developingchild.harvard.edu/wp-content/uploads/2024/10/How-Early-Experiences-Shape-the-Development-of-Executive-Function.pdf",
      says: "管住冲动、记住规则、转换想法的本领出生后就开始长，3–5 岁进步特别大，一直长到青少年和成年早期。",
      limit: "讲的是一般发展，不能用来判断某个孩子快还是慢。",
    },
    {
      who: "克利夫兰医学中心",
      title: "Temper Tantrums",
      url: "https://my.clevelandclinic.org/health/articles/14406-temper-tantrums",
      says: "发脾气多在 1–4 岁，常因还说不出感受；4 岁后加重、超过 15 分钟、伤人伤己或憋气晕厥要找医生。",
      limit: "是科普页面，就医信号只是提醒，不是诊断标准。",
    },
  ],
};

export default record;
