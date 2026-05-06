"use client";

import { useEffect, useState } from "react";
import { AGENTS, CONVERSATION } from "@/lib/mockData";
import type { AgentState, Message } from "@/lib/types";

export function useStreamingChat() {
  const [messages, setMessages] = useState<Message[]>(() =>
    CONVERSATION.map((m) => {
      if (m.streaming) return { ...m, displayText: "", streaming: true, done: false };
      return { ...m, streaming: false, done: true };
    })
  );

  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({
    fetcher: "done",
    analyst: "thinking",
    writer: "idle",
  });

  // Auto-stream the initial assistant message on mount
  useEffect(() => {
    const target = CONVERSATION.find((m) => m.streaming);
    if (!target || !target.chunks) return;

    const fullText = target.chunks.join("");
    let i = 0;
    let cancelled = false;

    setAgentStates((s) => ({ ...s, analyst: "done", writer: "streaming" }));

    const tick = () => {
      if (cancelled) return;
      i = Math.min(fullText.length, i + 3);
      setMessages((ms) =>
        ms.map((m) =>
          m.agent === target.agent && m.streaming
            ? { ...m, displayText: fullText.slice(0, i) }
            : m
        )
      );
      if (i < fullText.length) {
        setTimeout(tick, 22);
      } else {
        setMessages((ms) =>
          ms.map((m) =>
            m.agent === target.agent && !m.done
              ? { ...m, streaming: false, done: true }
              : m
          )
        );
        setAgentStates((s) => ({ ...s, writer: "done" }));
      }
    };

    const start = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((ms) => [
      ...ms,
      { role: "user", text, displayText: text, streaming: false, done: true, time: "now" },
    ]);
    setAgentStates({ fetcher: "thinking", analyst: "idle", writer: "idle" });

    setTimeout(
      () => setAgentStates((s) => ({ ...s, fetcher: "done", analyst: "thinking" })),
      700
    );

    setTimeout(() => {
      const replyChunks = [
        "Looking at that now — the agents are running.",
        " I'll factor in the latest tape and circle back with levels and a trade plan.",
      ];
      const full = replyChunks.join("");
      const writerAgent = AGENTS.find((a) => a.id === "writer");

      setMessages((ms) => [
        ...ms,
        {
          role: "assistant",
          agent: "writer",
          chunks: replyChunks,
          displayText: "",
          streaming: true,
          done: false,
          time: "now",
        },
      ]);
      setAgentStates((s) => ({ ...s, analyst: "done", writer: "streaming" }));

      let i = 0;
      const tick = () => {
        i = Math.min(full.length, i + 3);
        setMessages((ms) => {
          const out = [...ms];
          for (let k = out.length - 1; k >= 0; k--) {
            if (out[k].streaming) {
              out[k] = {
                ...out[k],
                displayText: full.slice(0, i),
                done: i >= full.length,
                streaming: i < full.length,
              };
              break;
            }
          }
          return out;
        });
        if (i < full.length) {
          setTimeout(tick, 22);
        } else {
          setAgentStates((s) => ({ ...s, writer: "done" }));
        }
      };
      setTimeout(tick, 500);
      void writerAgent; // used for color/avatar in MessageBubble
    }, 1400);
  };

  return { messages, agentStates, send };
}
