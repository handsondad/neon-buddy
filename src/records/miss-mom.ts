import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "miss-mom", name: "妈妈别走", icon: "👋", category: "others",
  age: { from: 8, to: 36 },
  title: "妈妈一出门，我为什么就哭得停不下来？",
  trigger: "妈妈穿上外套要去上班，小念一把抱住她的腿，哭着不让走",
  dialogue: [
    {
      nian: "爸爸，妈妈一出门我就哭，我是不是太没用了？",
      dad: "一点也不是。妈妈要走你就哭，是因为你心里认准了妈妈是最重要、最能保护你的人。这种「舍不得」，说明你们之间连着一根很结实的绳子。差不多每个小宝宝，从八九个月大起都会这样。",
    },
    {
      nian: "为什么是八九个月大才开始？更小的时候不哭吗？",
      dad: "更小的时候，妈妈一离开眼前，你就像忘了她一样。到了八九个月，你的小脑袋明白了一件大事：东西看不见了，也还在。所以你知道妈妈是去了别的地方，可你还不懂「待会儿」是多久，就怕她不回来了。",
      show: { kind: "steps", frames: [{ icon: "👀", label: "看见妈妈" }, { icon: "🚪", label: "妈妈出门了" }, { icon: "🤔", label: "她还在别处" }, { icon: "😭", label: "她还回来吗？" }] },
    },
    {
      nian: "不懂待会儿是多久，那妈妈回来了，我怎么就知道了？",
      dad: "靠一次一次地等到。妈妈说「吃完午饭就回来」，然后真的回来了；下一次你就更相信一点。科学家说，大多数孩子一岁到一岁半哭得最厉害，后来越来越好，三岁左右大多就不太哭了。",
    },
    {
      nian: "那为什么我累了、生病了，又会哭得更厉害？",
      dad: "因为累了、饿了、不舒服的时候，人心里那个「我能行」会变小，就更想紧紧挨着最信任的人。大人也一样，爸爸生病时也想有人陪。这不是变回小宝宝了，是身体在说：我需要多一点安心。",
    },
    {
      nian: "需要安心的时候，妈妈偷偷溜走是不是就不会哭了？",
      dad: "偷偷溜走，你回头一看人没了，会更害怕，下次连妈妈去厨房都要盯着。好办法是好好说再见：抱一抱，告诉你什么时候回来，然后笑着走，说到做到。回来时再大大地抱一下。",
      show: { kind: "steps", frames: [{ icon: "🤗", label: "抱一抱" }, { icon: "🕛", label: "说好几点回" }, { icon: "👋", label: "笑着说再见" }, { icon: "🏠", label: "说到做到" }] },
    },
    {
      nian: "我懂了！我哭，是因为妈妈对我太重要，又还不懂「待会儿」。妈妈每次说到做到，我就越来越放心了！",
      dad: "说得对！下次舍不得，就跟妈妈拉个钩：「你几点回来？」",
    },
  ],
  parentTip: "分离焦虑多在 8–9 个月出现，10–18 个月最明显，3 岁左右大多减轻，孩子之间差别很大。累、饿、生病时更重。固定简短的告别仪式、说清何时回来并守时，比偷偷离开好。如果到了上学年龄仍极度害怕分开，影响吃睡和上学，可以和儿科医生聊聊。",
  sources: [
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Social and Emotional Development: 9 Months Old",
      url: "https://www.healthychildren.org/English/ages-stages/baby/Pages/Emotional-and-Social-Development-8-12-Months.aspx",
      says: "九个月前后，宝宝明白人和东西离开视线也还在，又认准了最亲的人，于是开始怕分开；多在 10–18 个月最明显。",
      limit: "说的是大多数孩子的大致时间，早一点、晚一点或几乎不哭都常见。",
    },
    {
      who: "费城儿童医院",
      title: "Separation Anxiety",
      url: "https://www.chop.edu/conditions-diseases/separation-anxiety",
      says: "小宝宝还不懂时间，以为离开的人就不回来了；分离焦虑是正常发展的一部分，通常到三岁左右结束。",
      limit: "哭得厉害不说明依恋好或不好，也不说明以后会怎样。",
    },
  ],
};

export default record;
