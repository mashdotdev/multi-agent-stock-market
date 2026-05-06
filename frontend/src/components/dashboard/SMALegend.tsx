"use client";

type ItemProps = {
  on: boolean;
  color: string;
  label: string;
  onClick: () => void;
};

function LegendItem({ on, color, label, onClick }: ItemProps) {
  return (
    <button
      onClick={onClick}
      className="mono"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        border: 0, background: "transparent", padding: "2px 4px",
        fontSize: 11, color: on ? "var(--ink-soft)" : "var(--muted-2)",
        cursor: "pointer",
      }}
    >
      <span style={{
        width: 14, height: 2,
        background: on ? color : "var(--muted-2)",
        display: "inline-block", borderRadius: 2,
      }} />
      {label}
    </button>
  );
}

type Props = {
  showSMA20: boolean;
  showSMA50: boolean;
  onToggle: (key: "sma20" | "sma50") => void;
};

export function SMALegend({ showSMA20, showSMA50, onToggle }: Props) {
  return (
    <div style={{ display: "inline-flex", gap: 8 }}>
      <LegendItem
        on={showSMA20}
        color="oklch(0.62 0.13 70)"
        label="SMA 20"
        onClick={() => onToggle("sma20")}
      />
      <LegendItem
        on={showSMA50}
        color="var(--accent)"
        label="SMA 50"
        onClick={() => onToggle("sma50")}
      />
    </div>
  );
}
