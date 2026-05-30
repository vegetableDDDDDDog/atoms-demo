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
