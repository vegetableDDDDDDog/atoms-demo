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
    runInProgress: "Generating...",
    generatedWorkspace: "Generated result",
    generatedResultReady: "The generated app is rendered below. Switch to code to inspect the files.",
    generatedResultEmpty: "Run a request to see the generated app and code here.",
    generatedResultGenerating: "The agent team is working. The preview will appear as soon as QA finishes.",
    previewViews: "Generated result views",
    desktop: "Preview",
    mobile: "Mobile",
    code: "Code",
    previewStandbyTitle: "Generated app preview",
    previewStandbyBody: "After you run the builder, the generated web app appears here.",
    previewTitle: "Generated app preview",
    generatedCompleteLabel: "Generated app",
    generatedPreviewHint: "This is the runnable web app created from your request.",
    progressTitle: "Generating your app",
    progressCompleteTitle: "Finalizing preview",
    progressErrorTitle: "Generation needs attention",
    progressErrorBody: "The run stopped before the preview was ready. Try again or adjust the request.",
    progressStatusLabels: {
      waiting: "Waiting",
      active: "Running",
      done: "Done",
      error: "Error"
    },
    generationPhases: [
      { agent: "Mike", title: "Understand request", content: "Reading your prompt and defining the build goal." },
      { agent: "Emma", title: "Extract requirements", content: "Turning the idea into screens, data, and interactions." },
      { agent: "Bob", title: "Design structure", content: "Choosing the generated app structure and state model." },
      { agent: "Alex", title: "Generate code", content: "Writing iframe-ready HTML, CSS, and JavaScript." },
      { agent: "QA", title: "Verify preview", content: "Checking that the generated app can render and be published." }
    ],
    agentPipeline: "Agent worklog",
    agentsBuilding: "Agents are building the app...",
    agentEmpty: "Mike, Emma, Bob, Alex, and QA will log each step after a run starts.",
    fixBug: "Fix generated app",
    publish: "Publish preview",
    publishedAt: "Published at",
    workspaceSubtitle: "Web AI Coding Workspace",
    currentProject: "Project",
    workspaceMode: "Mode",
    teamMode: "Team Mode",
    topbarPublishIdle: "Ready to publish",
    leftRailTitle: "Workspace context",
    generatedFiles: "Generated files",
    versions: "Versions",
    conversationTitle: "Chat with agents",
    conversationSubtitle: "Describe what to build, then follow the agent plan as it turns the request into files and preview.",
    userRequestLabel: "User request",
    agentPlanLabel: "Agent plan",
    nextActionsLabel: "Next actions",
    followUpSuggestions: [
      "Make the dashboard denser and easier to scan",
      "Add role-based approval states",
      "Generate a mobile-friendly version"
    ],
    workspaceTabs: [
      { id: "preview", label: "Preview" },
      { id: "mobile", label: "Mobile" },
      { id: "code", label: "Code" },
      { id: "diff", label: "Diff" },
      { id: "deploy", label: "Deploy" }
    ],
    rightWorkspaceTitle: "Generated workspace",
    diffTitle: "Generated changes",
    diffEmpty: "Run a request to see which files the agents create.",
    diffSummary: "The latest run produced these editable web app files.",
    deployTitle: "Publish status",
    deployEmpty: "Publish becomes available after a generated app version exists.",
    deployReady: "Preview is published",
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
    runInProgress: "生成中...",
    generatedWorkspace: "生成结果",
    generatedResultReady: "生成的应用会在下方渲染，也可以切到代码查看文件。",
    generatedResultEmpty: "运行一次需求后，这里会展示生成应用和代码。",
    generatedResultGenerating: "智能体团队正在工作，QA 完成后会显示预览结果。",
    previewViews: "生成结果视图",
    desktop: "预览",
    mobile: "移动端",
    code: "代码",
    previewStandbyTitle: "生成应用预览",
    previewStandbyBody: "运行构建器后，生成出来的网页应用会显示在这里。",
    previewTitle: "生成应用预览",
    generatedCompleteLabel: "已生成应用",
    generatedPreviewHint: "这是根据你的需求生成出来的可运行网页应用。",
    progressTitle: "正在生成你的应用",
    progressCompleteTitle: "正在整理预览",
    progressErrorTitle: "生成过程需要处理",
    progressErrorBody: "本次运行在预览生成前停止了。可以重试，或调整需求后再生成。",
    progressStatusLabels: {
      waiting: "等待中",
      active: "进行中",
      done: "已完成",
      error: "失败"
    },
    generationPhases: [
      { agent: "Mike", title: "理解需求", content: "读取你的提示词，确定本次要生成的应用目标。" },
      { agent: "Emma", title: "提炼功能", content: "把想法整理成页面、数据和交互需求。" },
      { agent: "Bob", title: "设计结构", content: "规划生成应用的结构和状态模型。" },
      { agent: "Alex", title: "生成代码", content: "编写可在 iframe 中运行的 HTML、CSS 和 JavaScript。" },
      { agent: "QA", title: "检查预览", content: "确认生成应用可以渲染，并具备发布条件。" }
    ],
    agentPipeline: "智能体工作记录",
    agentsBuilding: "智能体正在生成应用...",
    agentEmpty: "运行开始后，Mike、Emma、Bob、Alex 和 QA 会记录各自完成的步骤。",
    fixBug: "修复生成结果",
    publish: "发布预览",
    publishedAt: "已发布到",
    workspaceSubtitle: "网页版 AI 编程工作台",
    currentProject: "项目",
    workspaceMode: "模式",
    teamMode: "团队模式",
    topbarPublishIdle: "可以发布",
    leftRailTitle: "工作区上下文",
    generatedFiles: "生成文件",
    versions: "版本记录",
    conversationTitle: "和智能体对话",
    conversationSubtitle: "描述你想构建的应用，然后跟随智能体计划，把需求变成文件和预览。",
    userRequestLabel: "用户需求",
    agentPlanLabel: "智能体计划",
    nextActionsLabel: "下一步可以继续说",
    followUpSuggestions: [
      "让仪表盘更紧凑，方便快速浏览",
      "增加角色审批状态",
      "生成一个移动端友好的版本"
    ],
    workspaceTabs: [
      { id: "preview", label: "预览" },
      { id: "mobile", label: "移动端" },
      { id: "code", label: "代码" },
      { id: "diff", label: "变更" },
      { id: "deploy", label: "发布" }
    ],
    rightWorkspaceTitle: "生成工作区",
    diffTitle: "生成变更",
    diffEmpty: "运行一次需求后，可以看到智能体创建了哪些文件。",
    diffSummary: "最新运行生成了这些可编辑的网页应用文件。",
    deployTitle: "发布状态",
    deployEmpty: "生成应用版本后，可以在这里发布预览。",
    deployReady: "预览已发布",
    errors: {
      loadProjects: "生成记录加载失败。",
      build: "智能体团队未能完成本次生成。",
      fix: "QA 未能创建修复版本。",
      publish: "当前版本发布失败。"
    }
  }
} as const satisfies Record<Locale, Record<string, unknown>>;

export type BuildRoomCopy = (typeof dictionary)[Locale];
