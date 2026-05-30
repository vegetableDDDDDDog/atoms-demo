import type { BuildRoomCopy } from "@/features/i18n/dictionary";

type Version = {
  title: string;
  description: string;
  html: string;
  css: string;
  js: string;
};

export function DiffPanel({ version, copy }: { version: Version | null; copy: BuildRoomCopy }) {
  if (!version) {
    return (
      <section className="output-empty">
        <strong>{copy.diffTitle}</strong>
        <p>{copy.diffEmpty}</p>
      </section>
    );
  }

  const fileStats = [
    { name: "index.html", lines: version.html.split("\n").length },
    { name: "styles.css", lines: version.css.split("\n").length },
    { name: "app.js", lines: version.js.split("\n").length }
  ];

  return (
    <section className="diff-panel">
      <div>
        <p className="section-title">{copy.diffTitle}</p>
        <h3>{version.title}</h3>
        <p>{copy.diffSummary}</p>
      </div>
      <div className="file-stat-list">
        {fileStats.map((file) => (
          <article key={file.name} className="file-stat">
            <strong>{file.name}</strong>
            <span>{file.lines} lines</span>
          </article>
        ))}
      </div>
    </section>
  );
}
