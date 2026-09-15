import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Card, CardHeader, CardMeta, CardTitle } from "@/components/ui/card";
import { PRODUCTS, REGIONS } from "@/lib/revenue/catalog";
import { formatDelta, formatMoney, formatPercent } from "@/lib/revenue/format";
import type { BreakdownDim, BreakdownRow, Focus, ProductId, RegionId } from "@/lib/revenue/types";
import { cn } from "@/lib/utils";

type SortKey = "label" | "revenue" | "share" | "growth" | "dailyAvg";

export function BreakdownTable({
  rows,
  dim,
  onDim,
  focus,
  onFocus,
  sort,
  onSort,
}: {
  rows: BreakdownRow[];
  dim: BreakdownDim;
  onDim: (dim: BreakdownDim) => void;
  focus: Focus;
  onFocus: (focus: Focus) => void;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
}) {
  const sorted = [...rows].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "label") return a.label.localeCompare(b.label) * dir;
    return (a[sort.key] - b[sort.key]) * dir;
  });

  const toggle = (id: string) => {
    if (focus.dim === dim && "id" in focus && focus.id === id) {
      onFocus({ dim: "all" });
      return;
    }
    if (dim === "product") onFocus({ dim: "product", id: id as ProductId });
    else onFocus({ dim: "region", id: id as RegionId });
  };

  return (
    <Card className="rounded-2xl p-0">
      <CardHeader className="mb-0 items-center px-5 pt-5">
        <div>
          <CardTitle>Breakdown</CardTitle>
          <CardMeta className="mt-1">Tap a row to isolate it in the charts</CardMeta>
        </div>
        <div
          role="tablist"
          aria-label="Breakdown dimension"
          className="flex rounded-sm bg-elevated p-1 shadow-[var(--shadow-border)]"
        >
          {(["product", "region"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={dim === item}
              onClick={() => onDim(item)}
              className={cn(
                "h-10 min-h-10 rounded-xs px-3 text-sm font-medium capitalize transition-[background-color,color] duration-150",
                dim === item ? "bg-surface text-fg" : "text-muted hover:text-fg",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-y border-border text-xs font-medium uppercase tracking-[0.06em] text-subtle">
              <Th label={dim === "product" ? "Product" : "Region"} k="label" sort={sort} onSort={onSort} />
              <Th label="Revenue" k="revenue" sort={sort} onSort={onSort} numeric />
              <Th label="Share" k="share" sort={sort} onSort={onSort} numeric />
              <Th label="Growth" k="growth" sort={sort} onSort={onSort} numeric />
              <Th label="Daily avg" k="dailyAvg" sort={sort} onSort={onSort} numeric />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const token =
                dim === "product"
                  ? PRODUCTS.find((p) => p.id === row.id)?.token
                  : REGIONS.find((r) => r.id === row.id)?.token;
              const active = focus.dim === dim && "id" in focus && focus.id === row.id;
              const growthUp = row.growth >= 0;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-b-0 transition-colors duration-150",
                    active ? "bg-elevated" : "hover:bg-elevated/60",
                  )}
                  onClick={() => toggle(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(row.id);
                    }
                  }}
                  tabIndex={0}
                  aria-selected={active}
                >
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5 font-medium text-fg">
                      <span className="size-2 rounded-full" style={{ background: token }} />
                      {row.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular text-fg">{formatMoney(row.revenue)}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center justify-end gap-2">
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-elevated">
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: `${Math.min(100, row.share * 100)}%` }}
                        />
                      </span>
                      <span className="tabular text-muted">{formatPercent(row.share)}</span>
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3.5 text-right tabular",
                      growthUp ? "text-up" : "text-down",
                    )}
                  >
                    {formatDelta(row.growth)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular text-muted">
                    {formatMoney(row.dailyAvg, "compact")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({
  label,
  k,
  sort,
  onSort,
  numeric,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  numeric?: boolean;
}) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-5 py-2.5 font-medium", numeric && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex h-8 min-h-8 items-center gap-1.5 text-xs uppercase tracking-[0.06em]",
          numeric && "ml-auto",
          active ? "text-fg" : "text-subtle hover:text-muted",
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </th>
  );
}
