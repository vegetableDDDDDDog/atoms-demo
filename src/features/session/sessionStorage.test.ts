import { describe, expect, it } from "vitest";
import { analyzeUserQuery } from "@/features/query/analyzeUserQuery";
import { generateApp } from "@/features/generation/generateApp";
import { loadSessions, saveSessions, sessionStorageKey, type AppSession } from "./sessionStorage";

function createMemoryStorage(seed?: Record<string, string>) {
  const data = new Map(Object.entries(seed ?? {}));

  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    }
  };
}

describe("sessionStorage", () => {
  it("saves and loads sessions with messages, attachments, analysis, generated app and active tab", () => {
    const prompt = "帮我做一个个人读书记录工具，需要书籍录入、阅读进度";
    const analysis = analyzeUserQuery(prompt, ["需求说明.md"]);
    const app = generateApp({ prompt, analysis });
    const storage = createMemoryStorage();
    const sessions: AppSession[] = [
      {
        id: "s1",
        title: "读书记录工具",
        createdAtLabel: "刚刚",
        activeWorkspaceTab: "code",
        messages: [
          { id: "m1", role: "user", text: prompt, attachments: ["需求说明.md"] },
          { id: "m2", role: "assistant", text: "已生成", analysis, app }
        ]
      }
    ];

    saveSessions(storage, sessions);

    expect(loadSessions(storage)).toEqual(sessions);
  });

  it("falls back to empty sessions when stored data is corrupt", () => {
    const storage = createMemoryStorage({ [sessionStorageKey]: "{broken" });

    expect(loadSessions(storage)).toEqual([]);
    expect(storage.getItem(sessionStorageKey)).toBeNull();
  });
});
