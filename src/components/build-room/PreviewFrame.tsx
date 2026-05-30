export function PreviewFrame({
  document,
  mode,
  empty
}: {
  document: string;
  mode: "desktop" | "mobile" | "code";
  empty: boolean;
}) {
  const width = mode === "mobile" ? 390 : "100%";

  if (empty) {
    return (
      <section className="card empty-preview">
        <div>
          <strong>Preview standby</strong>
          <p>Run Team Mode to render the generated app here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card preview-shell">
      <iframe
        title="Generated app preview"
        sandbox="allow-scripts"
        srcDoc={document}
        className="preview-frame"
        style={{ width, height: 520 }}
      />
    </section>
  );
}
