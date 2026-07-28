import type { AppConfig } from "../types";

export const appConfig: AppConfig = {
  cloud: {
    mode: "mock-local",
    apiBase: "",
    timeoutMs: 8000
  },
  stageMap: [
    { key: "newborn", minDay: 1, text: "新生期 · 正在建立安全感" },
    { key: "explorer", minDay: 8, text: "探索期 · 开始主动好奇" },
    { key: "communicator", minDay: 20, text: "表达期 · 愿意分享内心" }
  ],
  stageArcs: {
    newborn: {
      title: "新生期主线",
      mission: "建立稳定回应节奏，让孩子形成可预测的安全感。",
      caregiverGuidance: "优先保证吃睡与安抚节律一致，不追求高刺激成长任务。",
      focusEvents: ["meal", "sleep", "emotion"],
      milestones: [
        { day: 2, title: "熟悉照护节奏", description: "孩子在基础照护中开始出现稳定反应。" },
        { day: 5, title: "初步情绪安抚", description: "高情绪时能在陪伴下更快平复。" },
        { day: 7, title: "安全感起步", description: "形成对照护者的初步信任与依附。" }
      ]
    },
    explorer: {
      title: "探索期主线",
      mission: "鼓励主动探索，在安全边界内扩展好奇心与表达欲。",
      caregiverGuidance: "多使用描述性语言与共同探索，不急于纠正。",
      focusEvents: ["outdoor", "learning", "social"],
      milestones: [
        { day: 10, title: "主动观察", description: "孩子开始主动关注环境并发起探索。" },
        { day: 14, title: "共同任务", description: "在成人陪同下完成简单挑战并获得成就感。" },
        { day: 18, title: "探索稳定", description: "探索行为与情绪调节形成更稳定循环。" }
      ]
    },
    communicator: {
      title: "表达期主线",
      mission: "提升表达与社交能力，形成更清晰的需求沟通方式。",
      caregiverGuidance: "先倾听再引导，用共情与边界并行的方式回应。",
      focusEvents: ["emotion", "social", "learning"],
      milestones: [
        { day: 22, title: "需求表达", description: "孩子能更主动表达情绪与请求。" },
        { day: 26, title: "冲突修复", description: "在引导下学习复盘冲突并恢复关系。" },
        { day: 30, title: "沟通升级", description: "形成更稳定的情绪-表达-协商能力。" }
      ]
    }
  },
  statLabels: {
    safety: "安全感",
    trust: "亲密度",
    curiosity: "好奇心",
    mood: "情绪"
  },
  caregiverRoles: {
    parent: {
      label: "家长",
      highIntensityTemplate: "{name}感受到你及时而稳定的回应，虽然过程不轻松，但他更信任你了。",
      normalTemplate: "{name}在你的持续陪伴中感到安心，关系在稳步靠近。"
    },
    grandparent: {
      label: "祖辈",
      highIntensityTemplate: "{name}感受到长辈温和而耐心的守护，情绪在你的节奏里慢慢落下来。",
      normalTemplate: "{name}在长辈的熟悉陪伴中获得安稳感，今天的互动很有温度。"
    },
    teacher: {
      label: "老师",
      highIntensityTemplate: "{name}在你的结构化回应中逐步稳定下来，课堂边界感和安全感都在提升。",
      normalTemplate: "{name}在课堂互动中被清晰看见，正在形成更稳定的学习与表达节奏。"
    },
    relative: {
      label: "亲属",
      highIntensityTemplate: "{name}在熟悉亲属的陪伴下获得缓冲，情绪起伏逐步回落。",
      normalTemplate: "{name}在亲属的温暖互动中感到被接纳，关系连接更自然了。"
    }
  },
  roleEventTips: {
    parent: {
      meal: "家长可优先保持进餐边界一致，减少规则反复。",
      sleep: "家长可坚持固定睡前流程，让孩子形成可预期节奏。",
      outdoor: "家长可多做描述性回应，引导孩子表达观察。",
      learning: "家长可关注过程反馈，少用结果评价。",
      emotion: "家长可先命名情绪，再协助调节。",
      social: "家长可示范轮流和边界表达，帮助孩子复盘冲突。"
    },
    grandparent: {
      meal: "祖辈可在温和照顾下保持喂养节奏，避免过度追喂。",
      sleep: "祖辈可用熟悉的安抚方式维持睡前稳定感。",
      outdoor: "祖辈可在安全边界内鼓励探索，少做过度限制。",
      learning: "祖辈可通过讲故事和示范增强互动兴趣。",
      emotion: "祖辈可先共情安抚，再引导孩子说出需求。",
      social: "祖辈可引导孩子用礼貌语句表达请求与拒绝。"
    },
    teacher: {
      meal: "老师可用固定用餐口令和示范，帮助孩子在集体场景里维持节奏。",
      sleep: "老师可通过统一安静信号和固定过渡流程，降低午休前兴奋度。",
      outdoor: "老师可设置探索边界与轮换规则，保障安全和自主性并存。",
      learning: "老师可采用分层任务和同伴示范，降低学习挫败。",
      emotion: "老师可先简短命名情绪，再引导孩子选择可执行调节动作。",
      social: "老师可组织轮流表达和复述规则，帮助孩子练习冲突修复。"
    },
    relative: {
      meal: "亲属可延续家庭约定的进食边界，避免临时放宽导致节奏混乱。",
      sleep: "亲属可复用孩子熟悉的睡前口令与安抚动作，减少陌生感。",
      outdoor: "亲属可先确认安全范围，再鼓励孩子自主选择探索路径。",
      learning: "亲属可通过游戏化引导增强兴趣，减少说教压力。",
      emotion: "亲属可先接纳情绪，再把情况回传给主要照护者保持一致。",
      social: "亲属可示范礼貌表达，帮助孩子在新关系中建立信任。"
    }
  },
  eventRules: {
    meal: {
      title: "喂养时刻",
      narrative: "在吃饭这件事上，稳定的陪伴比速度更重要。",
      effect: { safety: 2, trust: 1, curiosity: 0, mood: 1 }
    },
    sleep: {
      title: "睡眠陪伴",
      narrative: "睡眠是情绪修复的底盘，睡前仪式感会显著提升安全感。",
      effect: { safety: 3, trust: 1, curiosity: 0, mood: 2 }
    },
    outdoor: {
      title: "户外探索",
      narrative: "户外探索会同步提升孩子的情绪与好奇心。",
      effect: { safety: 0, trust: 1, curiosity: 3, mood: 2 }
    },
    learning: {
      title: "学习互动",
      narrative: "学习不只是知识输入，更是你们共同完成挑战的关系体验。",
      effect: { safety: 0, trust: 1, curiosity: 2, mood: 1 }
    },
    emotion: {
      title: "情绪修复",
      narrative: "当孩子有情绪时，先被看见，再被引导，比直接纠正更有效。",
      effect: { safety: 2, trust: 3, curiosity: 0, mood: 1 }
    },
    social: {
      title: "社交练习",
      narrative: "社交中的每一次回应都在帮助孩子理解边界与共情。",
      effect: { safety: 0, trust: 2, curiosity: 1, mood: 2 }
    }
  },
  emotionEducation: {
    meal: {
      emotionLabel: "不安/抗拒",
      recognition: "进食场景常见抗拒并不等于任性，可能是节律变化或控制感需求。",
      acceptance: "先接住孩子的情绪，再慢慢回到进食任务，比直接催促更有效。",
      guidance: ["先描述情绪：你现在有点不想吃", "给有限选择：先喝汤或先吃一口菜", "保持节奏稳定，避免追喂升级冲突"]
    },
    sleep: {
      emotionLabel: "疲惫/分离焦虑",
      recognition: "睡前哭闹常与疲惫和分离焦虑叠加，不是故意对抗。",
      acceptance: "允许孩子在你怀里完成情绪过渡，先稳定再放下。",
      guidance: ["固定睡前三步仪式", "降低光线和声音刺激", "用重复语句建立可预测感"]
    },
    outdoor: {
      emotionLabel: "兴奋/受挫",
      recognition: "探索过程会同时出现兴奋和受挫，两者都是学习信号。",
      acceptance: "允许短暂挫败，不急于替代完成，保留孩子的尝试权。",
      guidance: ["先确认感受：刚才有点难", "示范一步再让孩子接手", "成功后强化过程努力"]
    },
    learning: {
      emotionLabel: "好奇/压力",
      recognition: "学习中的分心或退缩，常是任务难度与当下状态不匹配。",
      acceptance: "把目标拆小，让孩子在可完成范围内恢复胜任感。",
      guidance: ["任务拆成两到三步", "先做最容易的一步", "每完成一步就给予具体反馈"]
    },
    emotion: {
      emotionLabel: "愤怒/委屈",
      recognition: "强烈情绪往往在表达未被理解，而非单纯不听话。",
      acceptance: "先共情命名情绪，再谈规则，孩子更容易合作。",
      guidance: ["先说感受：你现在很生气", "给身体调节选项：喝水/抱抱/深呼吸", "情绪落下后再复盘边界"]
    },
    social: {
      emotionLabel: "紧张/受挫",
      recognition: "社交冲突会触发紧张和防御，是学习边界的关键时刻。",
      acceptance: "不急于贴标签，先帮助孩子理解事件和感受。",
      guidance: ["复述发生了什么", "引导孩子说出需求", "示范礼貌表达与轮流规则"]
    }
  },
  seasonalThemes: [
    {
      id: "spring-festival",
      title: "新春团圆支线",
      seasonTag: "冬末到初春",
      festivalName: "春节",
      atmosphere: "团聚、热闹与作息轻微变化并存，孩子容易兴奋后疲惫。",
      caregiverCue: "先守住吃睡底盘，再参与节日互动，避免连续高刺激。",
      microChallenge: "今天做一次 10 分钟亲子节日小仪式：贴福字、讲故事或拜年练习。",
      memoryBranchPrompts: [
        "记录一次节日互动中的开心瞬间和一个需要调整的小细节。",
        "写下孩子今天最在意的节日元素，并描述你如何回应。",
        "记录一次从兴奋到平稳的过渡过程。"
      ],
      window: { startDay: 1, endDay: 7 }
    },
    {
      id: "school-start",
      title: "开学适应支线",
      seasonTag: "早春",
      festivalName: "开学季",
      atmosphere: "新节奏开启，孩子可能在期待和紧张之间反复切换。",
      caregiverCue: "用固定晨间与睡前流程降低不确定感。",
      microChallenge: "和孩子共创一张开学小清单，只保留 2-3 项核心动作。",
      memoryBranchPrompts: [
        "记录一次出门前情绪波动，以及你如何帮助他稳定。",
        "写下今天最顺利的过渡环节，为明天复用。",
        "记录一次孩子主动表达需求的瞬间。"
      ],
      window: { startDay: 8, endDay: 14 }
    },
    {
      id: "spring-outdoor",
      title: "春日探索支线",
      seasonTag: "春季",
      festivalName: "踏青周",
      atmosphere: "户外机会增加，探索欲更强，也更容易出现边界拉扯。",
      caregiverCue: "先说安全边界，再放手让孩子主导一段探索。",
      microChallenge: "完成一次 15 分钟自然观察任务：找颜色、听声音、触摸纹理。",
      memoryBranchPrompts: [
        "记录一次孩子自主探索后的情绪变化。",
        "写下你们共同发现的新事物。",
        "记录一次边界提醒后孩子仍愿意合作的场景。"
      ],
      window: { startDay: 15, endDay: 21 }
    },
    {
      id: "birthday-week",
      title: "生日成长支线",
      seasonTag: "全年可复用",
      festivalName: "生日周",
      atmosphere: "庆祝感与规则感并行，孩子会更在意被看见与被重视。",
      caregiverCue: "把关注点放在关系仪式，而非礼物数量。",
      microChallenge: "做一张成长回顾卡：今年学会了什么、最想感谢谁。",
      memoryBranchPrompts: [
        "记录一个让孩子感到被看见的瞬间。",
        "写下你们共同完成的一次庆祝仪式。",
        "记录庆祝后如何平稳回到日常节奏。"
      ],
      window: { startDay: 22, endDay: 28 }
    }
  ],
  familyRoleGuides: {
    parent: {
      tone: "家庭主轴角色，负责建立长期稳定规则与情绪容纳边界。",
      handoff: "与其他照护者交接时，优先同步今日触发点、有效安抚动作与禁忌方式。"
    },
    grandparent: {
      tone: "情感缓冲角色，擅长提供安全感与熟悉节奏。",
      handoff: "向家长回传孩子当日情绪峰值时段，帮助夜间照护预判。"
    },
    teacher: {
      tone: "结构化引导角色，擅长在群体规则中支持表达与合作。",
      handoff: "向家庭同步课堂触发场景与有效引导语，减少家校策略冲突。"
    },
    relative: {
      tone: "补位支持角色，适合在短时陪伴中维持一致节奏。",
      handoff: "陪伴结束后同步孩子偏好和冲突点，避免下一位照护者重复试错。"
    }
  },
  lifeSkillGoals: {
    mealRoutine: {
      key: "mealRoutine",
      title: "自主进餐节律",
      relatedEvents: ["meal"],
      stageFocus: ["newborn", "explorer"],
      targetCount: 5,
      coachingTip: "把重点放在稳定节奏和有限选择，不追求一次吃很多。",
      completionHint: "当孩子能在提醒后进入进餐状态，就算一次有效积累。"
    },
    sleepRoutine: {
      key: "sleepRoutine",
      title: "睡前过渡流程",
      relatedEvents: ["sleep", "emotion"],
      stageFocus: ["newborn", "explorer"],
      targetCount: 4,
      coachingTip: "固定睡前三步动作，比临时安抚更有帮助。",
      completionHint: "只要完成一轮稳定睡前仪式，就记录一次进展。"
    },
    tidyUp: {
      key: "tidyUp",
      title: "整理与收尾",
      relatedEvents: ["learning", "social"],
      stageFocus: ["explorer", "communicator"],
      targetCount: 4,
      coachingTip: "把整理拆成一个个小动作，让孩子参与收尾而不是被动等待。",
      completionHint: "能完成一个整理动作，例如收一本书、放回一个玩具，就可累计。"
    },
    requesting: {
      key: "requesting",
      title: "表达请求",
      relatedEvents: ["emotion", "social", "learning"],
      stageFocus: ["explorer", "communicator"],
      targetCount: 5,
      coachingTip: "先示范句式，再鼓励孩子用短句说需求。",
      completionHint: "孩子只要有一次主动说出请求或在提示后表达，就算达成。"
    },
    conflictRepair: {
      key: "conflictRepair",
      title: "冲突修复",
      relatedEvents: ["emotion", "social"],
      stageFocus: ["communicator"],
      targetCount: 3,
      coachingTip: "情绪落下后复盘发生了什么，再练习道歉、解释或重来一次。",
      completionHint: "只要完成一次复盘、和好或重新表达，就累计一次。"
    }
  },
  storyWorldBranches: [
    {
      id: "harbor-lantern",
      title: "港湾灯塔支线",
      stageFocus: ["newborn"],
      triggerEvents: ["meal", "sleep", "emotion"],
      targetCount: 6,
      premise: "小洋人刚来到港湾世界，灯塔会根据照护节律发出更稳定的光。",
      currentSignal: "今天的港湾光线取决于你是否把吃睡与安抚维持在温和节奏里。",
      caregiverChoice: "优先做一件让节奏更可预测的小事，让灯塔知道这个世界是安全的。",
      memoryTag: "港湾灯塔",
      variants: [
        {
          key: "steady",
          label: "安稳线",
          preferredRoles: ["parent", "grandparent"],
          intensity: "low",
          signalShift: "灯塔进入低频稳定闪烁，说明孩子开始相信照护节奏。",
          choiceShift: "继续减少临时变更，用重复动作巩固安全预期。",
          echoLines: [
            "港湾浪头变小了，灯塔第一次连续亮了整夜。",
            "海风还是冷，但孩子已经知道会有人稳稳接住他。",
            "安稳的节律让港湾有了可依赖的边界。"
          ],
          memoryTag: "港湾灯塔·安稳"
        },
        {
          key: "repair",
          label: "修复线",
          preferredRoles: ["teacher", "relative", "parent"],
          intensity: "high",
          signalShift: "灯塔在风暴里短暂闪断后重新点亮，代表高情绪后的修复成功。",
          choiceShift: "优先做情绪修复，再回到规则边界，避免二次冲突。",
          echoLines: [
            "风暴没有立刻停，但灯塔在最暗时重新亮起。",
            "修复不是倒退，而是孩子学会信任关系会回来。",
            "港湾留下了风暴痕迹，也留下了可复用的修复路径。"
          ],
          memoryTag: "港湾灯塔·修复"
        }
      ]
    },
    {
      id: "forest-map",
      title: "森林地图支线",
      stageFocus: ["explorer"],
      triggerEvents: ["outdoor", "learning", "social"],
      targetCount: 6,
      premise: "小洋人进入会不断展开的森林地图，每一次探索都会点亮新的路径。",
      currentSignal: "今天最值得记录的不是结果，而是哪一条小路第一次被看见。",
      caregiverChoice: "给孩子一段可自主选择的空间，再用语言把发现固定下来。",
      memoryTag: "森林地图",
      variants: [
        {
          key: "explore",
          label: "探索线",
          preferredRoles: ["parent", "teacher"],
          intensity: "low",
          signalShift: "地图边缘出现更多可选岔路，说明自主探索正在提升。",
          choiceShift: "保留孩子主导权，只在关键风险点做最小提示。",
          echoLines: [
            "一条没人走过的小路被点亮，地图边缘向外扩展。",
            "孩子没有等答案，而是带着问题继续前进。",
            "森林记住了这次主动尝试，下一段路更容易被看见。"
          ],
          memoryTag: "森林地图·探索"
        },
        {
          key: "collab",
          label: "协作线",
          preferredRoles: ["teacher", "relative", "grandparent"],
          intensity: "high",
          signalShift: "地图出现并行路线，代表孩子开始愿意在他人支持下共同完成任务。",
          choiceShift: "把任务拆成双人步骤，让孩子体验“我能做 + 我们能做”。",
          echoLines: [
            "两条路线在林间汇合，孩子第一次主动邀请同伴一起走。",
            "地图上的协作标记亮起，说明支持关系开始稳定。",
            "这次不是独自闯关，而是学会在关系里前进。"
          ],
          memoryTag: "森林地图·协作"
        }
      ]
    },
    {
      id: "sky-post",
      title: "云上邮局支线",
      stageFocus: ["communicator"],
      triggerEvents: ["emotion", "social", "learning"],
      targetCount: 6,
      premise: "小洋人来到云上邮局，所有被表达出来的需求与情绪都会变成可投递的信件。",
      currentSignal: "今天的重要任务不是消灭情绪，而是把它整理成能被别人读懂的语言。",
      caregiverChoice: "帮助孩子把混乱感受变成一句话，再决定这封信要寄给谁。",
      memoryTag: "云上邮局",
      variants: [
        {
          key: "expression",
          label: "表达线",
          preferredRoles: ["parent", "teacher"],
          intensity: "low",
          signalShift: "邮局的收件窗口变长，代表需求表达的稳定性在提升。",
          choiceShift: "继续鼓励“先说感受再说请求”的句式。",
          echoLines: [
            "第一封完整表达的信寄出，邮戳上写着“我想要”。",
            "孩子的语言开始有次序，邮差能更快找到收件人。",
            "表达不再零散，关系沟通开始形成清晰通道。"
          ],
          memoryTag: "云上邮局·表达"
        },
        {
          key: "repair",
          label: "和解线",
          preferredRoles: ["grandparent", "relative", "parent"],
          intensity: "high",
          signalShift: "邮局开通了“重寄窗口”，代表冲突后修复能力在增强。",
          choiceShift: "先复述冲突，再引导孩子发出“重来一次”的和解信号。",
          echoLines: [
            "退回的信件被重新封好，说明关系愿意再试一次。",
            "孩子学会在争执后补上一句“我们再来一次”。",
            "邮局里亮起了和解印章，冲突开始转化为修复经验。"
          ],
          memoryTag: "云上邮局·和解"
        }
      ]
    }
  ],
  handoffTemplates: {
    meal: {
      triggerCue: "进餐前拖延或抗拒",
      effectiveAction: "先给两项有限选择，再进入固定进餐流程。",
      avoidAction: "连续催促或边喂边说教，容易升级对抗。",
      schoolToHome: "在校若有拒餐波动，回家先复用同一进餐口令和顺序。",
      homeToSchool: "若家里已形成稳定进餐句式，请同步给老师保持一致。"
    },
    sleep: {
      triggerCue: "睡前兴奋或分离焦虑",
      effectiveAction: "固定三步睡前过渡（降刺激-安抚-重复语句）。",
      avoidAction: "临时增加高刺激活动，打断入睡节律。",
      schoolToHome: "午休前若波动，放学后优先降低刺激，减少晚间反跳。",
      homeToSchool: "若夜间频繁醒来，请同步给老师调整午休前过渡。"
    },
    outdoor: {
      triggerCue: "探索时边界拉扯",
      effectiveAction: "先声明边界，再给一段自主探索时间。",
      avoidAction: "全程高密度指令，压制自主性。",
      schoolToHome: "在校户外冲突点可作为家庭复盘素材，做一次轻复演。",
      homeToSchool: "家庭已有效的边界口令可同步课堂使用。"
    },
    learning: {
      triggerCue: "任务前退缩或分心",
      effectiveAction: "任务拆步 + 即时过程反馈。",
      avoidAction: "只盯结果或反复比较。",
      schoolToHome: "课堂卡点可在家做低难度同构练习，先保成功体验。",
      homeToSchool: "家中有效拆步方式可提供给老师延续。"
    },
    emotion: {
      triggerCue: "强烈情绪爆发",
      effectiveAction: "先命名情绪，再给身体调节选项。",
      avoidAction: "高情绪时直接讲道理或追问责任。",
      schoolToHome: "若在校有情绪峰值，回家优先做安抚而非追问细节。",
      homeToSchool: "若家中已有有效调节动作，请同步老师课堂复用。"
    },
    social: {
      triggerCue: "同伴冲突或轮流失败",
      effectiveAction: "复述事件-表达需求-重来一次。",
      avoidAction: "贴标签式评价（如“你总是……”）。",
      schoolToHome: "在校冲突后可在家复盘同一脚本，强化修复流程。",
      homeToSchool: "家庭冲突修复脚本可提供老师做同伴互动引导。"
    }
  },
  ethicalCopy: {
    replacements: [
      { from: "更依赖你了", to: "更信任你的回应了" },
      { from: "必须每天", to: "可以每天" },
      { from: "不来就", to: "即使暂时没来也" },
      { from: "只有你", to: "你是重要陪伴者之一" },
      { from: "如果你离开", to: "当你暂时不在" }
    ],
    blockedKeywords: ["离不开你", "没有你就不行", "不买就会", "只要你给钱", "必须充值"],
    fallbackLine: "这段反馈已被安全规则改写为更温和的表达。",
    hint: "陪伴以真实、稳定、非强迫为原则，尊重孩子和照护者的节奏。"
  },
  expertCards: {
    meal: {
      title: "规律喂养与回应",
      insight: "进食中的稳定互动有助于孩子建立可预测感和基础安全感。",
      source: "Bowlby, J. (1988). A Secure Base.",
      actionTips: ["保持固定用餐节奏", "先回应情绪再处理进食速度"]
    },
    sleep: {
      title: "睡眠仪式与情绪修复",
      insight: "固定睡前仪式可帮助孩子降低唤醒水平，提升入睡稳定性。",
      source: "Sadeh, A. (2005). Sleep assessment methods.",
      actionTips: ["建立 10-15 分钟睡前流程", "减少睡前高刺激互动"]
    },
    outdoor: {
      title: "探索驱动发展",
      insight: "自由探索与身体活动能够提升积极情绪和环境适应能力。",
      source: "Ginsburg, K. (2007). The importance of play.",
      actionTips: ["每天留出自由探索时间", "用描述性语言回应孩子发现"]
    },
    learning: {
      title: "共同学习比结果更重要",
      insight: "协作式任务能强化胜任感和亲子协同体验。",
      source: "Vygotsky, L. (1978). Mind in Society.",
      actionTips: ["拆分成孩子可完成的小步骤", "肯定过程中的尝试而非只看结果"]
    },
    emotion: {
      title: "情绪共情与命名",
      insight: "先共情再引导，有助于孩子形成更稳定的情绪调节能力。",
      source: "Gottman, J. (1997). Emotion Coaching.",
      actionTips: ["先说出孩子情绪再给建议", "避免在高情绪时直接说教"]
    },
    social: {
      title: "社交中的示范学习",
      insight: "孩子通过观察照护者的互动方式学习边界与共情。",
      source: "Bandura, A. (1977). Social Learning Theory.",
      actionTips: ["示范礼貌表达和轮流规则", "冲突后做简短复盘"]
    },
    default: {
      title: "稳定陪伴",
      insight: "温和、持续、可预期的回应，是关系安全感的核心来源。",
      source: "Ainsworth, M. (1978). Patterns of Attachment.",
      actionTips: ["保持一致回应", "关注当下真实需求"]
    }
  }
};
