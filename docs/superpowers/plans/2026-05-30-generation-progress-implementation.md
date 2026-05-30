# Generation Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible generation progress so users can see what the agent team is doing after clicking generate.

**Architecture:** Keep the API synchronous and simulate progress in the client. A small tested helper converts a list of generation stages plus an active index into renderable statuses; Build Room owns the active index and passes progress state to AgentPipeline and PreviewFrame.

**Tech Stack:** Next.js App Router, React state/effects, TypeScript, Vitest, existing CSS.

---

## Files

- Create `src/features/progress/generationProgress.ts`: pure progress status helpers.
- Create `src/features/progress/generationProgress.test.ts`: TDD coverage for waiting/active/done/error mapping.
- Modify `src/features/i18n/dictionary.ts`: add localized progress copy and stage definitions.
- Modify `src/components/build-room/BuildRoom.tsx`: own progress lifecycle and visible minimum duration.
- Modify `src/components/build-room/AgentPipeline.tsx`: render simulated progress steps while generating.
- Modify `src/components/build-room/PreviewFrame.tsx`: render progress placeholder while generating.
- Modify `src/app/globals.css`: style progress cards, timeline states, and progress bar.

## Tasks

### Task 1: Progress Helper

- [ ] Write a failing test in `src/features/progress/generationProgress.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decorateProgressSteps, getProgressPercent } from "./generationProgress";

const phases = [
  { agent: "Mike", title: "Understand request", content: "Read prompt" },
  { agent: "Emma", title: "Extract requirements", content: "List features" },
  { agent: "Alex", title: "Generate files", content: "Write code" }
];

describe("decorateProgressSteps", () => {
  it("marks previous steps done, current step active, and future steps waiting", () => {
    expect(decorateProgressSteps(phases, 1)).toEqual([
      { ...phases[0], status: "done" },
      { ...phases[1], status: "active" },
      { ...phases[2], status: "waiting" }
    ]);
  });

  it("marks the active step as error when generation fails", () => {
    expect(decorateProgressSteps(phases, 1, "error")[1]?.status).toBe("error");
  });
});

describe("getProgressPercent", () => {
  it("returns an increasing bounded percentage", () => {
    expect(getProgressPercent(0, 3)).toBe(34);
    expect(getProgressPercent(2, 3)).toBe(100);
  });
});
```

- [ ] Run `npm test -- src/features/progress/generationProgress.test.ts` and confirm it fails because the helper does not exist.
- [ ] Implement the helper with `ProgressStatus = "waiting" | "active" | "done" | "error"`.
- [ ] Re-run the targeted test and confirm it passes.

### Task 2: UI Progress

- [ ] Add localized generation phases and progress labels to `dictionary.ts`.
- [ ] In `BuildRoom`, add `activeProgressIndex` and `progressState`.
- [ ] On generate start, clear old active run, set progress index to `0`, and advance it on a short interval while the API runs.
- [ ] Keep a minimum visible duration so the user can see the stages even if the API responds immediately.
- [ ] On success, mark progress as complete and show the generated preview.
- [ ] On failure, mark the current stage as error and keep the progress UI visible.

### Task 3: Render and Verify

- [ ] Update `AgentPipeline` to render simulated progress steps while generating and completed persisted steps after success.
- [ ] Update `PreviewFrame` to render a progress placeholder with current stage and progress bar.
- [ ] Add CSS for `.generation-progress`, `.progress-meter`, `.agent-step[data-status]`, and `.step-status`.
- [ ] Run `npm test`.
- [ ] Stop the dev server if needed, then run `npm run build`.
- [ ] Start the dev server and browser-test the prompt `帮我生成一个需求管理系统`; confirm the user sees progress immediately.

## Self-Review

- The plan addresses the reported issue directly.
- It does not require backend streaming or schema changes.
- The helper has unit coverage and the UI is verified manually in the browser.

