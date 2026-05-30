import type { AppType } from "./types";

const rules: Array<{ type: AppType; words: string[] }> = [
  {
    type: "crm",
    words: ["crm", "customer", "client", "booking", "appointment", "sales", "客户", "预约", "销售", "线索", "客资"]
  },
  {
    type: "portfolio",
    words: ["portfolio", "investment", "stock", "watchlist", "asset", "fund", "投资", "股票", "资产", "基金", "持仓"]
  },
  {
    type: "requirements",
    words: [
      "requirement",
      "requirements",
      "demand",
      "prd",
      "roadmap",
      "scope",
      "需求",
      "评审",
      "排期",
      "提价",
      "提交",
      "转测",
      "关闭"
    ]
  },
  {
    type: "operations",
    words: ["todo", "task", "internal", "operation", "ops", "kanban", "待办", "任务", "内部", "运营", "看板"]
  },
  {
    type: "commerce",
    words: ["shop", "store", "commerce", "product", "checkout", "order", "商店", "商城", "商品", "结账", "订单", "电商"]
  }
];

export function classifyPrompt(prompt: string): AppType {
  const normalized = prompt.toLowerCase();
  return rules.find((rule) => rule.words.some((word) => normalized.includes(word)))?.type ?? "operations";
}

