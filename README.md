# Atoms Demo

Atoms Demo 是一个网页版 AI 应用生成工作台原型。用户输入想法或问题后，系统先判断意图，再进行需求分析、实施规划，并逐步演进到代码生成和可视化预览。

当前方向是做一个类似 Atoms/Codex 的创作入口，而不是固定业务模板生成器。

## Current Scope

当前版本聚焦入口体验和第一步智能分析：

- Atoms 风格深色入口页。
- 左侧 session 列表与新建对话。
- 中间极简输入框、上传入口和发送按钮。
- Enter 发送，Shift + Enter 换行。
- 空 session 不保存，发送第一条消息后才生成会话。
- 区分咨询类请求和实现类请求。
- 咨询类展示问题理解、分析建议和下一步。
- 实现类展示需求规格、页面结构、数据结构、任务步骤和预期文件。

## Product Docs

- [Product Design](docs/product-design.md)
- [Implementation Plan](docs/implementation-plan.md)

## Stack

- Next.js App Router
- React
- TypeScript
- Vitest
- Global CSS

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm test
```
