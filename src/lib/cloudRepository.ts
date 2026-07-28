import type { AppState, CloudConfig, CloudSnapshot } from "../types";

const LOCAL_CLOUD_KEY = "xyr_cloud_mock_v1";

export interface CloudRepository {
  listSnapshots(accountId: string): Promise<CloudSnapshot[]>;
  uploadSnapshot(accountId: string, state: AppState): Promise<CloudSnapshot>;
  restoreLatest(accountId: string): Promise<CloudSnapshot | null>;
}

export function createCloudRepository(config: CloudConfig): CloudRepository {
  if (config.mode === "http") {
    return createHttpCloudRepository(config);
  }
  return createMockLocalCloudRepository();
}

function createMockLocalCloudRepository(): CloudRepository {
  return {
    async listSnapshots(accountId) {
      const store = loadCloudStore();
      return store[accountId] || [];
    },
    async uploadSnapshot(accountId, state) {
      const store = loadCloudStore();
      const snapshots = store[accountId] || [];
      const snapshot: CloudSnapshot = {
        id: `snap_${Date.now()}`,
        createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
        day: state.day,
        memoriesCount: state.memories.length,
        data: structuredClone(state)
      };

      const nextSnapshots = [snapshot, ...snapshots].slice(0, 10);
      store[accountId] = nextSnapshots;
      saveCloudStore(store);
      return snapshot;
    },
    async restoreLatest(accountId) {
      const store = loadCloudStore();
      const snapshots = store[accountId] || [];
      return snapshots[0] || null;
    }
  };
}

function createHttpCloudRepository(config: CloudConfig): CloudRepository {
  return {
    async listSnapshots(accountId) {
      ensureApiBase(config);
      const json = await requestJson(
        `${config.apiBase}/api/snapshots?accountId=${encodeURIComponent(accountId)}&limit=10`,
        { method: "GET" },
        config.timeoutMs
      );
      return json.items || [];
    },
    async uploadSnapshot(accountId, state) {
      ensureApiBase(config);
      const json = await requestJson(
        `${config.apiBase}/api/snapshots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId,
            payload: state,
            clientTs: new Date().toISOString()
          })
        },
        config.timeoutMs
      );

      return {
        id: json.snapshotId,
        createdAt: json.serverTs || new Date().toLocaleString("zh-CN", { hour12: false }),
        day: state.day,
        memoriesCount: state.memories.length,
        data: structuredClone(state)
      };
    },
    async restoreLatest(accountId) {
      ensureApiBase(config);
      const json = await requestJson(
        `${config.apiBase}/api/snapshots/latest?accountId=${encodeURIComponent(accountId)}`,
        { method: "GET" },
        config.timeoutMs
      );
      if (!json?.payload) {
        return null;
      }

      return {
        id: json.snapshotId,
        createdAt: json.serverTs || new Date().toLocaleString("zh-CN", { hour12: false }),
        day: json.payload.day || 1,
        memoriesCount: Array.isArray(json.payload.memories) ? json.payload.memories.length : 0,
        data: json.payload
      };
    }
  };
}

function ensureApiBase(config: CloudConfig): void {
  if (!config.apiBase) {
    throw new Error("cloud.apiBase 未配置，无法使用 HTTP 模式。");
  }
}

async function requestJson(url: string, options: RequestInit, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function loadCloudStore(): Record<string, CloudSnapshot[]> {
  try {
    const raw = localStorage.getItem(LOCAL_CLOUD_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CloudSnapshot[]>) : {};
  } catch {
    return {};
  }
}

function saveCloudStore(store: Record<string, CloudSnapshot[]>): void {
  localStorage.setItem(LOCAL_CLOUD_KEY, JSON.stringify(store));
}
