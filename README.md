# Atoms Demo

Atoms Demo 是一个网页版 AI 应用生成工作台原型。它模拟 Atoms/Codex 这类工具的核心入口体验：用户输入一个想法或问题，系统先判断意图，再完成需求分析、实施计划、代码生成，并把生成的应用放到网页预览中展示。

当前版本坚持一个原则：**query 驱动，而不是模板驱动**。页面不会让用户选择固定业务模板，而是根据用户输入派生分析、计划、文件、预览和日志。

## 当前能力

- Atoms 风格深色入口页。
- 左侧 session 列表、新建对话、历史切换。
- 空 session 不保存，发送第一条消息后生成标题。
- Enter 发送，Shift + Enter 换行。
- 上传附件后展示附件名，并把附件名作为分析上下文。
- 区分咨询类、实现类、修改类请求。
- 咨询类只展示分析和建议，不进入生成工作区。
- 实现类和修改类展示需求理解、功能拆解、页面结构、数据结构、任务步骤和预期文件。
- 根据 query 生成 `index.html`、`styles.css`、`app.js`。
- 右侧工作区展示预览、代码、执行日志。
- iframe sandbox 预览生成页面。
- 检查生成结果，失败时提供一键修复。
- 使用 localStorage 保存 session、消息、附件名、分析结果、生成结果和当前工作区标签。

## Product Docs

- [Product Design](docs/product-design.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Demo Script](docs/demo-script.md)

## Demo Queries

咨询类：

```text
帮我分析一下需求管理系统应该先做哪些功能
```

实现类：

```text
帮我做一个校园社团活动报名系统，需要活动发布、学生报名、名额限制和签到核销
```

修改类：

```text
把页面改成移动端优先，并增加筛选功能
```

附件类：

```text
根据附件帮我实现这个页面
```

## Stack

- Next.js App Router
- React
- TypeScript
- Vitest
- Global CSS
- localStorage
- sandboxed iframe preview

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm test
npm run build
```
