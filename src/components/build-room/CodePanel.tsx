type Version = {
  html: string;
  css: string;
  js: string;
};

export function CodePanel({ version }: { version: Version }) {
  return (
    <section className="card code-panel">
      {(["html", "css", "js"] as const).map((key) => (
        <article key={key}>
          <p className="section-title">{key}</p>
          <pre>
            <code>{version[key]}</code>
          </pre>
        </article>
      ))}
    </section>
  );
}
