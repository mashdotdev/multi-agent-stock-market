"use client";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

type Props = {
  active?: string;
  onChange?: (tf: string) => void;
};

export function TimeframeBar({ active = "1M", onChange }: Props) {
  return (
    <div style={{
      display: "inline-flex",
      border: "1px solid var(--hairline)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange?.(tf)}
          className="mono"
          style={{
            border: 0,
            background: tf === active ? "var(--ink)" : "transparent",
            color: tf === active ? "var(--surface)" : "var(--ink-soft)",
            padding: "5px 10px",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            borderRight: "1px solid var(--hairline)",
          }}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
