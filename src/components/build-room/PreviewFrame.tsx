import type { BuildRoomCopy } from "@/features/i18n/dictionary";
import type { DecoratedProgressStep, ProgressState } from "@/features/progress/generationProgress";

export function PreviewFrame({
  document,
  mode,
  empty,
  copy,
  progress
}: {
  document: string;
  mode: "desktop" | "mobile" | "code";
  empty: boolean;
  copy: BuildRoomCopy;
  progress: { percent: number; state: ProgressState; step: DecoratedProgressStep } | null;
}) {
  const width = mode === "mobile" ? 390 : "100%";

  if (progress) {
    const title = progress.state === "error"
      ? copy.progressErrorTitle
      : progress.state === "complete"
        ? copy.progressCompleteTitle
        : copy.progressTitle;

    return (
      <section className="card generation-progress">
        <div className="generation-progress-copy">
          <span className="status-pill">{copy.progressStatusLabels[progress.step.status]}</span>
          <strong>{title}</strong>
          <p>{progress.state === "error" ? copy.progressErrorBody : progress.step.content}</p>
        </div>
        <div className="progress-meter" aria-label={title}>
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="progress-current-step">
          <span>{progress.step.agent}</span>
          <strong>{progress.step.title}</strong>
        </div>
      </section>
    );
  }

  if (empty) {
    return (
      <section className="card empty-preview">
        <div>
          <strong>{copy.previewStandbyTitle}</strong>
          <p>{copy.previewStandbyBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card preview-shell">
      <iframe
        title={copy.previewTitle}
        sandbox="allow-scripts"
        srcDoc={document}
        className="preview-frame"
        style={{ width, height: 520 }}
      />
    </section>
  );
}
