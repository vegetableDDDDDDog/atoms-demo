"use client";

import { useMemo, useState } from "react";
import type { GeneratedApp } from "@/features/generation/types";

type CodeViewerProps = {
  app: GeneratedApp;
};

export function CodeViewer({ app }: CodeViewerProps) {
  const [selectedPath, setSelectedPath] = useState(app.entryFile);
  const selectedFile = useMemo(
    () => app.files.find((file) => file.path === selectedPath) ?? app.files[0],
    [app.files, selectedPath]
  );

  return (
    <div className="code-viewer">
      <div className="file-list" aria-label="生成文件">
        {app.files.map((file) => (
          <button
            data-active={file.path === selectedFile.path}
            key={file.path}
            onClick={() => setSelectedPath(file.path)}
            type="button"
          >
            {file.path}
          </button>
        ))}
      </div>
      <pre>
        <code>{selectedFile.content}</code>
      </pre>
    </div>
  );
}
