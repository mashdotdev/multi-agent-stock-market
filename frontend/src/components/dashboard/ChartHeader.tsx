"use client";

import type { Ticker } from "@/lib/types";

function fmtUSD(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Props = { ticker: Ticker };

export function ChartHeader({ ticker }: Props) {
  const up = ticker.change >= 0;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {ticker.symbol}
        </span>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>{ticker.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="mono" style={{ fontSize: 28, fontWeight: 600 }}>
          ${fmtUSD(ticker.price)}
        </span>
        <span
          className={"mono " + (up ? "up" : "down")}
          style={{ fontSize: 13, fontWeight: 500 }}
        >
          {up ? "+" : ""}{fmtUSD(ticker.change)} ({up ? "+" : ""}{ticker.changePct.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
