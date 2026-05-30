import type { GeneratedApp } from "@/features/generation/types";
import type { QueryAnalysis } from "@/features/query/analyzeUserQuery";

export const sessionStorageKey = "atoms-demo-sessions-v5";

export type WorkspaceTab = "preview" | "code" | "logs";

export type AppMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: string[];
  analysis?: QueryAnalysis;
  app?: GeneratedApp;
};

export type AppSession = {
  id: string;
  title: string;
  createdAtLabel: string;
  activeWorkspaceTab?: WorkspaceTab;
  messages: AppMessage[];
};

type StorageReader = {
  getItem(key: string): string | null;
  removeItem(key: string): void;
};

type StorageWriter = {
  setItem(key: string, value: string): void;
};

function isSessionList(value: unknown): value is AppSession[] {
  return (
    Array.isArray(value) &&
    value.every(
      (session) =>
        typeof session === "object" &&
        session !== null &&
        "id" in session &&
        "title" in session &&
        "messages" in session &&
        Array.isArray((session as AppSession).messages)
    )
  );
}

export function loadSessions(storage: StorageReader): AppSession[] {
  const stored = storage.getItem(sessionStorageKey);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (isSessionList(parsed)) {
      return parsed;
    }
  } catch {
    storage.removeItem(sessionStorageKey);
    return [];
  }

  storage.removeItem(sessionStorageKey);
  return [];
}

export function saveSessions(storage: StorageWriter, sessions: AppSession[]) {
  storage.setItem(sessionStorageKey, JSON.stringify(sessions));
}
