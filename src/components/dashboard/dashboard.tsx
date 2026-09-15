import { useMemo, useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PRODUCTS, REGIONS } from "@/lib/revenue/catalog";
import { dayCount, rangeForPreset } from "@/lib/revenue/dates";
import {
  computeBreakdown,
  computeBuckets,
  computeKpis,
  grainLabel,
  sparkChurn,
  sparkGrowth,
  sparkValues,
} from "@/lib/revenue/metrics";
import type { BreakdownDim, DateRangeValue, Focus, PresetId } from "@/lib/revenue/types";
import { AppHeader } from "./app-header";
import { BreakdownTable } from "./breakdown-table";
import { GrowthChurnChart } from "./growth-churn-chart";
import { KpiGrid } from "./kpi-grid";
import { MicroStrip } from "./micro-strip";
import { RevenueChart } from "./revenue-chart";

type SortKey = "label" | "revenue" | "share" | "growth" | "dailyAvg";

export function Dashboard() {
  const [preset, setPreset] = useState<PresetId>("30d");
  const [range, setRange] = useState<DateRangeValue>(() => rangeForPreset("30d"));
  const [focus, setFocus] = useState<Focus>({ dim: "all" });
  const [dim, setDim] = useState<BreakdownDim>("product");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "revenue",
    dir: "desc",
  });

  const kpis = useMemo(() => computeKpis(range, focus), [range, focus]);
  const buckets = useMemo(() => computeBuckets(range), [range]);
  const rows = useMemo(() => computeBreakdown(range, dim), [range, dim]);
  const revenueSpark = useMemo(() => sparkValues(range, focus), [range, focus]);
  const growthSpark = useMemo(() => sparkGrowth(range), [range]);
  const churnSpark = useMemo(() => sparkChurn(range), [range]);
  const grain = grainLabel(range);

  const periodLabel =
    preset === "ytd" ? "YTD window" : preset === "12m" ? "12 months" : `${dayCount(range)} days`;

  const focusLabel =
    focus.dim === "product"
      ? PRODUCTS.find((p) => p.id === focus.id)?.label
      : focus.dim === "region"
        ? REGIONS.find((r) => r.id === focus.id)?.label
        : null;

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "label" ? "asc" : "desc" },
    );
  }

  function handleDim(next: BreakdownDim) {
    setDim(next);
    if (focus.dim !== "all" && focus.dim !== next) setFocus({ dim: "all" });
  }

  return (
    <TooltipProvider>
      <div className="min-h-dvh bg-bg px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
          <AppHeader
            preset={preset}
            range={range}
            onPreset={(id) => {
              setPreset(id);
              setRange(rangeForPreset(id));
            }}
            onCustom={(next) => {
              setPreset("custom");
              setRange(next);
            }}
          />

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              {format(range.from, "d MMM yyyy")} – {format(range.to, "d MMM yyyy")}
            </span>
            <span aria-hidden="true">·</span>
            <span>{grain}</span>
            {focusLabel ? (
              <button
                type="button"
                onClick={() => setFocus({ dim: "all" })}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-elevated px-2.5 text-xs text-fg shadow-[var(--shadow-border)]"
              >
                {focusLabel}
                <X className="size-3.5" />
                <span className="sr-only">Clear filter</span>
              </button>
            ) : null}
          </div>

          <KpiGrid
            kpis={kpis}
            revenueSpark={revenueSpark}
            growthSpark={growthSpark}
            churnSpark={churnSpark}
            periodLabel={periodLabel}
          />
          <MicroStrip kpis={kpis} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RevenueChart data={buckets} grain={grain} focus={focus} />
            </div>
            <div className="lg:col-span-2">
              <GrowthChurnChart data={buckets} grain={grain} />
            </div>
          </div>

          <BreakdownTable
            rows={rows}
            dim={dim}
            onDim={handleDim}
            focus={focus}
            onFocus={setFocus}
            sort={sort}
            onSort={handleSort}
          />

          <footer className="pt-2 text-xs text-subtle">
            Figures are generated sample data for the APEX platform ledger. Balances are not live.
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
