# Generation Progress Design

## Problem

After the user clicks generate, the app waits for the API response and then swaps in the finished preview. Because the backend returns all agent steps at once, the UI does not show where the generation is. Users can reasonably think nothing happened.

## Goal

Make the generation process visible immediately after click, so the app feels like an Atoms-style agent builder rather than a static form.

## Scope

- Show a clear running state on the generate button.
- Show a progress card in the preview area while generation is running.
- Show a right-panel agent timeline with waiting, active, done, and error states.
- Simulate visible stage progression on the client while the existing synchronous API runs.
- Keep the backend and database unchanged.

## Interaction

When generation starts, the UI moves through five stages:

1. Mike understands the request.
2. Emma extracts product requirements.
3. Bob designs the app structure.
4. Alex generates HTML, CSS, and JavaScript.
5. QA checks the preview result.

If the API succeeds, all stages become done and the generated preview appears. If the API fails, the active stage becomes error and the user sees a retry-oriented message.

## Non-Goals

- Do not implement streaming API responses.
- Do not add a job queue.
- Do not persist intermediate progress to the database.
- Do not add a new dependency.

