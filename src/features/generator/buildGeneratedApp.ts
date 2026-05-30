import { classifyPrompt } from "./classifyPrompt";
import { createTemplate } from "./templates";
import type { GeneratedAppFiles, GenerateAppInput } from "./types";

export function buildGeneratedApp(input: GenerateAppInput): GeneratedAppFiles {
  const appType = classifyPrompt(input.prompt);
  return createTemplate({
    prompt: input.prompt,
    appType,
    locale: input.locale,
    fixRequested: input.fixRequested
  });
}
