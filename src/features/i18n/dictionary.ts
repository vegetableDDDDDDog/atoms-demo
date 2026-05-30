import type { Locale } from "@/features/generator/types";

export type { Locale } from "@/features/generator/types";

export const localeStorageKey = "atoms-demo-locale";

export function resolveLocale(value: unknown): Locale {
  return value === "zh" ? "zh" : "en";
}

export const dictionary = {
  en: {
    brandName: "Atoms Mini",
    mvp: "MVP",
    projects: "Projects",
    noBuilds: "No builds yet.",
    noVersion: "no version",
    projectStatus: {
      ready: "ready",
      generating: "generating"
    },
    buildRoomTitle: "Agent Build Room",
    tagline: "Team Mode · SQLite persistence · iframe preview",
    languageLabel: "Language",
    ready: "Ready",
    running: "Running",
    promptAria: "Build prompt",
    defaultPrompt: "Build a booking CRM for customers with revenue tracking",
    run: "Run",
    previewViews: "Preview views",
    desktop: "Desktop",
    mobile: "Mobile",
    code: "Code",
    previewStandbyTitle: "Preview standby",
    previewStandbyBody: "Run Team Mode to render the generated app here.",
    previewTitle: "Generated app preview",
    agentPipeline: "Agent Pipeline",
    agentsBuilding: "Agents are building...",
    agentEmpty: "Mike, Emma, Bob, Alex, and QA are waiting for the next run.",
    fixBug: "Fix Bug",
    publish: "Publish",
    publishedAt: "Published at",
    errors: {
      loadProjects: "Could not load projects.",
      build: "The agent team could not finish this run.",
      fix: "QA could not create a fix run.",
      publish: "Publish failed for this version."
    }
  },
  zh: {
    brandName: "Atoms Mini",
    mvp: "MVP",
    projects: "项目",
    noBuilds: "还没有生成记录。",
    noVersion: "暂无版本",
    projectStatus: {
      ready: "已就绪",
      generating: "生成中"
    },
    buildRoomTitle: "智能体构建室",
    tagline: "团队模式 · SQLite 持久化 · iframe 预览",
    languageLabel: "语言",
    ready: "就绪",
    running: "运行中",
    promptAria: "构建需求",
    defaultPrompt: "生成一个客户预约 CRM，包含收入追踪",
    run: "运行",
    previewViews: "预览视图",
    desktop: "桌面",
    mobile: "移动端",
    code: "代码",
    previewStandbyTitle: "预览待命",
    previewStandbyBody: "运行团队模式后，生成的应用会在这里渲染。",
    previewTitle: "生成应用预览",
    agentPipeline: "智能体流水线",
    agentsBuilding: "智能体正在构建...",
    agentEmpty: "Mike、Emma、Bob、Alex 和 QA 正在等待下一次运行。",
    fixBug: "修复问题",
    publish: "发布",
    publishedAt: "已发布到",
    errors: {
      loadProjects: "项目加载失败。",
      build: "智能体团队未能完成本次生成。",
      fix: "QA 未能创建修复版本。",
      publish: "当前版本发布失败。"
    }
  }
} as const satisfies Record<Locale, Record<string, unknown>>;

export type BuildRoomCopy = (typeof dictionary)[Locale];

