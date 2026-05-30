export type AgentName = "Mike" | "Emma" | "Bob" | "Alex" | "QA";

export type AgentPlanStep = {
  agent: AgentName;
  title: string;
  status: "done";
  content: string;
  order: number;
};
