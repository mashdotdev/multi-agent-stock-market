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
    <div style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--hairline)",
      padding: "12px 24px",
      display: "flex", alignItems: "center", gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: "var(--ink)", color: "var(--surface)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-jetbrains-mono), ui-monospace",
          fontWeight: 700, fontSize: 12,
        }}>
          Σ
        </div>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Sigma Desk</span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: "var(--hairline)", flexShrink: 0 }} />

      {/* Agent pipeline */}
      <div style={{ display: "flex", gap: 18, flex: 1 }}>
        {agents.map((a, i) => {
          const state = agentStates[a.id] ?? "idle";
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <AgentAvatar agent={a} size={30} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</span>
                    <span className={"dot " + state} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {state === "idle" ? a.role : a.task}
                  </div>
                </div>
              </div>
              {i < agents.length - 1 && (
                <svg
                  width="20" height="20" viewBox="0 0 20 20"
                  style={{ alignSelf: "center", flexShrink: 0, marginLeft: 8 }}
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
      <span className="mono" style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
        {ticker.asOf}
      </span>
    </div>
  );
}
