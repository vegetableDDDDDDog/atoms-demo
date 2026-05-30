# I18n Toggle Design

## Problem

The current Atoms Demo can generate and publish previewable apps, but the experience is English-only. For a Chinese assessment and demo flow, this makes the product story less direct: users can describe an idea in Chinese, but the editor chrome, agent reasoning, and generated application still speak English.

## Goal

Add a lightweight Chinese/English language switch that makes the prototype easier to explain in both interview and product-demo contexts.

## Scope

- Add a visible language toggle with `中文` and `English`.
- Persist the selected language in `localStorage`.
- Localize Build Room UI labels and empty states.
- Pass locale through generation APIs.
- Generate localized agent steps.
- Generate localized app copy for iframe previews.
- Keep project prompt, run history, versions, and publish records unchanged.

## Non-Goals

- Do not introduce `next-intl`, `react-i18next`, or a translation platform.
- Do not add database tables for translations.
- Do not localize stored historical data after it has already been generated.
- Do not create a multi-tenant locale preference model.

## Architecture

Use a simple typed dictionary in the frontend and a shared `Locale` type for backend generation. The UI owns the current locale, persists it locally, and includes it when calling `/api/runs`, `/api/projects`, and `/api/runs/:id/fix`. Generator and orchestrator functions accept `locale` and choose copy from small in-code dictionaries.

## Data Model

No schema change is required. Locale is treated as generation input, not durable project metadata. The generated HTML/CSS/JS and agent steps already persist the resulting text in existing tables.

## User Experience

The toggle sits in the Build Room header near the prompt controls. Switching language immediately updates product chrome. Running a new generation uses the selected language for the agent pipeline and preview output.

