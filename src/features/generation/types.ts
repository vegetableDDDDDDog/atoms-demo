export type GeneratedFile = {
  path: string;
  language: "html" | "css" | "javascript";
  content: string;
};

export type GeneratedModule = {
  title: string;
  description: string;
};

export type RunLogEntry = {
  id: string;
  label: string;
  status: "done" | "failed";
  detail: string;
};

export type GeneratedApp = {
  id: string;
  title: string;
  modules: GeneratedModule[];
  fields: string[];
  files: GeneratedFile[];
  entryFile: string;
  previewHtml: string;
  logs: RunLogEntry[];
};
