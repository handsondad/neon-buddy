import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "dreams", name: "做梦", icon: "🌙", category: "curious",
  age: { from: 36 },
  title: "为什么我会做梦，梦里的事是真的吗？",
  trigger: "小念半夜醒来，说梦见一只大怪兽在追他，抱着爸爸不肯松手",
  dialogue: [
    {
      nian: "爸爸，我梦见大怪兽追我，吓醒了。梦里的怪兽是真的吗？",
      dad: "不是真的，你现在很安全，爸爸就在这儿。梦是睡着的时候，脑子里自己编出来的画面和故事，像在心里放了一场电影。怪兽只在电影里，房间里没有。有研究问过四到六岁的小朋友，差不多四个里有三个说做过吓人的梦。",
    },
    {
      nian: "像在心里放电影？那为什么醒了，我还觉得那么真？",
      dad: "因为梦里的东西是假的，可你心里的害怕是真的，所以醒来还会怕一会儿。这时候抱一抱、说说话，告诉自己「那是梦，我在自己床上」，害怕就会慢慢走开。",
    },
    {
      nian: "害怕慢慢走开，可是三岁的小孩，分得清梦和真的吗？",
      dad: "大多分得清！科学家给三四岁的小朋友讲故事：一个孩子梦见一样东西，另一个孩子手里真的拿着这样东西。再问：「梦里的能摸到吗？别人能看见吗？」大多数孩子都知道：梦里的摸不着，别人也看不见，还能梦见世上没有的东西。",
      show: { kind: "steps", frames: [{ icon: "💭", label: "梦里的东西" }, { icon: "✋", label: "摸不着" }, { icon: "🙈", label: "别人看不见" }] },
    },
    {
      nian: "别人看不见？那睡在一个房间的两个人，会做一样的梦吗？",
      dad: "不会，每个人的梦都是自己的。有意思的是，那个实验里不少三岁的小朋友以为会：有个孩子说，他和兄弟睡一个房间，两个人都梦见家里的猫。到了四岁，大多数孩子就知道梦是各做各的了。",
    },
    {
      nian: "梦是各做各的，那我为什么偏偏梦见怪兽？",
      dad: "人为什么做梦，科学家还在研究。不过医生们发现，噩梦常常和年纪有关：学走路的小朋友常梦见和爸爸妈妈分开，上幼儿园的孩子常梦见怪兽和黑暗，上了小学会梦见真实的危险。白天看了、听了吓人的东西，比如吓人的动画，也可能做噩梦。",
    },
    {
      nian: "看了吓人的动画会做噩梦？那怎么才能少做噩梦？",
      dad: "有几个好办法：睡前不看吓人的东西，聊聊今天开心的事；房门可以开着，抱着喜欢的小熊睡。半夜吓醒了就叫爸爸，抱一抱，再回自己床上睡。第二天白天，我们再把这个梦讲一讲。",
      show: { kind: "steps", frames: [{ icon: "📺", label: "睡前不看吓人的" }, { icon: "🧸", label: "抱着小熊睡" }, { icon: "🗣️", label: "白天讲讲梦" }] },
    },
    {
      nian: "我懂了！梦是睡着时脑子里放的电影，怪兽是假的，害怕是真的。吓醒了就叫爸爸抱一抱！",
      dad: "对！爸爸随时在。今晚睡前，我们先聊聊今天最开心的事。",
    },
  ],
  parentTip: "3–4 岁的孩子大多已知道梦不是实物、别人看不见，但不少 3 岁孩子以为同屋的人会做同一个梦。噩梦在学龄前很常见，内容常和年龄阶段有关。醒来先安抚，白天再聊；睡前避开吓人的影像，保持放松、规律的睡前程序。夜惊不同：孩子没真正醒来，叫不应，事后不记得，不要强行叫醒。噩梦越来越频繁、影响白天，或 6 岁后仍常做、和可怕的经历有关，请咨询医生。",
  sources: [
    {
      who: "Woolley & Wellman（1992）",
      title: "Children's conceptions of dreams",
      url: "https://deepblue.lib.umich.edu/items/d3c46def-5145-4b38-9abe-57d9d08ffcc8",
      says: "3–4 岁孩子知道梦里的东西摸不着、别人看不见，也可以是编的；但不少 3 岁孩子以为同屋的人做同一个梦。",
      limit: "只有 32 个孩子，听的是故事里的问题，不等于半夜醒来时也分得清。",
    },
    {
      who: "Sándor, Szakadát & Bódizs（2014）",
      title: "Ontogeny of dreaming: A review of empirical studies",
      url: "https://semmelweis.hu/psychophysiology/2015/12/26/ontogeny-of-dreaming-a-review-of-empirical-studies-with-supplementary-information/",
      says: "综述儿童做梦研究：方法不同结果差别大；噩梦的结果较一致，一项调查里 74% 的 4–6 岁孩子说做过吓人的梦。",
      limit: "孩子的梦怎样随年龄变化，研究者还没有一致的结论。",
    },
    {
      who: "约翰斯·霍普金斯医学",
      title: "Nightmares and Night Terrors",
      url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/nightmares-and-night-terrors",
      says: "噩梦内容常和年龄有关：学步儿梦见分离，学龄前梦见怪兽和黑暗；建议安抚、白天聊梦、少看吓人节目。",
      limit: "是医院的科普建议，不是对某个孩子的诊断。",
    },
    {
      who: "英国国家医疗服务体系 NHS",
      title: "Night terrors and nightmares",
      url: "https://www.nhs.uk/conditions/night-terrors/",
      says: "很多孩子会做噩梦、有夜惊，大多会自己好；6 岁后仍常做噩梦，或和可怕的经历有关，可以看医生。",
      limit: "是英国的就医建议，各地看医生的做法可能不同。",
    },
  ],
};

export default record;
