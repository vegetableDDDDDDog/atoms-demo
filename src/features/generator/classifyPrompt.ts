import type { AppType } from "./types";

const rules: Array<{ type: AppType; words: string[] }> = [
  { type: "crm", words: ["crm", "customer", "client", "booking", "appointment", "sales"] },
  { type: "portfolio", words: ["portfolio", "investment", "stock", "watchlist", "asset", "fund"] },
  { type: "operations", words: ["todo", "task", "internal", "operation", "ops", "kanban"] },
  { type: "commerce", words: ["shop", "store", "commerce", "product", "checkout", "order"] }
];

export function classifyPrompt(prompt: string): AppType {
  const normalized = prompt.toLowerCase();
  return rules.find((rule) => rule.words.some((word) => normalized.includes(word)))?.type ?? "operations";
}
