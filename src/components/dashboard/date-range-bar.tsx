import { useState } from "react";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRESETS } from "@/lib/revenue/catalog";
import { DATA_START, TODAY, clampDate } from "@/lib/revenue/dates";
import type { DateRangeValue, PresetId } from "@/lib/revenue/types";
import { cn } from "@/lib/utils";

export function DateRangeBar({
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const selected: DateRange = draft ?? { from: range.from, to: range.to };
  const displayFrom = selected.from ?? range.from;
  const displayTo = selected.to ?? selected.from ?? range.to;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        role="tablist"
        aria-label="Date range"
        className="flex flex-wrap items-center rounded-md bg-surface p-1 shadow-[var(--shadow-border)]"
      >
        {PRESETS.map((item) => {
          const active = preset === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onPreset(item.id)}
              className={cn(
                "h-10 min-h-10 min-w-11 rounded-sm px-3 text-sm font-medium transition-[background-color,color] duration-150",
                active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft(undefined);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant={preset === "custom" ? "primary" : "outline"}
            className="gap-2"
            aria-label="Custom date range"
          >
            <CalendarRange className="size-4" />
            <span className="tabular hidden sm:inline">
              {format(range.from, "MMM d")} – {format(range.to, "MMM d, yyyy")}
            </span>
            <span className="sm:hidden">Custom</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-3">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={(next) => {
              setDraft(next);
              if (!next?.from || !next.to) return;
              const from = clampDate(next.from);
              const to = clampDate(next.to);
              const ordered = from <= to ? { from, to } : { from: to, to: from };
              onCustom(ordered);
            }}
            disabled={{ before: DATA_START, after: TODAY }}
            defaultMonth={range.to}
            numberOfMonths={1}
            className="rdp-root"
          />
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted">
              {format(displayFrom, "d MMM yyyy")} – {format(displayTo, "d MMM yyyy")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 min-h-10"
              onClick={() => {
                setDraft(undefined);
                onPreset("30d");
                setOpen(false);
              }}
            >
              Reset
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
