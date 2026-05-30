# AI Coding Workspace Redesign

## Problem

The current prototype still reads too much like a generated business app demo. A user can enter a request and eventually see an output, but the product frame is not obvious enough: this should be a web-based AI coding workspace, similar in spirit to Atoms or Codex, where the user describes an application and watches agents turn that request into design, code, and a visual preview.

The generated CRM, booking tool, or requirement management system should be the artifact produced by the workspace. It should not feel like the workspace itself.

## Goal

Redesign the main page around a clear prompt-to-app workflow:

1. The user describes the app they want.
2. The workspace shows the agent plan and execution process.
3. The system generates files and a runnable visual preview.
4. The user can inspect the preview, code, changes, and publish state.
5. The user can continue the conversation to modify the generated app.

## Product Positioning

The product should present itself as:

**Atoms Demo: Web AI Coding Workspace**

This means the first screen should communicate "build apps with agents" before it communicates any specific generated app domain.

## Layout

Use a simplified three-zone workspace.

```text
Top Bar
  Product identity, current project, language switch, publish entry

Left Rail
  Project context: projects, generated files, versions

Center Conversation
  Main action area: prompt, agent plan, execution log, follow-up requests

Right Workspace
  Output area: preview first, code/diff/deploy as secondary tabs
```

### Top Bar

The top bar should stay compact and utility-focused.

- Product name: `Atoms Demo`
- Workspace label: `Web AI Coding Workspace`
- Current project name
- Language switch
- Publish button or publish status

The top bar should not explain the product in long marketing copy.

### Left Rail

The left rail provides context, not the primary workflow.

Initial content:

- Current project
- Generated pages/files
- Recent versions

Keep this rail narrow and scannable. It should help the user answer: "What project and generated files am I working with?"

### Center Conversation

The center column is the primary product surface.

It should contain:

- A large prompt composer for describing the desired app
- The latest user request
- Agent planning and execution messages
- Clear generation stages
- Follow-up suggestions after generation completes

The user should be able to understand what is happening even if the right preview is still loading.

### Right Workspace

The right side shows the generated artifact.

Default tab:

- Preview

Secondary tabs:

- Code
- Diff
- Deploy

The preview should be visible by default because the challenge explicitly asks for the generated application to be shown as a visual web experience. Code and diff are useful, but they should not compete with the preview on first glance.

## Interaction States

### Empty State

Before the first generation:

- Center shows a prompt composer and 2-3 example app requests.
- Right shows a neutral preview placeholder that says the generated app will appear there.
- Left shows one demo project or an empty project context.

### Generating State

After clicking generate:

- The prompt composer enters a running state.
- Center shows visible agent steps:
  - Understand request
  - Draft product structure
  - Generate UI and data model
  - Produce code files
  - Run preview check
- Right shows a preview skeleton or "building preview" state.
- The user should never wonder whether the click worked.

### Generated State

After generation finishes:

- Right preview switches to the generated app.
- Center shows a short build summary, generated files, and next actions.
- Left file list updates with generated pages/components.
- Code tab shows generated HTML/CSS/JS or equivalent files.

### Follow-Up State

When the user asks for changes:

- Center appends the request and shows a new agent plan.
- Right preview stays visible until the new result is ready.
- Diff tab becomes useful after the update completes.

## Information Priority

The page should prioritize information in this order:

1. What can the user ask the AI to build?
2. What is the AI doing now?
3. What did the AI generate visually?
4. What code or files were produced?
5. How can the user publish or continue editing?

## MVP Scope

The next implementation pass should focus on product clarity, not new backend complexity.

Included:

- Reframe the main page as an AI coding workspace.
- Convert the current layout into the three-zone workspace.
- Make the center conversation the main area.
- Keep generated preview visible by default on the right.
- Add clear empty, generating, generated, and follow-up states.
- Keep bilingual UI support.
- Reuse the existing generation API, project data, generated files, and progress simulation.

Not included:

- Real LLM integration.
- Streaming backend.
- Terminal execution.
- Full file editor.
- Multi-user collaboration.
- Authentication.
- New database tables.

## Backend and Database Impact

No database migration is required for this redesign.

The existing tables already support the needed MVP concepts:

- Project: workspace/project context
- GenerationRun: one AI build attempt
- AgentStep: visible agent process
- AppVersion: generated artifact and files
- PublishRecord: public preview/share state

The redesign is primarily a frontend information architecture change. Backend additions should be avoided unless an existing API response is missing data that already exists in the database.

## Component Impact

Likely frontend changes:

- `BuildRoom` becomes the main three-zone shell.
- `PromptComposer` moves into the center conversation area.
- `AgentPipeline` becomes part of the conversation timeline or a compact progress block.
- `ProjectSidebar` becomes the left rail.
- `PreviewFrame` becomes the default right workspace tab.
- `CodePanel` remains behind a secondary tab.
- New small components may be added for tabs, conversation messages, and generated file rows if needed.

## Success Criteria

The redesign is successful when a first-time reviewer can understand these points within a few seconds:

- This is an AI app/code generation workspace.
- The user starts by describing an app idea.
- Agents turn the request into generated files.
- The generated app appears visually in the right preview.
- The user can continue chatting to revise the generated app.

## Validation

- Existing unit tests pass.
- Production build passes.
- Browser smoke test confirms:
  - The first screen no longer looks like a CRM product.
  - The prompt area is the dominant interaction.
  - A generated app preview is visible after generation.
  - Code and diff are available as secondary views.
  - Chinese and English modes still work.

## Spec Self-Review

- No placeholder requirements remain.
- The generated business app is explicitly treated as an output artifact, not the main product.
- The redesign is scoped to frontend information architecture and does not require a database migration.
- The MVP avoids real LLM, streaming, terminal, and full IDE scope so implementation remains realistic for the challenge.
