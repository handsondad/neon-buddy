import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "call-no-hear", name: "叫我听不见", icon: "👂", category: "control",
  age: { from: 24 },
  title: "我一玩起来，为什么听不见妈妈叫我？",
  trigger: "小念在搭积木，妈妈在厨房喊了三遍「吃饭啦」，他头也没抬",
  dialogue: [
    {
      nian: "爸爸，妈妈说她叫了我三遍，我真的没听见，我是不是耳朵坏了？",
      dad: "多半不是耳朵的事，是你的注意力全跑到积木上去了。玩得正专心的时候，脑子会把别的声音挡在外面，好让你一心一意干一件事。专心本来是个好本事，只是它有时候把妈妈的声音也挡住了。",
    },
    {
      nian: "把别的声音挡在外面？那我小时候也会这样吗？",
      dad: "会，而且越长大，能专心玩的时间越长。科学家把一岁、两岁、三岁半的孩子放在一堆玩具中间，记下他们认真盯着一样东西玩了多久。一岁的宝宝玩一会儿就散了；年纪越大，专心的时间越长，也越少走开。",
    },
    {
      nian: "专心的时间越长，为什么就越难听见别人叫？",
      dad: "因为听见是一回事，把注意力从积木上「拔」出来是另一回事。注意力像一块吸在玩具上的磁铁，要把它拔开、转到妈妈的声音上，得用力。科学家发现，三岁的孩子从一件事换到另一件事常常很难，三到五岁这个本事长得很快。",
      show: { kind: "steps", frames: [{ icon: "🧱", label: "专心搭积木" }, { icon: "📣", label: "妈妈在叫" }, { icon: "🧲", label: "注意力被吸住" }, { icon: "👀", label: "拔出来看妈妈" }] },
    },
    {
      nian: "注意力被吸住，那是不是我故意不理妈妈？",
      dad: "大多数时候不是故意的。不过爸爸也说实话：有时候其实听见了，只是太想接着玩，就装作没听见，大人小孩都有过。这两种不一样，一种是真没转过来，一种是不想停。分清楚了，你就能跟妈妈说真话：「我听见了，我想搭完这一层。」",
    },
    {
      nian: "跟妈妈说真话，那妈妈怎么叫，我才更容易听见？",
      dad: "最好是妈妈走过来，蹲下来和你一样高，看着你的眼睛，叫你的名字，一次只说一件事：「吃饭啦，把积木放下。」在厨房隔着墙喊，声音再大，也很难把磁铁拔开。爸爸觉得，饭快好时先过来说好「搭完这一层就吃饭」，也会容易些。",
    },
    {
      nian: "搭完这一层就吃饭，那我自己能做什么？",
      dad: "你可以和妈妈约个暗号，比如她拍两下手，你就抬头看她一眼。抬头这一下，就是把磁铁拔开的第一步。看见了妈妈，再说「好的」或者「等我搭完这一层」。随着你长大，转过来的本事也会越来越好。",
    },
    {
      nian: "我明白了！我不是耳朵坏了，是注意力被积木吸住了。妈妈走过来看着我说，我抬头看她一眼，就能转过来。",
      dad: "对！明天吃饭前，咱们就试试拍两下手的暗号。",
    },
  ],
  parentTip: "幼儿专注玩耍的时长从 1 岁到 4 岁半明显增加（Ruff & Lawson），注意转换的灵活性在 3–5 岁进步很大，在此之前孩子常被正在做的事「吸住」，叫不应多半不是故意。CDC 建议给指令前先靠近、蹲下、看着眼睛、叫名字，一次只说一件事。也可以提前说好在哪儿停（搭完这一层）。如果孩子对各种声音都反应少，或说话发展让你担心，请儿科医生查查听力。",
  sources: [
    {
      who: "Ruff & Lawson（1990）",
      title: "Development of Sustained, Focused Attention in Young Children During Free Play",
      url: "https://einstein.elsevierpure.com/en/publications/development-of-sustained-focused-attention-in-young-children-duri-2/",
      says: "观察1岁到4岁半的孩子自由玩玩具：专注的时间随年龄明显变长，1岁时玩着玩着就散，大孩子更少走开。",
      limit: "看的是实验室里玩玩具，没有测孩子能不能听见别人叫。",
    },
    {
      who: "Hanania & Smith（2010）",
      title: "Selective Attention and Attention Switching: Toward a Unified Developmental Approach",
      url: "https://pubmed.ncbi.nlm.nih.gov/20590726/",
      says: "综述：学龄前孩子换规则、换注意的本事在三到五岁进步很大；挑出要紧信息、不被别的打扰的本事发展得更久。",
      limit: "证据多来自卡片等实验任务，不直接说明在家叫名字时会怎样。",
    },
    {
      who: "美国疾病控制与预防中心（CDC）",
      title: "Tips for Giving Directions",
      url: "https://www.cdc.gov/parenting-toddlers/directions/good-directions.html",
      says: "给指令前先引起注意：靠近孩子、蹲下来面对面、看着眼睛、叫名字，一次只说一件事。",
      limit: "是给家长的做法建议，不保证孩子每次都照做。",
    },
  ],
};

export default record;
