// trigger 取自漫画书《小念是个破坏王》ideas.md「发生了什么」：十个月时扯断餐椅保护带、扯烂垫子扔掉
import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "throw-drop", name: "爱扔东西", icon: "🧸", category: "curious",
  age: { from: 8 },
  title: "为什么我小时候爱把东西扔到地上、拆开看？",
  trigger: "十个月的小念坐上新餐椅，没多久就把保护带扯断，又把垫子扯烂扔到了地上",
  dialogue: [
    {
      nian: "爸爸，我小时候把餐椅的带子扯断、垫子扯烂，还老把东西扔地上。我是不是破坏王？",
      dad: "不是破坏王，是个小科学家。那时候你不是想弄坏东西，是在做实验：扔下去会怎样？扯一扯会断吗？美国儿科学会说，八个月到一岁的宝宝扔呀、滚呀、摇呀，怎么都玩不腻，这是在弄明白东西是怎么回事。",
    },
    {
      nian: "做实验？可我那么小，又不懂科学？",
      dad: "不懂这两个字，也能做实验。科学家发现，很小的孩子就会像科学家一样：先在心里猜，再动手试，看结果对不对。东西扔下去，有的滚、有的弹，还有人「哎呀」一声去捡。每扔一次，你就多知道一点。",
    },
    {
      nian: "先在心里猜？那要是猜错了，会怎么样？",
      dad: "猜错了，反而最想弄明白！科学家给十一个月的宝宝看：小车滚下坡，前面有堵墙，小车却像穿墙过去了；或者小车被推出桌边，却没有掉下去。之后宝宝最想玩的就是这辆「怪」车：看它穿墙的，拿它使劲敲；看它不掉的，拿起来往下扔。",
      show: { kind: "steps", frames: [{ icon: "🚗", label: "小车穿过墙" }, { icon: "😮", label: "咦，不对呀" }, { icon: "🔨", label: "拿起来敲一敲" }] },
    },
    {
      nian: "拿起来往下扔，是在试它会不会掉？",
      dad: "科学家就是这么想的：宝宝在用自己的办法检查「它真的会掉吗」「它是硬的吗」。而且看见怪事以后，宝宝学这个东西的新本领也学得更好。所以你小时候扔了又扔、扯了又扯，很可能是在一遍遍检查：这东西到底是怎么回事。",
    },
    {
      nian: "那我现在还想把东西拆开看看，是不是不对？",
      dad: "想看看里面是什么，一点也没错，大人也会好奇呀。只是现在你有更多办法：问问题、看书、和爸爸一起拆个旧东西。要分清的是：有的东西拆了装不回去，有的会伤到人，比如插头和玻璃。",
    },
    {
      nian: "有的东西会伤到人？那我想拆的时候，要先怎么做？",
      dad: "先问一问大人：「这个能拆吗？」能拆的，我们一起拆，拆完一起装回去；不能拆的，换一样能玩的：扔软球、拆积木、往水里放东西看沉还是浮。好奇是好事，换个安全的地方用就行。",
      show: { kind: "steps", frames: [{ icon: "🙋", label: "先问能不能拆" }, { icon: "🧰", label: "一起拆一起装" }, { icon: "⚽", label: "换个安全玩法" }] },
    },
    {
      nian: "我懂了！我小时候扔东西、扯东西，是在做实验，想弄明白东西是怎么回事。现在想拆，先问爸爸！",
      dad: "对，小科学家！周末我们一起拆个旧玩具看看。",
    },
  ],
  parentTip: "这个阶段反复扔、敲、扯，研究上看是在探索因果和物体的性质。Stahl 和 Feigenson 发现，11 个月婴儿看到违反预期的事件后，会更多地探索那个物体，并做出和那种「意外」对应的检验动作。家里可以收好易碎、危险的东西，给可以扔、可以拆的替代品，大人捡东西时说说发生了什么。扔东西不等于故意捣乱，也不说明以后会怎样。",
  sources: [
    {
      who: "Stahl & Feigenson（2015）",
      title: "Observing the unexpected enhances infants' learning and exploration",
      url: "https://pubmed.ncbi.nlm.nih.gov/25838378/",
      says: "11 个月的宝宝看到小车穿墙或悬空不掉后，更爱探索它：穿墙的就敲，悬空的就扔，也更容易学会它的新本领。",
      limit: "是实验室里的短实验，不能说明在家每次扔东西都是在做检验。",
    },
    {
      who: "Gopnik（2012）",
      title: "Scientific Thinking in Young Children: Theoretical Advances, Empirical Research, and Policy Implications",
      url: "https://www.science.org/doi/10.1126/science.1223416",
      says: "综述：很小的孩子会根据看到的证据去猜、去试、去推断原因，学习方式很像科学家。",
      limit: "讲的是一类学习方式，不说明每个孩子在什么年纪会怎样做。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Cognitive Development in Infants: 8 to 12 Months",
      url: "https://www.healthychildren.org/English/ages-stages/baby/pages/Cognitive-Development-8-to-12-Months.aspx",
      says: "8–12 个月的宝宝爱扔、滚、摇东西，看它们会怎样，像小科学家一样观察；记得把危险物品收好。",
      limit: "说的是大致时间，每个宝宝早晚不一样。",
    },
  ],
  story: "broken-chair",
};

export default record;
