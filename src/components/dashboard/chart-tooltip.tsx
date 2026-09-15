import { formatMoney, formatPercent } from "@/lib/revenue/format";
import { cn } from "@/lib/utils";

type Item = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
};

export function ChartTooltip({
  active,
  label,
  payload,
  kind = "money",
  total,
}: {
  active?: boolean;
  label?: string;
  payload?: Item[];
  kind?: "money" | "rate";
  total?: number;
}) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value !== undefined && p.dataKey !== "total");
  const shown = rows.length ? rows : payload;
  const sum =
    total ??
    shown.reduce((s, p) => s + (typeof p.value === "number" ? p.value : 0), 0);

  return (
    <div className="min-w-[168px] rounded-md bg-elevated px-3 py-2.5 shadow-[var(--shadow-border),var(--shadow-pop)]">
      <p className="mb-2 text-xs text-muted">{label}</p>
      <ul className="space-y-1">
        {shown.map((item) => (
          <li key={String(item.dataKey ?? item.name)} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-2 text-muted">
              <span
                className="size-1.5 rounded-full"
                style={{ background: item.color ?? "var(--color-accent)" }}
              />
              {item.name}
            </span>
            <span className="tabular text-fg">
              {kind === "rate" ? formatPercent(Number(item.value ?? 0)) : formatMoney(Number(item.value ?? 0), "compact")}
            </span>
          </li>
        ))}
      </ul>
      {kind === "money" && shown.length > 1 ? (
        <p className={cn("mt-2 flex justify-between border-t border-border pt-2 text-xs")}>
          <span className="text-muted">Total</span>
          <span className="tabular font-medium text-fg">{formatMoney(sum, "compact")}</span>
        </p>
      ) : null}
    </div>
  );
}
