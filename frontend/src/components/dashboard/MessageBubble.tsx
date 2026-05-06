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
      <div className="flex justify-end mb-[18px]">
        <div className="bg-ink text-surface rounded-[14px] rounded-tr-[4px] px-3.5 py-2.5 max-w-[78%] text-sm leading-relaxed">
          {msg.displayText}
        </div>
      </div>
    );
  }

  const agent = msg.agent ? agentMap[msg.agent] : undefined;
  return (
    <div className="flex gap-2.5 mb-[18px]">
      {agent && <AgentAvatar agent={agent} size={30} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[13px] font-semibold text-ink">
            {agent?.name ?? "Assistant"}
          </span>
          <span className="text-[11px] text-[var(--muted)]">{msg.time ?? ""}</span>
        </div>
        <div
          className={`text-sm leading-relaxed text-ink-soft whitespace-pre-wrap ${
            msg.streaming ? "cursor" : ""
          }`}
        >
          {msg.displayText}
        </div>
      </div>
    </div>
  );
}
