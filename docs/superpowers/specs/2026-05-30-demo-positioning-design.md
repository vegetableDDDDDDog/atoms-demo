# Demo Positioning Design

## Problem

The current prototype has the right underlying capability, but the first screen makes the generated CRM-like example feel like the product itself. This weakens alignment with the challenge prompt, which asks for an Atoms-style app builder driven by agents.

## Goal

Make the first screen communicate that this is an AI app generation workspace: users describe an app, agents turn the request into code, and the generated app is shown visually.

## Product Framing

The page should lead with `Atoms Demo: AI App Builder`, not a business-domain example. The booking/customer scenario remains only an example prompt and generated output.

## UI Changes

- Add a compact product brief above the prompt area.
- Show a four-step flow: describe idea, agent planning, code generation, preview and publish.
- Rename the prompt area to focus on describing the app to generate.
- Rename preview/code controls as generated-result controls.
- Keep the left history and right agent pipeline, but make their labels reinforce the app-builder story.
- Remove visible `CRM` wording from the default generated booking example where possible.

## Data and Backend

No database changes are required. The generator can keep the internal `crm` app type while visible generated copy uses clearer wording such as `Customer Booking Manager`.

## Validation

- Existing generation and service tests should pass after expected title/slug updates.
- Build should pass.
- Browser smoke test should show a first screen that explains the app-builder workflow before the user runs anything.

