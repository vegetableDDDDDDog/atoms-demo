import { describe, expect, it } from "vitest";
import { analyzeUserQuery } from "./analyzeUserQuery";

describe("analyzeUserQuery", () => {
  it("detects consultation requests", () => {
    const result = analyzeUserQuery("帮我分析一下这个项目应该怎么设计");

    expect(result.intent).toBe("consult");
    expect(result.summary).toContain("分析");
    expect(result.steps[0]).toContain("理解问题");
  });

  it("detects implementation requests", () => {
    const result = analyzeUserQuery("帮我做一个校园社团活动报名系统，需要活动发布、学生报名、名额限制和签到核销");

    expect(result.intent).toBe("build");
    expect(result.summary).toContain("校园社团活动报名系统");
    expect(result.steps).toContain("生成需求规格");
    expect(result.steps).toContain("生成界面与交互");
  });

  it("includes uploaded attachment names as context", () => {
    const result = analyzeUserQuery("根据附件帮我实现这个页面", ["需求说明.md", "首页截图.png"]);

    expect(result.intent).toBe("build");
    expect(result.context).toContain("需求说明.md");
    expect(result.context).toContain("首页截图.png");
  });
});
