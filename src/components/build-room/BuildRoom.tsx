"use client";

import { useEffect, useMemo, useState } from "react";
import { dictionary, localeStorageKey, resolveLocale, type Locale } from "@/features/i18n/dictionary";
import { AgentPipeline } from "./AgentPipeline";
import { CodePanel } from "./CodePanel";
import { DemoBrief } from "./DemoBrief";
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
  const [locale, setLocale] = useState<Locale>("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeVersion = activeRun?.versions[0] ?? null;
  const copy = dictionary[locale];

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    const data = (await response.json()) as { projects?: ProjectSummary[] };
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    setLocale(resolveLocale(window.localStorage.getItem(localeStorageKey)));
    refreshProjects().catch(() => setError(dictionary.en.errors.loadProjects));
  }, []);

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }

  async function startBuild(prompt: string) {
    setIsGenerating(true);
    setPublishUrl(null);
    setError(null);

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "team", locale })
      });

      if (!response.ok) {
        throw new Error("Build failed");
      }

      const data = (await response.json()) as { run: Run };
      setActiveRun(data.run);
      await refreshProjects();
    } catch {
      setError(copy.errors.build);
    } finally {
      setIsGenerating(false);
    }
  }

  async function fixCurrentRun() {
    if (!activeRun) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/runs/${activeRun.id}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale })
      });

      if (!response.ok) {
        throw new Error("Fix failed");
      }

      const data = (await response.json()) as { run: Run };
      setActiveRun(data.run);
      await refreshProjects();
    } catch {
      setError(copy.errors.fix);
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
      setError(copy.errors.publish);
    }
  }

  const generatedDocument = useMemo(() => {
    if (!activeVersion) return "";
    return `<!doctype html><html><head><style>${activeVersion.css}</style></head><body>${activeVersion.html}<script>${activeVersion.js}</script></body></html>`;
  }, [activeVersion]);

  return (
    <main className="app-shell">
      <ProjectSidebar projects={projects} copy={copy} />
      <section className="workspace">
        <DemoBrief copy={copy} />
        <PromptComposer
          onSubmit={startBuild}
          disabled={isGenerating}
          locale={locale}
          onLocaleChange={changeLocale}
          copy={copy}
        />
        <div className="result-header">
          <div>
            <p className="section-title">{copy.generatedWorkspace}</p>
            <p>{activeVersion ? copy.generatedResultReady : copy.generatedResultEmpty}</p>
          </div>
          <div className="preview-tabs" aria-label={copy.previewViews}>
            <button className="button-ghost" data-active={view === "desktop"} onClick={() => setView("desktop")}>
              {copy.desktop}
            </button>
            <button className="button-ghost" data-active={view === "mobile"} onClick={() => setView("mobile")}>
              {copy.mobile}
            </button>
            <button className="button-ghost" data-active={view === "code"} onClick={() => setView("code")}>
              {copy.code}
            </button>
          </div>
        </div>
        {view === "code" && activeVersion ? (
          <CodePanel version={activeVersion} />
        ) : (
          <PreviewFrame document={generatedDocument} mode={view} empty={!activeVersion} copy={copy} />
        )}
      </section>
      <aside className="panel right-panel side-panel">
        <AgentPipeline steps={activeRun?.steps ?? []} isGenerating={isGenerating} copy={copy} />
        <div className="action-row">
          <button className="button-ghost" onClick={fixCurrentRun} disabled={!activeRun || isGenerating}>
            {copy.fixBug}
          </button>
          <button className="button-primary" onClick={publishCurrentVersion} disabled={!activeVersion}>
            {copy.publish}
          </button>
        </div>
        {publishUrl ? (
          <p className="publish-note">
            {copy.publishedAt} {publishUrl}
          </p>
        ) : null}
        {error ? (
          <p className="publish-note" style={{ color: "var(--warning)" }}>
            {error}
          </p>
        ) : null}
      </aside>
    </main>
  );
}
