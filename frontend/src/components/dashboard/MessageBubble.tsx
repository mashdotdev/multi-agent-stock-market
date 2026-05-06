"use client";

import type { Agent, Message } from "@/lib/types";
import { AgentAvatar } from "./AgentAvatar";

type Props = {
  msg: Message;
  agentMap: Record<string, Agent>;
};

export function MessageBubble({ msg, agentMap }: Props) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <div style={{
          background: "var(--ink)", color: "var(--surface)",
          borderRadius: 14, borderTopRightRadius: 4,
          padding: "10px 14px", maxWidth: "78%",
          fontSize: 14, lineHeight: 1.5,
        }}>
          {msg.displayText}
        </div>
      </div>
    );
  }

  const agent = msg.agent ? agentMap[msg.agent] : undefined;
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
      {agent && <AgentAvatar agent={agent} size={30} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{agent?.name ?? "Assistant"}</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{msg.time ?? ""}</span>
        </div>
        <div
          className={msg.streaming ? "cursor" : ""}
          style={{
            fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.displayText}
        </div>
      </div>
    </div>
  );
}
