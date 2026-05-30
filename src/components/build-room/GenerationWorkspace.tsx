"use client";

import { useMemo } from "react";
import { repairGeneratedApp, verifyGeneratedApp } from "@/features/generation/generateApp";
import type { GeneratedApp } from "@/features/generation/types";
import type { WorkspaceTab } from "@/features/session/sessionStorage";
import { CodeViewer } from "./CodeViewer";
import { PreviewFrame } from "./PreviewFrame";
import { RunLog } from "./RunLog";

type GenerationWorkspaceProps = {
  app: GeneratedApp;
  activeTab: WorkspaceTab;
  onAppChange: (app: GeneratedApp) => void;
  onTabChange: (tab: WorkspaceTab) => void;
};

const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "preview", label: "预览" },
  { id: "code", label: "代码" },
  { id: "logs", label: "执行日志" }
];

export function GenerationWorkspace({ activeTab, app, onAppChange, onTabChange }: GenerationWorkspaceProps) {
  const check = useMemo(() => verifyGeneratedApp(app), [app]);

  function repair() {
    onAppChange(repairGeneratedApp(app));
    onTabChange("logs");
  }

  return (
    <aside className="generation-workspace" aria-label="生成结果工作区">
      <header>
        <div>
          <p>生成工作区</p>
          <strong>{app.title}</strong>
        </div>
        <span>{check.ok ? "检查通过" : "检查失败"}</span>
      </header>

      {!check.ok ? (
        <section className="repair-panel" aria-label="生成检查结果">
          <strong>生成结果需要修复</strong>
          <ul>
            {check.issues.map((issue) => (
              <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
          <button onClick={repair} type="button">
            一键修复
          </button>
        </section>
      ) : null}

      <nav className="workspace-tabs" aria-label="生成结果标签">
        {tabs.map((tab) => (
          <button data-active={activeTab === tab.id} key={tab.id} onClick={() => onTabChange(tab.id)} type="button">
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="workspace-body">
        {activeTab === "preview" ? <PreviewFrame app={app} /> : null}
        {activeTab === "code" ? <CodeViewer app={app} /> : null}
        {activeTab === "logs" ? <RunLog app={app} /> : null}
      </section>
    </aside>
  );
}
