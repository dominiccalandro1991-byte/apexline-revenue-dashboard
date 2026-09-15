import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { formatCount, formatDelta, formatMoney, formatPercent } from "@/lib/revenue/format";
import type { KpiSet } from "@/lib/revenue/types";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

function toneOf(value: number, invert = false): "up" | "down" | "neutral" {
  if (Math.abs(value) < 0.0005) return "neutral";
  const positive = value > 0;
  if (invert) return positive ? "down" : "up";
  return positive ? "up" : "down";
}

function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  const tone = toneOf(value, invert);
  return (
    <span
      className={cn(
        "tabular text-sm font-medium",
        tone === "up" && "text-up",
        tone === "down" && "text-down",
        tone === "neutral" && "text-muted",
      )}
    >
      {formatDelta(value)}
    </span>
  );
}

export function KpiGrid({
  kpis,
  revenueSpark,
  growthSpark,
  churnSpark,
  periodLabel,
}: {
  kpis: KpiSet;
  revenueSpark: number[];
  growthSpark: number[];
  churnSpark: number[];
  periodLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <Card className="stagger-item rounded-2xl p-5 md:col-span-2 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-muted">
              Revenue
              <Tooltip content={`Gross platform fees in the selected window. Compared with the previous ${periodLabel}.`}>
                <button type="button" className="inline-flex size-8 items-center justify-center rounded-sm text-subtle hover:text-fg" aria-label="About revenue">
                  <Info className="size-3.5" />
                </button>
              </Tooltip>
            </div>
            <p className="mt-2 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl tabular">
              {formatMoney(kpis.revenue)}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Delta value={kpis.growth} />
              <span>vs prior {periodLabel}</span>
            </p>
          </div>
          <Sparkline values={revenueSpark} tone={toneOf(kpis.growth)} className="mt-2 hidden sm:block" />
        </div>
      </Card>

      <Card className="stagger-item rounded-2xl p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Growth
            <Tooltip content="Period-over-period change in revenue versus an equal-length window immediately before this range.">
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-sm text-subtle hover:text-fg" aria-label="About growth">
                <Info className="size-3.5" />
              </button>
            </Tooltip>
          </div>
          <Sparkline values={growthSpark} tone={toneOf(kpis.growth)} />
        </div>
        <p className="mt-3 font-display text-3xl leading-none tracking-tight tabular">
          {formatDelta(kpis.growth)}
        </p>
        <p className="mt-3 text-sm text-muted">
          Prior {formatMoney(kpis.priorRevenue, "compact")}
        </p>
      </Card>

      <Card className="stagger-item rounded-2xl p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Churn
            <Tooltip content="Customers lost in the window, divided by the opening customer base. Lower is better.">
              <button type="button" className="inline-flex size-8 items-center justify-center rounded-sm text-subtle hover:text-fg" aria-label="About churn">
                <Info className="size-3.5" />
              </button>
            </Tooltip>
          </div>
          <Sparkline values={churnSpark} tone={toneOf(kpis.churn - kpis.priorChurn, true)} />
        </div>
        <p className="mt-3 font-display text-3xl leading-none tracking-tight tabular">
          {formatPercent(kpis.churn)}
        </p>
        <p className="mt-3 text-sm text-muted">
          {formatCount(kpis.lostCustomers)} lost · prior {formatPercent(kpis.priorChurn)}
        </p>
      </Card>
    </div>
  );
}
