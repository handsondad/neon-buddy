import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "shy-blush", name: "害羞脸红", icon: "😳", category: "me",
  age: { from: 18 },
  title: "被大家看着，我为什么会害羞、脸红？",
  trigger: "过年时亲戚们围着让小念唱首歌，大家都看着他，他脸一下红了，躲到爸爸身后",
  dialogue: [
    {
      nian: "爸爸，大家一看着我，我就脸红想躲，是不是我胆子太小了？",
      dad: "不是胆子小。被很多眼睛看着时觉得不好意思，几乎人人都有，连大人上台讲话、被人当众夸奖时也常这样。这种难为情说明，你心里很在乎别人怎么看你。",
    },
    {
      nian: "在乎别人怎么看我，那更小的宝宝也会害羞吗？",
      dad: "很小的宝宝还不会。科学家先用红点实验，看哪些一两岁的孩子已经认得镜子里的自己，再让他们照镜子、被大人盯着看。结果发现，会露出害羞样子的，大多是已经认出自己的孩子；还没认出的，很少这样。",
      show: { kind: "steps", frames: [{ icon: "🔴", label: "红点认出自己" }, { icon: "👀", label: "被大家盯着看" }, { icon: "😳", label: "害羞躲一躲" }] },
    },
    {
      nian: "认出自己才会害羞，为什么？",
      dad: "因为害羞要先有一个「我」。你得知道「大家看的是我」，才会觉得「哎呀，我被看着」。所以害羞是心里长大的标志，差不多一岁半到两岁冒出来。到两岁半、三岁，孩子开始知道做得好不好，又多了骄傲和惭愧。",
    },
    {
      nian: "害羞的时候，我的脸为什么会变红、变热？",
      dad: "害羞时，脸上的血一下子多了，脸就红、就热。有个实验请三岁半到五岁的小朋友唱一首歌，再看自己唱歌的录像，脸颊上贴着小小的温度计。旁边有人一起看的时候，脸颊比一个人看时热得更多一点。",
    },
    {
      nian: "旁边有人看就更热，那脸红是不是很丢人？",
      dad: "一点也不丢人。科学家发现，有的孩子害羞时会一边躲开眼睛、一边偷偷笑，这种「害羞的笑」说明他又难为情、又想参加。这样的孩子，脸红得厉害，也不一定是在害怕。还有研究发现，人们看到别人脸红，常会觉得他更可信。",
    },
    {
      nian: "我又难为情又想参加，那我可以怎么办？",
      dad: "想躲一下没关系，可以先站在爸爸身边，等脸没那么热了再说。也可以先挥挥手、点点头，不一定马上唱歌。大人也别逼你表演，更不用当着大家说你「害羞」。你准备好了，自己决定要不要上场。",
    },
    {
      nian: "我懂了！害羞是因为我知道「大家在看我」，脸红说明我在乎。准备好了，我再上场！",
      dad: "说得好！下次先跟大家挥挥手，就算你的第一步。",
    },
  ],
  parentTip: "尴尬、害羞这类「自我意识情绪」，通常在孩子能认出镜中自己（约 15–24 个月）之后出现；2 岁半到 3 岁再出现骄傲、羞愧等和对错标准有关的情绪。被注视时脸红是正常反应；研究中，害羞时带着微笑的孩子，脸红多少和社交焦虑没有关系。别逼孩子当众表演，也别给他贴「害羞」标签，给他时间和退路。如果孩子因为怕被看而长期不敢上学、不敢和人说话，可以找儿科医生或心理专业人员聊聊。",
  sources: [
    {
      who: "Lewis 等（1989）",
      title: "Self development and self-conscious emotions",
      url: "https://pubmed.ncbi.nlm.nih.gov/2702864/",
      says: "先用红点镜子实验分出认得自己和不认得自己的孩子；结果尴尬和认出自己有关，怕生则无关。",
      limit: "两个研究共七十来个孩子，是相关，不能说明谁导致谁。",
    },
    {
      who: "Michael Lewis",
      title: "Early emotional development",
      url: "https://local.psy.miami.edu/faculty/dmessinger/c_c/rsrcs/rdgs/emot/EarlyEmotionalDevelopment.pdf",
      says: "被看、被指、被夸会引起「暴露的尴尬」，在有了自我意识后出现；两岁半到三岁才有和标准有关的羞愧、骄傲。",
      limit: "是作者的发展模型，年龄只是大致范围。",
    },
    {
      who: "Riddell 等（2025）",
      title: "Putting the Social in Emotions: The Effect of Audience Presence on Pride and Embarrassment Across Ontogeny",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12087427/",
      says: "3.5–5 岁、8–10 岁孩子和成人看自己唱歌的录像时，有观众在场比独自看时脸颊升温更多。",
      limit: "升温差别很小，实验室情境和家里不完全一样。",
    },
    {
      who: "Nikolić 等（2016）",
      title: "Blushing in early childhood: Feeling coy or socially anxious?",
      url: "https://doi.org/10.1037/emo0000131",
      says: "4 岁半孩子当众唱歌时测脸红；常带着「害羞的笑」的孩子，脸红多少和社交焦虑无关。",
      limit: "只测了一种场合，不能用脸红多少判断孩子将来怎样。",
    },
  ],
};

export default record;
