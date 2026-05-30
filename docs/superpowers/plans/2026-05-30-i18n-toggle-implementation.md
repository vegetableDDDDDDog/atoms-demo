# I18n Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight Chinese/English switch to the Atoms Demo so UI chrome, agent output, and generated apps can be shown in either language.

**Architecture:** Keep i18n intentionally small: one typed frontend dictionary plus a shared `Locale` type passed through API handlers into the generator and agent orchestrator. No database schema change is needed because generated localized text is already stored in existing run, step, and version records.

**Tech Stack:** Next.js App Router, React state/localStorage, TypeScript, Prisma existing tables, Vitest.

---

## File Structure

- Create `src/features/i18n/dictionary.ts`: frontend copy dictionary and locale helpers.
- Modify `src/features/generator/types.ts`: add `Locale` and attach it to `GenerateAppInput`.
- Modify `src/features/generator/classifyPrompt.ts`: recognize common Chinese product words.
- Modify `src/features/generator/templates.ts`: select English or Chinese generated app copy.
- Modify `src/features/generator/buildGeneratedApp.ts`: pass locale to templates.
- Modify `src/features/agents/orchestrator.ts`: generate localized agent steps.
- Modify `src/features/runs/generationService.ts`: accept locale and pass it downstream.
- Modify `src/app/api/projects/route.ts`, `src/app/api/runs/route.ts`, and `src/app/api/runs/[id]/fix/route.ts`: parse optional locale.
- Modify `src/components/build-room/*.tsx`: render localized labels and include a language toggle.
- Modify `src/app/globals.css`: style the segmented language toggle.
- Modify tests in `src/features/generator/generator.test.ts` and `src/features/agents/orchestrator.test.ts`.

## Tasks

### Task 1: Tests First

**Files:**
- Modify: `src/features/generator/generator.test.ts`
- Modify: `src/features/agents/orchestrator.test.ts`

- [ ] **Step 1: Add generator locale tests**

Add tests that prove a Chinese prompt classifies as CRM and that generated files include Chinese UI copy:

```ts
it("classifies Chinese customer booking prompts as crm", () => {
  expect(classifyPrompt("生成一个客户预约 CRM")).toBe("crm");
});

it("generates Chinese iframe-ready copy when locale is zh", () => {
  const app = buildGeneratedApp({
    prompt: "生成一个客户预约 CRM",
    mode: "team",
    locale: "zh"
  });

  expect(app.title).toContain("预约");
  expect(app.html).toContain("新增记录");
  expect(app.html).toContain("搜索生成数据");
});
```

- [ ] **Step 2: Add agent locale test**

Add a test that proves agent output switches to Chinese:

```ts
it("returns localized Chinese agent steps", () => {
  const steps = createAgentPlan("生成一个客户预约 CRM", false, "zh");

  expect(steps.map((step) => step.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
  expect(steps[0].title).toBe("协调构建");
  expect(steps[0].content).toContain("客户预约");
});
```

- [ ] **Step 3: Run tests and confirm red**

Run:

```bash
npm test -- src/features/generator/generator.test.ts src/features/agents/orchestrator.test.ts
```

Expected: fail because `locale` is not defined in types or function signatures and Chinese words are not classified yet.

### Task 2: Generator and Agent Locale Support

**Files:**
- Modify: `src/features/generator/types.ts`
- Modify: `src/features/generator/classifyPrompt.ts`
- Modify: `src/features/generator/templates.ts`
- Modify: `src/features/generator/buildGeneratedApp.ts`
- Modify: `src/features/agents/orchestrator.ts`

- [ ] **Step 1: Add `Locale` type**

Add `export type Locale = "en" | "zh";` and `locale?: Locale` to `GenerateAppInput`.

- [ ] **Step 2: Expand classifier words**

Add Chinese keywords such as `客户`, `预约`, `投资`, `任务`, `运营`, `商品`, and `订单` to the existing rules.

- [ ] **Step 3: Localize template content**

Update template content selection so `locale === "zh"` uses Chinese labels for title, description, metrics, rows, button text, search aria-label, status options, and generated item text.

- [ ] **Step 4: Localize agent copy**

Change `createAgentPlan(prompt, fixRequested, locale)` to choose English or Chinese step titles/content.

- [ ] **Step 5: Run targeted tests**

Run:

```bash
npm test -- src/features/generator/generator.test.ts src/features/agents/orchestrator.test.ts
```

Expected: pass.

### Task 3: API and Service Threading

**Files:**
- Modify: `src/features/runs/generationService.ts`
- Modify: `src/app/api/projects/route.ts`
- Modify: `src/app/api/runs/route.ts`
- Modify: `src/app/api/runs/[id]/fix/route.ts`

- [ ] **Step 1: Accept locale in `CreateRunInput`**

Add `locale?: Locale` and pass it to `createAgentPlan` and `buildGeneratedApp`.

- [ ] **Step 2: Parse locale in API handlers**

Read `locale` from request bodies and forward it to `createGenerationRun`.

- [ ] **Step 3: Run service tests**

Run:

```bash
npm test -- src/features/runs/generationService.test.ts
```

Expected: pass without schema migration.

### Task 4: UI Toggle

**Files:**
- Create: `src/features/i18n/dictionary.ts`
- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/components/build-room/PromptComposer.tsx`
- Modify: `src/components/build-room/ProjectSidebar.tsx`
- Modify: `src/components/build-room/PreviewFrame.tsx`
- Modify: `src/components/build-room/AgentPipeline.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create dictionary**

Create a typed dictionary with keys for Build Room labels, buttons, empty states, publishing status, and tab labels.

- [ ] **Step 2: Add locale state**

In `BuildRoom`, initialize locale from `localStorage`, persist changes, and pass localized copy to child components.

- [ ] **Step 3: Include locale in fetch bodies**

Send `{ locale }` when starting a run or requesting a fix.

- [ ] **Step 4: Render segmented toggle**

Add `中文` and `English` buttons with `aria-pressed`.

- [ ] **Step 5: Style the toggle**

Add compact segmented-control CSS that fits the existing dashboard visual language.

### Task 5: Verification and Commit

**Files:**
- All changed files.

- [ ] **Step 1: Run full tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: Next.js build passes.

- [ ] **Step 3: Browser smoke test**

Open `http://localhost:3000`, switch language, run a Chinese CRM prompt, and confirm UI chrome, agent pipeline, and preview content are Chinese.

- [ ] **Step 4: Commit and push**

Run:

```bash
git add docs src
git commit -m "feat: add bilingual build room"
git push -u origin feature/i18n-toggle
```

Expected: branch is pushed for review.

## Self-Review

- Spec coverage: toggle, persistence, UI localization, API threading, agent localization, generated app localization, and no DB migration are covered.
- Placeholder scan: no task depends on a placeholder or undefined follow-up.
- Type consistency: `Locale` flows from UI/API into `createGenerationRun`, `createAgentPlan`, and `buildGeneratedApp`.

