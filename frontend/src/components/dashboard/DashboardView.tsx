"use client";

import { useEffect, useRef, useState } from "react";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import {
  AGENTS,
  CANDLES,
  FINDINGS,
  MINI_STATS,
  QUICK_PROMPTS,
  SMA20,
  SMA50,
  TICKER,
} from "@/lib/mockData";
import { AgentStrip } from "./AgentStrip";
import { CandleChart } from "./CandleChart";
import { ChartHeader } from "./ChartHeader";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import { SMALegend } from "./SMALegend";
import { TimeframeBar } from "./TimeframeBar";

export function DashboardView() {
  const { messages, agentStates, send } = useStreamingChat();
  const [tf, setTf] = useState("1M");
  const [overlays, setOverlays] = useState({ sma20: true, sma50: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  const agentMap = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleOverlay = (key: "sma20" | "sma50") => {
    setOverlays((o) => ({ ...o, [key]: !o[key] }));
  };

  return (
    <div className="dashboard w-screen h-screen overflow-hidden grid grid-rows-[auto_1fr_320px]">

      {/* Row 1: Agent pipeline strip */}
      <AgentStrip agents={AGENTS} agentStates={agentStates} ticker={TICKER} />

      {/* Row 2: Chart hero */}
      <div className="p-6 flex flex-col overflow-hidden">
        <div className="fin-card flex-1 p-6 flex flex-col gap-4">

          {/* Header + controls */}
          <div className="flex justify-between items-start flex-wrap gap-4">
            <ChartHeader ticker={TICKER} />
            <div className="flex items-center gap-3.5">
              <SMALegend
                showSMA20={overlays.sma20}
                showSMA50={overlays.sma50}
                onToggle={toggleOverlay}
              />
              <TimeframeBar active={tf} onChange={setTf} />
            </div>
          </div>

          {/* Candlestick chart */}
          <div className="flex-1 flex items-stretch">
            <div className="flex-1">
              <CandleChart
                candles={CANDLES}
                sma20={SMA20}
                sma50={SMA50}
                height={300}
                showSMA20={overlays.sma20}
                showSMA50={overlays.sma50}
              />
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-6 gap-4 pt-3.5 border-t border-hairline">
            {MINI_STATS.map(({ label, value }) => (
              <div key={label}>
                <div className="section-label mb-0.5 text-[10px]">{label}</div>
                <div className="mono text-[13px] font-medium text-ink">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Bottom dock */}
      <div className="border-t border-hairline bg-surface grid grid-cols-[1fr_360px] overflow-hidden">

        {/* Conversation panel */}
        <div className="flex flex-col overflow-hidden">
          <div className="px-6 py-2.5 border-b border-hairline flex items-center justify-between">
            <span className="section-label">Conversation</span>
            <span className="mono text-[11px] text-[var(--muted)]">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div ref={scrollRef} className="scroll flex-1 overflow-y-auto px-6 py-3.5">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} agentMap={agentMap} />
            ))}
          </div>
          <div className="px-6 pt-3 pb-4 border-t border-hairline">
            <ChatComposer onSend={send} prompts={QUICK_PROMPTS.slice(0, 3)} />
          </div>
        </div>

        {/* Findings panel */}
        <div className="border-l border-hairline bg-surface-2 p-4 overflow-auto">
          <div className="section-label mb-2.5">Findings</div>
          <ul className="list-none p-0 m-0 text-xs leading-relaxed">
            {FINDINGS.map(({ key, value }) => (
              <li
                key={key}
                className="flex justify-between py-1.5 border-b border-hairline"
              >
                <span className="text-[var(--muted)]">{key}</span>
                <span className="mono text-ink-soft">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
