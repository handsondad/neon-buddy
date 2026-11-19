import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "say-no", name: "老说不要", icon: "🙅", category: "me",
  age: { from: 18, to: 36 },
  title: "为什么我老爱说「不要」？",
  trigger: "妈妈问小念要不要洗手、要不要穿外套、要不要吃苹果，他一口气全答：「不要！」",
  dialogue: [
    {
      nian: "爸爸，我小时候不管问什么都说「不要」，是不是很不听话？",
      dad: "不是不听话。差不多一岁半起，很多孩子最爱说的就是「不要」。美国儿科医生说，这常常是孩子刚明白了一件新鲜事：我可以自己选！说「不」，就是在试这个新本领。",
    },
    {
      nian: "我可以自己选？那时候我真的明白这个吗？",
      dad: "在慢慢明白。也差不多在这个年纪，孩子认出镜子里的自己，开始说「我」「我的」。心里有了「我」，就发现：我和妈妈不是一个人，我想的可以和她不一样。说「不要」，就像在说：「我也有想法！」",
    },
    {
      nian: "心里有了「我」，可为什么有时候我明明想要，也说不要？",
      dad: "因为那时候，「不要」是一句万能的话，又短又响亮。你还不太会说「等一下」「我想换一个」，就先用「不要」顶上。所以有时候它不是真不要，意思是「我想自己决定」。",
    },
    {
      nian: "自己决定这么好，那我会一直什么都说不要吗？",
      dad: "不会，说「不」的方式会长大。科学家录下妈妈和孩子在家里的样子，从一岁半多一直看到五岁。小时候，孩子常常直接顶回去，或者装没听见；长大一点，就越来越会好好拒绝、讲理由、商量：「我玩完这一块再收，好不好？」",
      show: { kind: "steps", frames: [{ icon: "😤", label: "直接顶回去" }, { icon: "🙉", label: "装没听见" }, { icon: "🗣️", label: "讲理由" }, { icon: "🤝", label: "商量一下" }] },
    },
    {
      nian: "会商量就好了！那大人可以怎么问，我就不会老说不要？",
      dad: "有个小窍门：少问「要不要」，多给选择。比如不问「要不要穿外套」，而是问「穿红外套还是蓝外套？」选项别太多，两三个就好。不过安全的事，比如坐安全座椅，就没得商量，大人要温和又坚定。",
    },
    {
      nian: "我懂了！我老说「不要」，是因为发现自己也能拿主意。等我长大一点，就会讲理由、会商量了！",
      dad: "说得对！下次想说「不要」，试试说「我想要……」。",
    },
  ],
  parentTip: "1 岁半到 3 岁前后孩子频繁说「不」，美国儿科学会认为这是孩子刚理解「选择」和「自主」、自我意识在发展的正常表现。研究发现，随着年龄增长，直接对抗和不理不睬会减少，简单拒绝和协商会增多，这是社交本领在长。用「二选一」代替「要不要」；涉及安全时温和而坚定，不必事事争输赢。孩子开始讲理由、讨价还价时，认真回应他。",
  sources: [
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Your Checkup Checklist: 18 Months Old",
      url: "https://www.healthychildren.org/English/ages-stages/Your-Childs-Checkups/Pages/your-checkup-checklist-18-months-old.aspx",
      says: "18 个月孩子万能的「不！」，表达的是刚形成的选择和自主意识，看似反抗，其实是自我认同在发展的正常信号。",
      limit: "说「不」多少因人而异，不能据此判断孩子好坏。",
    },
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Emotional Development in Preschoolers",
      url: "https://www.healthychildren.org/English/ages-stages/preschool/Pages/Emotional-Development-in-Preschoolers.aspx",
      says: "尽量给孩子选择，但把选项缩到两三个；同时大人保持比较坚定的掌控，大事不交给孩子决定。",
      limit: "是育儿建议，不是对照实验得出的结论。",
    },
    {
      who: "Kuczynski 等（1989 年会议报告，1990 年发表）",
      title: "Development of Children's Noncompliance Strategies from Toddlerhood to Age 5",
      url: "https://files.eric.ed.gov/fulltext/ED306012.pdf",
      says: "录下 51 对母子在家的互动：从学步期到五岁，直接对抗和不理不睬减少，简单拒绝和协商增多。",
      limit: "样本小，部分妈妈有抑郁；看的是母子互动，不是所有场合。",
    },
    {
      who: "NCBI Bookshelf《Nursing Health Promotion》",
      title: "Nursing Care for Infancy Through Adolescence",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK615351/",
      says: "15–24 个月开始用「我」「我的」；随着自主性增长，孩子试探界限，常用「不」回答，可以把要求说成简单的选择。",
      limit: "是护理教材的概括，年龄是大致范围。",
    },
  ],
  story: "ning",
};

export default record;
