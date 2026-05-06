"use client";

import type { Ticker } from "@/lib/types";

function fmtUSD(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Props = { ticker: Ticker };

export function ChartHeader({ ticker }: Props) {
  const up = ticker.change >= 0;
  return (
    <div className="flex items-baseline gap-3.5 flex-wrap">
      <div className="flex items-baseline gap-2">
        <span className="mono text-[22px] font-semibold tracking-tight text-ink">
          {ticker.symbol}
        </span>
        <span className="text-[var(--muted)] text-sm">{ticker.name}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="mono text-[28px] font-semibold text-ink">
          ${fmtUSD(ticker.price)}
        </span>
        <span className={`mono text-sm font-medium ${up ? "up" : "down"}`}>
          {up ? "+" : ""}{fmtUSD(ticker.change)} ({up ? "+" : ""}{ticker.changePct.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
