"use client";

import { useEffect, useMemo, useState } from "react";
import { dictionary, localeStorageKey, resolveLocale, type Locale } from "@/features/i18n/dictionary";
import { decorateProgressSteps, getProgressPercent, type ProgressState } from "@/features/progress/generationProgress";
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
  const [view, setView] = useState<"desktop" | "mobile" | "code">("desktop");
  const [locale, setLocale] = useState<Locale>("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProgressIndex, setActiveProgressIndex] = useState<number | null>(null);
  const [progressState, setProgressState] = useState<ProgressState>("running");
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            <p>{resultDescription}</p>
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
          <PreviewFrame
            document={generatedDocument}
            mode={view}
            empty={!activeVersion}
            copy={copy}
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
        )}
      </section>
      <aside className="panel right-panel side-panel">
        <AgentPipeline
          steps={activeRun?.steps ?? []}
          progressSteps={progressSteps}
          isGenerating={isGenerating}
          copy={copy}
        />
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
