import { describe, expect, it } from "vitest";
import { buildGeneratedApp } from "./buildGeneratedApp";
import { classifyPrompt } from "./classifyPrompt";

describe("classifyPrompt", () => {
  it("classifies booking and customer prompts as crm", () => {
    expect(classifyPrompt("Build a booking CRM for customers")).toBe("crm");
  });

  it("classifies portfolio and investment prompts as portfolio", () => {
    expect(classifyPrompt("Track my investment portfolio and watchlist")).toBe("portfolio");
  });

  it("classifies todo and operations prompts as operations", () => {
    expect(classifyPrompt("Make an internal todo operations board")).toBe("operations");
  });

  it("classifies Chinese customer booking prompts as crm", () => {
    expect(classifyPrompt("生成一个客户预约 CRM")).toBe("crm");
  });
});

describe("buildGeneratedApp", () => {
  it("returns complete iframe-ready files", () => {
    const app = buildGeneratedApp({
      prompt: "Build a booking CRM for customers",
      mode: "team"
    });

    expect(app.title).toContain("CRM");
    expect(app.html).toContain("<main");
    expect(app.css).toContain(":root");
    expect(app.js).toContain("addEventListener");
    expect(app.appType).toBe("crm");
  });

  it("generates Chinese iframe-ready copy when locale is zh", () => {
    const app = buildGeneratedApp({
      prompt: "生成一个客户预约 CRM",
      mode: "team",
      locale: "zh"
    });

    expect(app.title).toContain("预约");
    expect(app.html).toContain("新增记录");
    expect(app.html).toContain("搜索生成数据");
  });
});
