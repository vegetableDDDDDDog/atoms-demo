# Atoms Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight full-stack Atoms-inspired app generation demo with persisted projects, simulated agent runs, generated app previews, version history, and publish links.

**Architecture:** Use a Next.js App Router monolith. React renders the Build Room UI, route handlers expose project/run/publish APIs, Prisma persists data to SQLite, and a deterministic generator service simulates the AI agent workflow while keeping a clean boundary for future real LLM integration.

**Tech Stack:** Next.js, React, TypeScript, Prisma, SQLite, Vitest, lucide-react, CSS Modules/global CSS.

---

## File Structure

- `package.json`: npm scripts and dependency declarations.
- `tsconfig.json`: TypeScript configuration for Next.js and Vitest.
- `next.config.ts`: Next.js configuration.
- `vitest.config.ts`: test runner configuration.
- `.env.example`: database URL example.
- `prisma/schema.prisma`: SQLite schema for users, projects, runs, agent steps, versions, and publishes.
- `src/lib/prisma.ts`: shared Prisma client.
- `src/lib/demo-user.ts`: deterministic demo user helper.
- `src/features/generator/types.ts`: generator interfaces and output types.
- `src/features/generator/classifyPrompt.ts`: keyword-based prompt classifier.
- `src/features/generator/templates.ts`: generated app HTML/CSS/JS templates.
- `src/features/generator/buildGeneratedApp.ts`: generator entry point.
- `src/features/generator/generator.test.ts`: unit tests for classification and generated files.
- `src/features/agents/types.ts`: agent step types.
- `src/features/agents/orchestrator.ts`: deterministic multi-agent step creation.
- `src/features/agents/orchestrator.test.ts`: unit tests for agent sequencing.
- `src/features/publish/slug.ts`: publish slug creation helper.
- `src/features/publish/slug.test.ts`: unit tests for slug generation.
- `src/features/projects/projectService.ts`: project list/detail persistence logic.
- `src/features/runs/generationService.ts`: create/remix/fix run orchestration.
- `src/features/publish/publishService.ts`: publish and resolve app versions.
- `src/app/api/projects/route.ts`: list and create projects.
- `src/app/api/projects/[id]/route.ts`: project detail API.
- `src/app/api/runs/route.ts`: create generation runs.
- `src/app/api/runs/[id]/route.ts`: run detail API.
- `src/app/api/runs/[id]/fix/route.ts`: fix-bug run API.
- `src/app/api/publish/route.ts`: publish API.
- `src/app/p/[slug]/page.tsx`: public published preview page.
- `src/app/layout.tsx`: app shell metadata.
- `src/app/page.tsx`: Build Room page.
- `src/app/globals.css`: visual system and layout styles.
- `src/components/build-room/*`: focused React components for the Build Room UI.
- `README.md`: setup, run, deploy, and demo notes.

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts`
- Create: `vitest.config.ts`
- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Install runtime and dev dependencies**

Run:

```powershell
npm install next react react-dom @prisma/client lucide-react
npm install -D typescript @types/node @types/react @types/react-dom prisma vitest jsdom
```

Expected: npm creates `package-lock.json` and installs packages under `node_modules`.

- [ ] **Step 2: Create project scripts**

Create `package.json` with:

```json
{
  "name": "atoms-demo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "lucide-react": "^0.468.0",
    "next": "^14.2.16",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^25.0.0",
    "prisma": "^5.22.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create TypeScript and Next config**

Create `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true
};

export default nextConfig;
```

Create `next-env.d.ts` with:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 4: Create Vitest config**

Create `vitest.config.ts` with:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
```

- [ ] **Step 5: Create environment example**

Create `.env.example` with:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 6: Update README setup section**

Replace `README.md` with:

```md
# Atoms Demo

A lightweight full-stack Atoms-inspired app generation demo. Users describe an app idea, watch a simulated AI agent team build it, preview the generated app, save versions, and publish a shareable preview.

## Stack

- Next.js App Router
- TypeScript
- Prisma + SQLite
- Vitest
- CSS Modules/global CSS

## Local Setup

```bash
npm install
copy .env.example .env
npm run db:migrate -- --name init
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm test
```
```

- [ ] **Step 7: Verify scaffold**

Run:

```powershell
npm test
```

Expected: Vitest starts and reports no tests found or no failing tests before test files exist.

- [ ] **Step 8: Commit scaffold**

Run:

```powershell
git add package.json package-lock.json tsconfig.json next.config.ts next-env.d.ts vitest.config.ts .env.example README.md
git commit -m "chore: scaffold next app"
```

---

## Task 2: Add Prisma Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `src/lib/demo-user.ts`

- [ ] **Step 1: Create Prisma schema**

Create `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  createdAt DateTime  @default(now())
  projects  Project[]
}

