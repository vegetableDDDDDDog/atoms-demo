import { describe, expect, it } from "vitest";
import { analyzeUserQuery } from "./analyzeUserQuery";

describe("analyzeUserQuery", () => {
  it("detects consultation requests", () => {
    const result = analyzeUserQuery("帮我分析一下这个项目应该怎么设计");

    expect(result.intent).toBe("consult");
    expect(result.summary).toContain("分析");
    expect(result.steps[0]).toContain("理解问题");
    expect(result.sections.map((section) => section.title)).toEqual(["问题理解", "分析建议", "下一步"]);
  });

  it("keeps feature-planning questions as consult requests", () => {
    const result = analyzeUserQuery("帮我分析一下需求管理系统应该先做哪些功能");

    expect(result.intent).toBe("consult");
    expect(result.sections.map((section) => section.title)).toEqual(["问题理解", "分析建议", "下一步"]);
  });

  it("detects implementation requests", () => {
    const result = analyzeUserQuery("帮我做一个校园社团活动报名系统，需要活动发布、学生报名、名额限制和签到核销");

    expect(result.intent).toBe("build");
    expect(result.summary).toContain("校园社团活动报名系统");
    expect(result.steps).toContain("生成需求规格");
    expect(result.steps).toContain("生成界面与交互");
    expect(result.sections.find((section) => section.title === "需求规格")?.items).toEqual([
      "活动发布",
      "学生报名",
      "名额限制",
      "签到核销"
    ]);
    expect(result.sections.find((section) => section.title === "页面结构")?.items).toContain("校园社团活动报名系统首页");
    expect(result.sections.find((section) => section.title === "预期文件")?.items).toEqual([
      "app/spec.json",
      "app/page.tsx",
      "app/actions.ts",
      "tests/smoke.spec.ts"
    ]);
  });

  it("includes uploaded attachment names as context", () => {
    const result = analyzeUserQuery("根据附件帮我实现这个页面", ["需求说明.md", "首页截图.png"]);

    expect(result.intent).toBe("build");
    expect(result.context).toContain("需求说明.md");
    expect(result.context).toContain("首页截图.png");
  });
});
