# AI Coding Workspace Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current generated-app demo into a clear web AI coding workspace where the user drives app generation through conversation and sees the generated artifact in a right-side preview.

**Architecture:** Keep the existing Next.js, Prisma, route handlers, and deterministic generation services. Refactor the frontend information architecture only: top bar, left project rail, center conversation, and right output workspace. Reuse existing `Project`, `GenerationRun`, `AgentStep`, and `AppVersion` data without database changes.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma/SQLite, Vitest, plain CSS in `src/app/globals.css`, existing `lucide-react` icons.

---

## File Structure

- Modify `src/features/i18n/dictionary.ts`
  - Add workspace-specific labels, tabs, conversation copy, file labels, and deploy/diff empty states in English and Chinese.
- Modify `src/components/build-room/BuildRoom.tsx`
  - Recompose the page as top bar + left rail + center conversation + right output workspace.
  - Add new workspace views: `preview`, `mobile`, `code`, `diff`, `deploy`.
- Modify `src/components/build-room/PromptComposer.tsx`
  - Simplify it into a conversation composer, moving language/status controls to the new top bar.
- Modify `src/components/build-room/ProjectSidebar.tsx`
  - Make it a project/file/version context rail.
- Modify `src/components/build-room/AgentPipeline.tsx`
  - Make it render as a conversation timeline instead of a detached right sidebar log.
- Modify `src/components/build-room/PreviewFrame.tsx`
  - Keep preview behavior but tune copy and sizing for the right workspace.
- Modify `src/components/build-room/CodePanel.tsx`
  - Keep file rendering but make it fit the right workspace tabs.
- Modify `src/app/globals.css`
  - Replace the old three-column layout with a clearer top-bar workspace layout.
- Create `src/components/build-room/DiffPanel.tsx`
  - Show a lightweight generated-change summary using the current version.
- Create `src/components/build-room/DeployPanel.tsx`
  - Show publish state and publish action in a secondary tab.
- Create `src/features/i18n/dictionary.test.ts`
  - Verify both locales expose the required workspace tabs and generation phases.

---

### Task 1: Localized Workspace Copy

**Files:**
- Modify: `src/features/i18n/dictionary.ts`
- Create: `src/features/i18n/dictionary.test.ts`

- [ ] **Step 1: Write the dictionary coverage test**

Create `src/features/i18n/dictionary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { dictionary } from "./dictionary";

describe("dictionary workspace copy", () => {
  it("defines the same workspace tab ids for both locales", () => {
    expect(dictionary.en.workspaceTabs.map((tab) => tab.id)).toEqual(["preview", "mobile", "code", "diff", "deploy"]);
    expect(dictionary.zh.workspaceTabs.map((tab) => tab.id)).toEqual(["preview", "mobile", "code", "diff", "deploy"]);
  });

  it("keeps the generation phase pipeline complete in both locales", () => {
    expect(dictionary.en.generationPhases).toHaveLength(5);
    expect(dictionary.zh.generationPhases).toHaveLength(5);
    expect(dictionary.en.generationPhases.map((phase) => phase.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(dictionary.zh.generationPhases.map((phase) => phase.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm test -- src/features/i18n/dictionary.test.ts
```

Expected: fail because `workspaceTabs` does not exist yet.

- [ ] **Step 3: Add workspace copy**

Update each locale in `src/features/i18n/dictionary.ts` with these keys:

```ts
workspaceSubtitle: string;
currentProject: string;
workspaceMode: string;
teamMode: string;
topbarPublishIdle: string;
leftRailTitle: string;
generatedFiles: string;
versions: string;
conversationTitle: string;
conversationSubtitle: string;
userRequestLabel: string;
agentPlanLabel: string;
nextActionsLabel: string;
followUpSuggestions: string[];
workspaceTabs: Array<{ id: "preview" | "mobile" | "code" | "diff" | "deploy"; label: string }>;
rightWorkspaceTitle: string;
diffTitle: string;
diffEmpty: string;
diffSummary: string;
deployTitle: string;
deployEmpty: string;
deployReady: string;
```

Use human-facing text, not technical placeholders. English copy should call the product `Web AI Coding Workspace`. Chinese copy should call it `网页版 AI 编程工作台`.

- [ ] **Step 4: Run the dictionary test**

Run:

```bash
npm test -- src/features/i18n/dictionary.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/i18n/dictionary.ts src/features/i18n/dictionary.test.ts
git commit -m "feat: add workspace localization copy"
```

---

### Task 2: Recompose the Workspace Shell

**Files:**
- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/components/build-room/PromptComposer.tsx`
- Modify: `src/components/build-room/ProjectSidebar.tsx`
- Modify: `src/components/build-room/AgentPipeline.tsx`

- [ ] **Step 1: Change the view state**

In `BuildRoom.tsx`, replace:

```ts
const [view, setView] = useState<"desktop" | "mobile" | "code">("desktop");
```

with:

```ts
type WorkspaceView = "preview" | "mobile" | "code" | "diff" | "deploy";

