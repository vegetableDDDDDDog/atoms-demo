import type { QueryAnalysis } from "@/features/query/analyzeUserQuery";
import type { GeneratedApp, GeneratedAppCheck, GeneratedAppIssue, GeneratedFile, GeneratedModule, RunLogEntry } from "./types";

type GenerateAppInput = {
  prompt: string;
  analysis: QueryAnalysis;
};

const requiredFilePaths = ["index.html", "styles.css", "app.js"];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16);
}

function findSection(analysis: QueryAnalysis, title: string) {
  return analysis.sections.find((section) => section.title === title)?.items ?? [];
}

function titleFromAnalysis(prompt: string, analysis: QueryAnalysis) {
  const summaryTitle = analysis.summary.replace(/^准备实现：/, "").trim();
  if (summaryTitle && summaryTitle !== analysis.summary) {
    return summaryTitle;
  }

  const match = prompt.match(/(?:做|实现|生成|开发|搭建|写)(?:一个|个|套|款)?([^，。,.、\s]+(?:系统|应用|页面|工具|平台|网站|小程序|游戏))/);
  return match?.[1] ?? "生成应用";
}

function modulesFromAnalysis(analysis: QueryAnalysis): GeneratedModule[] {
  const features = findSection(analysis, "需求规格");
  const items = features.length > 0 ? features : ["核心信息录入", "列表查看", "状态流转"];

  return items.map((item) => ({
    title: item,
    description: `围绕“${item}”生成可操作的界面区域。`
  }));
}

function buildIndexHtml(title: string, modules: GeneratedModule[], fields: string[]) {
  const moduleCards = modules
    .map(
      (module) => `
        <article class="module-card">
          <h2>${escapeHtml(module.title)}</h2>
          <p>${escapeHtml(module.description)}</p>
        </article>`
    )
    .join("");

  const fieldInputs = fields
    .map(
      (field) => `
          <label>
            <span>${escapeHtml(field)}</span>
            <input name="${escapeHtml(field)}" placeholder="请输入${escapeHtml(field)}" />
          </label>`
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="app-shell">
      <section class="hero">
        <p>AI 生成应用</p>
        <h1>${escapeHtml(title)}</h1>
        <span>根据你的需求生成的可运行网页原型</span>
      </section>
      <section class="modules">
        ${moduleCards}
      </section>
      <section class="workspace">
        <form id="record-form">
          <h2>新增记录</h2>
${fieldInputs}
          <button type="submit">保存记录</button>
        </form>
        <section>
          <h2>记录列表</h2>
          <ul id="record-list"></ul>
        </section>
      </section>
    </main>
    <script src="./app.js"></script>
  </body>
</html>`;
}

function buildStylesCss() {
  return `:root {
  color-scheme: light;
  --bg: #f4f6f8;
  --ink: #172033;
  --muted: #647084;
  --panel: #ffffff;
  --line: #d8dee8;
  --accent: #256f56;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.app-shell {
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px;
}

.hero,
.module-card,
.workspace > * {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
  padding: 18px;
}

.hero {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.hero p,
.hero span,
.module-card p {
  margin: 0;
  color: var(--muted);
}

.hero h1,
.module-card h2,
.workspace h2 {
  margin: 0;
}

.modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  gap: 16px;
}

form {
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 14px;
}

input {
  min-height: 38px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 10px;
  color: var(--ink);
}

button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}

#record-list {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

#record-list li {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  color: var(--muted);
}

@media (max-width: 760px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}`;
}

function buildAppJs(fields: string[]) {
  const fallbackSummary = fields.map((field) => `${field}: 未填写`).join("；");

  return `const form = document.querySelector("#record-form");
const list = document.querySelector("#record-list");
const fields = ${JSON.stringify(fields)};

function renderRecord(values) {
  const item = document.createElement("li");
  item.textContent = fields.map((field) => \`\${field}: \${values[field] || "未填写"}\`).join("；") || ${JSON.stringify(fallbackSummary)};
  list.prepend(item);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const values = Object.fromEntries(fields.map((field) => [field, formData.get(field)]));
  renderRecord(values);
  form.reset();
});`;
}

function composePreviewHtml(indexHtml: string, stylesCss: string, appJs: string) {
  return indexHtml
    .replace('<link rel="stylesheet" href="./styles.css" />', `<style>${stylesCss}</style>`)
    .replace('<script src="./app.js"></script>', `<script>${appJs}</script>`);
}

function buildLogs(title: string, modules: GeneratedModule[]): RunLogEntry[] {
  return [
    { id: "intent", label: "意图识别", status: "done", detail: "识别为实现类需求，进入生成流程。" },
    { id: "analysis", label: "需求分析", status: "done", detail: `提取应用主题“${title}”和 ${modules.length} 个功能模块。` },
    { id: "code", label: "代码生成", status: "done", detail: "生成 index.html、styles.css、app.js。" },
    { id: "preview", label: "预览渲染", status: "done", detail: "已组合为可在 iframe 中运行的预览页面。" }
  ];
}

function buildGeneratedFiles(title: string, modules: GeneratedModule[], fields: string[]) {
  const indexHtml = buildIndexHtml(title, modules, fields);
  const stylesCss = buildStylesCss();
  const appJs = buildAppJs(fields);
  const files: GeneratedFile[] = [
    { path: "index.html", language: "html", content: indexHtml },
    { path: "styles.css", language: "css", content: stylesCss },
    { path: "app.js", language: "javascript", content: appJs }
  ];

  return {
    files,
    previewHtml: composePreviewHtml(indexHtml, stylesCss, appJs)
  };
}

export function generateApp({ prompt, analysis }: GenerateAppInput): GeneratedApp {
  const title = titleFromAnalysis(prompt, analysis);
  const modules = modulesFromAnalysis(analysis);
  const fields = modules.map((module) => module.title);
  const generated = buildGeneratedFiles(title, modules, fields);

  return {
    id: `artifact-${hashText(prompt)}`,
    title,
    modules,
    fields,
    files: generated.files,
    entryFile: "index.html",
    previewHtml: generated.previewHtml,
    logs: buildLogs(title, modules)
  };
}

export function verifyGeneratedApp(app: GeneratedApp): GeneratedAppCheck {
  const issues: GeneratedAppIssue[] = [];
  const filePaths = new Set(app.files.map((file) => file.path));

  if (!filePaths.has(app.entryFile)) {
    issues.push({ code: "missing-entry", message: `缺少入口文件 ${app.entryFile}` });
  }

  for (const path of requiredFilePaths) {
    if (!filePaths.has(path) && path !== app.entryFile) {
      issues.push({ code: "missing-file", message: `缺少文件 ${path}` });
    }
  }

  if (!app.previewHtml.trim()) {
    issues.push({ code: "empty-preview", message: "预览内容为空" });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function repairGeneratedApp(app: GeneratedApp): GeneratedApp {
  const generated = buildGeneratedFiles(app.title, app.modules, app.fields);

  return {
    ...app,
    files: generated.files,
    entryFile: "index.html",
    previewHtml: generated.previewHtml,
    logs: [
      ...app.logs,
      {
        id: `repair-${app.logs.length + 1}`,
        label: "一键修复",
        status: "done",
        detail: "已补齐缺失文件并重新生成预览。"
      }
    ]
  };
}