model Project {
  id        String          @id @default(cuid())
  userId    String
  name      String
  prompt    String
  mode      String
  status    String
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  runs      GenerationRun[]
  versions  AppVersion[]
  publishes PublishRecord[]
}

model GenerationRun {
  id                String       @id @default(cuid())
  projectId         String
  inputPrompt       String
  mode              String
  status            String
  selectedVersionId String?
  createdAt         DateTime     @default(now())
  completedAt       DateTime?
  project           Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  steps             AgentStep[]
  versions          AppVersion[]
}

model AgentStep {
  id        String        @id @default(cuid())
  runId     String
  agent     String
  title     String
  status    String
  content   String
  order     Int
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  run       GenerationRun @relation(fields: [runId], references: [id], onDelete: Cascade)
}

model AppVersion {
  id            String          @id @default(cuid())
  projectId     String
  runId         String
  versionNumber Int
  title         String
  description   String
  appType       String
  html          String
  css           String
  js            String
  createdAt     DateTime        @default(now())
  project       Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  run           GenerationRun   @relation(fields: [runId], references: [id], onDelete: Cascade)
  publishes     PublishRecord[]

  @@unique([projectId, versionNumber])
}

model PublishRecord {
  id          String     @id @default(cuid())
  projectId   String
  versionId   String
  slug        String     @unique
  isActive    Boolean    @default(true)
  publishedAt DateTime   @default(now())
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  version     AppVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Create Prisma client helper**

Create `src/lib/prisma.ts` with:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Create demo user helper**

Create `src/lib/demo-user.ts` with:

```ts
import { prisma } from "@/lib/prisma";

export const DEMO_USER_EMAIL = "demo@atoms-mini.local";

export async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo Builder"
    }
  });
}
```

- [ ] **Step 4: Generate and migrate database**

Run:

```powershell
copy .env.example .env
npm run db:generate
npm run db:migrate -- --name init
```

Expected: Prisma creates `prisma/dev.db`, `prisma/migrations/*`, and generated client files.

- [ ] **Step 5: Commit database setup**

Run:

```powershell
git add prisma/schema.prisma prisma/migrations src/lib/prisma.ts src/lib/demo-user.ts .env.example README.md
git commit -m "feat: add prisma persistence model"
```

---

## Task 3: Build Deterministic App Generator

**Files:**
- Create: `src/features/generator/types.ts`
- Create: `src/features/generator/classifyPrompt.ts`
- Create: `src/features/generator/templates.ts`
- Create: `src/features/generator/buildGeneratedApp.ts`
- Create: `src/features/generator/generator.test.ts`

- [ ] **Step 1: Write failing generator tests**

Create `src/features/generator/generator.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { buildGeneratedApp } from "./buildGeneratedApp";
import { classifyPrompt } from "./classifyPrompt";

describe("classifyPrompt", () => {
  it("classifies booking and customer prompts as crm", () => {
    expect(classifyPrompt("Build a booking CRM for customers")).toBe("crm");
  });

  it("classifies portfolio and investment prompts as portfolio", () => {
    expect(classifyPrompt("Track my investment portfolio and watchlist")).toBe("portfolio");
  });

  it("classifies todo and operations prompts as operations", () => {
    expect(classifyPrompt("Make an internal todo operations board")).toBe("operations");
  });
});

describe("buildGeneratedApp", () => {
  it("returns complete iframe-ready files", () => {
    const app = buildGeneratedApp({
      prompt: "Build a booking CRM for customers",
      mode: "team"
    });

    expect(app.title).toContain("CRM");
    expect(app.html).toContain("<main");
    expect(app.css).toContain(":root");
    expect(app.js).toContain("addEventListener");
    expect(app.appType).toBe("crm");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/features/generator/generator.test.ts
```

Expected: FAIL because generator modules do not exist.

- [ ] **Step 3: Create generator types**

Create `src/features/generator/types.ts` with:

```ts
export type BuildMode = "team" | "engineer" | "race";

export type AppType = "crm" | "portfolio" | "operations" | "commerce";

export type GenerateAppInput = {
  prompt: string;
  mode: BuildMode;
  previousVersionId?: string;
  fixRequested?: boolean;
};

export type GeneratedAppFiles = {
  html: string;
  css: string;
  js: string;
  title: string;
  description: string;
  appType: AppType;
};
```

- [ ] **Step 4: Create prompt classifier**

Create `src/features/generator/classifyPrompt.ts` with:

```ts
import type { AppType } from "./types";

const rules: Array<{ type: AppType; words: string[] }> = [
  { type: "crm", words: ["crm", "customer", "client", "booking", "appointment", "sales"] },
  { type: "portfolio", words: ["portfolio", "investment", "stock", "watchlist", "asset", "fund"] },
  { type: "operations", words: ["todo", "task", "internal", "operation", "ops", "kanban"] },
  { type: "commerce", words: ["shop", "store", "commerce", "product", "checkout", "order"] }
];

export function classifyPrompt(prompt: string): AppType {
  const normalized = prompt.toLowerCase();
  return rules.find((rule) => rule.words.some((word) => normalized.includes(word)))?.type ?? "operations";
}
```

- [ ] **Step 5: Create generated app templates**

Create `src/features/generator/templates.ts` with:

```ts
import type { AppType, GeneratedAppFiles } from "./types";

type TemplateInput = {
  prompt: string;
  appType: AppType;
  fixRequested?: boolean;
};

const baseCss = `
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172033; background: #f5f7fb; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: #f5f7fb; }
main { padding: 24px; max-width: 1120px; margin: 0 auto; }
.hero { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 18px; }
h1 { font-size: 28px; margin: 0 0 6px; letter-spacing: 0; }
p { margin: 0; color: #647084; line-height: 1.5; }
button { border: 0; border-radius: 8px; background: #111827; color: #fff; padding: 10px 13px; font-weight: 700; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.card { border: 1px solid #dde4ef; border-radius: 10px; background: #fff; padding: 14px; box-shadow: 0 10px 24px rgba(15, 23, 42, .06); }
.card strong { display: block; font-size: 22px; margin-bottom: 5px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
input, select { border: 1px solid #d3dbe8; border-radius: 8px; padding: 10px; min-width: 0; }
.list { display: grid; gap: 8px; }
.row { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0e6ef; border-radius: 9px; background: #fff; padding: 10px 12px; }
.tag { border-radius: 999px; background: #eaf3ff; color: #1158c7; padding: 4px 8px; font-size: 12px; font-weight: 700; }
@media (max-width: 760px) { main { padding: 16px; } .hero { align-items: flex-start; flex-direction: column; } .grid { grid-template-columns: 1fr; } .row { align-items: flex-start; flex-direction: column; gap: 8px; } }
`;

const script = `
document.querySelectorAll("[data-add-row]").forEach((button) => {
  button.addEventListener("click", () => {
    const list = document.querySelector(".list");
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = "<span>New generated item</span><span class='tag'>New</span>";
    list?.prepend(row);
  });
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = button.textContent === "Active" ? "Paused" : "Active";
  });
});
`;

const contentByType: Record<AppType, { title: string; description: string; metrics: string[]; rows: string[] }> = {
  crm: {
    title: "Booking CRM",
    description: "Manage customer bookings, revenue, and follow-ups from one generated workspace.",
    metrics: ["12 bookings", "$8.4k revenue", "4 follow-ups"],
    rows: ["Ada Chen - Product consultation", "Northwind Studio - Renewal call", "Kai Liu - Onboarding"]
  },
  portfolio: {
    title: "Portfolio Monitor",
    description: "Track holdings, watchlist movement, and allocation signals in a compact dashboard.",
    metrics: ["$42.8k value", "+3.2% today", "8 assets"],
    rows: ["NVDA - Watch momentum", "BTC - Rebalance alert", "Cash - Reserve target"]
  },
  operations: {
    title: "Operations Board",
    description: "Prioritize work, assign owners, and keep internal execution visible.",
    metrics: ["18 tasks", "6 in progress", "3 blocked"],
    rows: ["Prepare launch checklist", "Review support backlog", "Sync vendor contract"]
  },
  commerce: {
    title: "Commerce Console",
    description: "Manage products, orders, and merchandising actions for a small storefront.",
    metrics: ["32 orders", "$12.1k sales", "9 products"],
    rows: ["Coffee kit - Restock", "Gift box - Feature item", "Ceramic cup - Price test"]
  }
};

export function createTemplate({ prompt, appType, fixRequested }: TemplateInput): GeneratedAppFiles {
  const content = contentByType[appType];
  const qualityNote = fixRequested ? "QA repair pass applied with clearer empty states and stronger mobile spacing." : "Generated from prompt.";

  return {
    title: content.title,
    description: content.description,
    appType,
    css: baseCss,
    js: script,
    html: `
<main>
  <section class="hero">
    <div>
      <h1>${content.title}</h1>
      <p>${content.description}</p>
      <p>${qualityNote}</p>
    </div>
    <button data-add-row>Add item</button>
  </section>
  <section class="grid">
    ${content.metrics.map((metric) => `<article class="card"><strong>${metric}</strong><p>${prompt}</p></article>`).join("")}
  </section>
  <section class="toolbar">
    <input aria-label="Search generated data">
    <select aria-label="Status"><option>All statuses</option><option>Active</option><option>Paused</option></select>
  </section>
  <section class="list">
    ${content.rows.map((row) => `<div class="row"><span>${row}</span><button data-toggle>Active</button></div>`).join("")}
  </section>
</main>`
  };
}
```

- [ ] **Step 6: Create generator entry point**

Create `src/features/generator/buildGeneratedApp.ts` with:

```ts
import { classifyPrompt } from "./classifyPrompt";
import { createTemplate } from "./templates";
import type { GenerateAppInput, GeneratedAppFiles } from "./types";

export function buildGeneratedApp(input: GenerateAppInput): GeneratedAppFiles {
  const appType = classifyPrompt(input.prompt);
  return createTemplate({
    prompt: input.prompt,
    appType,
    fixRequested: input.fixRequested
  });
}
```

- [ ] **Step 7: Verify generator tests pass**

Run:

```powershell
npm test -- src/features/generator/generator.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit generator**

Run:

```powershell
git add src/features/generator
git commit -m "feat: add deterministic app generator"
```

---

## Task 4: Add Agent Orchestrator and Publish Helpers

**Files:**
- Create: `src/features/agents/types.ts`
- Create: `src/features/agents/orchestrator.ts`
- Create: `src/features/agents/orchestrator.test.ts`
- Create: `src/features/publish/slug.ts`
- Create: `src/features/publish/slug.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/features/agents/orchestrator.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { createAgentPlan } from "./orchestrator";

describe("createAgentPlan", () => {
  it("returns the expected ordered agent team", () => {
    const steps = createAgentPlan("Build a booking CRM");
    expect(steps.map((step) => step.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(steps.every((step) => step.status === "done")).toBe(true);
    expect(steps[0].content).toContain("booking CRM");
  });
});
```

Create `src/features/publish/slug.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { createBaseSlug } from "./slug";

describe("createBaseSlug", () => {
  it("creates lowercase slugs from titles", () => {
    expect(createBaseSlug("Booking CRM")).toBe("booking-crm");
  });

  it("falls back when the title has no letters or numbers", () => {
    expect(createBaseSlug("!!!")).toBe("atoms-app");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm test -- src/features/agents/orchestrator.test.ts src/features/publish/slug.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Create agent types**

Create `src/features/agents/types.ts` with:

```ts
export type AgentName = "Mike" | "Emma" | "Bob" | "Alex" | "QA";

export type AgentPlanStep = {
  agent: AgentName;
  title: string;
  status: "done";
  content: string;
  order: number;
};
```

- [ ] **Step 4: Create orchestrator**

Create `src/features/agents/orchestrator.ts` with:

```ts
import type { AgentPlanStep } from "./types";

export function createAgentPlan(prompt: string, fixRequested = false): AgentPlanStep[] {
  const repairCopy = fixRequested ? " This run focuses on fixing UX gaps from the selected version." : "";

  return [
    {
      agent: "Mike",
      title: "Coordinate build",
      status: "done",
      content: `I scoped the build request: ${prompt}.${repairCopy}`,
      order: 1
    },
    {
      agent: "Emma",
      title: "Extract requirements",
      status: "done",
      content: "Core requirements: interactive preview, useful data controls, saved version, and publishable output.",
      order: 2
    },
    {
      agent: "Bob",
      title: "Design structure",
      status: "done",
      content: "Data model includes projects, generation runs, ordered agent steps, app versions, and publish records.",
      order: 3
    },
    {
      agent: "Alex",
      title: "Generate app files",
      status: "done",
      content: "Generated iframe-ready HTML, CSS, and JavaScript with local interactive state.",
      order: 4
    },
    {
      agent: "QA",
      title: "Verify generated app",
      status: "done",
      content: "Preview contains controls, responsive layout, and non-empty generated files.",
      order: 5
    }
  ];
}
```

- [ ] **Step 5: Create slug helper**

Create `src/features/publish/slug.ts` with:

```ts
export function createBaseSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "atoms-app";
}
```

- [ ] **Step 6: Verify tests pass**

Run:

```powershell
npm test -- src/features/agents/orchestrator.test.ts src/features/publish/slug.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit agent helpers**

Run:

```powershell
git add src/features/agents src/features/publish
git commit -m "feat: add agent orchestration helpers"
```

---

## Task 5: Add Services and API Routes

**Files:**
- Create: `src/features/projects/projectService.ts`
- Create: `src/features/runs/generationService.ts`
- Create: `src/features/publish/publishService.ts`
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[id]/route.ts`
- Create: `src/app/api/runs/route.ts`
- Create: `src/app/api/runs/[id]/route.ts`
- Create: `src/app/api/runs/[id]/fix/route.ts`
- Create: `src/app/api/publish/route.ts`

- [ ] **Step 1: Create project service**

Create `src/features/projects/projectService.ts` with:

```ts
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";

export async function listProjects() {
  const user = await getDemoUser();
  return prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      publishes: { where: { isActive: true }, take: 1 }
    }
  });
}

export async function getProjectDetail(id: string) {
  const user = await getDemoUser();
  return prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
      runs: {
        orderBy: { createdAt: "desc" },
        include: { steps: { orderBy: { order: "asc" } } }
      },
      publishes: { where: { isActive: true } }
    }
  });
}
```

- [ ] **Step 2: Create generation service**

Create `src/features/runs/generationService.ts` with:

```ts
import { createAgentPlan } from "@/features/agents/orchestrator";
import { buildGeneratedApp } from "@/features/generator/buildGeneratedApp";
import type { BuildMode } from "@/features/generator/types";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";

type CreateRunInput = {
  prompt: string;
  projectId?: string;
  mode?: BuildMode;
  previousVersionId?: string;
  fixRequested?: boolean;
};

function projectNameFromPrompt(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned || "Untitled Atoms App";
}

export async function createGenerationRun(input: CreateRunInput) {
  const user = await getDemoUser();
  const mode = input.mode ?? "team";
  const prompt = input.prompt.trim();

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const project =
    input.projectId
      ? await prisma.project.update({
          where: { id: input.projectId },
          data: { prompt, mode, status: "generating" }
        })
      : await prisma.project.create({
          data: {
            userId: user.id,
            name: projectNameFromPrompt(prompt),
            prompt,
            mode,
            status: "generating"
          }
        });

  const run = await prisma.generationRun.create({
    data: {
      projectId: project.id,
      inputPrompt: prompt,
      mode,
      status: "running"
    }
  });

  const agentSteps = createAgentPlan(prompt, input.fixRequested);
  await prisma.agentStep.createMany({
    data: agentSteps.map((step) => ({
      runId: run.id,
      agent: step.agent,
      title: step.title,
      status: step.status,
      content: step.content,
      order: step.order
    }))
  });

  const generated = buildGeneratedApp({
    prompt,
    mode,
    previousVersionId: input.previousVersionId,
    fixRequested: input.fixRequested
  });

  const latestVersion = await prisma.appVersion.findFirst({
    where: { projectId: project.id },
    orderBy: { versionNumber: "desc" }
  });

  const version = await prisma.appVersion.create({
    data: {
      projectId: project.id,
      runId: run.id,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      title: generated.title,
      description: generated.description,
      appType: generated.appType,
      html: generated.html,
      css: generated.css,
      js: generated.js
    }
  });

  await prisma.generationRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      selectedVersionId: version.id,
      completedAt: new Date()
    }
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { status: "ready" }
  });

  return getRunDetail(run.id);
}

export async function getRunDetail(id: string) {
  return prisma.generationRun.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      versions: { orderBy: { versionNumber: "desc" } },
      project: true
    }
  });
}
```

- [ ] **Step 3: Create publish service**

Create `src/features/publish/publishService.ts` with:

```ts
import { prisma } from "@/lib/prisma";
import { createBaseSlug } from "./slug";

export async function publishVersion(versionId: string) {
  const version = await prisma.appVersion.findUnique({
    where: { id: versionId },
    include: { project: true }
  });

  if (!version) {
    throw new Error("Version not found");
  }

  const baseSlug = createBaseSlug(version.title);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.publishRecord.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  await prisma.publishRecord.updateMany({
    where: { projectId: version.projectId },
    data: { isActive: false }
  });

  return prisma.publishRecord.create({
    data: {
      projectId: version.projectId,
      versionId: version.id,
      slug,
      isActive: true
    }
  });
}

export async function getPublishedVersion(slug: string) {
  return prisma.publishRecord.findUnique({
    where: { slug },
    include: { version: true, project: true }
  });
}
```

- [ ] **Step 4: Create API route handlers**

Create `src/app/api/projects/route.ts` with:

```ts
import { listProjects } from "@/features/projects/projectService";
import { createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "team" | "engineer" | "race" };
  const run = await createGenerationRun({ prompt: body.prompt ?? "", mode: body.mode ?? "team" });
  return NextResponse.json({ run }, { status: 201 });
}
```

Create `src/app/api/projects/[id]/route.ts` with:

```ts
import { getProjectDetail } from "@/features/projects/projectService";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await getProjectDetail(params.id);
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}
```

Create `src/app/api/runs/route.ts` with:

```ts
import { createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt?: string;
    projectId?: string;
    previousVersionId?: string;
    mode?: "team" | "engineer" | "race";
  };

  const run = await createGenerationRun({
    prompt: body.prompt ?? "",
    projectId: body.projectId,
    previousVersionId: body.previousVersionId,
    mode: body.mode ?? "team"
  });

  return NextResponse.json({ run }, { status: 201 });
}
```

Create `src/app/api/runs/[id]/route.ts` with:

```ts
import { getRunDetail } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const run = await getRunDetail(params.id);
  if (!run) {
    return NextResponse.json({ message: "Run not found" }, { status: 404 });
  }
  return NextResponse.json({ run });
}
```

Create `src/app/api/runs/[id]/fix/route.ts` with:

```ts
import { getRunDetail, createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const sourceRun = await getRunDetail(params.id);
  const sourceVersion = sourceRun?.versions[0];

  if (!sourceRun || !sourceVersion) {
    return NextResponse.json({ message: "Run or version not found" }, { status: 404 });
  }

  const run = await createGenerationRun({
    prompt: sourceRun.inputPrompt,
    projectId: sourceRun.projectId,
    previousVersionId: sourceVersion.id,
    mode: "team",
    fixRequested: true
  });

  return NextResponse.json({ run }, { status: 201 });
}
```

Create `src/app/api/publish/route.ts` with:

```ts
import { publishVersion } from "@/features/publish/publishService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { versionId?: string };
  if (!body.versionId) {
    return NextResponse.json({ message: "versionId is required" }, { status: 400 });
  }

  const publish = await publishVersion(body.versionId);
  return NextResponse.json({
    publish,
    url: `/p/${publish.slug}`
  });
}
```

- [ ] **Step 5: Verify service code compiles through build**

Run:

```powershell
npm run build
```

Expected: Next.js compiles route handlers and Prisma client generation succeeds.

- [ ] **Step 6: Commit services and API**

Run:

```powershell
git add src/features/projects src/features/runs src/features/publish src/app/api
git commit -m "feat: add generation and publish APIs"
```

---

## Task 6: Build Main UI

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/build-room/BuildRoom.tsx`
- Create: `src/components/build-room/ProjectSidebar.tsx`
- Create: `src/components/build-room/PromptComposer.tsx`
- Create: `src/components/build-room/AgentPipeline.tsx`
- Create: `src/components/build-room/PreviewFrame.tsx`
- Create: `src/components/build-room/CodePanel.tsx`

- [ ] **Step 1: Create app shell**

Create `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atoms Demo",
  description: "AI agent app generation demo"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx` with:

```tsx
import { BuildRoom } from "@/components/build-room/BuildRoom";

export default function HomePage() {
  return <BuildRoom />;
}
```

- [ ] **Step 2: Create global styles**

Create `src/app/globals.css` with:

```css
:root {
  color-scheme: light;
  --bg: #eef2f7;
  --panel: #ffffff;
  --panel-soft: #f7f9fc;
  --ink: #121826;
  --muted: #67748a;
  --line: #dce3ee;
  --accent: #245c3d;
  --accent-ink: #ffffff;
}

* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
button, input, textarea, select {
  font: inherit;
}
button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 340px;
}
.panel {
  background: var(--panel);
  border-right: 1px solid var(--line);
}
.side-panel {
  padding: 16px;
}
.workspace {
  min-width: 0;
  padding: 18px;
}
.right-panel {
  border-left: 1px solid var(--line);
  border-right: 0;
}
.section-title {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .08em;
}
.button-primary {
  background: var(--accent);
  color: var(--accent-ink);
  padding: 10px 12px;
}
.button-ghost {
  background: #eef3f8;
  color: var(--ink);
  padding: 9px 11px;
}
.card {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  box-shadow: 0 14px 36px rgba(15, 23, 42, .08);
}
.preview-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.preview-tabs button[data-active="true"] {
  background: #111827;
  color: #fff;
}
@media (max-width: 1080px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .panel, .right-panel {
    border: 0;
  }
}
```

- [ ] **Step 3: Create BuildRoom client component**

Create `src/components/build-room/BuildRoom.tsx` with:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentPipeline } from "./AgentPipeline";
import { CodePanel } from "./CodePanel";
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

export function BuildRoom() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [view, setView] = useState<"desktop" | "mobile" | "code">("desktop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  const activeVersion = activeRun?.versions[0] ?? null;

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    const data = await response.json();
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    refreshProjects();
  }, []);

  async function startBuild(prompt: string) {
    setIsGenerating(true);
    setPublishUrl(null);
    const response = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode: "team" })
    });
    const data = await response.json();
    setActiveRun(data.run);
    await refreshProjects();
    setIsGenerating(false);
  }

  async function fixCurrentRun() {
    if (!activeRun) return;
    setIsGenerating(true);
    const response = await fetch(`/api/runs/${activeRun.id}/fix`, { method: "POST" });
    const data = await response.json();
    setActiveRun(data.run);
    await refreshProjects();
    setIsGenerating(false);
  }

  async function publishCurrentVersion() {
    if (!activeVersion) return;
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: activeVersion.id })
    });
    const data = await response.json();
    setPublishUrl(data.url);
    await refreshProjects();
  }

  const generatedDocument = useMemo(() => {
    if (!activeVersion) return "";
    return `<!doctype html><html><head><style>${activeVersion.css}</style></head><body>${activeVersion.html}<script>${activeVersion.js}</script></body></html>`;
  }, [activeVersion]);

  return (
    <main className="app-shell">
      <ProjectSidebar projects={projects} />
      <section className="workspace">
        <PromptComposer onSubmit={startBuild} disabled={isGenerating} />
        <div className="preview-tabs">
          <button className="button-ghost" data-active={view === "desktop"} onClick={() => setView("desktop")}>Desktop</button>
          <button className="button-ghost" data-active={view === "mobile"} onClick={() => setView("mobile")}>Mobile</button>
          <button className="button-ghost" data-active={view === "code"} onClick={() => setView("code")}>Code</button>
        </div>
        {view === "code" && activeVersion ? (
          <CodePanel version={activeVersion} />
        ) : (
          <PreviewFrame document={generatedDocument} mode={view} empty={!activeVersion} />
        )}
      </section>
      <aside className="panel right-panel side-panel">
        <AgentPipeline steps={activeRun?.steps ?? []} isGenerating={isGenerating} />
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="button-ghost" onClick={fixCurrentRun} disabled={!activeRun || isGenerating}>Fix Bug</button>
          <button className="button-primary" onClick={publishCurrentVersion} disabled={!activeVersion}>Publish</button>
        </div>
        {publishUrl ? <p style={{ color: "#245c3d", marginTop: 12 }}>Published at {publishUrl}</p> : null}
      </aside>
    </main>
  );
}
```

- [ ] **Step 4: Create focused UI components**

Create `src/components/build-room/PromptComposer.tsx` with:

```tsx
"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function PromptComposer({ onSubmit, disabled }: { onSubmit: (prompt: string) => void; disabled: boolean }) {
  const [prompt, setPrompt] = useState("Build a booking CRM for customers with revenue tracking");

  return (
    <section className="card" style={{ padding: 16, marginBottom: 14 }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 24 }}>Agent Build Room</h1>
      <p style={{ color: "#67748a", margin: "0 0 12px" }}>Describe an app idea and watch the agent team generate a working preview.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          style={{ resize: "vertical", border: "1px solid #dce3ee", borderRadius: 10, padding: 12 }}
        />
        <button className="button-primary" onClick={() => onSubmit(prompt)} disabled={disabled}>
          <Send size={16} /> Run
        </button>
      </div>
    </section>
  );
}
```

Create `src/components/build-room/ProjectSidebar.tsx` with:

```tsx
export function ProjectSidebar({ projects }: { projects: any[] }) {
  return (
    <aside className="panel side-panel">
      <h2 style={{ margin: "0 0 18px", fontSize: 18 }}>Atoms Mini</h2>
      <p className="section-title">Projects</p>
      <div style={{ display: "grid", gap: 8 }}>
        {projects.length === 0 ? <p style={{ color: "#67748a" }}>No builds yet.</p> : null}
        {projects.map((project) => (
          <article key={project.id} className="card" style={{ padding: 12 }}>
            <strong>{project.name}</strong>
            <p style={{ color: "#67748a", margin: "6px 0 0" }}>{project.status}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
```

Create `src/components/build-room/AgentPipeline.tsx` with:

```tsx
type Step = {
  id: string;
  agent: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

export function AgentPipeline({ steps, isGenerating }: { steps: Step[]; isGenerating: boolean }) {
  return (
    <section>
      <p className="section-title">Agent Pipeline</p>
      <div style={{ display: "grid", gap: 10 }}>
        {isGenerating ? <div className="card" style={{ padding: 12 }}>Agents are building...</div> : null}
        {steps.length === 0 ? <p style={{ color: "#67748a" }}>Run a build to see Mike, Emma, Bob, Alex, and QA collaborate.</p> : null}
        {steps.map((step) => (
          <article key={step.id} className="card" style={{ padding: 12 }}>
            <strong>{step.agent}: {step.title}</strong>
            <p style={{ color: "#67748a", margin: "6px 0 0" }}>{step.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

Create `src/components/build-room/PreviewFrame.tsx` with:

```tsx
export function PreviewFrame({ document, mode, empty }: { document: string; mode: "desktop" | "mobile" | "code"; empty: boolean }) {
  const width = mode === "mobile" ? 390 : "100%";

  if (empty) {
    return (
      <section className="card" style={{ minHeight: 520, display: "grid", placeItems: "center", color: "#67748a" }}>
        Generated app preview will appear here.
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: 12, minHeight: 560, display: "flex", justifyContent: "center" }}>
      <iframe
        title="Generated app preview"
        sandbox="allow-scripts"
        srcDoc={document}
        style={{ width, height: 520, border: "1px solid #dce3ee", borderRadius: 10, background: "#fff" }}
      />
    </section>
  );
}
```

Create `src/components/build-room/CodePanel.tsx` with:

```tsx
type Version = {
  html: string;
  css: string;
  js: string;
};

export function CodePanel({ version }: { version: Version }) {
  return (
    <section className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
      {(["html", "css", "js"] as const).map((key) => (
        <article key={key}>
          <p className="section-title">{key}</p>
          <pre style={{ overflow: "auto", background: "#0b1020", color: "#d6e4ff", padding: 12, borderRadius: 10, maxHeight: 220 }}>
            <code>{version[key]}</code>
          </pre>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 5: Build UI**

Run:

```powershell
npm run build
```

Expected: Next.js build succeeds.

- [ ] **Step 6: Commit UI**

Run:

```powershell
git add src/app src/components
git commit -m "feat: build agent room interface"
```

---

## Task 7: Add Published Preview Page and Documentation

**Files:**
- Create: `src/app/p/[slug]/page.tsx`
- Modify: `README.md`

- [ ] **Step 1: Create public preview page**

Create `src/app/p/[slug]/page.tsx` with:

```tsx
import { getPublishedVersion } from "@/features/publish/publishService";
import { notFound } from "next/navigation";

export default async function PublishedPage({ params }: { params: { slug: string } }) {
  const publish = await getPublishedVersion(params.slug);

  if (!publish || !publish.isActive) {
    notFound();
  }

  const version = publish.version;
  const document = `<!doctype html><html><head><style>${version.css}</style></head><body>${version.html}<script>${version.js}</script></body></html>`;

  return (
    <main style={{ minHeight: "100vh", background: "#eef2f7", padding: 16 }}>
      <iframe
        title={version.title}
        sandbox="allow-scripts"
        srcDoc={document}
        style={{ width: "100%", height: "calc(100vh - 32px)", border: "1px solid #dce3ee", borderRadius: 12, background: "#fff" }}
      />
    </main>
  );
}
```

- [ ] **Step 2: Expand README**

Append this to `README.md`:

```md
## Demo Flow

1. Enter an app idea in the Build Room.
2. Run the simulated agent build.
3. Inspect the generated preview, mobile view, and code panel.
4. Use Fix Bug to create an improved version.
5. Publish the latest version and open the generated `/p/:slug` URL.

## Architecture Notes

The MVP uses a deterministic local generator instead of a real LLM call. The generator is isolated behind `src/features/generator/buildGeneratedApp.ts`, so a real model adapter can replace it without changing the UI or database schema.

SQLite is used for local persistence. For Vercel-style serverless deployment with durable persistence, switch Prisma to a hosted Postgres provider such as Supabase or Neon.
```

- [ ] **Step 3: Build and test**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass and Next.js build succeeds.

- [ ] **Step 4: Commit publish page and docs**

Run:

```powershell
git add src/app/p README.md
git commit -m "feat: add published preview page"
```

---

## Task 8: Manual Verification and Final Commit

**Files:**
- Modify only files required by verification fixes.

- [ ] **Step 1: Start development server**

Run:

```powershell
npm run dev
```

Expected: Next.js starts on `http://localhost:3000` or reports the next available port.

- [ ] **Step 2: Verify browser flow**

Open the app and verify:

```text
1. The Build Room loads without console errors.
2. Running "Build a booking CRM for customers with revenue tracking" creates a project.
3. Agent steps appear for Mike, Emma, Bob, Alex, and QA.
4. Desktop preview renders an interactive generated app.
5. Mobile preview narrows the iframe.
6. Code view shows HTML, CSS, and JavaScript.
7. Fix Bug creates a new version.
8. Publish returns a `/p/:slug` URL.
9. Opening `/p/:slug` renders the generated app.
```

- [ ] **Step 3: Run final checks**

Run:

```powershell
npm test
npm run build
git status --short
```

Expected:

```text
Tests pass.
Build succeeds.
Git status shows no uncommitted changes after final commit.
```

- [ ] **Step 4: Push changes**

Run:

```powershell
git push
```

Expected: `main` is pushed to `origin/main`.

---

## Self-Review

- Spec coverage: The plan covers the Build Room UI, simulated agent workflow, generated preview, desktop/mobile/code views, version history, Fix Bug, publish links, SQLite persistence, tests, and README documentation.
- Placeholder scan: The plan contains concrete file paths, commands, and code blocks for each implementation task.
- Type consistency: `BuildMode`, `GeneratedAppFiles`, agent step fields, project/run/version data shapes, and API payload names are consistent across generator, services, routes, and UI.
