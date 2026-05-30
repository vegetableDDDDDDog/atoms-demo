# Atoms Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前 Atoms 风格入口原型推进成 query 驱动的 AI 应用生成工作台，支持可见计划、生成文件、运行预览和持续修改。

**Architecture:** 保留当前 Next.js App Router 和 React client shell。按能力分阶段扩展：先稳定 session 与意图识别，再引入 artifact，再做 preview，最后接入后端、数据库和真实 AI。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Global CSS, future API routes, future database layer, future sandboxed iframe preview.

---

## Phase 1: 稳定当前入口体验

### Task 1: 明确 session 行为

**Files:**

- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/app/globals.css`

- [ ] 点击“新建对话”时清空输入框和附件。
- [ ] 空 session 不写入历史列表。
- [ ] 发送第一条消息后创建 session。
- [ ] session 标题来自第一条用户输入。
- [ ] 后续消息追加到当前 session。
- [ ] 刷新页面后可恢复本地 session。

### Task 2: 加强意图识别

**Files:**

- Modify: `src/features/query/analyzeUserQuery.ts`
- Modify: `src/features/query/analyzeUserQuery.test.ts`

- [ ] 覆盖咨询类表达：分析一下、应该怎么设计、先做哪些功能。
- [ ] 覆盖实现类表达：做一个、实现一个、生成一个、开发一个。
- [ ] 覆盖修改类表达：修改、修复、增加、删除。
- [ ] 对模糊 query 给出明确默认策略。
- [ ] 保持 analyzer 是纯函数，方便后续替换为 API。

### Task 3: 优化分析结果展示

**Files:**

- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/app/globals.css`

- [ ] 咨询类只展示问题理解、分析建议和下一步。
- [ ] 实现类展示需求规格、页面结构、数据结构、任务步骤和预期文件。
- [ ] 只有实现类显示构建状态。
- [ ] 首屏保持极简，不提前展示生成工作区。

## Phase 2: 引入 Artifact 模型

### Task 4: 定义生成结果类型

**Files:**

- Create: `src/features/artifacts/types.ts`
- Create: `src/features/artifacts/createArtifactPlan.ts`
- Create: `src/features/artifacts/createArtifactPlan.test.ts`

- [ ] 定义 `GeneratedFile`，包含 `path`、`language`、`content`。
- [ ] 定义 `GeneratedArtifact`，包含 `id`、`title`、`files`、`entryFile`、`createdAt`。
- [ ] 从实现类分析结果生成 artifact plan。
- [ ] 测试 artifact plan 来源于 query，而不是固定业务模板。

### Task 5: 增加文件和代码面板

**Files:**

- Create: `src/components/build-room/ArtifactPanel.tsx`
- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/app/globals.css`

- [ ] 实现类请求后展示生成文件列表。
- [ ] 支持选择文件。
- [ ] 展示选中文件内容。
- [ ] 咨询类 session 不展示文件面板。

## Phase 3: 实现可运行预览

### Task 6: 生成静态应用文件

**Files:**

- Create: `src/features/artifacts/generateStaticApp.ts`
- Create: `src/features/artifacts/generateStaticApp.test.ts`

- [ ] 基于 query 生成 `index.html`。
- [ ] 基于 query 生成 `styles.css`。
- [ ] 基于 query 生成 `app.js`。
- [ ] 页面标题、功能区和交互文案都来自用户输入。
- [ ] 避免硬编码业务模板。

### Task 7: 使用 iframe 渲染预览

**Files:**

- Create: `src/components/build-room/PreviewFrame.tsx`
- Modify: `src/components/build-room/ArtifactPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] 将生成的 HTML、CSS、JS 合成为 iframe `srcDoc`。
- [ ] iframe 使用 sandbox。
- [ ] 支持“预览 / 代码”切换。
- [ ] 生成内容为空或缺失入口文件时显示错误状态。

## Phase 4: 增加后端边界

### Task 8: 增加 run API

**Files:**

- Create: `src/app/api/runs/route.ts`
- Create: `src/features/runs/runAgent.ts`
- Create: `src/features/runs/runAgent.test.ts`
- Modify: `src/components/build-room/BuildRoom.tsx`

- [ ] 前端把 query 和附件 metadata 发送到 API。
- [ ] API 返回 intent、analysis、run steps 和 artifacts。
- [ ] 第一版 API 仍保持确定性生成，不直接接真实模型。
- [ ] UI 行为保持不变，只替换数据来源。

### Task 9: 设计持久化模型

**Files:**

- Create: `docs/database-design.md`

- [ ] 设计 users、projects、sessions、messages、attachments、runs、run_steps、artifacts。
- [ ] 标出 MVP 必需字段。
- [ ] 对比 SQLite、Postgres 和托管数据库。
- [ ] 只有 artifact 与 preview 流程稳定后再真正引入数据库。

## Phase 5: 接入真实 AI

### Task 10: 模型驱动的智能体编排

**Files:**

- Create: `src/features/agent/prompts.ts`
- Create: `src/features/agent/agentClient.ts`
- Modify: `src/features/runs/runAgent.ts`
- Add tests for structured output parsing.

- [ ] 定义咨询类结构化输出。
- [ ] 定义实现类计划结构化输出。
- [ ] 定义生成文件结构化输出。
- [ ] 保留本地 deterministic fallback。
- [ ] 模型失败时在 run step 中展示错误。

## Verification Checklist

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `http://localhost:3000/` loads successfully.
- [ ] 咨询类 prompt 不展示构建状态。
- [ ] 实现类 prompt 展示实施计划。
- [ ] 生成文件后可以查看代码。
- [ ] 生成预览后 iframe 内容非空。
- [ ] 刷新页面后 session 历史仍可用。
