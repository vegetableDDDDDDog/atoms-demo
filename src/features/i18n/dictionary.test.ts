import { describe, expect, it } from "vitest";
import { dictionary } from "./dictionary";

describe("dictionary workspace copy", () => {
  it("defines the same workspace tab ids for both locales", () => {
    expect(dictionary.en.workspaceTabs.map((tab) => tab.id)).toEqual(["preview", "mobile", "code", "diff", "deploy"]);
    expect(dictionary.zh.workspaceTabs.map((tab) => tab.id)).toEqual(["preview", "mobile", "code", "diff", "deploy"]);
  });

  it("keeps the generation phase pipeline complete in both locales", () => {
    expect(dictionary.en.generationPhases).toHaveLength(5);
    expect(dictionary.zh.generationPhases).toHaveLength(5);
    expect(dictionary.en.generationPhases.map((phase) => phase.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(dictionary.zh.generationPhases.map((phase) => phase.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
  });
});
