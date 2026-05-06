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
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              className="inline-flex items-center text-xs text-ink-soft border border-hairline bg-surface px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <textarea
          rows={1}
          placeholder="Ask the agents about a ticker, setup, or strategy…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="flex-1 text-ink bg-surface border border-hairline-strong rounded-[10px] px-3 py-2.5 outline-none resize-none min-h-[42px] max-h-[120px] text-sm leading-normal transition-[border-color,box-shadow] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_18%,transparent)] font-[inherit]"
        />
        <button
          onClick={submit}
          className="bg-ink text-surface border border-ink rounded-[6px] px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors hover:bg-ink-soft font-[inherit]"
        >
          Send
        </button>
      </div>
    </div>
  );
}
