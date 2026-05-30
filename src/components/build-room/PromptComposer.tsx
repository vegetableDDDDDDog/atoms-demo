"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { BuildRoomCopy, Locale } from "@/features/i18n/dictionary";

export function PromptComposer({
  onSubmit,
  disabled,
  locale,
  onLocaleChange,
  copy
}: {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
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
    <section className="card composer">
      <div className="composer-header">
        <div>
          <h2>{copy.buildRoomTitle}</h2>
          <p>{copy.tagline}</p>
        </div>
        <div className="composer-actions">
          <div className="language-toggle" aria-label={copy.languageLabel}>
            <button type="button" aria-pressed={locale === "zh"} data-active={locale === "zh"} onClick={() => onLocaleChange("zh")}>
              中文
            </button>
            <button type="button" aria-pressed={locale === "en"} data-active={locale === "en"} onClick={() => onLocaleChange("en")}>
              English
            </button>
          </div>
          <span className="status-pill">{disabled ? copy.running : copy.ready}</span>
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
          {copy.run}
        </button>
      </div>
    </section>
  );
}

