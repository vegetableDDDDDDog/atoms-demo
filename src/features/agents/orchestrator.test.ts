import { describe, expect, it } from "vitest";
import { createAgentPlan } from "./orchestrator";

describe("createAgentPlan", () => {
  it("returns the expected ordered agent team", () => {
    const steps = createAgentPlan("Build a booking CRM");
    expect(steps.map((step) => step.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(steps.every((step) => step.status === "done")).toBe(true);
    expect(steps[0].content).toContain("booking CRM");
  });

  it("returns localized Chinese agent steps", () => {
    const steps = createAgentPlan("生成一个客户预约 CRM", false, "zh");

    expect(steps.map((step) => step.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(steps[0].title).toBe("协调构建");
    expect(steps[0].content).toContain("客户预约");
  });

  it("turns a requirements-management request into concrete analysis and design artifacts", () => {
    const steps = createAgentPlan("帮我生成一个需求管理系统，需要需求提报、评审、排期、设计分析、开发、转测、测试和关闭", false, "zh");
    const emma = steps.find((step) => step.agent === "Emma");
    const bob = steps.find((step) => step.agent === "Bob");
    const qa = steps.find((step) => step.agent === "QA");

    expect(emma?.content).toContain("角色");
    expect(emma?.content).toContain("需求提报");
    expect(emma?.content).toContain("需求评审");
    expect(emma?.content).toContain("验收标准");
    expect(bob?.content).toContain("页面结构");
    expect(bob?.content).toContain("数据对象");
    expect(qa?.content).toContain("可验证");
  });
});
