import type { BuildRoomCopy } from "@/features/i18n/dictionary";

export function PreviewFrame({
  document,
  mode,
  empty,
  copy
}: {
  document: string;
  mode: "desktop" | "mobile" | "code";
  empty: boolean;
  copy: BuildRoomCopy;
}) {
  const width = mode === "mobile" ? 390 : "100%";

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

