import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "baby-memory", name: "小时候的事", icon: "📷", category: "curious",
  age: { from: 36 },
  title: "为什么我记不得自己小时候的事？",
  trigger: "翻到一张自己一岁时坐在餐椅上吃饭的照片，小念怎么想也想不起那天的事",
  dialogue: [
    {
      nian: "爸爸，照片里的我在吃饭，可我一点也想不起来。我是不是记性不好？",
      dad: "不是记性不好，大家都这样。几乎每个大人都想不起自己很小很小时候的事，科学家管这叫「童年失忆」。很多大人能想起的最早的事，大约在三岁前后，每个人早晚不一样。",
    },
    {
      nian: "童年失忆？那是不是我小时候根本就没记住？",
      dad: "以前很多人这么想，可新的研究不一样。科学家让宝宝躺在一台大机器里看图片，同时看他脑子里管记事的地方忙不忙。过一会儿，再把这张图和一张新图放在一起。看第一眼时那里越忙，宝宝后来越会多看这张旧图，像在说：「我见过！」一岁以上的宝宝最明显。",
      show: { kind: "steps", frames: [{ icon: "🖼️", label: "先看一张图" }, { icon: "🧠", label: "记事的地方在忙" }, { icon: "👀", label: "再见到时多看" }] },
    },
    {
      nian: "我见过，那就是记住了？那后来怎么又忘了？",
      dad: "这正是科学家还在找答案的地方。他们猜，宝宝的记忆也许存下了，只是后来找不到「打开它的钥匙」；也可能没存多久就淡了。还有科学家跟踪了一群孩子：三岁时和妈妈聊过的事，五到七岁时还能想起六成多，到八九岁就只剩不到四成。",
    },
    {
      nian: "八九岁就只剩不到四成？那我现在记得的事，以后也会忘吗？",
      dad: "有一些会慢慢淡掉，这很正常，大人也一样。那个研究还发现一件有意思的事：年纪大一点的孩子，想起来的事少了，可想起来的那些，讲得更完整、更详细。",
    },
    {
      nian: "想起来的少了，那我小时候学会的本领，也忘了吗？",
      dad: "没有！走路、说话、认得爸爸妈妈，这些本领都好好地留着。记不起的是「哪一天发生了什么」这样一件一件的事。科学家说，宝宝很早就很会从生活里找规律，这对学说话、认东西特别要紧。",
    },
    {
      nian: "这些本领都留着，那怎么才能把小时候的事多记住一点？",
      dad: "有个办法：常常和大人一起聊过去的事。科学家发现，三岁时，妈妈聊天时常把话头交给孩子，比如问「你还记得什么？」，这些孩子过了几年，讲起那些事说得更多。我们可以一起翻照片，你来讲讲那天。",
      show: { kind: "steps", frames: [{ icon: "📷", label: "一起翻照片" }, { icon: "🗣️", label: "聊聊那一天" }, { icon: "🙋", label: "你来讲一讲" }] },
    },
    {
      nian: "我懂了！小时候的事可能不是没记住，是后来找不到了。本领都还在，常常聊一聊，就能多讲出一些！",
      dad: "说得好！今晚我们就翻翻照片，你先讲一张。",
    },
  ],
  parentTip: "童年失忆指成人很难回忆约 3 岁以前的具体经历。Bauer 和 Larkina 追踪发现，3 岁时的经历，5–7 岁还记得六成以上，8–9 岁降到四成以下。Yates 等 2025 年用清醒婴儿脑成像发现，1 岁以上婴儿的海马体已能编码单次经历，遗忘可能更多是后来提取不到，但样本小，还需验证。多和孩子细致地聊过去、把话头交给孩子，孩子以后讲得更多。",
  sources: [
    {
      who: "Bauer & Larkina（2014）",
      title: "The onset of childhood amnesia in childhood: A prospective investigation of the course and determinants of forgetting of early-life events",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4025992/",
      says: "3 岁时和妈妈聊过的事，5–7 岁还记得六成以上，8–9 岁不到四成；妈妈把话头交给孩子，孩子后来讲得更多。",
      limit: "只有 83 个美国孩子，不说明哪件事会被记住、哪件会忘。",
    },
    {
      who: "Yates 等（2025）",
      title: "Hippocampal encoding of memories in human infants",
      url: "https://www.science.org/doi/10.1126/science.adt7570",
      says: "26 个清醒宝宝做脑成像：看新图时海马越活跃，之后越会多看这张旧图，1 岁以上的宝宝最明显。",
      limit: "样本小，测的是很短时间里的认出，不知道这些记忆能留多久。",
    },
    {
      who: "耶鲁大学新闻（2025）",
      title: "Why don't we remember being a baby? New study provides clues",
      url: "https://news.yale.edu/2025/03/20/why-dont-we-remember-being-baby-new-study-provides-clues",
      says: "宝宝一岁前后已能存下单个经历；记不得可能是后来提取不到；更早的找规律式学习对学说话很重要。",
      limit: "「存下了只是找不到」还是研究者的推测，没有定论。",
    },
  ],
};

export default record;
