# Atoms Demo Core Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 跑通 Atoms Demo 的核心闭环：用户输入 query，系统分析意图，生成实施计划，生成可运行页面，展示预览/代码/日志，并支持失败修复与本地持久化。

**Architecture:** 使用 Next.js + React 前端原型。所有能力先在本地确定性实现。核心原则是 query 驱动生成结果，不按固定业务模板穷举。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Global CSS, localStorage, sandboxed iframe preview.

---

## 1. 完善首页交互

**目标：** 首页像 Atoms/Codex 一样成为创作入口，session 行为清楚、可继续、不会产生空历史。

**Files:**

- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/app/globals.css`
- Create: `src/features/session/sessionStorage.ts`

- [x] 新建对话：点击后进入空白工作区。
- [x] 空 session 不保存：没有发送内容时，不向左侧历史添加记录。
- [x] 发送第一条消息后生成 session 标题：标题来自第一条 query。
- [x] 左侧可切换历史 session：切换后恢复对应消息、附件、分析和生成结果。
- [x] Enter 发送，Shift + Enter 换行。
- [x] 上传附件后展示附件名。
- [x] 刷新页面后通过 localStorage 恢复 session。

## 2. 完善意图识别

**目标：** 先判断用户是来咨询，还是要系统真正实现，避免咨询类请求误进入生成状态。

**Files:**

- Modify: `src/features/query/analyzeUserQuery.ts`
- Modify: `src/features/query/analyzeUserQuery.test.ts`

- [x] 区分咨询类、实现类。
- [x] 咨询类：只输出分析和建议。
- [x] 实现类：输出需求理解和实施计划。
- [x] 附件名作为上下文进入分析结果。
- [x] 增加“修改/增加/删除/修复”这类迭代意图的识别。
- [x] 增加模糊 query 的默认策略：默认先分析，再引导用户确认是否实现。
- [x] 测试覆盖咨询、实现、附件、迭代、模糊 query。

## 3. 实现“实施计划”展示

**目标：** 用户发送实现类需求后，能看到系统如何从 query 推导出可执行计划，而不是只显示一句“已生成”。

**Files:**

- Modify: `src/features/query/analyzeUserQuery.ts`
- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/features/query/analyzeUserQuery.test.ts`

- [x] 展示需求理解。
- [x] 展示功能拆解。
- [x] 展示页面结构。
- [x] 展示数据结构。
- [x] 展示任务步骤。
- [x] 展示预期生成文件。
- [x] 所有内容都从 query 派生，不使用固定业务模板。

## 4. 实现真正的生成结果区域

**目标：** 实现类需求发送后，页面右侧出现工作区，不再只有文字分析。

**Files:**

- Create: `src/components/build-room/GenerationWorkspace.tsx`
- Modify: `src/components/build-room/BuildRoom.tsx`
- Modify: `src/app/globals.css`

- [x] 发送实现类需求后展示右侧工作区。
- [x] 工作区包含三个标签：预览、代码、执行日志。
- [x] 咨询类请求不展示右侧工作区。
- [x] 预览区域显示生成页面。
- [x] 代码区域显示生成文件。
- [x] 执行日志展示意图识别、需求分析、计划生成、代码生成、预览渲染等步骤。
- [x] 工作区内容根据当前 session 切换。

## 5. 补基础代码生成能力

**目标：** 根据用户 query 生成一个可运行页面。重点是“从 query 派生”，不是固定业务类型模板穷举。

**Files:**

- Create: `src/features/generation/types.ts`
- Create: `src/features/generation/generateApp.ts`
- Create: `src/features/generation/generateApp.test.ts`
- Modify: `src/components/build-room/GenerationWorkspace.tsx`

- [x] 定义生成结果结构：标题、功能模块、文件列表、执行日志、预览入口。
- [x] 根据 query 生成页面标题。
- [x] 根据 query 生成功能模块。
- [x] 根据 query 生成表单字段、列表项、按钮文案。
- [x] 生成 `index.html`、`styles.css`、`app.js` 三个文件。
- [x] 生成结果不能依赖固定业务枚举。
- [x] 单元测试验证不同 query 会生成不同标题、模块和字段。

## 6. 实现预览、代码、执行日志

**目标：** 用户能看到生成结果，而不是只看到“计划”。预览能运行，代码能查看，日志能解释过程。

**Files:**

- Create: `src/components/build-room/PreviewFrame.tsx`
- Create: `src/components/build-room/CodeViewer.tsx`
- Create: `src/components/build-room/RunLog.tsx`
- Modify: `src/components/build-room/GenerationWorkspace.tsx`
- Modify: `src/app/globals.css`

- [x] 预览：把生成的 HTML/CSS/JS 合成 iframe `srcDoc`。
- [x] 预览：iframe 使用 sandbox。
- [x] 代码：展示生成文件列表。
- [x] 代码：点击文件后显示文件内容。
- [x] 日志：展示从 query 到 preview 的执行步骤。
- [x] 切换标签时不丢失当前 session 状态。

## 7. 错误与修复流程

**目标：** 生成失败或检查失败时，用户知道哪里出了问题，并能触发修复。

**Files:**

- Modify: `src/features/generation/generateApp.ts`
- Modify: `src/features/generation/generateApp.test.ts`
- Modify: `src/components/build-room/GenerationWorkspace.tsx`
- Modify: `src/components/build-room/RunLog.tsx`

- [x] 显示生成失败状态。
- [x] 显示检查失败状态，例如缺少入口文件、预览内容为空。
- [x] 提供“一键修复”按钮。
- [x] 修复后更新预览和代码。
- [x] 日志里记录修复前后的状态变化。
- [x] 测试覆盖缺失文件、空预览和修复结果。

## 8. 持久化

**目标：** 用 localStorage 保存完整 session，让刷新后的演示流程可继续。

**Files:**

- Modify: `src/components/build-room/BuildRoom.tsx`
- Create: `src/features/session/sessionStorage.ts`
- Create: `src/features/session/sessionStorage.test.ts`

- [x] 保存 session。
- [x] 保存消息。
- [x] 保存附件名。
- [x] 保存分析结果。
- [x] 保存生成结果。
- [x] 保存当前选中的预览/代码/日志标签。
- [x] localStorage 数据损坏时自动回退为空状态。

## 9. 最终演示包装

**目标：** 让评审能快速理解这个 demo 的能力和操作路径。

**Files:**

- Modify: `README.md`
- Create: `docs/demo-script.md`
- Modify: `docs/product-design.md`

- [x] README 更新使用说明。
- [x] 准备几个演示 query。
- [x] 整理演示流程：咨询类、实现类、附件类、修复类。
- [x] 说明本地运行方式。
- [x] 说明当前先验证核心交互闭环，避免把演示重点转移到外围能力。

## 当前不做

这些内容不进入当前核心闭环，避免再次偏题：

- 不做登录和用户系统。
- 不做部署平台。
- 不做固定业务模板市场。
- 不做复杂项目管理功能。

## Verification Checklist

- [x] `npm test` passes.
- [x] `npm run build` passes.
- [x] `http://localhost:3000/` loads successfully.
- [x] 咨询类 prompt 不展示生成工作区。
- [x] 实现类 prompt 展示实施计划和右侧工作区。
- [x] 生成页面可以在 iframe 中预览。
- [x] 代码标签能查看生成文件。
- [x] 执行日志能解释生成过程。
- [x] 一键修复能更新预览和代码。
- [x] 刷新页面后 session、消息、分析和生成结果仍可用。
