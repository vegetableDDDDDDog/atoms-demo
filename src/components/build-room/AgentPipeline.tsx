type Step = {
  id: string;
  agent: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

export function AgentPipeline({ steps, isGenerating }: { steps: Step[]; isGenerating: boolean }) {
  return (
    <section>
      <p className="section-title">Agent Pipeline</p>
      <div className="pipeline">
        {isGenerating ? <div className="card agent-step">Agents are building...</div> : null}
        {steps.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Mike, Emma, Bob, Alex, and QA are waiting for the next run.
          </p>
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
