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
  const summaryTitle = analysis.summary.replace(/^(准备实现|修改需求)：/, "").trim();
  if (summaryTitle && summaryTitle !== analysis.summary) {
    return summaryTitle;
  }

  const match = prompt.match(/(?:做|实现|生成|开发|搭建|写)(?:一个|个|套|款)?([^，。,.、\s]+(?:系统|应用|页面|工具|平台|网站|小程序|游戏))/);
  return match?.[1] ?? "生成应用";
}

function modulesFromAnalysis(analysis: QueryAnalysis): GeneratedModule[] {
  const features = findSection(analysis, "功能拆解").length > 0 ? findSection(analysis, "功能拆解") : findSection(analysis, "需求规格");
  const items = features.length > 0 ? features : ["核心信息录入", "列表查看", "状态流转"];

  return items.map((item) => ({
    title: item,
    description: `围绕“${item}”生成可操作的界面区域。`
  }));
}

function isGameApp(title: string, modules: GeneratedModule[]) {
  const source = `${title} ${modules.map((module) => module.title).join(" ")}`;
  return /游戏|横版|射击|敌人|生命值|得分|玩家|game/i.test(source);
}

function isContentApp(title: string, modules: GeneratedModule[]) {
  const source = `${title} ${modules.map((module) => module.title).join(" ")}`;
  return !isGameApp(title, modules) && /官网|网站|页面|落地页|首屏|内容展示|行动按钮|联系入口|website|landing/i.test(source);
}

function isLifecycleApp(title: string, modules: GeneratedModule[]) {
  const source = `${title} ${modules.map((module) => module.title).join(" ")}`;
  return /提交|评审|排期|设计|开发|测试|关闭|审批|流转|状态/.test(source);
}

function entityNameFromTitle(title: string) {
  const compact = title.replace(/管理系统|系统|应用|工具|平台|页面|网站|小程序|游戏/g, "").trim();
  if (compact.includes("需求")) return "需求";
  return compact || "记录";
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

function buildGameIndexHtml(title: string, modules: GeneratedModule[]) {
  const moduleCards = modules
    .map(
      (module) => `
        <article class="module-card">
          <h2>${escapeHtml(module.title)}</h2>
          <p>${escapeHtml(module.description)}</p>
        </article>`
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
    <main class="game-app">
      <section class="game-header">
        <p>AI 生成游戏原型</p>
        <h1>${escapeHtml(title)}</h1>
        <span>可运行的横版射击小游戏：移动、跳跃、射击、击败敌人并保住生命值。</span>
      </section>

      <section class="hud" aria-label="游戏状态">
        <strong>得分 <span id="score">0</span></strong>
        <strong>生命 <span id="lives">3</span></strong>
        <strong>状态 <span id="status">待开始</span></strong>
      </section>

      <canvas id="game-canvas" width="760" height="360" aria-label="游戏舞台"></canvas>

      <section class="controls">
        <button id="start-button" type="button">开始 / 重新开始</button>
        <p>A/D 或方向键移动，W/空格跳跃，J 射击。击中敌人得分，被敌人碰到扣生命。</p>
      </section>

      <section class="modules">
        ${moduleCards}
      </section>
    </main>
    <script src="./app.js"></script>
  </body>
</html>`;
}

function buildGameStylesCss() {
  return `:root {
  color-scheme: dark;
  --bg: #101319;
  --panel: #171d27;
  --panel-strong: #202838;
  --ink: #f5f7fb;
  --muted: #a7b1c2;
  --line: #364052;
  --accent: #34d399;
  --danger: #fb7185;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at 20% 0%, #22314d, var(--bg) 42%);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.game-app {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  gap: 14px;
}

.game-header,
.hud,
.controls,
.module-card {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(23, 29, 39, 0.9);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
}

.game-header {
  padding: 18px;
}

.game-header p,
.game-header span,
.module-card p,
.controls p {
  margin: 0;
  color: var(--muted);
}

.game-header h1 {
  margin: 8px 0;
  font-size: 36px;
}

.hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px;
}

.hud strong {
  border-radius: 8px;
  background: var(--panel-strong);
  padding: 10px;
}

#score {
  color: var(--accent);
}

#lives {
  color: var(--danger);
}

#game-canvas {
  width: 100%;
  aspect-ratio: 19 / 9;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #0b1020;
  display: block;
}

