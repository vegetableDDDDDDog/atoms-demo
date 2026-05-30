"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dictionary, localeStorageKey, resolveLocale, type Locale } from "@/features/i18n/dictionary";
import { decorateProgressSteps, getProgressPercent, type ProgressState } from "@/features/progress/generationProgress";
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

type WorkspaceView = "preview" | "mobile" | "code" | "diff" | "deploy";

const minimumProgressMs = 2800;
const completionPauseMs = 350;
const progressTickMs = 620;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function BuildRoom() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [view, setView] = useState<WorkspaceView>("preview");
  const [locale, setLocale] = useState<Locale>("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProgressIndex, setActiveProgressIndex] = useState<number | null>(null);
  const [progressState, setProgressState] = useState<ProgressState>("running");
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const activeVersion = activeRun?.versions[0] ?? null;
  const copy = dictionary[locale];
  const visibleProgressIndex = activeProgressIndex ?? 0;
  const progressSteps =
    activeProgressIndex === null
      ? []
      : decorateProgressSteps(copy.generationPhases, visibleProgressIndex, progressState);
  const activeProgressStep =
    progressSteps.find((step) => step.status === "active" || step.status === "error") ??
    progressSteps[progressSteps.length - 1] ??
    null;
  const progressPercent =
    activeProgressIndex === null ? 0 : getProgressPercent(visibleProgressIndex, copy.generationPhases.length);
  const resultDescription =
    activeProgressIndex !== null
      ? copy.generatedResultGenerating
      : activeVersion
        ? copy.generatedResultReady
        : copy.generatedResultEmpty;
  const visibleWorkspaceTabs = copy.workspaceTabs.filter((tab) => tab.id === "preview" || tab.id === "code");

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    const data = (await response.json()) as { projects?: ProjectSummary[] };
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    setLocale(resolveLocale(window.localStorage.getItem(localeStorageKey)));
    refreshProjects().catch(() => setError(dictionary.en.errors.loadProjects));
  }, []);

  useEffect(() => {
    if (activeVersion && activeProgressIndex === null) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeProgressIndex, activeVersion]);

  useEffect(() => {
    if (!isGenerating || activeProgressIndex === null) return;

    const intervalId = window.setInterval(() => {
      setActiveProgressIndex((currentIndex) => {
        const current = currentIndex ?? 0;
        return Math.min(current + 1, copy.generationPhases.length - 1);
      });
    }, progressTickMs);

    return () => window.clearInterval(intervalId);
  }, [activeProgressIndex, copy.generationPhases.length, isGenerating]);

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }

  function beginProgress() {
    setActiveProgressIndex(0);
    setProgressState("running");
  }

  async function finishProgress(startedAt: number) {
    const elapsed = Date.now() - startedAt;
    await wait(Math.max(0, minimumProgressMs - elapsed));
    setActiveProgressIndex(copy.generationPhases.length - 1);
    setProgressState("complete");
    await wait(completionPauseMs);
  }

  async function startBuild(prompt: string) {
    const startedAt = Date.now();
    setIsGenerating(true);
    setView("preview");
    beginProgress();
    setActiveRun(null);
    setPublishUrl(null);
    setError(null);
    let succeeded = false;

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
      await finishProgress(startedAt);
      setActiveRun(data.run);
      succeeded = true;
      await refreshProjects();
    } catch {
      setProgressState("error");
      setError(copy.errors.build);
    } finally {
      setIsGenerating(false);
      if (succeeded) {
        setActiveProgressIndex(null);
      }
    }
  }

  async function fixCurrentRun() {
    if (!activeRun) return;
    const startedAt = Date.now();
    setIsGenerating(true);
    setView("preview");
    beginProgress();
    setError(null);
    let succeeded = false;

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
      await finishProgress(startedAt);
      setActiveRun(data.run);
      succeeded = true;
      await refreshProjects();
    } catch {
      setProgressState("error");
      setError(copy.errors.fix);
    } finally {
      setIsGenerating(false);
      if (succeeded) {
        setActiveProgressIndex(null);
      }
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
    <main className="workspace-shell">
      <header className="workspace-topbar">
        <div className="topbar-brand">
          <strong>{copy.brandName}</strong>
          <span>{copy.workspaceSubtitle}</span>
        </div>
        <div className="topbar-meta">
          <span className="status-pill">{isGenerating ? copy.running : copy.ready}</span>
          <div className="language-toggle" aria-label={copy.languageLabel}>
            <button type="button" aria-pressed={locale === "zh"} data-active={locale === "zh"} onClick={() => changeLocale("zh")}>
              中文
            </button>
            <button type="button" aria-pressed={locale === "en"} data-active={locale === "en"} onClick={() => changeLocale("en")}>
              English
            </button>
          </div>
        </div>
      </header>
      <div className="workspace-grid">
        <ProjectSidebar projects={projects} activeVersion={activeVersion} copy={copy} />
        <section className="conversation-panel">
          <PromptComposer onSubmit={startBuild} disabled={isGenerating} copy={copy} />
          <AgentPipeline
            steps={activeRun?.steps ?? []}
            progressSteps={progressSteps}
            isGenerating={isGenerating}
            copy={copy}
          />
          {error ? (
            <p className="publish-note" style={{ color: "var(--warning)" }}>
              {error}
            </p>
          ) : null}
        </section>
        <section className="output-panel" ref={resultRef}>
          <div>
            <p className="section-title">{copy.rightWorkspaceTitle}</p>
            <p>{activeVersion?.title ?? resultDescription}</p>
          </div>
          <div className="workspace-tabs" aria-label={copy.previewViews}>
            {visibleWorkspaceTabs.map((tab) => (
              <button
                className="button-ghost"
                data-active={view === tab.id}
                key={tab.id}
                onClick={() => setView(tab.id as WorkspaceView)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="output-panel-body">
            {view === "code" ? (
              activeVersion ? (
                <CodePanel version={activeVersion} />
              ) : (
                <section className="output-empty">
                  <strong>{copy.code}</strong>
                  <p>{copy.generatedResultEmpty}</p>
                </section>
              )
            ) : null}
            {view === "preview" || view === "mobile" ? (
              <PreviewFrame
                document={generatedDocument}
                mode={view}
                empty={!activeVersion}
                copy={copy}
                version={activeVersion}
                progress={
                  activeProgressStep
                    ? {
                        percent: progressPercent,
                        state: progressState,
                        step: activeProgressStep
                      }
                    : null
                }
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
