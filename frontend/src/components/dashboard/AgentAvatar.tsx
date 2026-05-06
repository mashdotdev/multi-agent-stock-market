"use client";

import type { Agent } from "@/lib/types";

type Props = {
  agent: Agent;
  size?: number;
};

export function AgentAvatar({ agent, size = 28 }: Props) {
  const colorVar = `var(--agent-${agent.color || agent.id})`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: `color-mix(in oklab, ${colorVar} 14%, var(--surface))`,
        color: colorVar,
        border: `1px solid color-mix(in oklab, ${colorVar} 28%, var(--hairline))`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-jetbrains-mono), ui-monospace",
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {agent.initial}
    </div>
  );
}