.controls {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
}

button {
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #052016;
  font-weight: 800;
  min-height: 40px;
  padding: 0 14px;
}

.modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.module-card {
  padding: 14px;
}

.module-card h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

@media (max-width: 680px) {
  .hud,
  .controls {
    grid-template-columns: 1fr;
    display: grid;
  }

  .game-header h1 {
    font-size: 28px;
  }
}`;
}

function buildGameAppJs() {
  return `const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const livesEl = document.querySelector("#lives");
const statusEl = document.querySelector("#status");
const startButton = document.querySelector("#start-button");

const keys = new Set();
const bullets = [];
const enemies = [];
let score = 0;
let lives = 3;
let frame = 0;
let running = false;

const player = {
  x: 72,
  y: 260,
  width: 34,
  height: 42,
  velocityY: 0,
  grounded: true,
  direction: 1
};

function resetGame() {
  bullets.length = 0;
  enemies.length = 0;
  score = 0;
  lives = 3;
  frame = 0;
  running = true;
  player.x = 72;
  player.y = 260;
  player.velocityY = 0;
  player.grounded = true;
  updateHud("战斗中");
  requestAnimationFrame(loop);
}

function updateHud(status) {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
  statusEl.textContent = status;
}

function shoot() {
  if (!running) return;
  if (frame % 8 !== 0) return;
  bullets.push({
    x: player.x + player.width,
    y: player.y + 18,
    width: 12,
    height: 4,
    speed: 8 * player.direction
  });
}

