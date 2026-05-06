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
      className={`mono inline-flex items-center gap-1.5 border-0 bg-transparent px-1 py-0.5 text-[11px] cursor-pointer transition-colors ${
        on ? "text-ink-soft" : "text-muted-2"
      }`}
    >
      <span
        className="inline-block rounded-sm"
        style={{ width: 14, height: 2, background: on ? color : "var(--muted-2)" }}
      />
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
    <div className="inline-flex gap-2">
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
