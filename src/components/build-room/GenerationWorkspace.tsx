"use client";

import { useState } from "react";
import type { GeneratedApp } from "@/features/generation/types";
import { CodeViewer } from "./CodeViewer";
import { PreviewFrame } from "./PreviewFrame";
import { RunLog } from "./RunLog";

type GenerationWorkspaceProps = {
  app: GeneratedApp;
};

type WorkspaceTab = "preview" | "code" | "logs";

const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "preview", label: "预览" },
  { id: "code", label: "代码" },
  { id: "logs", label: "执行日志" }
];

export function GenerationWorkspace({ app }: GenerationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("preview");

  return (
    <aside className="generation-workspace" aria-label="生成结果工作区">
      <header>
        <div>
          <p>生成工作区</p>
          <strong>{app.title}</strong>
        </div>
        <span>{app.files.length} 个文件</span>
      </header>

      <nav className="workspace-tabs" aria-label="生成结果标签">
        {tabs.map((tab) => (
          <button data-active={activeTab === tab.id} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button">
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
