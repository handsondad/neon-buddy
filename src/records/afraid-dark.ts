import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "afraid-dark", name: "床底怪兽", icon: "🌙", category: "feel",
  age: { from: 36 },
  title: "我为什么怕黑，总觉得床底下有怪兽？",
  trigger: "关灯以后，小念把被子拉到下巴，说床底下有声音，一定要爸爸开着灯",
  dialogue: [
    {
      nian: "爸爸，我一关灯就怕床底下有怪兽，我是不是胆小鬼？",
      dad: "不是胆小鬼。晚上害怕的小朋友多得很：科学家问过一百七十多个四到十二岁的孩子，七成多都说晚上躺在床上会害怕。最常怕的是坏人、怪兽、噩梦和奇怪的声音。你有这种害怕，一点也不稀奇。",
    },
    {
      nian: "怪兽又不是真的，为什么那么多孩子晚上还会怕？",
      dad: "因为你的想象力长大了。科学家请四岁、六岁的孩子想象一个盒子里有怪兽。孩子们都说知道是假装的，可还是对那个盒子又怕又好奇，好多孩子后来承认：「我在想，它会不会真在里面。」想象出来的东西，也能让心里当真。",
      show: { kind: "steps", frames: [{ icon: "📦", label: "一个盒子" }, { icon: "💭", label: "想象有怪兽" }, { icon: "😨", label: "又怕又想看" }, { icon: "🤔", label: "会不会是真的？" }] },
    },
    {
      nian: "想象出来的也会当真？那为什么一关灯，想象就更厉害？",
      dad: "爸爸猜，是因为黑了看不清，一点声音、一团影子，脑袋就忙着自己补画面，一补就补成了怪兽。白天什么都看得清清楚楚，想象没地方钻。还有，那个研究里，大多数孩子说，他们的害怕是从电视和别人讲的事里听来的。",
    },
    {
      nian: "电视里听来的也算？那我再长大一点，就不怕了吗？",
      dad: "不一定，怕的东西会换。那个研究发现，四到六岁有一半多孩子晚上会怕，七到九岁反而更多；小时候多怕噩梦，大一点更怕坏人。另一个研究问了八到十六岁的孩子，十三岁以上的大孩子，也有差不多一半会怕。",
    },
    {
      nian: "大孩子也会怕？那爸爸妈妈知道我们晚上怕吗？",
      dad: "常常不知道！那个研究也问了爸爸妈妈，他们以为晚上会怕的孩子，比孩子自己说的少了一半多。好多孩子没说出来。所以你说出来特别好，说了，爸爸才知道怎么帮你，爸爸也不会笑话你。",
    },
    {
      nian: "我说出来以后，怎么把怪兽赶走呢？",
      dad: "孩子们自己试过很多办法：找爸爸妈妈、抱紧小熊、想点别的事、主动去看一看。研究发现，躲着不敢看最不管用；主动去看一看，比如开灯一起检查床底下，孩子们觉得最有用。再开一盏小夜灯，睡前不看吓人的东西。",
      show: { kind: "steps", frames: [{ icon: "💡", label: "开灯" }, { icon: "🔦", label: "一起看床底" }, { icon: "🧸", label: "抱紧小熊" }, { icon: "🌙", label: "留盏小夜灯" }] },
    },
    {
      nian: "我懂了！我怕黑，是因为我的想象力很厉害，黑里会补出怪兽。很多孩子都怕，说出来，再一起去看一看，就没那么怕了。",
      dad: "对！今晚咱们拿上手电筒，一起去床底下侦察一下。",
    },
  ],
  parentTip: "夜间恐惧很普遍：一项 4–12 岁的研究里 73% 的孩子说晚上害怕，7–9 岁最多，而家长明显低估。3–4 岁孩子常把陌生影像想成「怪兽」，也常分不清想象和现实。认真听、别嘲笑，白天聊一聊，睡前少看吓人的内容；陪孩子主动查看、开小夜灯，比回避更有帮助。如果害怕严重到长期睡不着、白天也一直担心或影响上学，可以找儿科医生或心理专业人员。",
  sources: [
    {
      who: "Muris 等（2001）",
      title: "Children's nighttime fears: parent–child ratings of frequency, content, origins, coping behaviors and severity",
      url: "https://pubmed.ncbi.nlm.nih.gov/11125721/",
      says: "176 个 4–12 岁孩子里 73% 晚上会怕，7–9 岁最多；多说害怕来自电视等信息；家长明显低估；主动查看比躲避更有用。",
      limit: "荷兰的小样本、靠访谈，「有用」是孩子自己说的。",
    },
    {
      who: "Gordon 等（2007）",
      title: "Nighttime fears of children and adolescents: Frequency, content, severity, harm expectations, disclosure, and coping behaviours",
      url: "https://doi.org/10.1016/j.brat.2007.03.013",
      says: "511 个 8–16 岁的孩子里近三分之二晚上会怕：8–12 岁约 79%，13–16 岁约 49%；最常怕有人闯进家。",
      limit: "澳大利亚学校样本，没有包括更小的孩子。",
    },
    {
      who: "Harris 等（1991）",
      title: "Monsters, ghosts and witches: Testing the limits of the fantasy–reality distinction in young children",
      url: "https://doi.org/10.1111/j.2044-835X.1991.tb00865.x",
      says: "4、6 岁孩子分得清真东西和想象，可想象盒子里有怪兽后，会对盒子又怕又好奇，常承认想过它是不是真在里面。",
      limit: "是实验室里的假装游戏，不等于晚上害怕的全部原因。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Developmental Milestones: 3 to 4 Year Olds",
      url: "https://www.healthychildren.org/English/ages-stages/preschool/Pages/Developmental-Milestones-3-to-4-Year-Olds.aspx",
      says: "3–4 岁孩子常把陌生的影像想成「怪兽」，也常分不清想象和现实。",
      limit: "是大致的发展参考，不是每个孩子都在这时开始怕。",
    },
  ],
};

export default record;
