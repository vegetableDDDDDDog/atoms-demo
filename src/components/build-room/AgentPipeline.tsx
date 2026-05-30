import type { BuildRoomCopy } from "@/features/i18n/dictionary";

type Step = {
  id: string;
  agent: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

export function AgentPipeline({
  steps,
  isGenerating,
  copy
}: {
  steps: Step[];
  isGenerating: boolean;
  copy: BuildRoomCopy;
}) {
  return (
    <section>
      <p className="section-title">{copy.agentPipeline}</p>
      <div className="pipeline">
        {isGenerating ? <div className="card agent-step">{copy.agentsBuilding}</div> : null}
        {steps.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>{copy.agentEmpty}</p>
        ) : null}
        {steps.map((step) => (
          <article key={step.id} className="card agent-step">
            <strong>
              {step.agent}: {step.title}
            </strong>
            <p>{step.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

