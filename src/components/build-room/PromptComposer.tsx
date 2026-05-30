"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { BuildRoomCopy } from "@/features/i18n/dictionary";

export function PromptComposer({
  onSubmit,
  disabled,
  copy
}: {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  copy: BuildRoomCopy;
}) {
  const [prompt, setPrompt] = useState<string>(copy.defaultPrompt);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (!isEdited) {
      setPrompt(copy.defaultPrompt);
    }
  }, [copy.defaultPrompt, isEdited]);

  return (
    <section className="card composer conversation-card">
      <div className="composer-header">
        <div>
          <h2>{copy.buildRoomTitle}</h2>
          <p>{copy.tagline}</p>
        </div>
      </div>
      <div className="prompt-grid">
        <textarea
          aria-label={copy.promptAria}
          value={prompt}
          onChange={(event) => {
            setIsEdited(true);
            setPrompt(event.target.value);
          }}
          rows={3}
        />
        <button className="button-primary" onClick={() => onSubmit(prompt)} disabled={disabled || !prompt.trim()}>
          <Send size={16} />
          {disabled ? copy.runInProgress : copy.run}
        </button>
      </div>
    </section>
  );
}
