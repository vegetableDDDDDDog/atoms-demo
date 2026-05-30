import { describe, expect, it } from "vitest";
import { decorateProgressSteps, getProgressPercent } from "./generationProgress";

const phases = [
  { agent: "Mike", title: "Understand request", content: "Read prompt" },
  { agent: "Emma", title: "Extract requirements", content: "List features" },
  { agent: "Alex", title: "Generate files", content: "Write code" }
];

describe("decorateProgressSteps", () => {
  it("marks previous steps done, current step active, and future steps waiting", () => {
    expect(decorateProgressSteps(phases, 1)).toEqual([
      { ...phases[0], status: "done" },
      { ...phases[1], status: "active" },
      { ...phases[2], status: "waiting" }
    ]);
  });

  it("marks every step done when generation is complete", () => {
    expect(decorateProgressSteps(phases, 2, "complete").every((step) => step.status === "done")).toBe(true);
  });

  it("marks the active step as error when generation fails", () => {
    expect(decorateProgressSteps(phases, 1, "error")[1]?.status).toBe("error");
  });
});

describe("getProgressPercent", () => {
  it("returns an increasing bounded percentage", () => {
    expect(getProgressPercent(0, 3)).toBe(34);
    expect(getProgressPercent(2, 3)).toBe(100);
  });
});