const [view, setView] = useState<WorkspaceView>("preview");
```

- [ ] **Step 2: Add top bar markup**

Inside `BuildRoom`, render a top bar before the main content:

```tsx
<header className="workspace-topbar">
  <div>
    <strong>{copy.brandName}</strong>
    <span>{copy.workspaceSubtitle}</span>
  </div>
  <div className="topbar-meta">
    <span>{copy.currentProject}: {activeRun?.project.name ?? copy.noBuilds}</span>
    <span>{copy.workspaceMode}: {copy.teamMode}</span>
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
```

- [ ] **Step 3: Replace page structure**

Use this structure in `BuildRoom.tsx`:

```tsx
return (
  <main className="workspace-shell">
    <header className="workspace-topbar">...</header>
    <div className="workspace-grid">
      <ProjectSidebar projects={projects} activeVersion={activeVersion} copy={copy} />
      <section className="conversation-panel">...</section>
      <section className="output-panel">...</section>
    </div>
  </main>
);
```

The center `conversation-panel` contains `DemoBrief`, `PromptComposer`, the latest request summary, and `AgentPipeline`. The right `output-panel` contains tabs and the selected output view.

- [ ] **Step 4: Simplify `PromptComposer` props**

Change `PromptComposer` to accept only:

```ts
{
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  copy: BuildRoomCopy;
}
```

Remove language controls and status pill from the composer. Keep textarea and generate button.

- [ ] **Step 5: Update `ProjectSidebar` props**

Change `ProjectSidebar` to accept:

```ts
{
  projects: ProjectSummary[];
  activeVersion: { title: string; appType: string; versionNumber: number } | null;
  copy: BuildRoomCopy;
}
```

Render project cards, a generated files block, and a versions block. For the generated files block, show `index.html`, `styles.css`, and `app.js` when `activeVersion` exists.

- [ ] **Step 6: Update `AgentPipeline` visual role**

Keep the existing data props, but change the heading to `copy.agentPlanLabel` and render inside the center conversation. The component should still show simulated progress while generating and persisted agent steps after generation.

- [ ] **Step 7: Run TypeScript/build check**

Run:

```bash
npm run build
```

Expected: pass after related CSS and missing panels are added in later tasks. If this task is run before Task 3 and Task 4, TypeScript may fail because `DiffPanel` and `DeployPanel` are not created yet.

---

### Task 3: Add Output Tabs, Diff, and Deploy Panels

**Files:**
- Create: `src/components/build-room/DiffPanel.tsx`
- Create: `src/components/build-room/DeployPanel.tsx`
- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/components/build-room/CodePanel.tsx`
- Modify: `src/components/build-room/PreviewFrame.tsx`

- [ ] **Step 1: Create `DiffPanel.tsx`**

```tsx
import type { BuildRoomCopy } from "@/features/i18n/dictionary";

type Version = {
  title: string;
  description: string;
  html: string;
  css: string;
  js: string;
};

export function DiffPanel({ version, copy }: { version: Version | null; copy: BuildRoomCopy }) {
  if (!version) {
    return (
      <section className="output-empty">
        <strong>{copy.diffTitle}</strong>
        <p>{copy.diffEmpty}</p>
      </section>
    );
  }

  const fileStats = [
    { name: "index.html", lines: version.html.split("\n").length },
    { name: "styles.css", lines: version.css.split("\n").length },
    { name: "app.js", lines: version.js.split("\n").length }
  ];

  return (
    <section className="diff-panel">
      <div>
        <p className="section-title">{copy.diffTitle}</p>
        <h3>{version.title}</h3>
        <p>{copy.diffSummary}</p>
      </div>
      <div className="file-stat-list">
        {fileStats.map((file) => (
          <article key={file.name} className="file-stat">
            <strong>{file.name}</strong>
            <span>{file.lines} lines</span>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `DeployPanel.tsx`**

```tsx
import type { BuildRoomCopy } from "@/features/i18n/dictionary";

export function DeployPanel({
  canPublish,
  publishUrl,
  onPublish,
  copy
}: {
  canPublish: boolean;
  publishUrl: string | null;
  onPublish: () => void;
  copy: BuildRoomCopy;
}) {
  return (
    <section className="deploy-panel">
      <div>
        <p className="section-title">{copy.deployTitle}</p>
        <h3>{publishUrl ? copy.deployReady : copy.topbarPublishIdle}</h3>
        <p>{publishUrl ? `${copy.publishedAt} ${publishUrl}` : copy.deployEmpty}</p>
      </div>
      <button className="button-primary" onClick={onPublish} disabled={!canPublish}>
        {copy.publish}
      </button>
    </section>
  );
}
```

- [ ] **Step 3: Wire tabs in `BuildRoom.tsx`**

Add imports:

```ts
import { DeployPanel } from "./DeployPanel";
import { DiffPanel } from "./DiffPanel";
```

Render tab buttons from `copy.workspaceTabs`:

```tsx
<div className="workspace-tabs" aria-label={copy.previewViews}>
  {copy.workspaceTabs.map((tab) => (
    <button key={tab.id} className="button-ghost" data-active={view === tab.id} onClick={() => setView(tab.id)}>
      {tab.label}
    </button>
  ))}
