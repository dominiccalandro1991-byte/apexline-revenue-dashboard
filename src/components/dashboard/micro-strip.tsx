import { formatCount, formatMoney } from "@/lib/revenue/format";
import type { KpiSet } from "@/lib/revenue/types";

export function MicroStrip({ kpis }: { kpis: KpiSet }) {
  const items = [
    { label: "Active customers", value: formatCount(kpis.customers) },
    { label: "Net new", value: `${kpis.netNew >= 0 ? "+" : ""}${formatCount(kpis.netNew)}` },
    { label: "Daily ARPU", value: formatMoney(kpis.arpu, "compact") },
    { label: "Prior period", value: formatMoney(kpis.priorRevenue, "compact") },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <li key={item.label} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">{item.label}</p>
          <p className="mt-1 font-medium tabular text-fg">{item.value}</p>
        </li>
      ))}
    </ul>
  );
}
