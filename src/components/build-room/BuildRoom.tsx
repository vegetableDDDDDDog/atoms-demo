"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { analyzeUserQuery, type QueryAnalysis } from "@/features/query/analyzeUserQuery";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  analysis?: QueryAnalysis;
};

type Session = {
  id: string;
  title: string;
  createdAtLabel: string;
  messages: Message[];
};

const seedSessions: Session[] = [
  { id: "s1", title: "确认已部署测试链接要求", createdAtLabel: "5 小时", messages: [] },
  { id: "s2", title: "京东面试回顾", createdAtLabel: "5 小时", messages: [] },
  { id: "s3", title: "解释 SSE 断点重连", createdAtLabel: "3 天", messages: [] },
  { id: "s4", title: "整理 Redis 高频面试题", createdAtLabel: "3 天", messages: [] },
  { id: "s5", title: "分析 OpenClaw 功能架构", createdAtLabel: "1 周", messages: [] }
];

const storageKey = "atoms-demo-sessions-v1";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromPrompt(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();
  return compact.length > 18 ? `${compact.slice(0, 18)}...` : compact || "新对话";
}

function buildAssistantText(analysis: QueryAnalysis) {
  const mode = analysis.intent === "build" ? "实现类" : "咨询类";
  return `意图识别：${mode}\n${analysis.summary}\n${analysis.context}`;
}

export function BuildRoom() {
  const [sessions, setSessions] = useState<Session[]>(seedSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );
  const latestAnalysis = activeSession?.messages.findLast((message) => message.analysis)?.analysis ?? null;

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Session[];
      if (Array.isArray(parsed)) {
        setSessions(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(sessions));
  }, [sessions]);

  function startEmptySession() {
    setActiveSessionId(null);
    setDraft("");
    setAttachments([]);
  }

  function sendMessage() {
    const prompt = draft.trim();
    if (!prompt) return;

    const analysis = analyzeUserQuery(prompt, attachments);
    const userMessage: Message = { id: createId("m"), role: "user", text: prompt };
    const assistantMessage: Message = {
      id: createId("m"),
      role: "assistant",
      text: buildAssistantText(analysis),
      analysis
    };

    if (activeSession) {
      setSessions((current) =>
        current.map((session) =>
          session.id === activeSession.id
            ? { ...session, messages: [...session.messages, userMessage, assistantMessage], title: session.title || titleFromPrompt(prompt) }
            : session
        )
      );
    } else {
      const session: Session = {
        id: createId("s"),
        title: titleFromPrompt(prompt),
        createdAtLabel: "刚刚",
        messages: [userMessage, assistantMessage]
      };
      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
    }

    setDraft("");
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
              onChange={(event) => setDraft(event.target.value)}
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
              <button aria-label="发送" className="send-btn" disabled={!draft.trim()} type="submit">
                ↑
              </button>
            </div>
          </form>
        </section>

        {latestAnalysis?.intent === "build" ? (
          <aside className="build-status">
            <p>构建状态</p>
            <strong>已生成实施计划</strong>
            <ul>
              {latestAnalysis.sections
                .find((section) => section.title === "预期文件")
                ?.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
