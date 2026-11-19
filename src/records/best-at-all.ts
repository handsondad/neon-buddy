import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "best-at-all", name: "我最厉害", icon: "🏆", category: "me",
  age: { from: 36, to: 96 },
  title: "为什么我觉得自己什么都最厉害？",
  trigger: "小念说自己能一口气记住十张卡片，结果只想起三张，下一轮又拍胸脯：「这回全记得！」",
  dialogue: [
    {
      nian: "爸爸，我总觉得自己什么都最厉害，是不是在吹牛？",
      dad: "不是吹牛，是很多小朋友都戴着的一副「玫瑰色眼镜」。三岁左右起，孩子看自己、看别人，常常先看到好的一面。科学家问幼儿园和一年级的孩子聪不聪明，大多数都说自己很聪明，和老师的看法也对不上。",
    },
    {
      nian: "和老师的看法对不上？那我是不是看不清自己？",
      dad: "那个年纪，是还看不太清，这很正常。有个实验给四五岁的小朋友看十张图片，先让他们猜自己能记住几张，再请他们说出来。小朋友常常猜得比记住的多。连着玩好几轮，还是猜多；就算刚说对了上一轮记住几张，下一轮照样猜多。",
      show: { kind: "steps", frames: [{ icon: "🖼️", label: "看十张图片" }, { icon: "🤔", label: "猜能记住几张" }, { icon: "🗣️", label: "说出记住的" }, { icon: "🔁", label: "下次还猜得多" }] },
    },
    {
      nian: "照样猜多？是因为我太想赢了吗？",
      dad: "不全是。科学家也这么想过，就让小朋友替另一个小朋友猜，结果还是猜得太多。所以不只是想赢，更像是小脑袋还不太会用上一次的结果，来调整这一次的想法。这个本领，要上学以后慢慢长。",
    },
    {
      nian: "本领慢慢长，那我觉得自己最厉害，是坏事吗？",
      dad: "很多科学家认为，这反而有好处。小朋友要学的本领太多了：走路、说话、拿筷子、写字……要是每次失败都觉得「我不行」，就不想再试了。觉得「我能行」，摔倒了才会爬起来再来一次。",
    },
    {
      nian: "摔倒了还爬起来再试，那我会一直觉得自己最厉害吗？",
      dad: "会慢慢变的。大概上小学二年级前后，孩子对自己的看法开始和实际情况对得上；到十岁左右，什么都往好处看的样子会少一些。你会发现：有的事你很拿手，有的事还要多练，这也很好。",
    },
    {
      nian: "有的事还要多练，那别人说我没那么厉害，我怎么办？",
      dad: "可以先想想：我上次是怎么做的？哪里还能更好？大人也不用急着戳破你的「最厉害」，可以陪你一起看看真实的结果，比如真的数一数记住了几张，再问你：「下次想试试什么办法？」",
    },
    {
      nian: "我懂了！我觉得自己最厉害，是戴着玫瑰色眼镜，它让我敢一直试。长大一点，我会更看清自己哪里还要练！",
      dad: "说得好！下次猜之前，我们先数数上次记住了几张。",
    },
  ],
  parentTip: "学前儿童普遍高估自己的能力，这种「积极偏差」约 3 岁出现，幼儿园到一年级的自评常和老师评价对不上，二年级起才渐趋准确，10–11 岁明显减弱。有观点认为，这种乐观帮助幼儿在不断失败中坚持练习；但它也容易被贬低的评价削弱。不必急着纠正，可以和孩子一起看真实结果、讨论下次的办法，而不是评判「你没那么好」。",
  sources: [
    {
      who: "Boseovski（2010）",
      title: "Evidence for “Rose-Colored Glasses”: An Examination of the Positivity Bias in Young Children's Personality Judgments",
      url: "https://doi.org/10.1111/j.1750-8606.2010.00149.x",
      says: "幼儿看自己和别人偏向积极：约 3 岁出现，幼儿园和一年级自评很高、和老师评价无关，二年级才渐渐对得上。",
      limit: "是综述；也有一部分孩子并不这样看。",
    },
    {
      who: "Lipko、Dunlosky & Merriman（2009）",
      title: "Persistent overconfidence despite practice: The role of task experience in preschoolers' recall predictions",
      url: "https://doi.org/10.1016/j.jecp.2008.10.002",
      says: "学前儿童看 10 张图后预测能记住几张，连续多轮都猜得太多；替别的孩子猜也一样。",
      limit: "只测了记图片这一件事，不说明别的事上也一样。",
    },
    {
      who: "Thompson（2002）",
      title: "The Roots of School Readiness in Social and Emotional Development",
      url: "https://sedlpubs.faculty.ucdavis.edu/wp-content/uploads/sites/192/2015/04/Thompson2002Kauffman.pdf",
      says: "学前儿童天生乐观，刚失败也相信再努力就能成功；但这份自信容易被贬低、不在意的评价削弱。",
      limit: "是研究综述，不是单个实验。",
    },
  ],
};

export default record;
