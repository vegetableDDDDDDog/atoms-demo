import { describe, expect, it } from "vitest";
import { createAgentPlan } from "./orchestrator";

describe("createAgentPlan", () => {
  it("returns the expected ordered agent team", () => {
    const steps = createAgentPlan("Build a booking CRM");
    expect(steps.map((step) => step.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(steps.every((step) => step.status === "done")).toBe(true);
    expect(steps[0].content).toContain("booking CRM");
  });
});
