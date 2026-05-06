"use client";

import { useRef } from "react";
import { useState, useEffect } from "react";
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
    <div
      className="dashboard"
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr 320px",
        overflow: "hidden",
      }}
    >
      {/* Row 1: Agent pipeline strip */}
      <AgentStrip agents={AGENTS} agentStates={agentStates} ticker={TICKER} />

      {/* Row 2: Chart hero */}
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="fin-card"
          style={{
            flex: 1,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Chart header + controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <ChartHeader ticker={TICKER} />
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <SMALegend
                showSMA20={overlays.sma20}
                showSMA50={overlays.sma50}
                onToggle={toggleOverlay}
              />
              <TimeframeBar active={tf} onChange={setTf} />
            </div>
          </div>

          {/* Candlestick chart */}
          <div style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
            <div style={{ flex: 1 }}>
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

          {/* Mini stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 16,
              paddingTop: 14,
              borderTop: "1px solid var(--hairline)",
            }}
          >
            {MINI_STATS.map(({ label, value }) => (
              <div key={label}>
                <div
                  className="section-label"
                  style={{ marginBottom: 2, fontSize: 10 }}
                >
                  {label}
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Bottom dock — conversation + findings */}
      <div
        style={{
          borderTop: "1px solid var(--hairline)",
          background: "var(--surface)",
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          overflow: "hidden",
        }}
      >
        {/* Conversation panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderBottom: "1px solid var(--hairline)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="section-label">Conversation</span>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--muted)" }}
            >
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div
            ref={scrollRef}
            className="scroll"
            style={{ flex: 1, overflowY: "auto", padding: "14px 24px" }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} agentMap={agentMap} />
            ))}
          </div>
          <div
            style={{
              padding: "12px 24px 16px",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <ChatComposer onSend={send} prompts={QUICK_PROMPTS.slice(0, 3)} />
          </div>
        </div>

        {/* Findings panel */}
        <div
          style={{
            borderLeft: "1px solid var(--hairline)",
            background: "var(--surface-2)",
            padding: 16,
            overflow: "auto",
          }}
        >
          <div className="section-label" style={{ marginBottom: 10 }}>
            Findings
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            {FINDINGS.map(({ key, value }) => (
              <li
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <span style={{ color: "var(--muted)" }}>{key}</span>
                <span className="mono" style={{ color: "var(--ink-soft)" }}>
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
