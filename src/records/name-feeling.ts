import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "name-feeling", name: "说出生气", icon: "💬", category: "feel",
  age: { from: 24 },
  title: "为什么把「我很生气」说出来，就好一点？",
  trigger: "小念气得直跺脚，爸爸蹲下来问他怎么了，他大喊「我很生气！」，喊完慢慢不跺了",
  dialogue: [
    {
      nian: "爸爸，我刚才大喊「我很生气」，喊完就没那么气了。这是为什么？",
      dad: "可能是因为你给心里那团乱糟糟的感觉起了个名字。有了名字，它就不再是一团说不清的东西，你知道「哦，这是生气」，好像就把它抓住了一点。而且你一说，爸爸马上就听懂了你。",
    },
    {
      nian: "起个名字就能抓住它？科学家试过吗？",
      dad: "试过。科学家请三十个大人躺进能看见大脑在忙什么的机器里，看一张张带表情的脸。有时给脸挑一个感觉词，比如「生气」「害怕」；有时只给脸挑一个名字。挑感觉词的时候，大脑里管「警报」的地方，响得没那么厉害。",
      show: { kind: "steps", frames: [{ icon: "😠", label: "看到生气的脸" }, { icon: "🏷️", label: "挑「生气」这个词" }, { icon: "🔔", label: "警报小一点" }] },
    },
    {
      nian: "警报小一点？可那是大人，我们小孩说出来也管用吗？",
      dad: "那个实验是大人做的。还有个实验也是大人：怕蜘蛛的人一边靠近大蜘蛛，一边说「我好害怕」。一星期后再见到别的蜘蛛，他们手心出汗比别的组少，虽然自己觉得还是一样怕。小孩是不是也这样，科学家还在研究，爸爸猜差不多。",
    },
    {
      nian: "手心出汗少一点？那我是从什么时候开始会说「我生气」的？",
      dad: "很早！很多孩子差不多两岁，就开始用感觉词说自己。两岁多一点，一大半孩子会说「开心」「害怕」「生气」。从四岁到十一岁，认识的感觉词差不多每两年就翻一倍，从「生气」学到「委屈」「失望」「着急」。",
    },
    {
      nian: "那我说了「我生气」以后，是不是想扔东西也可以扔？",
      dad: "不可以。感觉都可以有，也都可以说；可做的事有规矩，扔东西会伤人、弄坏东西。说出来是第一步，接着想办法：跺跺脚、捏捏枕头、走开一会儿，或者告诉大人是什么事让你生气。",
    },
    {
      nian: "告诉大人以后，大人会怎么帮我呢？",
      dad: "有位科学家观察了一些家庭，发现有的爸爸妈妈像「心情教练」：先留意到你的小情绪，不说「这有什么好气的」；帮你找到词，比如「你很失望，因为积木倒了」；再和你一起想办法，也讲清哪些事不能做。这样的家庭里，孩子好像更会让自己平静。",
      show: { kind: "steps", frames: [{ icon: "👀", label: "留意到情绪" }, { icon: "🤝", label: "接住不笑话" }, { icon: "🏷️", label: "帮你找到词" }, { icon: "🧩", label: "一起想办法" }] },
    },
    {
      nian: "我懂了！把感觉说出来，心里那团乱糟糟就有了名字，警报会小一点。说完再想办法，不乱扔东西！",
      dad: "说得真好！以后你说「我生气」，爸爸就蹲下来好好听。",
    },
  ],
  parentTip: "情绪标注（affect labeling）在成人研究中能减弱杏仁核对情绪面孔的反应，也能减少怕蜘蛛的成人一周后的生理反应，但儿童证据还少。孩子约 2 岁开始用情绪词，4–11 岁情绪词汇快速增长。戈特曼提出的「情绪教练」：觉察孩子的情绪，把它当作亲近和教导的机会，接纳，帮忙命名，在设限的同时一起解决问题。如果孩子很难用任何方式表达需要、语言发展让你担心，或情绪爆发常伤人，可以找儿科医生。",
  sources: [
    {
      who: "Lieberman 等（2007）",
      title: "Putting Feelings Into Words: Affect Labeling Disrupts Amygdala Activity in Response to Affective Stimuli",
      url: "https://pubmed.ncbi.nlm.nih.gov/17576282/",
      says: "30 个成人看带表情的脸：给脸选感觉词时，大脑里情绪警报区的反应比给脸选名字时弱。",
      limit: "只测了成人的脑成像，不说明孩子说出来马上就不气。",
    },
    {
      who: "Kircanski、Lieberman & Craske（2012）",
      title: "Feelings Into Words: Contributions of Language to Exposure Therapy",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4721564/",
      says: "怕蜘蛛的成人靠近蜘蛛时说出感受，一周后皮肤出汗反应比其他组低，但自己说的害怕没有差别。",
      limit: "对象是成人，样本小，只看了怕蜘蛛。",
    },
    {
      who: "Gottman、Katz & Hooven（1996）",
      title: "Parental Meta-Emotion Philosophy and the Emotional Life of Families: Theoretical Models and Preliminary Data",
      url: "https://www.johngottman.net/wp-content/uploads/2011/05/Parental-meta-emotion-philosophy-and-the-emotional-life-of-families-Theoretical-models-and-preliminary-data.pdf",
      says: "提出「情绪教练」五要素：觉察、当成亲近机会、接纳、帮孩子命名、设限并一起解决；与孩子调节情绪的能力有关。",
      limit: "是初步的相关研究，不能证明是教练方式带来的改变。",
    },
    {
      who: "Baron-Cohen 等（2010）",
      title: "Emotion Word Comprehension from 4 to 16 Years Old: A Developmental Survey",
      url: "https://www.frontiersin.org/journals/evolutionary-neuroscience/articles/10.3389/fnevo.2010.00109/full",
      says: "4–11 岁认识的情绪词约每两年翻一倍；文中引用的研究说，28 个月时六成多孩子会用开心、害怕、生气。",
      limit: "是英语词汇调查、靠家长报告，不能直接套到中文。",
    },
  ],
};

export default record;
