# Atoms Demo Design

## Goal

Build a lightweight, runnable full-stack web prototype inspired by Atoms. The product lets a user describe an app idea, watches a simulated AI agent team plan and generate it, then previews the generated app in the browser.

The demo should be deployable, interactive, persistent, and easy to extend into a real AI-powered app generation platform.

## Product Direction

Use the "Agent Build Room" layout as the main experience:

- Left panel: prompt input, build controls, project/history list, agent pipeline.
- Center panel: live generated app preview with desktop/mobile/code tabs.
- Right panel: chat/log stream, generated files, publish/share controls.

This direction keeps the Atoms-like interaction visible while staying realistic for a focused build.

## Core User Flow

1. User opens the dashboard and enters an app idea.
2. User starts a build in Team Mode.
3. Backend creates a project and generation run.
4. Agent steps run in sequence:
   - Mike: coordinates the build and summarizes the goal.
   - Emma: extracts requirements and acceptance criteria.
   - Bob: proposes app structure and data model.
   - Alex: generates app files from templates.
   - QA: checks the generated app and reports issues or success.
5. Frontend shows progress, logs, and generated artifacts.
6. Generated app is rendered in an iframe through `srcDoc`.
7. User can switch desktop/mobile/code views.
8. User can save versions, remix a previous version, run Fix Bug, and publish a version.

## MVP Features

- Prompt-to-app build flow.
- Simulated multi-agent pipeline with persisted steps.
- Generated app preview inside iframe.
- Desktop/mobile preview toggle.
- Code panel showing generated HTML, CSS, and JavaScript.
- Version history per project.
- Remix from an existing version.
- Fix Bug action that creates a follow-up run and improved version.
- Publish action that creates a stable internal publish record and share URL.
- Persistence through SQLite.

## Optional Follow-Up Features

- Race Mode: generate two or three candidate versions for the same prompt.
- Template gallery: CRM, portfolio monitor, todo/internal tool, ecommerce landing page.
- Real LLM generation through an adapter.
- Authentication.
- Supabase/Postgres migration.
- GitHub export.

## Technical Stack

- Framework: Next.js with App Router.
- Language: TypeScript.
- UI: React components plus CSS Modules or scoped global CSS.
- Icons: `lucide-react`.
- Backend: Next.js route handlers under `app/api`.
- Database: SQLite for MVP.
- ORM: Prisma.
- Preview: iframe using `srcDoc`.
- Testing: Vitest for generation logic; Playwright can be added for end-to-end UI checks.
- Deployment target: Vercel, Netlify, or another Node-compatible host. If static-only hosting is required, SQLite-dependent API routes need a hosted database replacement.

## Architecture

The app is a full-stack monolith with replaceable service boundaries.

```text
React UI
  -> API route handlers
    -> generation service
      -> agent orchestrator
      -> template generator
    -> Prisma repository layer
      -> SQLite database
```

### Frontend Modules

- `BuildRoom`: main page shell.
- `PromptComposer`: captures the user's app idea and build mode.
- `AgentPipeline`: displays step status and agent outputs.
- `LogStream`: displays chronological run events.
- `PreviewFrame`: renders generated app output.
- `ViewTabs`: switches desktop, mobile, and code views.
- `CodePanel`: shows generated files.
- `ProjectSidebar`: lists projects, versions, and publish state.
- `PublishDialog`: shows published slug and copyable URL.

### Backend Modules

- `projectService`: project CRUD and version lookup.
- `generationService`: creates runs and coordinates generation.
- `agentOrchestrator`: produces ordered agent steps.
- `templateGenerator`: maps prompt intent to app type and generated files.
- `publishService`: creates and resolves published versions.
- `repositories`: small Prisma wrappers for persistence.

### Replaceable AI Boundary

The MVP generator is deterministic and local. It should expose an interface that can later be backed by a real model.

```ts
type GenerateAppInput = {
  prompt: string;
  mode: "team" | "engineer" | "race";
  previousVersionId?: string;
};

type GeneratedAppFiles = {
  html: string;
  css: string;
  js: string;
  title: string;
  description: string;
  appType: string;
};
```

Later, `templateGenerator` can be replaced or augmented by `llmGenerator` without changing the UI or database shape.

## Database Design

### User

MVP can create or assume a single demo user. The table remains useful for future authentication.

- `id`
- `name`
- `email`
- `createdAt`

### Project

- `id`
- `userId`
- `name`
- `prompt`
- `mode`
- `status`
- `createdAt`
- `updatedAt`

### GenerationRun

- `id`
- `projectId`
- `inputPrompt`
- `mode`
- `status`
- `selectedVersionId`
- `createdAt`
- `completedAt`

### AgentStep

- `id`
- `runId`
- `agent`
- `title`
- `status`
- `content`
- `order`
- `createdAt`
- `updatedAt`

### AppVersion

- `id`
- `projectId`
- `runId`
- `versionNumber`
- `title`
- `description`
- `appType`
- `html`
- `css`
- `js`
- `createdAt`

### PublishRecord

- `id`
- `projectId`
- `versionId`
- `slug`
- `isActive`
- `publishedAt`

## API Design

- `GET /api/projects`
  - List projects and latest versions.
- `POST /api/projects`
  - Create a project from an initial prompt.
- `GET /api/projects/:id`
  - Fetch project detail, versions, and recent runs.
- `POST /api/runs`
  - Start a generation run for a prompt or remix.
- `GET /api/runs/:id`
  - Fetch run status, agent steps, and generated version.
- `POST /api/runs/:id/fix`
  - Start a fix-bug run using the selected version.
- `POST /api/publish`
  - Publish a version and return a share URL.
- `GET /p/:slug`
  - Public preview page for a published generated app.

For MVP, run progress can be returned through polling. Server-Sent Events can be added later if time allows.

## Generated App Types

The first generator should support a small set of recognizable app categories:

- CRM or booking dashboard.
- Portfolio or investment monitor.
- Todo or internal operations tool.
- Ecommerce or landing page.

Prompt classification can be keyword-based for MVP. The generated app must contain real controls and local in-preview state, such as adding rows, filtering, toggling statuses, or editing a card.

## Error Handling

- If generation fails, mark the run as `failed` and persist the error in a QA or system step.
- If a project or version is missing, API returns 404 with a short message.
- If publish slug conflicts, generate a new suffix.
- If iframe content is empty, show a fallback preview error panel.
- If database initialization fails, show a setup error instead of a blank page.

## Testing Strategy

- Unit test prompt classification.
- Unit test template generation returns non-empty HTML/CSS/JS.
- Unit test version number incrementing.
- Unit test publish slug creation and conflict handling.
- Manual browser test:
  - create project,
  - run generation,
  - view preview,
  - switch mobile/code tabs,
  - run Fix Bug,
  - publish version,
  - open public page.

## Delivery Notes

The MVP intentionally uses a simulated local agent engine instead of relying on a real LLM API. This keeps the demo reliable under interview conditions while preserving a clean extension point for real AI generation.

The design is full-stack from the start, so the project demonstrates backend routing, persistence, generated artifacts, and deployability without overbuilding the first version.
