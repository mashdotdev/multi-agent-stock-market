"use client";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

type Props = {
  active?: string;
  onChange?: (tf: string) => void;
};

export function TimeframeBar({ active = "1M", onChange }: Props) {
  return (
    <div className="inline-flex border border-hairline rounded-lg overflow-hidden">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange?.(tf)}
          className={`mono border-0 border-r border-hairline px-2.5 py-[5px] text-[11px] font-medium cursor-pointer transition-colors ${
            tf === active
              ? "bg-ink text-surface"
              : "bg-transparent text-ink-soft hover:bg-surface-2"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
