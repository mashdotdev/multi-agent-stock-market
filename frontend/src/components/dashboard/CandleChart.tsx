"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/types";

function fmtUSD(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Props = {
  candles: Candle[];
  sma20: (number | null)[];
  sma50: (number | null)[];
  height?: number;
  showSMA20?: boolean;
  showSMA50?: boolean;
  showVolume?: boolean;
  showCrosshair?: boolean;
};

export function CandleChart({
  candles,
  sma20,
  sma50,
  height = 320,
  showSMA20 = true,
  showSMA50 = true,
  showVolume = true,
  showCrosshair = true,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setW(Math.max(320, cr.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 10;
  const padR = 56;
  const padT = 10;
  const padB = showVolume ? 46 : 22;
  const chartH = height - padT - padB;
  const volH = showVolume ? 32 : 0;

  const { yMin, yMax } = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    candles.forEach((c) => { lo = Math.min(lo, c.low); hi = Math.max(hi, c.high); });
    const pad = (hi - lo) * 0.08;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [candles]);

  const innerW = w - padL - padR;
  const slot = innerW / candles.length;
  const cw = Math.max(2, slot * 0.62);

  const xOf = (i: number) => padL + slot * i + slot / 2;
  const yOf = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (chartH - volH - 6);

  const maxVol = Math.max(...candles.map((c) => c.volume));
  const volBaseY = padT + chartH - 4;
  const yVol = (v: number) => volBaseY - (v / maxVol) * volH;

  const linePath = (arr: (number | null)[]) => {
    let d = "";
    arr.forEach((v, i) => {
      if (v == null) return;
      d += (d ? " L " : "M ") + xOf(i).toFixed(1) + " " + yOf(v).toFixed(1);
    });
    return d;
  };

  const ticks = 4;
  const gridY = Array.from({ length: ticks + 1 }, (_, k) => yMin + ((yMax - yMin) * k) / ticks);

  return (
    <div ref={wrapRef} className="w-full relative">
      <svg
        width={w}
        height={height}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.max(0, Math.min(candles.length - 1, Math.floor((x - padL) / slot)));
          setHover(idx);
        }}
        onMouseLeave={() => setHover(null)}
        className="block overflow-visible"
      >
        {/* Gridlines */}
        {gridY.map((g, i) => (
          <g key={i}>
            <line
              x1={padL} x2={w - padR}
              y1={yOf(g)} y2={yOf(g)}
              stroke="var(--hairline)"
              strokeDasharray={i === 0 || i === ticks ? "0" : "2 4"}
            />
            <text
              x={w - padR + 6} y={yOf(g) + 3}
              fontSize="10" fill="var(--muted)"
              fontFamily="var(--font-jetbrains-mono), ui-monospace"
            >
              {fmtUSD(g, 0)}
            </text>
          </g>
        ))}

        {/* Volume bars */}
        {showVolume && candles.map((c, i) => (
          <rect
            key={"v" + i}
            x={xOf(i) - cw / 2}
            y={yVol(c.volume)}
            width={cw}
            height={volBaseY - yVol(c.volume)}
            fill={c.close >= c.open ? "var(--up)" : "var(--down)"}
            opacity="0.18"
          />
        ))}

        {/* SMA lines */}
        {showSMA50 && (
          <path d={linePath(sma50)} fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity="0.85" />
        )}
        {showSMA20 && (
          <path d={linePath(sma20)} fill="none" stroke="oklch(0.62 0.13 70)" strokeWidth="1.4" opacity="0.9" />
        )}

        {/* Candles */}
        {candles.map((c, i) => {
          const up = c.close >= c.open;
          const color = up ? "var(--up)" : "var(--down)";
          return (
            <g key={i}>
              <line x1={xOf(i)} x2={xOf(i)} y1={yOf(c.high)} y2={yOf(c.low)} stroke={color} strokeWidth="1" />
              <rect
                x={xOf(i) - cw / 2}
                y={yOf(Math.max(c.open, c.close))}
                width={cw}
                height={Math.max(1, Math.abs(yOf(c.open) - yOf(c.close)))}
                fill={up ? "var(--surface)" : color}
                stroke={color}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Crosshair */}
        {showCrosshair && hover != null && (
          <g>
            <line
              x1={xOf(hover)} x2={xOf(hover)}
              y1={padT} y2={padT + chartH}
              stroke="var(--ink)" strokeDasharray="2 3" opacity="0.35"
            />
            <line
              x1={padL} x2={w - padR}
              y1={yOf(candles[hover].close)} y2={yOf(candles[hover].close)}
              stroke="var(--ink)" strokeDasharray="2 3" opacity="0.35"
            />
          </g>
        )}
      </svg>

      {/* OHLC tooltip */}
      {hover != null && (
        <div className="absolute top-2 left-3 bg-surface border border-hairline rounded-[6px] px-2.5 py-1.5 mono text-[11px] flex gap-3 text-ink-soft pointer-events-none">
          <span>D{hover + 1}</span>
          <span>O <b>{fmtUSD(candles[hover].open)}</b></span>
          <span>H <b>{fmtUSD(candles[hover].high)}</b></span>
          <span>L <b>{fmtUSD(candles[hover].low)}</b></span>
          <span>
            C{" "}
            <b className={candles[hover].close >= candles[hover].open ? "text-up" : "text-down"}>
              {fmtUSD(candles[hover].close)}
            </b>
          </span>
        </div>
      )}
    </div>
  );
}
