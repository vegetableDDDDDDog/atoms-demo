import type { AgentPlanStep } from "./types";
import type { Locale } from "@/features/generator/types";

export function createAgentPlan(prompt: string, fixRequested = false, locale: Locale = "en"): AgentPlanStep[] {
  const copy = locale === "zh" ? zhAgentCopy(prompt, fixRequested) : enAgentCopy(prompt, fixRequested);

  return [
    {
      agent: "Mike",
      title: copy.mike.title,
      status: "done",
      content: copy.mike.content,
      order: 1
    },
    {
      agent: "Emma",
      title: copy.emma.title,
      status: "done",
      content: copy.emma.content,
      order: 2
    },
    {
      agent: "Bob",
      title: copy.bob.title,
      status: "done",
      content: copy.bob.content,
      order: 3
    },
    {
      agent: "Alex",
      title: copy.alex.title,
      status: "done",
      content: copy.alex.content,
      order: 4
    },
    {
      agent: "QA",
      title: copy.qa.title,
      status: "done",
      content: copy.qa.content,
      order: 5
    }
  ];
}

function enAgentCopy(prompt: string, fixRequested: boolean) {
  const repairCopy = fixRequested ? " This run focuses on fixing UX gaps from the selected version." : "";

  return {
    mike: {
      title: "Coordinate build",
      content: `I scoped the build request: ${prompt}.${repairCopy}`
    },
    emma: {
      title: "Extract requirements",
      content: "Core requirements: interactive preview, useful data controls, saved version, and publishable output."
    },
    bob: {
      title: "Design structure",
      content: "Data model includes projects, generation runs, ordered agent steps, app versions, and publish records."
    },
    alex: {
      title: "Generate app files",
      content: "Generated iframe-ready HTML, CSS, and JavaScript with local interactive state."
    },
    qa: {
      title: "Verify generated app",
      content: "Preview contains controls, responsive layout, and non-empty generated files."
    }
  };
}

function zhAgentCopy(prompt: string, fixRequested: boolean) {
  const repairCopy = fixRequested ? " 本轮会重点修复所选版本里的体验缺口。" : "";

  return {
    mike: {
      title: "协调构建",
      content: `我已经梳理构建需求：${prompt}。${repairCopy}`
    },
    emma: {
      title: "提炼需求",
      content: "核心需求：可交互预览、实用数据控件、保存版本，并支持发布分享。"
    },
    bob: {
      title: "设计结构",
      content: "数据模型包含项目、生成运行、按顺序记录的智能体步骤、应用版本和发布记录。"
    },
    alex: {
      title: "生成应用文件",
      content: "已生成可在 iframe 中运行的 HTML、CSS 和 JavaScript，并带有本地交互状态。"
    },
    qa: {
      title: "验证生成应用",
      content: "预览包含控件、响应式布局，并且生成文件内容不为空。"
    }
  };
}
