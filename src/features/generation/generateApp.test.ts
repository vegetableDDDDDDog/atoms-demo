import { describe, expect, it } from "vitest";
import { analyzeUserQuery } from "@/features/query/analyzeUserQuery";
import { generateApp, repairGeneratedApp, verifyGeneratedApp } from "./generateApp";

describe("generateApp", () => {
  it("generates runnable files from a build query", () => {
    const prompt = "帮我做一个校园社团活动报名系统，需要活动发布、学生报名、名额限制和签到核销";
    const analysis = analyzeUserQuery(prompt);

    const app = generateApp({ prompt, analysis });

    expect(app.title).toBe("校园社团活动报名系统");
    expect(app.modules.map((module) => module.title)).toEqual(["活动发布", "学生报名", "名额限制", "签到核销"]);
    expect(app.fields).toContain("活动发布");
    expect(app.files.map((file) => file.path)).toEqual(["index.html", "styles.css", "app.js"]);
    expect(app.entryFile).toBe("index.html");
    expect(app.previewHtml).toContain("校园社团活动报名系统");
    expect(app.previewHtml).toContain("活动发布");
    expect(app.logs.map((log) => log.label)).toEqual(["意图识别", "需求分析", "代码生成", "预览渲染"]);
  });

  it("does not collapse different queries into one fixed template", () => {
    const firstPrompt = "帮我做一个校园社团活动报名系统，需要活动发布、学生报名";
    const secondPrompt = "帮我做一个个人读书记录工具，需要书籍录入、阅读进度";

    const firstApp = generateApp({ prompt: firstPrompt, analysis: analyzeUserQuery(firstPrompt) });
    const secondApp = generateApp({ prompt: secondPrompt, analysis: analyzeUserQuery(secondPrompt) });

    expect(firstApp.title).toBe("校园社团活动报名系统");
    expect(secondApp.title).toBe("个人读书记录工具");
    expect(firstApp.modules.map((module) => module.title)).not.toEqual(secondApp.modules.map((module) => module.title));
    expect(firstApp.previewHtml).not.toBe(secondApp.previewHtml);
  });

  it("generates a playable game surface for game requests", () => {
    const prompt = "帮我写一个魂斗罗的游戏";
    const app = generateApp({ prompt, analysis: analyzeUserQuery(prompt) });

    expect(app.title).toBe("魂斗罗的游戏");
    expect(app.modules.map((module) => module.title)).toEqual(["横版移动", "跳跃与射击", "敌人生成", "生命值与得分"]);
    expect(app.previewHtml).toContain("game-canvas");
    expect(app.previewHtml).toContain("requestAnimationFrame");
    expect(app.previewHtml).toContain("bullets");
    expect(app.previewHtml).toContain("enemies");
    expect(app.previewHtml).toContain("得分");
    expect(app.previewHtml).not.toContain("新增记录");
  });

  it("generates a content page instead of a record form for website requests", () => {
    const prompt = "帮我做一个产品官网页面，需要产品介绍、价格、联系入口";
    const app = generateApp({ prompt, analysis: analyzeUserQuery(prompt) });

    expect(app.title).toBe("产品官网页面");
    expect(app.modules.map((module) => module.title)).toEqual(["产品介绍", "价格", "联系入口"]);
    expect(app.previewHtml).toContain("site-app");
    expect(app.previewHtml).toContain("查看方案");
    expect(app.previewHtml).toContain("联系入口");
    expect(app.previewHtml).not.toContain("新增记录");
    expect(app.previewHtml).not.toContain("game-canvas");
  });

  it("reports missing entry file and empty preview issues", () => {
    const prompt = "帮我做一个校园社团活动报名系统，需要活动发布、学生报名";
    const app = generateApp({ prompt, analysis: analyzeUserQuery(prompt) });

    const brokenApp = {
      ...app,
      files: app.files.filter((file) => file.path !== "index.html"),
      previewHtml: " "
    };

    const check = verifyGeneratedApp(brokenApp);

    expect(check.ok).toBe(false);
    expect(check.issues.map((issue) => issue.message)).toEqual(["缺少入口文件 index.html", "预览内容为空"]);
  });

  it("repairs missing files and preview content", () => {
    const prompt = "帮我做一个个人读书记录工具，需要书籍录入、阅读进度";
    const app = generateApp({ prompt, analysis: analyzeUserQuery(prompt) });
    const brokenApp = {
      ...app,
      files: app.files.filter((file) => file.path === "styles.css"),
      previewHtml: ""
    };

    const repaired = repairGeneratedApp(brokenApp);

    expect(verifyGeneratedApp(repaired).ok).toBe(true);
    expect(repaired.files.map((file) => file.path)).toEqual(["index.html", "styles.css", "app.js"]);
    expect(repaired.previewHtml).toContain("个人读书记录工具");
    expect(repaired.logs.at(-1)).toMatchObject({
      label: "一键修复",
      status: "done"
    });
  });
});
