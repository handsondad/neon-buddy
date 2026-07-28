# 账号与云存档落地方案（下一阶段）

## 当前状态

当前版本已实现“本地模拟云”：

- 多账号切换（账号隔离存储）
- 云快照上传（保存最近 10 条）
- 云快照恢复（恢复最新一条）
- 快照列表可视化

说明：当前云端为 localStorage 模拟，不涉及真实网络请求。

已完成抽象：

- 已封装 `src/lib/cloudRepository.ts`，UI 层通过统一仓储接口调用
- 支持通过配置切换 `mock-local` 与 `http` 模式
- 已完成本地模拟模式全链路验证

## 目标后端能力

1. 账号认证
2. 数据上传与读取
3. 快照历史管理
4. 设备间同步冲突处理

## 建议接口（REST）

### 1) 登录/匿名身份绑定

- `POST /api/auth/session`
- 请求：`{ accountId: string }`
- 响应：`{ userId: string, token: string, expiresAt: string }`

### 2) 上传完整状态快照

- `POST /api/snapshots`
- Header：`Authorization: Bearer <token>`
- 请求：`{ accountId: string, payload: AppState, clientTs: string }`
- 响应：`{ snapshotId: string, serverTs: string }`

### 3) 获取最新快照

- `GET /api/snapshots/latest?accountId=<id>`
- 响应：`{ snapshotId: string, payload: AppState, serverTs: string }`

### 4) 获取快照列表

- `GET /api/snapshots?accountId=<id>&limit=10`
- 响应：`{ items: Array<{ snapshotId: string, day: number, memoriesCount: number, serverTs: string }> }`

## AppState 建议结构

```json
{
  "childName": "小洋人",
  "day": 12,
  "stage": "explorer",
  "stats": {
    "safety": 66,
    "trust": 63,
    "curiosity": 58,
    "mood": 61
  },
  "memories": []
}
```

## 冲突策略（推荐）

- MVP：采用 `last-write-wins`（以 `serverTs` 最新为准）
- 后续：增加“手动选择版本”界面，允许用户比较两份快照再合并

## 安全与隐私建议

1. 仅存储必要字段，不上传无关个人隐私
2. 传输使用 HTTPS
3. token 设定有效期并支持刷新
4. 提供账号数据导出与删除能力

## 前端接入顺序

1. 封装 `CloudRepository`（统一本地模拟与真实 API）
2. 保留当前 UI，不改交互文案
3. 先接“上传快照 / 恢复最新”两条链路
4. 再替换“快照列表”来源
5. 最后加入网络异常与重试提示
