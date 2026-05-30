import type { BuildRoomCopy } from "@/features/i18n/dictionary";

export function DemoBrief({ copy }: { copy: BuildRoomCopy }) {
  return (
    <section className="demo-brief">
      <div className="demo-brief-copy">
        <p className="eyebrow">{copy.productKicker}</p>
        <h1>{copy.productTitle}</h1>
        <p>{copy.productSummary}</p>
      </div>
      <ol className="flow-steps" aria-label={copy.productTitle}>
        {copy.flowSteps.map((step, index) => (
          <li key={step.title}>
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

