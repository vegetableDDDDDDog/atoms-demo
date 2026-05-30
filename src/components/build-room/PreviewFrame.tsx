import type { GeneratedApp } from "@/features/generation/types";

type PreviewFrameProps = {
  app: GeneratedApp;
};

export function PreviewFrame({ app }: PreviewFrameProps) {
  return (
    <div className="preview-frame">
      <iframe sandbox="allow-scripts" srcDoc={app.previewHtml} title={`${app.title} 预览`} />
    </div>
  );
}
