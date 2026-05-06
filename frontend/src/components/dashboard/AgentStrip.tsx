"use client";

import type { Agent, AgentState, Ticker } from "@/lib/types";
import { AgentAvatar } from "./AgentAvatar";

type Props = {
  agents: Agent[];
  agentStates: Record<string, AgentState>;
  ticker: Ticker;
};

export function AgentStrip({ agents, agentStates, ticker }: Props) {
  return (
    <div className="bg-surface border-b border-hairline px-6 py-3 flex items-center gap-6">

      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-6 h-6 rounded-[6px] bg-ink text-surface grid place-items-center mono font-bold text-xs">
          Σ
        </div>
        <span className="font-semibold text-sm text-ink">Sigma Desk</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-hairline shrink-0" />

      {/* Agent pipeline */}
      <div className="flex gap-[18px] flex-1">
        {agents.map((a, i) => {
          const state = agentStates[a.id] ?? "idle";
          return (
            <div key={a.id} className="flex items-center gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <AgentAvatar agent={a} size={30} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-ink">{a.name}</span>
                    <span className={"dot " + state} />
                  </div>
                  <div className="text-[10px] text-[var(--muted)] whitespace-nowrap">
                    {state === "idle" ? a.role : a.task}
                  </div>
                </div>
              </div>
              {i < agents.length - 1 && (
                <svg
                  width="20" height="20" viewBox="0 0 20 20"
                  className="self-center shrink-0 ml-2"
                >
                  <path
                    d="M5 10 L15 10 M11 6 L15 10 L11 14"
                    fill="none" stroke="var(--muted-2)" strokeWidth="1.2"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Timestamp */}
      <span className="mono text-[11px] text-[var(--muted)] shrink-0">{ticker.asOf}</span>
    </div>
  );
}
