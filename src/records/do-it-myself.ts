import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "do-it-myself", name: "我自己来", icon: "🙋", category: "me",
  age: { from: 18, to: 36 },
  title: "为什么我什么都想自己来，穿反了也不让帮？",
  trigger: "小念把裤子穿反了，妈妈伸手要帮，他一把推开，坐在地上自己脱了又穿",
  dialogue: [
    {
      nian: "爸爸，我小时候裤子穿反了也不让妈妈帮，是不是太倔了？",
      dad: "不是倔，是你心里长出了一个很重要的愿望：我想自己来！差不多一岁多到三岁，很多孩子都这样，吃饭要自己拿勺，鞋子要自己穿。你是在练习当自己的小主人。",
    },
    {
      nian: "当自己的小主人，为什么那么重要？",
      dad: "有位心理学家叫埃里克森，他说一到三岁的孩子在学一门功课：「我能自己做主」。被允许试，孩子慢慢觉得「我行」；老被拦着、被笑话，就容易怀疑自己，不敢再试。后来的科学家也发现，人心里都想觉得自己有本事、能自己选。",
    },
    {
      nian: "觉得自己有本事？可我穿反了呀，那不是没本事吗？",
      dad: "穿反了，正是本事在长的样子。你得先记住哪边是前、哪边是后，再一次次试。科学家发现，一岁多的宝宝看见大人试了好几次才成功，轮到自己做难事时，也会多试好几次。所以穿反了不丢人，多试几次就是在长本事。",
      show: { kind: "steps", frames: [{ icon: "👀", label: "看大人试了又试" }, { icon: "🔁", label: "自己多试几次" }, { icon: "💪", label: "本事长出来" }] },
    },
    {
      nian: "多试几次是好，可为什么别人一帮我，我就那么生气？",
      dad: "因为你正在做的事，突然被人拿走了。就像拼图只差最后一块，别人一下替你拼上。你气的不是被帮，是「我自己的机会没了」。所以那个年纪的孩子，常常坚持「我自己来」，把伸过来的手推开。",
    },
    {
      nian: "机会被拿走才生气，那大人什么时候可以帮我？",
      dad: "有危险的时候，比如过马路、碰热水，大人一定要管。别的时候，可以先问一句：「你想自己来，还是要帮忙？」或者让你在两件衣服里挑一件。大人放手让你试，再说说你哪里做得好，你会越来越有信心。",
      show: { kind: "steps", frames: [{ icon: "⚠️", label: "危险时大人管" }, { icon: "🙋", label: "问：自己来吗？" }, { icon: "👕", label: "两件里挑一件" }] },
    },
    {
      nian: "我懂了！我想自己来，是在练当自己的小主人。穿反了也没关系，多试几次，本事就长出来了！",
      dad: "对！下次想自己来，就说「让我试三次，不行再请你帮忙」。",
    },
  ],
  parentTip: "约 1–3 岁的孩子坚持「我自己来」，是自主性发展的正常表现：埃里克森称之为「自主对羞怯怀疑」阶段，自我决定理论认为人天生需要胜任感和自主感。只要安全，尽量留出时间让孩子试，给两三个选项，具体地说出孩子的努力；危险的事坚决由大人来。大人示范「试了又试」，也可能让孩子更坚持。赶时间的早上，可以早点起床，给孩子留出自己来的时间。",
  sources: [
    {
      who: "NCBI Bookshelf《Nursing Health Promotion》",
      title: "Nursing Care for Infancy Through Adolescence",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK615351/",
      says: "按埃里克森的理论，学步儿在学「自主」：自己做事带来自豪；限制太多或被羞辱，容易怀疑自己。可以给简单的选择。",
      limit: "埃里克森的阶段是理论，年龄划分是大致的。",
    },
    {
      who: "Ryan & Deci（2000）",
      title: "Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being",
      url: "https://doi.org/10.1037/0003-066X.55.1.68",
      says: "人天生有三种心理需要：觉得自己有本事、能自己做主、和别人连在一起；被满足时更有内在动力。",
      limit: "主要研究大孩子和成人，不是专门讲学步儿。",
    },
    {
      who: "Leonard, Lee & Schulz（2017）",
      title: "Infants make more attempts to achieve a goal when they see adults persist",
      url: "https://www.science.org/doi/10.1126/science.aan2317",
      says: "15 个月左右的宝宝看大人反复尝试才成功，之后玩一个新的难玩具时，按按钮的次数更多。",
      limit: "测的是实验室里一次任务的坚持，不说明长期会怎样。",
    },
    {
      who: "Thompson（2002）",
      title: "The Roots of School Readiness in Social and Emotional Development",
      url: "https://sedlpubs.faculty.ucdavis.edu/wp-content/uploads/sites/192/2015/04/Thompson2002Kauffman.pdf",
      says: "两三岁时孩子坚持「我自己来」、拒绝帮助，也开始有自豪和难为情；大人的评价会影响孩子怎么看自己。",
      limit: "是研究综述，不是单个实验。",
    },
  ],
  story: "do-it-myself",
};

export default record;