function spawnEnemy() {
  enemies.push({
    x: canvas.width + 20,
    y: 270,
    width: 30,
    height: 32,
    speed: 2.4 + Math.min(score / 80, 2.4)
  });
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updatePlayer() {
  if (keys.has("ArrowLeft") || keys.has("a")) {
    player.x -= 4;
    player.direction = -1;
  }
  if (keys.has("ArrowRight") || keys.has("d")) {
    player.x += 4;
    player.direction = 1;
  }
  if ((keys.has("ArrowUp") || keys.has("w") || keys.has(" ")) && player.grounded) {
    player.velocityY = -12;
    player.grounded = false;
  }

  player.velocityY += 0.7;
  player.y += player.velocityY;
  player.x = Math.max(18, Math.min(canvas.width - player.width - 18, player.x));

  if (player.y >= 260) {
    player.y = 260;
    player.velocityY = 0;
    player.grounded = true;
  }
}

function updateWorld() {
  if (frame % 75 === 0) spawnEnemy();
  if (keys.has("j")) shoot();

  for (const bullet of bullets) bullet.x += bullet.speed;
  for (const enemy of enemies) enemy.x -= enemy.speed;

  for (const enemy of enemies) {
    for (const bullet of bullets) {
      if (!enemy.hit && !bullet.hit && intersects(enemy, bullet)) {
        enemy.hit = true;
        bullet.hit = true;
        score += 10;
      }
    }

    if (!enemy.hit && intersects(enemy, player)) {
      enemy.hit = true;
      lives -= 1;
      if (lives <= 0) {
        running = false;
        updateHud("游戏结束");
      }
    }
  }

  for (let index = bullets.length - 1; index >= 0; index -= 1) {
    if (bullets[index].hit || bullets[index].x < -20 || bullets[index].x > canvas.width + 20) bullets.splice(index, 1);
  }
  for (let index = enemies.length - 1; index >= 0; index -= 1) {
    if (enemies[index].hit || enemies[index].x < -50) enemies.splice(index, 1);
  }
}

function drawBackground() {
  context.fillStyle = "#0b1020";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#1f2a44";
  context.fillRect(0, 306, canvas.width, 54);
  context.strokeStyle = "#334155";
  for (let x = 0; x < canvas.width; x += 48) {
    context.beginPath();
    context.moveTo(x, 306);
    context.lineTo(x + 24, 286);
    context.stroke();
  }
}

function draw() {
  drawBackground();

  context.fillStyle = "#34d399";
  context.fillRect(player.x, player.y, player.width, player.height);
  context.fillStyle = "#e5e7eb";
  context.fillRect(player.x + 20, player.y + 12, 24 * player.direction, 6);

  context.fillStyle = "#facc15";
  for (const bullet of bullets) context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

  context.fillStyle = "#fb7185";
  for (const enemy of enemies) context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  if (!running) {
    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f8fafc";
    context.font = "28px sans-serif";
    context.fillText("点击开始，进入战斗", 250, 178);
  }
}

function loop() {
  if (!running) {
    draw();
    return;
  }

  frame += 1;
  updatePlayer();
  updateWorld();
  updateHud("战斗中");
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

startButton.addEventListener("click", resetGame);
draw();
updateHud("待开始");`;
}

function buildContentIndexHtml(title: string, modules: GeneratedModule[]) {
  const contentSections = modules
    .map(
      (module, index) => `
        <article class="content-section">
          <span>0${index + 1}</span>
          <h2>${escapeHtml(module.title)}</h2>
          <p>${escapeHtml(module.description)}</p>
        </article>`
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
    <main class="site-app">
      <section class="site-hero">
        <p>AI 生成内容页面</p>
        <h1>${escapeHtml(title)}</h1>
        <span>围绕你的需求生成首屏、内容分区、行动按钮和联系入口。</span>
        <div class="hero-actions">
          <button id="primary-cta" type="button">查看方案</button>
          <a href="#contact">联系入口</a>
        </div>
      </section>

      <section class="site-sections" aria-label="页面内容">
        ${contentSections}
      </section>

      <section class="contact-panel" id="contact">
        <h2>联系入口</h2>
        <form id="contact-form">
          <input name="name" placeholder="你的姓名" />
          <input name="contact" placeholder="联系方式" />
          <button type="submit">提交意向</button>
        </form>
        <p id="contact-result">填写后会在这里看到提交状态。</p>
      </section>
    </main>
    <script src="./app.js"></script>
  </body>
</html>`;
}

function buildContentStylesCss() {
  return `:root {
  color-scheme: light;
  --bg: #f7f7f2;
  --ink: #161817;
  --muted: #636b66;
  --panel: #ffffff;
  --line: #d8ded8;
  --accent: #0f766e;
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

.site-app {
  max-width: 1040px;
  margin: 0 auto;
  padding: 28px;
}

.site-hero {
  min-height: 320px;
  display: grid;
  align-content: center;
  gap: 14px;
  border-bottom: 1px solid var(--line);
}

.site-hero p,
.site-hero span,
.content-section p,
.contact-panel p {
  margin: 0;
  color: var(--muted);
}

.site-hero h1 {
  margin: 0;
  max-width: 720px;
  font-size: 52px;
  line-height: 1.05;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

button,
.hero-actions a {
  min-height: 42px;
  border: 0;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
}

.hero-actions a {
  background: #1f2937;
}

.site-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  padding: 24px 0;
}

.content-section,
.contact-panel {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  padding: 18px;
}

.content-section span {
  color: var(--accent);
  font-weight: 900;
}

.content-section h2,
.contact-panel h2 {
  margin: 8px 0;
}

#contact-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 12px 0;
}

input {
  min-height: 42px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 12px;
}

@media (max-width: 760px) {
  .site-hero h1 {
    font-size: 34px;
  }

  #contact-form {
    grid-template-columns: 1fr;
  }
}`;
}

function buildContentAppJs() {
  return `const primaryCta = document.querySelector("#primary-cta");
const contactPanel = document.querySelector("#contact");
const contactForm = document.querySelector("#contact-form");
const result = document.querySelector("#contact-result");

primaryCta.addEventListener("click", () => {
  contactPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get("name") || "访客";
  result.textContent = name + "，你的意向已记录，可以继续完善联系方式。";
  contactForm.reset();
});`;
}

function buildLifecycleIndexHtml(title: string, modules: GeneratedModule[]) {
  const entityName = entityNameFromTitle(title);
  const moduleCards = modules
    .map(
      (module) => `
        <article class="module-card">
          <h2>${escapeHtml(module.title)}</h2>
          <p>${escapeHtml(module.description)}</p>
        </article>`
    )
    .join("");
  const stages = lifecycleStagesFromModules(modules);
  const stageColumns = stages
    .map(
      (stage) => `
        <section class="stage-column" data-stage="${escapeHtml(stage)}">
          <h2>${escapeHtml(stage)}</h2>
          <div class="stage-items" data-list="${escapeHtml(stage)}"></div>
        </section>`
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
    <main class="workflow-app">
      <section class="workflow-hero">
        <p>AI 生成流程应用</p>
        <h1>${escapeHtml(title)}</h1>
        <span>根据 query 生成创建、编辑、状态流转和操作记录。</span>
      </section>

      <section class="workflow-layout">
        <form id="record-form" class="record-form">
          <h2>创建${escapeHtml(entityName)}</h2>
          <input name="title" placeholder="${escapeHtml(entityName)}标题" required />
          <textarea name="description" placeholder="${escapeHtml(entityName)}描述"></textarea>
          <select name="owner">
            <option>产品负责人</option>
            <option>设计负责人</option>
            <option>开发负责人</option>
            <option>测试负责人</option>
          </select>
          <button type="submit">创建${escapeHtml(entityName)}</button>
        </form>

        <section class="workflow-board" aria-label="流程看板">
          ${stageColumns}
        </section>
      </section>

      <section class="activity-panel">
        <h2>操作记录</h2>
        <ol id="activity-log"></ol>
      </section>

      <section class="modules">
        ${moduleCards}
      </section>
    </main>
    <script src="./app.js"></script>
  </body>
</html>`;
}

function buildLifecycleStylesCss() {
  return `:root {
  color-scheme: light;
  --bg: #f3f5f7;
  --ink: #172033;
  --muted: #667085;
  --panel: #ffffff;
  --line: #d6dde8;
  --accent: #2563eb;
  --soft: #e8eefc;
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

.workflow-app {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  gap: 16px;
}

.workflow-hero,
.record-form,
.stage-column,
.activity-panel,
.module-card {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
}

.workflow-hero {
  padding: 18px;
}

.workflow-hero p,
.workflow-hero span,
.module-card p,
.record-card p,
.activity-panel li {
  margin: 0;
  color: var(--muted);
}

.workflow-hero h1,
.record-form h2,
.stage-column h2,
.activity-panel h2,
.module-card h2 {
  margin: 0;
}

.workflow-layout {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 16px;
}

.record-form {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 16px;
}

input,
textarea,
select {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  color: var(--ink);
  background: #fff;
}

textarea {
  min-height: 84px;
  resize: vertical;
}

button {
  min-height: 38px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 800;
  padding: 0 12px;
}

.workflow-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.stage-column {
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: 280px;
  padding: 12px;
}

.stage-column h2 {
  font-size: 16px;
}

.stage-items {
  display: grid;
  gap: 8px;
}

.record-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--soft);
  padding: 10px;
  display: grid;
  gap: 8px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-actions button {
  min-height: 30px;
  font-size: 12px;
}

.activity-panel,
.module-card {
  padding: 14px;
}

#activity-log {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding-left: 18px;
}

.modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

@media (max-width: 860px) {
  .workflow-layout {
    grid-template-columns: 1fr;
  }
}`;
}

function lifecycleStagesFromModules(modules: GeneratedModule[]) {
  const stageWords = ["提交", "评审", "排期", "设计", "开发", "测试", "关闭", "审批", "发布", "完成"];
  const stages = modules
    .map((module) => module.title.replace(/^需求/, ""))
    .filter((title) => stageWords.some((word) => title.includes(word)));

  return stages.length > 0 ? stages : ["待处理", "处理中", "已完成"];
}

function buildLifecycleAppJs(modules: GeneratedModule[], title: string) {
  const stages = lifecycleStagesFromModules(modules);
  const firstStage = stages[0];
  const entityName = entityNameFromTitle(title);

  return `const form = document.querySelector("#record-form");
const activityLog = document.querySelector("#activity-log");
const stages = ${JSON.stringify(stages)};
let records = [
  { id: 1, title: "${entityName}样例", description: "这是一条由 query 生成的初始记录。", owner: "产品负责人", stage: "${firstStage}" }
];

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = new Date().toLocaleTimeString() + " " + text;
  activityLog.prepend(item);
}

function moveRecord(id, nextStage) {
  records = records.map((record) => (record.id === id ? { ...record, stage: nextStage } : record));
  addLog("记录进入：" + nextStage);
  render();
}

function editRecord(id) {
  records = records.map((record) => (record.id === id ? { ...record, title: record.title + "（已编辑）" } : record));
  addLog("编辑记录：" + id);
  render();
}

function deleteRecord(id) {
  records = records.filter((record) => record.id !== id);
  addLog("删除记录：" + id);
  render();
}

function renderCard(record) {
  const currentIndex = stages.indexOf(record.stage);
  const nextStage = stages[Math.min(currentIndex + 1, stages.length - 1)];
  const canMove = nextStage !== record.stage;

  return \`<article class="record-card">
    <strong>\${record.title}</strong>
    <p>\${record.description || "暂无描述"}</p>
    <small>负责人：\${record.owner}</small>
    <div class="card-actions">
      <button type="button" data-action="edit" data-id="\${record.id}">编辑</button>
      \${canMove ? \`<button type="button" data-action="move" data-id="\${record.id}" data-next="\${nextStage}">\${nextStage}</button>\` : ""}
      <button type="button" data-action="delete" data-id="\${record.id}">删除</button>
    </div>
  </article>\`;
}

function render() {
  for (const stage of stages) {
    const list = document.querySelector(\`[data-list="\${stage}"]\`);
    list.innerHTML = records.filter((record) => record.stage === stage).map(renderCard).join("");
  }
}

document.querySelector(".workflow-board").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "move") moveRecord(id, button.dataset.next);
  if (button.dataset.action === "edit") editRecord(id);
  if (button.dataset.action === "delete") deleteRecord(id);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const record = {
    id: Date.now(),
    title: data.get("title"),
    description: data.get("description"),
    owner: data.get("owner"),
    stage: stages[0]
  };
  records = [record, ...records];
  addLog("创建${entityName}：" + record.title);
  form.reset();
  render();
});

addLog("工作流已根据 query 初始化");
render();`;
}

function composePreviewHtml(indexHtml: string, stylesCss: string, appJs: string) {
  return indexHtml
    .replace('<link rel="stylesheet" href="./styles.css" />', `<style>${stylesCss}</style>`)
    .replace('<script src="./app.js"></script>', `<script>${appJs}</script>`);
}

function buildLogs(title: string, modules: GeneratedModule[], kind: "app" | "game" | "content" | "workflow"): RunLogEntry[] {
  return [
    { id: "intent", label: "意图识别", status: "done", detail: "识别为实现类需求，进入生成流程。" },
    {
      id: "analysis",
      label: "需求分析",
      status: "done",
      detail:
        kind === "game"
          ? `提取游戏主题“${title}”，生成玩家控制、射击、敌人和得分生命值玩法。`
          : kind === "content"
            ? `提取页面主题“${title}”，生成首屏、内容分区、行动按钮和联系入口。`
            : kind === "workflow"
              ? `提取流程主题“${title}”，生成创建、编辑、状态流转和操作记录。`
          : `提取应用主题“${title}”和 ${modules.length} 个功能模块。`
    },
    { id: "code", label: "代码生成", status: "done", detail: "生成 index.html、styles.css、app.js。" },
    { id: "preview", label: "预览渲染", status: "done", detail: "已组合为可在 iframe 中运行的预览页面。" }
  ];
}

function buildGeneratedFiles(title: string, modules: GeneratedModule[], fields: string[]) {
  const isGame = isGameApp(title, modules);
  const isContent = isContentApp(title, modules);
  const isLifecycle = isLifecycleApp(title, modules);
  const kind: "app" | "game" | "content" | "workflow" = isGame ? "game" : isContent ? "content" : isLifecycle ? "workflow" : "app";
  const indexHtml =
    kind === "game"
      ? buildGameIndexHtml(title, modules)
      : kind === "content"
        ? buildContentIndexHtml(title, modules)
        : kind === "workflow"
          ? buildLifecycleIndexHtml(title, modules)
          : buildIndexHtml(title, modules, fields);
  const stylesCss = kind === "game" ? buildGameStylesCss() : kind === "content" ? buildContentStylesCss() : kind === "workflow" ? buildLifecycleStylesCss() : buildStylesCss();
  const appJs = kind === "game" ? buildGameAppJs() : kind === "content" ? buildContentAppJs() : kind === "workflow" ? buildLifecycleAppJs(modules, title) : buildAppJs(fields);
  const files: GeneratedFile[] = [
    { path: "index.html", language: "html", content: indexHtml },
    { path: "styles.css", language: "css", content: stylesCss },
    { path: "app.js", language: "javascript", content: appJs }
  ];

  return {
    files,
    previewHtml: composePreviewHtml(indexHtml, stylesCss, appJs),
    kind
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
    logs: buildLogs(title, modules, generated.kind)
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
