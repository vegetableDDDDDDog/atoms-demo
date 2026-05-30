import type { GeneratedApp } from "@/features/generation/types";

type RunLogProps = {
  app: GeneratedApp;
};

export function RunLog({ app }: RunLogProps) {
  return (
    <ol className="run-log">
      {app.logs.map((entry) => (
        <li data-status={entry.status} key={entry.id}>
          <span>{entry.status === "done" ? "完成" : "失败"}</span>
          <strong>{entry.label}</strong>
          <p>{entry.detail}</p>
        </li>
      ))}
    </ol>
  );
}
