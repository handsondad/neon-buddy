export const THEORIES = {
  temperament: {
    name: "气质：反应性与调节", author: "Rothbart · 儿童早期发展百科（2019修订）",
    url: "https://www.child-encyclopedia.com/temperament/according-experts/early-temperament-and-psychosocial-development",
    principle: "在不同情境与时间中观察接近、退避、挫折反应和注意调节；同时记录环境怎样回应孩子。",
    fields: ["signals", "context.familiarity", "context.antecedent", "context.response", "context.outcome", "occurredOn"],
    limit: "自然材料不是气质量表，单次行为不能定义气质，也不能生成外向／敏感等特质分数。气质随发展和经历变化。"
  },
  motivation: {
    name: "自我决定理论：自主、胜任与联结", author: "Self-Determination Theory · 理论概览",
    url: "https://selfdeterminationtheory.org/theory/",
    principle: "关注活动由谁发起、是否有真实选择、怎样获得协助、与谁共同参与；研究支持环境而非只评价孩子。",
    fields: ["context.activity", "context.people", "context.response", "signals", "childExpression"],
    limit: "拒绝不等于自主不足，坚持不等于动机强。三种需要是解释视角，不是从行为代码自动计算的隐变量。"
  },
  responsive: {
    name: "回应式互动", author: "Harvard Center on the Developing Child",
    url: "https://developingchild.harvard.edu/key-concept/serve-and-return/",
    principle: "保留孩子发出的动作、声音或语言信号，以及成人的回应和后续互动，而不是只保留孩子一端的行为。",
    fields: ["behavior", "childExpression", "context.response", "context.outcome"],
    limit: "主要基于婴幼儿互动研究；对更大孩子只作交流观察参考。不能从片段判定依恋类型、养育质量或脑发育。"
  },
  executive: {
    name: "执行功能与自我调节", author: "Harvard · Guide to Executive Function",
    url: "https://developingchild.harvard.edu/resource-guides/guide-executive-function/",
    principle: "关注任务要求、规则变化、等待、调整与获得的帮助。能力表现与发展阶段及环境支持有关。",
    fields: ["context.activity", "context.antecedent", "signals", "context.response", "context.outcome"],
    limit: "日常叙述不是执行功能测试，不能从分心、停下或等待推断能力缺陷或诊断。"
  },
  informants: {
    name: "多报告者与情境差异", author: "De Los Reyes 等 · Psychological Bulletin（2015）",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4486608/",
    principle: "保留谁在什么环境中观察到什么；不同报告并存，差异本身是需要了解的材料，而不是投票决定真相。",
    fields: ["sourceId", "context.setting", "context.people", "sourceExcerpt", "occurredOn"],
    limit: "该综述来自临床儿童评估，支持保留多来源的设计原则，不证明本产品的分析有效，也不能把分歧直接当作情境因果。"
  },
  developmental: {
    name: "发展时间与里程碑的边界", author: "CDC · Learn the Signs. Act Early. / Zubler 等（2022）",
    url: "https://pubmed.ncbi.nlm.nih.gov/35132439/",
    principle: "以事件发生时间而非录入时间组织材料。可选出生年月只用于近似月龄背景，比较时同时保留活动和观察来源。",
    fields: ["child.birthMonth", "occurredOn", "recordedAt", "context"],
    limit: "本框架没有移植量表或里程碑阈值。缺材料不等于未达到里程碑，不能输出落后／超前或替代专业筛查。"
  }
} as const;
export type TheoryId = keyof typeof THEORIES;

export const DOMAINS = {
  regulation: { name: "情绪与调节", question: "他怎样表达感受，又怎样获得恢复的支持？", theories: ["temperament", "responsive", "executive"] },
  relationships: { name: "关系与互动", question: "和不同的人在一起时，互动有什么不同？", theories: ["informants", "motivation", "responsive"] },
  agency: { name: "自主与动机", question: "他怎样选择、表达意愿和寻求帮助？", theories: ["motivation", "informants"] },
  exploration: { name: "探索与学习", question: "什么吸引他发起、尝试和调整？", theories: ["motivation", "executive", "temperament"] },
  attention: { name: "注意与行动组织", question: "不同任务和支持下，他怎样等待、转换或计划？", theories: ["executive", "temperament"] },
  communication: { name: "表达与理解", question: "他通过语言、动作或其他方式传达了什么？", theories: ["responsive", "informants", "developmental"] },
  movement: { name: "动作与身体体验", question: "在游戏和日常活动中，他怎样行动、练习或表达身体感受？", theories: ["developmental", "temperament"] },
  wellbeing: { name: "日常节奏与体验", question: "生活节奏、愉快体验与变化有哪些背景？", theories: ["developmental", "temperament", "responsive"] }
} as const satisfies Record<string, { name: string; question: string; theories: readonly TheoryId[] }>;
export type DomainId = keyof typeof DOMAINS;

export const SIGNALS = {
  initiates: "主动发起", approaches: "靠近／加入", observes: "先观察", declines: "表达不愿意",
  asks_help: "寻求帮助", expresses_feeling: "表达感受", pauses: "暂停／退出",
  returns: "返回活动", changes_strategy: "调整做法", shares: "分享／回应他人",
  asks_question: "提出问题", waits: "等待", transitions: "切换活动",
  expresses_preference: "表达偏好", repeats: "再次参与", unknown: "尚无可编码的行为"
} as const;
export type SignalId = keyof typeof SIGNALS;

export const SETTINGS = { home: "家中", learning: "学习环境", community: "公共／社群场景", online: "线上", other: "其他", unknown: "环境未知" } as const;
export const FAMILIARITY = { familiar: "熟悉", new: "新情境", mixed: "部分熟悉", unknown: "熟悉度未知" } as const;
export const SOURCE_KINDS = { caregiver: "照料者叙述", child: "孩子表达", educator: "教育者叙述", artifact: "材料转录", other: "其他来源" } as const;
