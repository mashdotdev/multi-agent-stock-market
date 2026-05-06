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
      className="inline-flex items-center justify-center shrink-0 rounded-lg mono font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `color-mix(in oklab, ${colorVar} 14%, var(--surface))`,
        color: colorVar,
        border: `1px solid color-mix(in oklab, ${colorVar} 28%, var(--hairline))`,
      }}
    >
      {agent.initial}
    </div>
  );
}
