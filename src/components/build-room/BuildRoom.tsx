"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { generateApp } from "@/features/generation/generateApp";
import type { GeneratedApp } from "@/features/generation/types";
import { analyzeUserQuery, type QueryAnalysis } from "@/features/query/analyzeUserQuery";
import { loadSessions, saveSessions, type AppMessage, type AppSession, type WorkspaceTab } from "@/features/session/sessionStorage";
import { GenerationWorkspace } from "./GenerationWorkspace";

const localStorageResetKey = "atoms-demo-clean-reset-token";
const localStorageResetValue = "2026-05-30-workflow-lifecycle-generation";
const legacySessionKeys = [
  "atoms-demo-sessions-v1",
  "atoms-demo-sessions-v2",
  "atoms-demo-sessions-v3",
  "atoms-demo-sessions-v4",
  "atoms-demo-sessions-v5"
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromPrompt(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();
  return compact.length > 18 ? `${compact.slice(0, 18)}...` : compact || "新对话";
}

function buildAssistantText(analysis: QueryAnalysis) {
  const mode = analysis.intent === "build" ? "实现类" : analysis.intent === "revise" ? "修改类" : "咨询类";
  return `意图识别：${mode}\n${analysis.summary}\n${analysis.context}`;
}

export function BuildRoom() {
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );
  const latestAnalysis = activeSession?.messages.findLast((message) => message.analysis)?.analysis ?? null;
  const latestApp = activeSession?.messages.findLast((message) => message.app)?.app ?? null;
  const activeWorkspaceTab = activeSession?.activeWorkspaceTab ?? "preview";

  useEffect(() => {
    if (window.localStorage.getItem(localStorageResetKey) !== localStorageResetValue) {
      legacySessionKeys.forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.setItem(localStorageResetKey, localStorageResetValue);
    }
    const savedSessions = loadSessions(window.localStorage);
    setSessions(savedSessions);
    setActiveSessionId(savedSessions[0]?.id ?? null);
    setIsStorageReady(true);
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    saveSessions(window.localStorage, sessions);
  }, [isStorageReady, sessions]);

  function startEmptySession() {
    setActiveSessionId(null);
    setDraft("");
    setAttachments([]);
  }

  function sendMessage() {
    const prompt = (textareaRef.current?.value ?? draft).trim();
    if (!prompt) return;

    const analysis = analyzeUserQuery(prompt, attachments);
    const app = analysis.intent === "build" || analysis.intent === "revise" ? generateApp({ prompt, analysis }) : undefined;
    const userMessage: AppMessage = { id: createId("m"), role: "user", text: prompt, attachments };
    const assistantMessage: AppMessage = {
      id: createId("m"),
      role: "assistant",
      text: buildAssistantText(analysis),
      analysis,
      app
    };

    if (activeSession) {
      setSessions((current) =>
        current.map((session) =>
          session.id === activeSession.id
            ? {
                ...session,
                activeWorkspaceTab: app ? "preview" : session.activeWorkspaceTab,
                messages: [...session.messages, userMessage, assistantMessage],
                title: session.title || titleFromPrompt(prompt)
              }
            : session
        )
      );
    } else {
      const session: AppSession = {
        id: createId("s"),
        title: titleFromPrompt(prompt),
        createdAtLabel: "刚刚",
        activeWorkspaceTab: app ? "preview" : undefined,
        messages: [userMessage, assistantMessage]
      };
      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
    }

    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    setAttachments([]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function updateWorkspaceTab(tab: WorkspaceTab) {
    if (!activeSession) return;
    setSessions((current) =>
      current.map((session) => (session.id === activeSession.id ? { ...session, activeWorkspaceTab: tab } : session))
    );
  }

  function updateLatestApp(app: GeneratedApp) {
    if (!activeSession) return;
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== activeSession.id) return session;
        const lastAppIndex = session.messages.findLastIndex((message) => message.app);
        if (lastAppIndex === -1) return session;
        const messages = session.messages.map((message, index) => (index === lastAppIndex ? { ...message, app } : message));
        return { ...session, messages };
      })
    );
  }

  return (
    <main className="atoms-page">
      <aside className="atoms-sidebar">
        <div className="atoms-logo">
          <span className="atoms-mark" />
          <strong>Atoms</strong>
        </div>

        <nav className="atoms-nav">
          <button onClick={startEmptySession}>＋ 新建对话</button>
          <button>◎ 资源</button>
        </nav>

        <section className="session-list" aria-label="历史对话">
          {sessions.map((session) => (
            <button
              className="session-item"
              data-active={session.id === activeSessionId}
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
            >
              <span>{session.title}</span>
              <small>{session.createdAtLabel}</small>
            </button>
          ))}
        </section>
      </aside>

      <section className="atoms-main">
        <section className="hero-create" data-has-session={Boolean(activeSession)}>
          <h1>{activeSession ? activeSession.title : "你今天想创造什么？"}</h1>

          {activeSession ? (
            <div className="conversation">
              {activeSession.messages.map((message) => (
                <article className="message-card" data-role={message.role} key={message.id}>
                  <strong>{message.role === "user" ? "你" : "Atoms"}</strong>
                  <p>{message.text}</p>
                  {message.attachments?.length ? (
                    <div className="message-attachments">
                      {message.attachments.map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </div>
                  ) : null}
                  {message.analysis ? (
                    <div className="analysis-block">
                      <ol>
                        {message.analysis.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                      <div className="analysis-sections">
                        {message.analysis.sections.map((section) => (
                          <section key={section.title}>
                            <h2>{section.title}</h2>
                            <ul>
                              {section.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          <form className="create-box" onSubmit={submit}>
            <textarea
              aria-label="描述你想创造的产品"
              ref={textareaRef}
              onChange={(event) => setDraft(event.target.value)}
              onInput={(event) => setDraft(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你想创造的产品，或提出一个需要分析的问题"
              value={draft}
            />
            {attachments.length > 0 ? (
              <div className="attachment-row">
                {attachments.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            ) : null}
            <div className="create-actions">
              <input
                multiple
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                onChange={(event) => {
                  setAttachments(Array.from(event.target.files ?? []).map((file) => file.name));
                }}
              />
              <button aria-label="上传附件" className="circle-btn" type="button" onClick={() => fileInputRef.current?.click()}>
                ＋
              </button>
              <button aria-label="发送" className="send-btn" type="submit">
                ↑
              </button>
            </div>
          </form>
        </section>

        {(latestAnalysis?.intent === "build" || latestAnalysis?.intent === "revise") && latestApp ? (
          <GenerationWorkspace
            activeTab={activeWorkspaceTab}
            app={latestApp}
            onAppChange={updateLatestApp}
            onTabChange={updateWorkspaceTab}
          />
        ) : null}
      </section>
    </main>
  );
}
