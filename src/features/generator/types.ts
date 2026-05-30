export type BuildMode = "team" | "engineer" | "race";

export type Locale = "en" | "zh";

export type AppType = "crm" | "portfolio" | "operations" | "commerce";

export type GenerateAppInput = {
  prompt: string;
  mode: BuildMode;
  locale?: Locale;
  previousVersionId?: string;
  fixRequested?: boolean;
};

export type GeneratedAppFiles = {
  html: string;
  css: string;
  js: string;
  title: string;
  description: string;
  appType: AppType;
};
