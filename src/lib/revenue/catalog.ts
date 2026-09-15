import type { ProductId, RegionId } from "./types";

export const TODAY_ISO = "2026-09-13";
export const DATA_START_ISO = "2025-01-01";

export const PRODUCTS: {
  id: ProductId;
  label: string;
  short: string;
  token: string;
}[] = [
  { id: "payments", label: "Payments", short: "Pay", token: "var(--color-chart-1)" },
  { id: "marketplace", label: "Marketplace", short: "Mkt", token: "var(--color-chart-2)" },
  { id: "cards", label: "Cards", short: "Cards", token: "var(--color-chart-3)" },
  { id: "banking", label: "Banking", short: "Bank", token: "var(--color-chart-4)" },
  { id: "crypto", label: "Crypto", short: "Cryp", token: "var(--color-chart-5)" },
];

export const REGIONS: {
  id: RegionId;
  label: string;
  short: string;
  token: string;
}[] = [
  { id: "na", label: "North America", short: "NA", token: "var(--color-chart-1)" },
  { id: "eu", label: "Europe", short: "EU", token: "var(--color-chart-2)" },
  { id: "apac", label: "Asia Pacific", short: "APAC", token: "var(--color-chart-3)" },
  { id: "latam", label: "Latin America", short: "LATAM", token: "var(--color-chart-4)" },
];

export const PRODUCT_WEIGHT: Record<ProductId, number> = {
  payments: 0.42,
  marketplace: 0.22,
  cards: 0.16,
  banking: 0.12,
  crypto: 0.08,
};

export const REGION_WEIGHT: Record<RegionId, number> = {
  na: 0.48,
  eu: 0.27,
  apac: 0.17,
  latam: 0.08,
};

export const PRESETS: { id: Exclude<import("./types").PresetId, "custom">; label: string }[] = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "ytd", label: "YTD" },
  { id: "12m", label: "12m" },
];
