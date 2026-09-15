export const PRODUCT_IDS = [
  "payments",
  "marketplace",
  "cards",
  "banking",
  "crypto",
] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export const REGION_IDS = ["na", "eu", "apac", "latam"] as const;
export type RegionId = (typeof REGION_IDS)[number];

export type DailyRow = {
  date: string;
  revenue: Record<ProductId, number>;
  regional: Record<RegionId, number>;
  newCustomers: number;
  churnedCustomers: number;
  activeCustomers: number;
};

export type DateRangeValue = {
  from: Date;
  to: Date;
};

export type PresetId = "7d" | "30d" | "90d" | "ytd" | "12m" | "custom";

export type BreakdownDim = "product" | "region";

export type Focus =
  | { dim: "all" }
  | { dim: "product"; id: ProductId }
  | { dim: "region"; id: RegionId };

export type BucketPoint = {
  date: string;
  label: string;
  total: number;
  payments: number;
  marketplace: number;
  cards: number;
  banking: number;
  crypto: number;
  na: number;
  eu: number;
  apac: number;
  latam: number;
  newCustomers: number;
  churnedCustomers: number;
  activeCustomers: number;
  growth: number;
  churn: number;
};

export type KpiSet = {
  revenue: number;
  priorRevenue: number;
  growth: number;
  churn: number;
  priorChurn: number;
  customers: number;
  netNew: number;
  arpu: number;
  lostCustomers: number;
};

export type BreakdownRow = {
  id: string;
  label: string;
  revenue: number;
  share: number;
  growth: number;
  priorRevenue: number;
  dailyAvg: number;
};
