import type { Locale } from "@/features/generator/types";

export type { Locale } from "@/features/generator/types";

export const localeStorageKey = "atoms-demo-locale";

export function resolveLocale(value: unknown): Locale {
  return value === "zh" ? "zh" : "en";
}

export const dictionary = {
  en: {
    brandName: "Atoms Demo",
    mvp: "AI App Builder",
    projects: "Generated Apps",
    noBuilds: "No generated apps yet.",
    noVersion: "no version",
    projectStatus: {
      ready: "ready",
      generating: "generating"
    },
    productKicker: "Atoms Demo",
    productTitle: "AI app generation workspace",
    productSummary: "Describe an app idea, let agents turn it into code, then inspect the generated web app in a live preview.",
    flowSteps: [
      { title: "Describe idea", body: "Enter the app you want to create." },
      { title: "Agents plan", body: "The team breaks down requirements." },
      { title: "Generate code", body: "HTML, CSS, and JS are produced." },
      { title: "Preview & publish", body: "Run, fix, and share the result." }
    ],
    buildRoomTitle: "1. Describe the app to generate",
    tagline: "Use the example prompt or type your own product idea.",
    languageLabel: "Language",
    ready: "Ready",
    running: "Running",
    promptAria: "App generation request",
    defaultPrompt: "Build a customer booking manager with revenue tracking",
    run: "Generate app",
    generatedWorkspace: "Generated result",
    generatedResultReady: "The generated app is rendered below. Switch to code to inspect the files.",
    generatedResultEmpty: "Run a request to see the generated app and code here.",
    previewViews: "Generated result views",
    desktop: "Preview",
    mobile: "Mobile",
    code: "Code",
    previewStandbyTitle: "Generated app preview",
    previewStandbyBody: "After you run the builder, the generated web app appears here.",
    previewTitle: "Generated app preview",
    agentPipeline: "Agent worklog",
    agentsBuilding: "Agents are building the app...",
    agentEmpty: "Mike, Emma, Bob, Alex, and QA will log each step after a run starts.",
    fixBug: "Fix generated app",
    publish: "Publish preview",
    publishedAt: "Published at",
    errors: {
      loadProjects: "Could not load generated apps.",
      build: "The agent team could not finish this run.",
      fix: "QA could not create a fix run.",
      publish: "Publish failed for this version."
    }
  },
  zh: {
    brandName: "Atoms Demo",
    mvp: "AI 应用生成器",
    projects: "生成记录",
    noBuilds: "还没有生成应用。",
    noVersion: "暂无版本",
    projectStatus: {
      ready: "已就绪",
      generating: "生成中"
    },
    productKicker: "Atoms Demo",
    productTitle: "AI 应用生成工作台",
    productSummary: "输入一个应用想法，让多个智能体协作生成代码，并在网页中直接预览生成结果。",
    flowSteps: [
      { title: "描述想法", body: "输入你想创建的应用。" },
      { title: "智能体规划", body: "团队拆解需求和结构。" },
      { title: "生成代码", body: "产出 HTML、CSS 和 JS。" },
      { title: "预览发布", body: "运行、修复并分享结果。" }
    ],
    buildRoomTitle: "1. 描述要生成的应用",
    tagline: "可以使用示例需求，也可以输入自己的产品想法。",
    languageLabel: "语言",
    ready: "就绪",
    running: "运行中",
    promptAria: "应用生成需求",
    defaultPrompt: "生成一个客户预约管理应用，包含收入追踪",
    run: "生成应用",
    generatedWorkspace: "生成结果",
    generatedResultReady: "生成的应用会在下方渲染，也可以切到代码查看文件。",
    generatedResultEmpty: "运行一次需求后，这里会展示生成应用和代码。",
    previewViews: "生成结果视图",
    desktop: "预览",
    mobile: "移动端",
    code: "代码",
    previewStandbyTitle: "生成应用预览",
    previewStandbyBody: "运行构建器后，生成出来的网页应用会显示在这里。",
    previewTitle: "生成应用预览",
    agentPipeline: "智能体工作记录",
    agentsBuilding: "智能体正在生成应用...",
    agentEmpty: "运行开始后，Mike、Emma、Bob、Alex 和 QA 会记录各自完成的步骤。",
    fixBug: "修复生成结果",
    publish: "发布预览",
    publishedAt: "已发布到",
    errors: {
      loadProjects: "生成记录加载失败。",
      build: "智能体团队未能完成本次生成。",
      fix: "QA 未能创建修复版本。",
      publish: "当前版本发布失败。"
    }
  }
} as const satisfies Record<Locale, Record<string, unknown>>;

export type BuildRoomCopy = (typeof dictionary)[Locale];

