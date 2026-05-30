# Rebuild Atoms Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean Atoms-style entry page with session navigation, a minimal creation input, attachment affordance, and query-driven intent analysis.

**Architecture:** Replace the old build room UI with a single client workspace shell. Keep all behavior local for the first prototype: sessions live in React state, the first sent message persists a session in the sidebar, and a small pure analysis module determines whether the query is consultation or implementation and produces the next visible state.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, plain CSS in `src/app/globals.css`, existing `lucide-react` icons if needed.

---

## Tasks

- [ ] Create a pure `analyzeUserQuery` module with tests for consultation vs implementation intent.
- [ ] Replace `BuildRoom` with the new Atoms-style session shell.
- [ ] Restyle `globals.css` to match the approved dark prototype.
- [ ] Verify tests, build, and browser smoke behavior.
