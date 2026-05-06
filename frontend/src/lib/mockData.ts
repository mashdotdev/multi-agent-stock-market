import type { Agent, Candle, Message, Ticker } from "./types";

export const TICKER: Ticker = {
  symbol: "NVDA",
  name: "NVIDIA Corporation",
  price: 942.18,
  change: +14.32,
  changePct: +1.54,
  asOf: "May 6, 2026 · 3:47 PM ET",
};

function genCandles(seed = 42, n = 60, start = 820): Candle[] {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: Candle[] = [];
  let close = start;
  for (let i = 0; i < n; i++) {
    const drift = Math.sin(i / 8) * 4 + (i / n) * 90;
    const vol = 6 + rnd() * 14;
    const open = close + (rnd() - 0.5) * 4;
    const dir = rnd() > 0.45 ? 1 : -1;
    const body = dir * (rnd() * vol * 0.6);
    const c = open + body + drift * 0.04;
    const high = Math.max(open, c) + rnd() * vol * 0.5;
    const low = Math.min(open, c) - rnd() * vol * 0.5;
    out.push({ i, open, high, low, close: c, volume: 8e6 + rnd() * 2e7 });
    close = c;
  }
  out[out.length - 1].close = TICKER.price;
  out[out.length - 1].high = Math.max(out[out.length - 1].high, TICKER.price + 6);
  return out;
}

function sma(data: Candle[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(data.length).fill(null);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) sum -= data[i - period].close;
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export const CANDLES = genCandles();
export const SMA20 = sma(CANDLES, 20);
export const SMA50 = sma(CANDLES, 50);

export const AGENTS: Agent[] = [
  {
    id: "fetcher",
    name: "DataFetcher",
    role: "Pulls OHLC, fundamentals, news",
    initial: "DF",
    state: "done",
    task: "Fetched 60d OHLC + earnings calendar",
    progress: 1.0,
    color: "fetcher",
  },
  {
    id: "analyst",
    name: "TechnicalAnalyst",
    role: "Indicators, patterns, levels",
    initial: "TA",
    state: "thinking",
    task: "Evaluating SMA-20/50 cross & RSI",
    progress: 0.62,
    color: "analyst",
  },
  {
    id: "writer",
    name: "ReportWriter",
    role: "Synthesizes the response",
    initial: "RW",
    state: "idle",
    task: "Awaiting analyst output",
    progress: 0.0,
    color: "writer",
  },
];

export const CONVERSATION: Message[] = [
  {
    role: "user",
    text: "How is NVDA setting up into next week's earnings? Walk me through the technicals.",
    displayText: "How is NVDA setting up into next week's earnings? Walk me through the technicals.",
    streaming: false,
    done: true,
    time: "3:46 PM",
  },
  {
    role: "assistant",
    agent: "writer",
    displayText: "",
    streaming: true,
    done: false,
    time: "3:47 PM",
    chunks: [
      "NVDA is consolidating above its rising 20-day SMA",
      " (currently $912.40), with the 50-day at $874.10 — a healthy",
      " bullish stack. Price tagged $948 intraday and pulled back on lighter",
      " volume, which the TechnicalAnalyst flags as constructive rather than distributive.",
      "\n\nKey levels: support at $912 (20-SMA) and $895 (prior breakout shelf);",
      " resistance at $948 and the $972 measured-move target.",
      "\n\nGoing into earnings, the setup is a coiled continuation pattern.",
      " Risk is a gap-down through $895 on a guide-down.",
    ],
  },
];

export const QUICK_PROMPTS = [
  "Compare to AMD",
  "Show options flow",
  "Draft an earnings note",
  "What if it gaps down?",
];

export const FINDINGS = [
  { key: "Trend",      value: "Up — bullish stack 20>50" },
  { key: "Support",    value: "$912 / $895" },
  { key: "Resistance", value: "$948 / $972" },
  { key: "Vol regime", value: "Compressing" },
  { key: "Catalyst",   value: "Earnings · May 14" },
];

export const MINI_STATS = [
  { label: "Open",   value: "$931.20" },
  { label: "High",   value: "$948.06" },
  { label: "Low",    value: "$928.40" },
  { label: "Vol",    value: "28.4M" },
  { label: "SMA 20", value: "$912.40" },
  { label: "SMA 50", value: "$874.10" },
];
