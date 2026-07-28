import type { EthicalCopy } from "../types";

export function sanitizeCopy(text: string, ethicalCopy: EthicalCopy): string {
  let safeText = text;

  for (const rule of ethicalCopy.replacements) {
    safeText = safeText.split(rule.from).join(rule.to);
  }

  const blocked = ethicalCopy.blockedKeywords.some((keyword) => keyword && safeText.includes(keyword));
  if (blocked) {
    return ethicalCopy.fallbackLine;
  }

  return safeText;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