</div>
```

Render selected view:

```tsx
{view === "code" && activeVersion ? <CodePanel version={activeVersion} /> : null}
{view === "diff" ? <DiffPanel version={activeVersion} copy={copy} /> : null}
{view === "deploy" ? (
  <DeployPanel canPublish={Boolean(activeVersion)} publishUrl={publishUrl} onPublish={publishCurrentVersion} copy={copy} />
) : null}
{(view === "preview" || view === "mobile") ? (
  <PreviewFrame document={generatedDocument} mode={view} empty={!activeVersion} copy={copy} version={activeVersion} progress={...} />
) : null}
```

- [ ] **Step 4: Update preview mode type**

In `PreviewFrame.tsx`, change mode type from:

```ts
mode: "desktop" | "mobile" | "code";
```

to:

```ts
mode: "preview" | "mobile";
```

Use `mode === "mobile"` to keep the mobile width behavior.

- [ ] **Step 5: Keep code panel inside right workspace**

In `CodePanel.tsx`, keep the existing file loop but remove assumptions that it occupies the full center page. The existing component can remain mostly unchanged if CSS handles sizing.

- [ ] **Step 6: Commit**

```bash
git add src/components/build-room/BuildRoom.tsx src/components/build-room/DiffPanel.tsx src/components/build-room/DeployPanel.tsx src/components/build-room/PreviewFrame.tsx src/components/build-room/CodePanel.tsx
git commit -m "feat: add workspace output tabs"
```

---

### Task 4: Restyle the Three-Zone Workspace

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/build-room/DemoBrief.tsx` only if markup needs lighter copy hierarchy

- [ ] **Step 1: Replace shell layout CSS**

Use these layout anchors:

```css
.workspace-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.workspace-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 58px;
  border-bottom: 1px solid var(--line);
  background: var(--panel);
  padding: 10px 16px;
}

.workspace-grid {
  min-height: 0;
  display: grid;
  grid-template-columns: 240px minmax(420px, 1fr) minmax(420px, .95fr);
}

.conversation-panel,
.output-panel,
.project-rail {
  min-width: 0;
  min-height: 0;
}
```

- [ ] **Step 2: Make the center conversation dominant**

Add CSS for:

```css
.conversation-panel {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 16px;
  overflow: auto;
}

.conversation-card {
  padding: 14px;
}

.latest-request {
  display: grid;
  gap: 8px;
  padding: 14px;
}
```

- [ ] **Step 3: Make the right output panel stable**

Add CSS for:

```css
.output-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  border-left: 1px solid var(--line);
  background: #f8fafc;
  padding: 16px;
}

.output-panel-body {
  min-height: 0;
}

.workspace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
```

- [ ] **Step 4: Add responsive behavior**

At `max-width: 1180px`, switch to one column:

```css
@media (max-width: 1180px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .output-panel {
    border-left: 0;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/build-room/DemoBrief.tsx
git commit -m "style: redesign ai coding workspace layout"
```

---

### Task 5: Verification and Browser Smoke Test

**Files:**
- No required source changes unless verification finds an issue.

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

Expected: all existing and new tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build completes successfully.

- [ ] **Step 3: Open local app**

Ensure the dev server is running:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/
```

- [ ] **Step 4: Browser smoke test**

Manually verify:

- First screen reads as an AI coding workspace, not a CRM product.
- Center prompt/conversation is the dominant interaction.
- Click generate with `帮我生成一个需求管理系统`.
- Generation state visibly progresses.
- Generated app preview appears on the right.
- Code, Diff, and Deploy tabs are reachable.
- Chinese and English switching still works.

- [ ] **Step 5: Final commit if fixes were needed**

```bash
git add <changed-files>
git commit -m "fix: polish workspace smoke test issues"
```

---

## Self-Review

- Spec coverage: The plan covers product reframing, three-zone layout, visible agent process, generated preview as default, code/diff/deploy as secondary views, bilingual UI, and no database migration.
- Placeholder scan: No `TBD` or `TODO` markers are intentionally left in the plan.
- Type consistency: `WorkspaceView` ids match the planned `workspaceTabs` ids: `preview`, `mobile`, `code`, `diff`, `deploy`.
