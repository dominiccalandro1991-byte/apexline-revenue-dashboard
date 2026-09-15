const full = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function trim1(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function pct1(value: number): string {
  return `${(Math.abs(value) * 100).toFixed(1)}%`;
}

export function formatMoney(value: number, mode: "full" | "compact" = "full"): string {
  if (!Number.isFinite(value)) return "—";
  if (mode === "full") return full.format(value);
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}$${trim1(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trim1(abs / 1_000)}K`;
  return `${sign}$${trim1(abs)}`;
}

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return count.format(Math.round(value));
}

export function formatDelta(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 0.0005) return "0.0%";
  const sign = value > 0 ? "+" : "−";
  return `${sign}${pct1(value)}`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return pct1(value);
}

export function formatAxisMoney(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${trim1(value / 1_000_000)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function formatAxisPct(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
