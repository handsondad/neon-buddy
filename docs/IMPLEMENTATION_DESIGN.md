# 小洋人实现反推设计文档（React-TS版）

更新时间：2026-04-20

## 1. 目标

基于当前代码实现反推系统设计，用于：

1. 明确 React-TS 架构下的模块边界
2. 为后续接入真实后端提供稳定接口层
3. 支持多人协作时的低耦合迭代

## 2. 技术架构

1. 前端框架：React 18 + TypeScript
2. 构建工具：Vite
3. 状态管理：组件内 `useState/useMemo/useEffect`
4. 存储策略：localStorage（账号隔离）
5. 云存档：CloudRepository 抽象（mock-local/http）

## 3. 分层设计

1. 入口层
- `index.html`：挂载根节点
- `src/main.tsx`：渲染根组件与样式入口

2. 页面编排层
- `src/App.tsx`：页面结构、事件分发、视图组合

3. 配置层
- `src/config/appConfig.ts`：场景规则、伦理规则、角色模板、云配置

4. 领域与基础设施层
- `src/lib/storage.ts`：账号与本地状态存取
- `src/lib/cloudRepository.ts`：云仓储抽象与实现切换
- `src/lib/summary.ts`：周报统计计算
- `src/lib/ethics.ts`：文案过滤

5. 类型层
- `src/types.ts`：核心实体与契约类型

## 4. 核心数据模型

1. `AppState`
- `childName`
- `day`
- `stage`
- `stats`（`safety/trust/curiosity/mood`）
- `memories[]`

2. `MemoryItem`
- `type`
- `caregiverRole`
- `intensity`
- `detail`
- `title`
- `response`
- `createdAt`

3. `CloudSnapshot`
- `id`
- `createdAt`
- `day`
- `memoriesCount`
- `data`（完整 `AppState`）

4. `EmotionEducationGuide`
- `emotionLabel`
- `recognition`
- `acceptance`
- `guidance[]`

5. `SeasonalTheme`
- `title/seasonTag/festivalName`
- `atmosphere/caregiverCue/microChallenge`
- `memoryBranchPrompts[]`
- `window(startDay/endDay)`

6. `FamilyRoleGuide`
- `tone`
- `handoff`

7. `LifeSkillGoal`
- `title`
- `relatedEvents[]`
- `stageFocus[]`
- `targetCount`
- `coachingTip/completionHint`

8. `StoryWorldBranch`
- `title`
- `stageFocus[]/triggerEvents[]`
- `premise/currentSignal/caregiverChoice`
- `variants[]`（按角色与强度分叉）
- `memoryTag`

## 5. 核心流程

### 5.1 事件提交流程

1. 用户输入事件类型、角色、强度、描述
2. 根据 `eventRules` 计算状态增量
3. 根据 `caregiverRoles + roleEventTips` 生成角色化反馈
4. 执行 `ethicalCopy` 过滤
5. 注入专家卡片
6. 注入情绪教育卡片（识别-接纳-引导）
7. 写入 `memories` 并持久化

### 5.4 情绪教育主题流程

1. 依据 `event type` 读取 `emotionEducation[type]`
2. 输出三段式内容：
- 识别：命名当前情绪状态
- 接纳：给出共情与允许表达
- 引导：给出 2-3 条可执行步骤
3. 对输出文案执行伦理过滤后再渲染到反馈区

### 5.5 节日与季节主题流程

1. 以 `day` 计算 28 天循环日（`cycleDay`）
2. 根据 `window(startDay/endDay)` 匹配激活主题
3. 在主界面展示节日主题卡（氛围、照护提示、微任务）
4. 在事件反馈中注入支线记忆提示
5. 在记忆标题追加节日标签，强化后续复盘可追踪性

### 5.6 家庭关系主题流程

1. 扩展照护角色集合（家长/祖辈/老师/亲属）
2. 按角色读取差异化事件提示与反馈模板
3. 注入 `familyRoleGuides[role]` 生成角色定位与交接建议
4. 在反馈区展示协同策略，降低多角色照护冲突

### 5.7 生活技能主题流程

1. 按当前阶段筛选 `lifeSkillGoals`
2. 在主界面展示阶段目标卡与累计进度
3. 用户提交事件时，根据 `relatedEvents` 自动增加对应技能计数
4. 在反馈区展示当前技能目标、完成进度、练习建议与达成口径
5. 通过状态归一化兼容旧账号数据中缺失的 `skillProgress`

### 5.8 世界观剧情主题流程

1. 根据当前 `stage` 选择阶段支线
2. 根据 `caregiverRole + intensity + eventType` 选择分叉路径
3. 提交事件时累计 `storyProgress[branch.id][variant.key]`
4. 同步 `storyLastVariant[branch.id]` 作为当前主路径
5. 在主界面展示各路径推进进度与解锁状态
6. 在反馈区生成路径化故事回响文案与下一段目标
7. 在记忆标题追加路径标签 `memoryTag`，让时间线自然沉淀剧情轨迹

### 5.2 每周总结流程

1. 截取最近 7 天记忆
2. 计算：本周记录、高频类型、主陪伴者、平均强度
3. 计算最佳状态增量项
4. 抽取关键记忆 Top3

### 5.3 账号与云快照流程

1. 账号切换
- 校验账号 ID
- 保存当前账号状态
- 加载目标账号状态

2. 上传快照
- 通过 `CloudRepository.uploadSnapshot`
- 刷新快照列表与状态提示

3. 恢复快照
- 通过 `CloudRepository.restoreLatest`
- 覆盖当前状态并持久化

## 6. 云仓储抽象策略

统一接口：

1. `listSnapshots(accountId)`
2. `uploadSnapshot(accountId, state)`
3. `restoreLatest(accountId)`

可切换模式：

1. `mock-local`：本地模拟，便于开发与演示
2. `http`：真实后端联调，支持超时与错误传播

切换入口：`src/config/appConfig.ts` 的 `cloud` 配置。

## 7. 伦理与安全控制

1. 替换依赖性表达
2. 拦截敏感短语并回退安全文案
3. 保持温和、非强迫反馈策略

## 8. 已知限制

1. 真实鉴权与 token 生命周期尚未接入
2. 多端并发冲突仅支持后写覆盖策略设计，未实现可视化合并
3. 缺少自动化测试（单测/E2E）

## 9. 后续建议

1. 接入真实 API 并启用 `cloud.mode=http`
2. 增加 CloudRepository 重试与退避策略
3. 对配置层增加 schema 校验
4. 补充关键流程测试用例

## 10. 文件追踪

1. `index.html`
2. `src/main.tsx`
3. `src/App.tsx`
4. `src/config/appConfig.ts`
5. `src/lib/storage.ts`
6. `src/lib/cloudRepository.ts`
7. `src/lib/summary.ts`
8. `src/lib/ethics.ts`
9. `src/types.ts`
