# Atoms Demo

一个重新开始的 Atoms 网页版核心原型。

当前版本只聚焦入口体验：

- 左侧历史 session 列表
- 新建对话
- 中央输入框
- 上传附件入口
- Enter 或发送按钮触发 query 分析
- 区分咨询类和实现类请求
- 根据 query 展示分析结果或实施计划

旧的业务模板生成、发布页、Prisma/SQLite 持久化已经移除，避免和新方向混在一起。

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
