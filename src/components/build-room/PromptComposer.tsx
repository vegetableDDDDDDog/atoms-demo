"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function PromptComposer({
  onSubmit,
  disabled
}: {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
}) {
  const [prompt, setPrompt] = useState("Build a booking CRM for customers with revenue tracking");

  return (
    <section className="card composer">
      <div className="composer-header">
        <div>
          <h2>Agent Build Room</h2>
          <p>Team Mode · SQLite persistence · iframe preview</p>
        </div>
        <span className="status-pill">{disabled ? "Running" : "Ready"}</span>
      </div>
      <div className="prompt-grid">
        <textarea
          aria-label="Build prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
        />
        <button className="button-primary" onClick={() => onSubmit(prompt)} disabled={disabled || !prompt.trim()}>
          <Send size={16} />
          Run
        </button>
      </div>
    </section>
  );
}
