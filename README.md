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

## Demo Flow

1. Enter an app idea in the Build Room.
2. Run the simulated agent build.
3. Inspect the generated preview, mobile view, and code panel.
4. Use Fix Bug to create an improved version.
5. Publish the latest version and open the generated `/p/:slug` URL.

## Architecture Notes

The MVP uses a deterministic local generator instead of a real LLM call. The generator is isolated behind `src/features/generator/buildGeneratedApp.ts`, so a real model adapter can replace it without changing the UI or database schema.

SQLite is used for local persistence. For Vercel-style serverless deployment with durable persistence, switch Prisma to a hosted Postgres provider such as Supabase or Neon.
