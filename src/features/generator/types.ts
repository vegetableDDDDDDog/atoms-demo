export type BuildMode = "team" | "engineer" | "race";

export type AppType = "crm" | "portfolio" | "operations" | "commerce";

export type GenerateAppInput = {
  prompt: string;
  mode: BuildMode;
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
