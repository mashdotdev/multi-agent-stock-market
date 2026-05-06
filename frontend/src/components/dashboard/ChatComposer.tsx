"use client";

import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
  prompts?: string[];
};

export function ChatComposer({ onSend, prompts = [] }: Props) {
  const [val, setVal] = useState("");

  const submit = () => {
    if (!val.trim()) return;
    onSend(val);
    setVal("");
  };

  return (
    <div>
      {prompts.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "var(--ink-soft)",
                border: "1px solid var(--hairline)",
                background: "var(--surface)",
                padding: "4px 10px", borderRadius: 999,
                cursor: "pointer",
                transition: "background .15s, color .15s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          rows={1}
          placeholder="Ask the agents about a ticker, setup, or strategy…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          style={{
            flex: 1,
            fontFamily: "inherit", color: "var(--ink)",
            background: "var(--surface)",
            border: "1px solid var(--hairline-strong)",
            borderRadius: 10,
            padding: "10px 12px",
            outline: "none",
            resize: "none",
            minHeight: 42,
            maxHeight: 120,
            fontSize: 14,
            lineHeight: 1.5,
            transition: "border-color .15s, box-shadow .15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--hairline-strong)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          onClick={submit}
          style={{
            background: "var(--ink)", color: "var(--surface)", border: "1px solid var(--ink)",
            borderRadius: 6, padding: "10px 16px", fontSize: 13, cursor: "pointer",
            fontFamily: "inherit", fontWeight: 500,
            transition: "background .15s",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
