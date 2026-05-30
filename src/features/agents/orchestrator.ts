import type { AgentPlanStep } from "./types";
import { buildPlanningArtifacts, sentenceList } from "./planningArtifacts";
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
  const artifacts = buildPlanningArtifacts(prompt, "en");

  return {
    mike: {
      title: "Coordinate build",
      content: `Request: ${prompt}.${repairCopy}
Plan: analyze requirements, define product structure, generate runnable files, then verify the preview.`
    },
    emma: {
      title: "Requirement analysis",
      content: `Roles: ${sentenceList(artifacts.roles)}
Workflow/modules: ${sentenceList(artifacts.modules)}
Acceptance criteria: ${sentenceList(artifacts.acceptanceCriteria)}`
    },
    bob: {
      title: "Product design",
      content: `Page structure: ${sentenceList(artifacts.pages)}
Data objects: ${sentenceList(artifacts.dataObjects)}
Interaction design: ${sentenceList(artifacts.designNotes)}`
    },
    alex: {
      title: "Generate app files",
      content: `Generated files: ${sentenceList(artifacts.implementationFiles)}
Implementation maps the analyzed workflow into an iframe-ready preview with local interactive state.`
    },
    qa: {
      title: "Verify generated app",
      content: `Verifiable checks: ${sentenceList(artifacts.qaChecks)}
Preview contains controls, responsive layout, and non-empty generated files.`
    }
  };
}

function zhAgentCopy(prompt: string, fixRequested: boolean) {
  const repairCopy = fixRequested ? " 本轮会重点修复所选版本里的体验缺口。" : "";
  const artifacts = buildPlanningArtifacts(prompt, "zh");

  return {
    mike: {
      title: "协调构建",
      content: `需求：${prompt}。${repairCopy}
计划：先做需求分析，再做产品设计，然后生成可运行文件并验证预览。`
    },
    emma: {
      title: "需求分析",
      content: `角色：${sentenceList(artifacts.roles)}
核心流程：${sentenceList(artifacts.modules)}
验收标准：${sentenceList(artifacts.acceptanceCriteria)}`
    },
    bob: {
      title: "产品设计",
      content: `页面结构：${sentenceList(artifacts.pages)}
数据对象：${sentenceList(artifacts.dataObjects)}
交互设计：${sentenceList(artifacts.designNotes)}`
    },
    alex: {
      title: "生成应用文件",
      content: `生成文件：${sentenceList(artifacts.implementationFiles)}
实现方式：把上面的流程和数据对象映射成可在 iframe 中运行的交互预览。`
    },
    qa: {
      title: "验证生成应用",
      content: `可验证：${sentenceList(artifacts.qaChecks)}
预览包含控件、响应式布局，并且生成文件内容不为空。`
    }
  };
}
