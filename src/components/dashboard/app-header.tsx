import { DateRangeBar } from "./date-range-bar";
import type { DateRangeValue, PresetId } from "@/lib/revenue/types";

export function AppHeader({
  preset,
  range,
  onPreset,
  onCustom,
}: {
  preset: PresetId;
  range: DateRangeValue;
  onPreset: (id: Exclude<PresetId, "custom">) => void;
  onCustom: (range: DateRangeValue) => void;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <Mark />
        <div>
          <p className="font-display text-2xl italic leading-none tracking-tight text-fg">Apexline</p>
          <p className="mt-1.5 text-sm text-muted">Revenue intelligence · sample ledger</p>
        </div>
      </div>
      <DateRangeBar preset={preset} range={range} onPreset={onPreset} onCustom={onCustom} />
    </header>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="mt-0.5 size-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--color-elevated)" />
      <path
        fill="var(--color-accent)"
        fillRule="evenodd"
        d="M16 4.5 28 27h-5.4l-2.1-4.6H11.5L9.4 27H4L16 4.5ZM16 10.2l3.5 7.2h-7L16 10.2Z"
      />
    </svg>
  );
}
