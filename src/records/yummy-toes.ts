import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "yummy-toes", name: "啃脚丫", icon: "🦶", category: "me",
  age: { from: 4, to: 9 },
  title: "我小时候为什么爱啃自己的脚丫？",
  trigger: "小念翻到自己小时候的照片：躺在床上，两只手抱着脚，把大脚趾塞进嘴里啃",
  dialogue: [
    {
      nian: "爸爸，我小时候老把脚丫塞进嘴里啃，是不是又脏又傻？",
      dad: "一点也不傻，你那是在做一件大事：认识自己的身体。四到七个月大时，很多宝宝躺着就能抓住自己的脚，往嘴里送。你在发现：咦，这个会动的东西，原来长在我身上！",
    },
    {
      nian: "原来长在我身上？我那时候不知道脚是我的吗？",
      dad: "大概知道一点，还不太清楚。脚离眼睛最远，手要先学会伸、学会抓，才够得着它。抓住以后，手摸到脚，脚也觉得被摸；放进嘴里，嘴碰到脚，脚也觉得被碰。这种两边一起有感觉的事，只有碰自己才会发生。",
      show: { kind: "steps", frames: [{ icon: "✋", label: "手抓住脚" }, { icon: "👄", label: "放进嘴里" }, { icon: "🦶", label: "脚也有感觉" }, { icon: "💡", label: "这是我的！" }] },
    },
    {
      nian: "两边都有感觉，科学家怎么知道宝宝分得出来？",
      dad: "有科学家专门看刚出生的宝宝。别人用手指碰宝宝脸蛋，他常会转过头、张开嘴去找，像在找奶吃；可宝宝自己的小手碰到脸蛋时，他就很少这样。说明刚出生，宝宝就分得出「我碰我」和「别人碰我」。",
    },
    {
      nian: "刚出生就知道，那为什么要到几个月大才啃脚？",
      dad: "因为本领要一样一样长。两三个月起，宝宝就爱摸自己的身体，听自己咿咿呀呀；四个月左右，手更灵活了，抓到什么都往嘴里送；等腿能抬高、手能够到，脚丫也就被抓住了。",
    },
    {
      nian: "身体摸一遍，我就更认识自己了吗？",
      dad: "是的。有个实验让三到五个月大的宝宝看电视里自己的两条腿：一个画面和平常一样，另一个左右反过来。宝宝会盯着反过来的那个看得更久，踢得更多，好像在想：「这跟我感觉到的不一样！」说明他已经记住自己的腿是怎么动的。",
    },
    {
      nian: "那大人看到宝宝啃脚，要不要拦住他？",
      dad: "不用拦，这是宝宝自己的探险。大人要做的是：让他有时间躺在安全的地方光着脚玩，脚丫洗干净，指甲剪短；身边别放能塞进嘴、会噎着的小东西，因为这时候宝宝抓到什么都会往嘴里送。",
    },
    {
      nian: "我懂了！小时候啃脚丫，是我在用手和嘴巴认识自己的身体，发现脚原来是我的！",
      dad: "对！你现在闭上眼睛摸摸鼻子、拍拍膝盖，也是在跟身体打招呼。",
    },
  ],
  parentTip: "4–7 个月的宝宝常抓脚、啃脚，这是认识身体的正常探索。研究发现，新生儿就能区分自己碰自己和别人碰自己，两三个月起会主动探索自己的身体。给宝宝留出躺着、趴着、光脚玩的时间，保持手脚清洁，移开能放进嘴里的小物件。对宝宝的动作发育有担心时，和儿科医生聊聊。",
  sources: [
    {
      who: "美国儿科学会 HealthyChildren.org",
      title: "Movement Milestones: Babies 4 to 7 Months",
      url: "https://www.healthychildren.org/English/ages-stages/baby/Pages/Movement-4-to-7-Months.aspx",
      says: "四到七个月，宝宝的手更灵活，躺着能抓住脚和脚趾送进嘴里，借此发现身体的新感觉；要移开能噎着的东西。",
      limit: "是大致时间；不啃脚的宝宝也很常见，不说明什么。",
    },
    {
      who: "Rochat & Hespos（1997）",
      title: "Differential rooting response by neonates: evidence for an early sense of self",
      url: "https://doi.org/10.1002/(SICI)1099-0917(199709/12)6:3/4%3C105::AID-EDP150%3E3.0.CO;2-U",
      says: "新生儿被别人手指碰脸颊时，比自己的手碰到时更常转头张嘴；说明一出生就能分出自己和外界的触碰。",
      limit: "只看了 5 个新生儿和 11 个一月龄宝宝，样本很小。",
    },
    {
      who: "Rochat & Morgan（1995）",
      title: "Spatial determinants in the perception of self-produced leg movements in 3- to 5-month-old infants",
      url: "https://doi.org/10.1037/0012-1649.31.4.626",
      says: "3–5 个月宝宝同时看两幅自己腿的实时画面，盯着左右颠倒的那幅看得更久、踢得更多。",
      limit: "看得久说明分得出差别，不等于宝宝已经想到「这是我」。",
    },
    {
      who: "Rochat（1998）",
      title: "Self-perception and action in infancy",
      url: "https://doi.org/10.1007/s002210050550",
      says: "两三个月起，宝宝主动摸自己的身体、发出声音，探索自己的动作带来的感觉，这可能是最早的自我感。",
      limit: "是综述加推测，「最早的自我感」没法直接测量。",
    },
  ],
  story: "yummy-toes",
};

export default record;
