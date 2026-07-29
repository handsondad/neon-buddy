import type { AppState } from "../types";

export const STORAGE_KEY = "xyr_virtual_child_v1";
export const ACCOUNT_KEY = "xyr_current_account_v1";
export const DEFAULT_ACCOUNT_ID = "guest";
export const ONBOARDING_KEY = "xyr_onboarding_complete_v1";

export function getAccountStorageKey(accountId: string): string {
  return `${STORAGE_KEY}:${accountId}`;
}

export function normalizeAccountId(input: string): string {
  const value = (input || "").trim().toLowerCase();
  if (!value) {
    return "";
  }
  return /^[a-z0-9_-]{2,24}$/.test(value) ? value : "";
}

export function loadCurrentAccountId(): string {
  const stored = normalizeAccountId(localStorage.getItem(ACCOUNT_KEY) || "");
  if (stored) {
    return stored;
  }
  localStorage.setItem(ACCOUNT_KEY, DEFAULT_ACCOUNT_ID);
  return DEFAULT_ACCOUNT_ID;
}

export function persistCurrentAccountId(accountId: string): void {
  localStorage.setItem(ACCOUNT_KEY, accountId);
}

export function hasCompletedOnboarding(accountId: string): boolean {
  return localStorage.getItem(`${ONBOARDING_KEY}:${accountId}`) === "1";
}

export function markOnboardingComplete(accountId: string): void {
  localStorage.setItem(`${ONBOARDING_KEY}:${accountId}`, "1");
}

export function loadState(accountId: string, defaultState: AppState): AppState {
  try {
    const legacy = localStorage.getItem(STORAGE_KEY);
    const accountKey = getAccountStorageKey(accountId);

    if (legacy && !localStorage.getItem(accountKey) && accountId === DEFAULT_ACCOUNT_ID) {
      localStorage.setItem(accountKey, legacy);
      localStorage.removeItem(STORAGE_KEY);
    }

    const raw = localStorage.getItem(accountKey);
    if (!raw) {
      return structuredClone(defaultState);
    }

    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(accountId: string, state: AppState): void {
  localStorage.setItem(getAccountStorageKey(accountId), JSON.stringify(state));
}
