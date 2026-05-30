import { classifyPrompt } from "@/features/generator/classifyPrompt";
import type { AppType, Locale } from "@/features/generator/types";

type PlanningArtifacts = {
  appType: AppType;
  roles: string[];
  modules: string[];
  pages: string[];
  dataObjects: string[];
  acceptanceCriteria: string[];
  designNotes: string[];
  implementationFiles: string[];
  qaChecks: string[];
};

type ArtifactCopy = Omit<PlanningArtifacts, "appType">;

const zhArtifacts: Record<AppType, ArtifactCopy> = {
  crm: {
    roles: ["销售", "客户成功", "运营负责人"],
    modules: ["客户录入", "预约跟进", "收入追踪", "客户状态流转"],
    pages: ["客户列表", "预约日程", "收入概览", "客户详情"],
    dataObjects: ["Customer", "Booking", "RevenueRecord", "FollowUp"],
    acceptanceCriteria: ["可以新增跟进记录", "可以按状态筛选客户", "可以看到收入指标"],
    designNotes: ["左侧看客户池", "顶部看核心指标", "详情里处理跟进动作"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["预览能渲染客户数据", "新增记录按钮可用", "移动端列表不溢出"]
  },
  portfolio: {
    roles: ["投资者", "资产管理员"],
    modules: ["持仓概览", "关注列表", "资产配置", "风险提醒"],
    pages: ["组合总览", "资产列表", "调仓提醒"],
    dataObjects: ["Holding", "WatchItem", "Allocation", "Alert"],
    acceptanceCriteria: ["可以查看资产指标", "可以筛选关注项", "可以看到风险提醒"],
    designNotes: ["指标优先", "列表支持快速扫描", "提醒信息突出显示"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["指标卡不为空", "筛选控件存在", "预览在移动端可读"]
  },
  requirements: {
    roles: ["需求提出人", "产品负责人", "研发负责人", "测试负责人"],
    modules: ["需求提报", "需求评审", "需求排期", "需求设计与分析", "开发", "转测", "测试", "关闭"],
    pages: ["需求列表", "需求详情", "版本排期看板", "评审记录"],
    dataObjects: ["Requirement", "Review", "ReleasePlan", "DesignSpec", "TestCase", "StatusHistory"],
    acceptanceCriteria: [
      "可以提交新需求并进入待评审状态",
      "可以记录评审结论和排期版本",
      "可以跟踪从设计分析到测试关闭的完整状态"
    ],
    designNotes: ["需求列表按状态分组", "详情页展示评审、设计、开发、测试信息", "关键状态用看板方式表达"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["可验证需求流转链路", "可验证状态筛选", "可验证新增记录交互"]
  },
  operations: {
    roles: ["执行人", "负责人", "协作团队"],
    modules: ["任务收集", "优先级排序", "负责人分配", "阻塞跟踪"],
    pages: ["任务看板", "执行列表", "风险摘要"],
    dataObjects: ["Task", "Owner", "Priority", "Blocker"],
    acceptanceCriteria: ["可以新增任务", "可以查看进行中事项", "可以识别阻塞项"],
    designNotes: ["看板适合快速扫描", "状态和负责人必须并列展示", "操作按钮靠近任务行"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["任务列表不为空", "新增交互可用", "状态切换可用"]
  },
  commerce: {
    roles: ["店铺运营", "商品负责人"],
    modules: ["商品管理", "订单追踪", "库存提醒", "销售概览"],
    pages: ["商品列表", "订单列表", "销售仪表盘"],
    dataObjects: ["Product", "Order", "Inventory", "SalesMetric"],
    acceptanceCriteria: ["可以查看订单指标", "可以管理商品状态", "可以识别库存动作"],
    designNotes: ["销售指标放在首屏", "商品和订单列表保持紧凑", "库存提醒使用醒目标记"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["订单数据可见", "商品状态可切换", "移动端布局可用"]
  }
};

const enArtifacts: Record<AppType, ArtifactCopy> = {
  crm: {
    roles: ["Sales rep", "Customer success", "Operations lead"],
    modules: ["Customer intake", "Booking follow-up", "Revenue tracking", "Customer status flow"],
    pages: ["Customer list", "Booking calendar", "Revenue overview", "Customer detail"],
    dataObjects: ["Customer", "Booking", "RevenueRecord", "FollowUp"],
    acceptanceCriteria: ["Users can add follow-ups", "Users can filter customers by status", "Revenue metrics are visible"],
    designNotes: ["Customer pool stays on the left", "Core metrics stay at the top", "Follow-up actions live in detail rows"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["Preview renders customer data", "Add button works", "Mobile list does not overflow"]
  },
  portfolio: {
    roles: ["Investor", "Portfolio manager"],
    modules: ["Holdings overview", "Watchlist", "Allocation", "Risk alerts"],
    pages: ["Portfolio overview", "Asset list", "Rebalance alerts"],
    dataObjects: ["Holding", "WatchItem", "Allocation", "Alert"],
    acceptanceCriteria: ["Asset metrics are visible", "Watch items can be scanned", "Risk alerts are shown"],
    designNotes: ["Metrics come first", "Lists stay dense", "Alerts are visually distinct"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["Metric cards are non-empty", "Filters exist", "Preview is readable on mobile"]
  },
  requirements: {
    roles: ["Requester", "Product owner", "Engineering lead", "QA lead"],
    modules: ["Demand intake", "Requirement review", "Release scheduling", "Design analysis", "Development", "QA handoff", "Testing", "Closure"],
    pages: ["Requirement list", "Requirement detail", "Release board", "Review log"],
    dataObjects: ["Requirement", "Review", "ReleasePlan", "DesignSpec", "TestCase", "StatusHistory"],
    acceptanceCriteria: [
      "Users can submit a requirement into review",
      "Users can record review decisions and planned release",
      "Users can track design, development, testing, and closure"
    ],
    designNotes: ["Group requirements by status", "Detail view combines review, design, development, and testing", "Board view highlights status movement"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["Requirement workflow is verifiable", "Status filtering is verifiable", "Add-record interaction is verifiable"]
  },
  operations: {
    roles: ["Assignee", "Owner", "Collaborating team"],
    modules: ["Task intake", "Priority sorting", "Owner assignment", "Blocker tracking"],
    pages: ["Task board", "Execution list", "Risk summary"],
    dataObjects: ["Task", "Owner", "Priority", "Blocker"],
    acceptanceCriteria: ["Users can add tasks", "In-progress work is visible", "Blocked items are identifiable"],
    designNotes: ["Board supports scanning", "Status and owner must be adjacent", "Actions stay close to each row"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["Task list is non-empty", "Add interaction works", "Status toggle works"]
  },
  commerce: {
    roles: ["Store operator", "Merchandising lead"],
    modules: ["Product management", "Order tracking", "Inventory alerts", "Sales overview"],
    pages: ["Product list", "Order list", "Sales dashboard"],
    dataObjects: ["Product", "Order", "Inventory", "SalesMetric"],
    acceptanceCriteria: ["Order metrics are visible", "Product status can be managed", "Inventory actions are identifiable"],
    designNotes: ["Sales metrics stay above the fold", "Product and order lists stay compact", "Inventory alerts use clear labels"],
    implementationFiles: ["index.html", "styles.css", "app.js"],
    qaChecks: ["Order data is visible", "Product status toggles", "Mobile layout works"]
  }
};

export function buildPlanningArtifacts(prompt: string, locale: Locale = "en"): PlanningArtifacts {
  const appType = classifyPrompt(prompt);
  const copy = locale === "zh" ? zhArtifacts[appType] : enArtifacts[appType];

  return {
    appType,
    ...copy
  };
}

export function sentenceList(items: string[]) {
  return items.join("、");
}
