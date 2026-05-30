import type { AgentPlanStep } from "./types";

export function createAgentPlan(prompt: string, fixRequested = false): AgentPlanStep[] {
  const repairCopy = fixRequested ? " This run focuses on fixing UX gaps from the selected version." : "";

  return [
    {
      agent: "Mike",
      title: "Coordinate build",
      status: "done",
      content: `I scoped the build request: ${prompt}.${repairCopy}`,
      order: 1
    },
    {
      agent: "Emma",
      title: "Extract requirements",
      status: "done",
      content: "Core requirements: interactive preview, useful data controls, saved version, and publishable output.",
      order: 2
    },
    {
      agent: "Bob",
      title: "Design structure",
      status: "done",
      content: "Data model includes projects, generation runs, ordered agent steps, app versions, and publish records.",
      order: 3
    },
    {
      agent: "Alex",
      title: "Generate app files",
      status: "done",
      content: "Generated iframe-ready HTML, CSS, and JavaScript with local interactive state.",
      order: 4
    },
    {
      agent: "QA",
      title: "Verify generated app",
      status: "done",
      content: "Preview contains controls, responsive layout, and non-empty generated files.",
      order: 5
    }
  ];
}
