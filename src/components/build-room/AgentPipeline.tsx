import type { BuildRoomCopy } from "@/features/i18n/dictionary";
import type { DecoratedProgressStep } from "@/features/progress/generationProgress";

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
  progressSteps,
  isGenerating,
  copy
}: {
  steps: Step[];
  progressSteps: DecoratedProgressStep[];
  isGenerating: boolean;
  copy: BuildRoomCopy;
}) {
  const shouldShowProgress = progressSteps.length > 0;

  return (
    <section className="card conversation-card agent-conversation">
      <p className="section-title">{copy.agentPlanLabel}</p>
      <div className="pipeline">
        {isGenerating && !shouldShowProgress ? <div className="agent-step">{copy.agentsBuilding}</div> : null}
        {shouldShowProgress
          ? progressSteps.map((step) => (
              <article key={`${step.agent}-${step.title}`} className="agent-step" data-status={step.status}>
                <div className="agent-step-header">
                  <strong>
                    {step.agent}: {step.title}
                  </strong>
                  <span className="step-status">{copy.progressStatusLabels[step.status]}</span>
                </div>
                <p>{step.content}</p>
              </article>
            ))
          : null}
        {!shouldShowProgress && steps.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>{copy.agentEmpty}</p>
        ) : null}
        {!shouldShowProgress ? steps.map((step) => (
          <article key={step.id} className="agent-step">
            <strong>
              {step.agent}: {step.title}
            </strong>
            <p>{step.content}</p>
          </article>
        )) : null}
      </div>
    </section>
  );
}
