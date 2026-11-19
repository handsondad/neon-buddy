import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "peekaboo", name: "躲猫猫", icon: "🙈", category: "curious",
  age: { from: 6 },
  title: "为什么躲猫猫怎么玩都好笑？",
  trigger: "爸爸用手捂住脸，再一下子拿开说「喵！」，小时候的小念每次都咯咯笑个不停",
  dialogue: [
    {
      nian: "爸爸，妈妈说我小时候，你一捂脸再拿开，我就笑个不停。这到底有什么好笑的呀？",
      dad: "好笑的地方，藏在你的小脑袋里。脸一捂上，你心里在猜「爸爸还在后面」；手一拿开，真的是爸爸！猜对了，就开心得咯咯笑。很多宝宝从六个月左右起就爱玩这个，每个宝宝早晚不一样。",
    },
    {
      nian: "猜对了就笑？那更小的宝宝，不会猜爸爸还在吗？",
      dad: "以前的科学家以为，小宝宝觉得东西看不见就没了。后来有人想了个聪明的办法：在五个月大的宝宝面前藏一个盒子，再让一块板子像吊桥一样往后倒。板子本该被盒子挡住，却一直倒平了，像穿过了盒子。宝宝盯着看了好久，像在想：「不对呀，盒子呢？」",
      show: { kind: "steps", frames: [{ icon: "📦", label: "板子后藏着盒子" }, { icon: "🚪", label: "板子往后倒" }, { icon: "😮", label: "穿过去了？" }, { icon: "👀", label: "盯着看好久" }] },
    },
    {
      nian: "盯着看好久，就是说宝宝心里知道盒子还在？",
      dad: "科学家是这么猜的：宝宝觉得意外，才会多看。还有科学家专门研究躲猫猫：大人藏起来，偶尔偷偷换成另一个人出来，或者从另一边冒出来。六到八个月的宝宝就笑得少了，还常常挑起眉毛，像在吃惊。",
    },
    {
      nian: "换成另一个人出来就不好笑了？为什么呀？",
      dad: "因为那么小的宝宝，开心的是「我猜的真的发生了」：还是那个人，还在那个地方。科学家说，正是这种猜中，让躲猫猫那么好玩；那个年纪的宝宝，好像还不太喜欢被「骗」。所以一遍一遍玩，一遍一遍猜中，每次都开心。",
    },
    {
      nian: "躲猫猫那么好玩，那我现在长大了，玩捉迷藏为什么还那么开心？",
      dad: "爸爸猜，捉迷藏就像躲猫猫的大哥哥版：你知道我还在，可不知道我藏在哪儿，要自己去找。小时候猜的是「会不会出来」，现在猜的是「藏在哪里」。找到的那一下，心里还是那种「我猜对了」的开心。",
    },
    {
      nian: "大哥哥版？那我能跟小宝宝玩躲猫猫，让他也开心吗？",
      dad: "当然能！用一块软布盖住你的头，问「小念哥哥在哪儿？」再掀开；或者躲在门后，故意露出一只脚让他找。美国儿科学会说，换着花样玩，宝宝能玩很久都不腻。",
      show: { kind: "steps", frames: [{ icon: "🧣", label: "软布盖住头" }, { icon: "❓", label: "哥哥在哪儿？" }, { icon: "😄", label: "掀开：在这儿！" }] },
    },
    {
      nian: "我懂了！躲猫猫好笑，是因为宝宝心里知道人还在，一猜就猜中了。猜中了，就开心！",
      dad: "说得真好！下次你来藏，让小宝宝也猜中一回。",
    },
  ],
  parentTip: "半岁前后，宝宝越来越明白人和东西离开视线也还在（客体永存），躲猫猫正好让他一次次「猜中」。Baillargeon 等用「违反预期」的注视实验发现，5 个月婴儿可能已有这种预期，比皮亚杰认为的早。Parrott 和 Gleitman 发现，这个年纪的宝宝享受的是预期被证实，而不是被捉弄。可以多换花样、让宝宝主导；宝宝如果看起来受惊，就放慢一点。",
  sources: [
    {
      who: "Parrott & Gleitman（1989）",
      title: "Infants' Expectations in Play: The Joy of Peek-a-boo",
      url: "https://www.tandfonline.com/doi/abs/10.1080/02699938908412710",
      says: "躲猫猫里偶尔换个人或换个位置出来，6–8 个月的宝宝笑得更少、更常挑眉；猜中预期让游戏好玩。",
      limit: "只观察了几十个宝宝的笑和挑眉，不知道宝宝心里具体怎么想。",
    },
    {
      who: "Baillargeon, Spelke & Wasserman（1985）",
      title: "Object permanence in five-month-old infants",
      url: "https://infantcognition.web.illinois.edu/wp-content/uploads/2021/12/baillargeon_spelke_wasserman_1985-Object-permanence-in-5%E2%80%93month-old-infants.pdf",
      says: "板子像吊桥一样转过藏着的盒子所在的地方时，5 个月的宝宝看得更久，说明他们可能知道盒子还在。",
      limit: "多看一会儿只说明觉得意外，不等于宝宝像大人一样想明白了。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Cognitive Development in Infants: 8 to 12 Months",
      url: "https://www.healthychildren.org/English/ages-stages/baby/pages/Cognitive-Development-8-to-12-Months.aspx",
      says: "8 个月左右宝宝会掀开布找藏起来的玩具；多玩躲猫猫、换着花样玩，比如躲在门后露出一只脚。",
      limit: "说的是大致时间，每个宝宝早晚不一样。",
    },
  ],
};

export default record;
