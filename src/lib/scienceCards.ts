import { type DomainId, type TheoryId } from "./knowledgeFramework.ts";

export interface ScienceCard {
  id: string;
  version: number;
  kind: "concept" | "observation" | "method";
  title: string;
  theoryIds: TheoryId[];
  domains: DomainId[];
  summary: string;
  applicability: string;
  prompts: string[];
  fields: string[];
  limits: string[];
}

// These are product guidance derived from the cited theories, not validated assessment instruments.
export const SCIENCE_CARDS: readonly ScienceCard[] = [
  {
    id: "concept-reactivity", version: 1, kind: "concept", title: "反应性与调节：表现需要放回情境",
    theoryIds: ["temperament"], domains: ["regulation", "relationships", "attention"],
    summary: "气质研究区分反应性与调节；日常材料应同时保留孩子怎样反应、怎样调整，以及环境怎样回应。",
    applicability: "可用于组织不同发展时期的自然观察；不是用日常片段测量气质。儿童年龄、任务与经历均需另行考虑。",
    prompts: ["接近、观察、退出或恢复发生在什么活动中？", "同一表现是否也出现于不同熟悉度或不同时间？"],
    fields: ["occurredOn", "behavior", "context.familiarity", "context.antecedent", "context.response", "context.outcome"],
    limits: ["单次不加入不能推出内向，反应强不能推出固定敏感特质。", "片段数量不是发生频率；没有标准化施测，不生成气质分。"]
  },
  {
    id: "concept-support-needs", version: 1, kind: "concept", title: "自主、胜任与联结：观察支持环境",
    theoryIds: ["motivation"], domains: ["agency", "exploration", "relationships"],
    summary: "自我决定理论把自主、胜任与联结作为理解支持环境的视角；先保留选择、活动发起与协助经过，不直接推断内在需要。",
    applicability: "用来提出关于活动和支持方式的问题；不能从少量儿童叙述确定动机类型或需要满足程度。",
    prompts: ["孩子有哪些实际选择，是否愿意参与？", "帮助由谁提供、怎样提供，后续发生了什么？"],
    fields: ["context.activity", "context.people", "context.response", "childExpression", "signals"],
    limits: ["拒绝不等于叛逆，坚持不等于动机强。", "成人提供选择与孩子体验到自主不是同一事实，不从行为码计算心理需要。"]
  },
  {
    id: "concept-responsive-exchange", version: 1, kind: "concept", title: "回应式互动：保存来回，而非单端表现",
    theoryIds: ["responsive"], domains: ["communication", "relationships", "regulation"],
    summary: "记录孩子的动作、声音或语言信号，以及他人的回应和下一轮互动；缺少后续就保留未知。",
    applicability: "研究背景主要是婴幼儿与照料者双向互动；对更大孩子只作交流观察参考，需核对适用性。",
    prompts: ["孩子发出了什么可描述信号？", "谁怎样回应，孩子之后有什么可记录表现？"],
    fields: ["behavior", "childExpression", "context.response", "context.outcome"],
    limits: ["不能据此评定依恋类型、养育质量或脑发育。", "有前后顺序不等于回应导致了后续变化。"]
  },
  {
    id: "concept-task-support", version: 1, kind: "concept", title: "执行功能：任务要求与支持一起看",
    theoryIds: ["executive"], domains: ["attention", "regulation", "exploration"],
    summary: "等待、转换或调整策略的表现，需要连同任务规则、变化、可获得帮助和发展背景理解。",
    applicability: "用于组织日常任务片段，不代替执行功能测试、筛查或临床评估。",
    prompts: ["任务要求与规则是否明确，是否发生变化？", "有无帮助、休息或示范，相似任务中有哪些不同表现？"],
    fields: ["context.activity", "context.antecedent", "signals", "context.response", "context.outcome"],
    limits: ["一次分心、停下或等待不能推出能力缺陷或诊断。", "难度与支持不同的任务，不直接比较能力高低。"]
  },
  {
    id: "concept-informant-context", version: 1, kind: "concept", title: "多报告者：差异需要解释，不用投票抹平",
    theoryIds: ["informants"], domains: ["relationships", "communication", "agency"],
    summary: "保留不同报告者、情境和原文；分歧可能涉及观察机会、场景与报告方式，不能直接选择多数说法。",
    applicability: "来源是儿童青少年临床评估的多报告者综述；这里只借鉴保留来源差异的设计原则。",
    prompts: ["两位报告者是在相同场景、相近时间、观察同一表现吗？", "有哪些不同片段或遗漏，哪些仍无法区分？"],
    fields: ["sourceId", "sourceExcerpt", "context.setting", "context.people", "occurredOn"],
    limits: ["不把报告人数当可信度分，不默认成人比孩子可靠。", "分歧不是环境因果的证明，也不验证本系统的个体分析。"]
  },
  {
    id: "concept-development-time", version: 1, kind: "concept", title: "发展时间：事件年龄不是达标分数",
    theoryIds: ["developmental"], domains: ["movement", "wellbeing", "communication"],
    summary: "发生日期与采集、整理日期分离。出生年月只提供事件时的近似月龄背景，比较还需保留活动与来源。",
    applicability: "用于纵向组织材料；发展监测与正式筛查有不同用途。本项目不提供常模和里程碑阈值。",
    prompts: ["确切知道发生时间吗，还是只有模糊时间？", "不同时期的任务、来源与支持是否可比？"],
    fields: ["occurredOn", "recordedAt", "child.birthMonth", "context"],
    limits: ["未知日期用null，不拿录入日代替，不猜生日。", "缺记录不是未达到，不推算超前、落后或进步比例。"]
  },
  {
    id: "observe-context-sequence", version: 1, kind: "observation", title: "自然片段：前因、行为、回应与后续",
    theoryIds: ["temperament", "responsive", "executive"], domains: ["regulation", "communication", "attention"],
    summary: "本产品的观察整理指引：将原文中的活动、前后经过和表达分别提取，保留原始来源与未知。",
    applicability: "仅整理自然出现、获授权的材料；不要求每天采样，也不为了验证假设制造考验。",
    prompts: ["原文实际说了什么，而非我们认为孩子想了什么？", "行为与表达是否能定位到原文，报告者和提取Agent是否分开？", "哪些前因、回应或后续根本没有被记录？"],
    fields: ["sourceExcerpt", "sourceLocator", "behavior", "context", "childExpression", "recordedBy"],
    limits: ["这是产品操作指引，不是已验证的观察量表。", "精确摘录仍可能继承来源偏差；不要补全心理原因。"]
  },
  {
    id: "method-context-comparison", version: 1, kind: "method", title: "跨情境比较：先检查可比性",
    theoryIds: ["informants", "temperament", "executive"], domains: ["relationships", "attention", "regulation"],
    summary: "先分别列出活动、时间、熟悉度、在场者、规则和帮助，再描述共同点与差异；不可比处要明确说明。",
    applicability: "适合围绕一个具体问题比较已有自然材料，不用于计算情境对行为的因果效应。",
    prompts: ["相同点和不同点各是什么？", "有哪些表现不符合当前解释？是否存在另一种情境解释？"],
    fields: ["context", "occurredOn", "sourceId", "supportingIds", "counterIds"],
    limits: ["相同setting或familiarity不等于相同情境。", "无对照、选择性记录和不同报告者都限制推断，不以计数拟合规律。"]
  },
  {
    id: "method-alternatives", version: 1, kind: "method", title: "替代解释与反例：允许暂不下结论",
    theoryIds: ["informants", "motivation"], domains: ["relationships", "agency", "exploration"],
    summary: "本产品的分析约束：针对一个问题，列出条件性解释、不同解释、反例检索范围与尚缺信息；可以只报告材料不足。",
    applicability: "用于任何Agent分析任务；不是特定论文提出并验证的推理量表或心理评估程序。",
    prompts: ["读过哪些材料，在什么范围找过反例？", "哪些证据能区分不同解释，哪些结论现在不能形成？"],
    fields: ["question", "claim", "alternatives", "limitations", "counterIds", "followUps"],
    limits: ["没有找到反例不代表反例不存在。", "程序可检查引用和结构，无法证明Agent真实读过、语义支持或心理解释有效。"]
  },
  {
    id: "method-longitudinal", version: 1, kind: "method", title: "纵向复核：说明理解为什么改变",
    theoryIds: ["developmental", "temperament", "informants"], domains: ["wellbeing", "relationships", "exploration"],
    summary: "围绕同一个问题积累时间线，每次更新说明新材料、纠正、反例和理论适用性怎样改变了原解释。",
    applicability: "用于回看资料与解释的版本变化；不是自动生成发展阶段、稳定人格或未来预测。",
    prompts: ["这次变化来自新证据、更正、解释方式变化，还是只是材料增多？", "与旧分析相比哪些主张保留、缩小适用范围或撤回？"],
    fields: ["occurredOn", "supersedes", "basedOnRevision", "changeReason"],
    limits: ["年龄、环境与记录方式同时变化时，不把差异归因为长大。", "理论卡版本变化需要复核，旧结论不能自动继承新理论背书。"]
  }
];

export function scienceCard(id: string): ScienceCard | undefined {
  return SCIENCE_CARDS.find((card) => card.id === id);
}
