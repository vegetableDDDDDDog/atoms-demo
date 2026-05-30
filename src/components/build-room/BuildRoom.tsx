"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentPipeline } from "./AgentPipeline";
import { CodePanel } from "./CodePanel";
import { PreviewFrame } from "./PreviewFrame";
import { ProjectSidebar } from "./ProjectSidebar";
import { PromptComposer } from "./PromptComposer";

type AgentStep = {
  id: string;
  agent: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

type Version = {
  id: string;
  versionNumber: number;
  title: string;
  description: string;
  html: string;
  css: string;
  js: string;
  appType: string;
};

type Run = {
  id: string;
  inputPrompt: string;
  status: string;
  steps: AgentStep[];
  versions: Version[];
  project: { id: string; name: string; status: string };
};

export type ProjectSummary = {
  id: string;
  name: string;
  status: string;
  versions: Version[];
  publishes: Array<{ slug: string; isActive: boolean }>;
};

export function BuildRoom() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [view, setView] = useState<"desktop" | "mobile" | "code">("desktop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeVersion = activeRun?.versions[0] ?? null;

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    const data = (await response.json()) as { projects?: ProjectSummary[] };
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    refreshProjects().catch(() => setError("Could not load projects."));
  }, []);

  async function startBuild(prompt: string) {
    setIsGenerating(true);
    setPublishUrl(null);
    setError(null);

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "team" })
      });

      if (!response.ok) {
        throw new Error("Build failed");
      }

      const data = (await response.json()) as { run: Run };
      setActiveRun(data.run);
      await refreshProjects();
    } catch {
      setError("The agent team could not finish this run.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function fixCurrentRun() {
    if (!activeRun) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/runs/${activeRun.id}/fix`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Fix failed");
      }
      const data = (await response.json()) as { run: Run };
      setActiveRun(data.run);
      await refreshProjects();
    } catch {
      setError("QA could not create a fix run.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function publishCurrentVersion() {
    if (!activeVersion) return;
    setError(null);

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: activeVersion.id })
      });

      if (!response.ok) {
        throw new Error("Publish failed");
      }

      const data = (await response.json()) as { url: string };
      setPublishUrl(data.url);
      await refreshProjects();
    } catch {
      setError("Publish failed for this version.");
    }
  }

  const generatedDocument = useMemo(() => {
    if (!activeVersion) return "";
    return `<!doctype html><html><head><style>${activeVersion.css}</style></head><body>${activeVersion.html}<script>${activeVersion.js}</script></body></html>`;
  }, [activeVersion]);

  return (
    <main className="app-shell">
      <ProjectSidebar projects={projects} />
      <section className="workspace">
        <PromptComposer onSubmit={startBuild} disabled={isGenerating} />
        <div className="preview-tabs" aria-label="Preview views">
          <button className="button-ghost" data-active={view === "desktop"} onClick={() => setView("desktop")}>
            Desktop
          </button>
          <button className="button-ghost" data-active={view === "mobile"} onClick={() => setView("mobile")}>
            Mobile
          </button>
          <button className="button-ghost" data-active={view === "code"} onClick={() => setView("code")}>
            Code
          </button>
        </div>
        {view === "code" && activeVersion ? (
          <CodePanel version={activeVersion} />
        ) : (
          <PreviewFrame document={generatedDocument} mode={view} empty={!activeVersion} />
        )}
      </section>
      <aside className="panel right-panel side-panel">
        <AgentPipeline steps={activeRun?.steps ?? []} isGenerating={isGenerating} />
        <div className="action-row">
          <button className="button-ghost" onClick={fixCurrentRun} disabled={!activeRun || isGenerating}>
            Fix Bug
          </button>
          <button className="button-primary" onClick={publishCurrentVersion} disabled={!activeVersion}>
            Publish
          </button>
        </div>
        {publishUrl ? <p className="publish-note">Published at {publishUrl}</p> : null}
        {error ? <p className="publish-note" style={{ color: "var(--warning)" }}>{error}</p> : null}
      </aside>
    </main>
  );
}
