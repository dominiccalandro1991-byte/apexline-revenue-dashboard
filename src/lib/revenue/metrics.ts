import { format, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { PRODUCTS, REGIONS } from "./catalog";
import { BY_DATE, DAILY } from "./sample-data";
import { DATA_START, dayCount, enumerateDays, fromISODate, priorRange, toISODate } from "./dates";
import type {
  BreakdownDim,
  BreakdownRow,
  BucketPoint,
  DateRangeValue,
  Focus,
  KpiSet,
  ProductId,
  RegionId,
} from "./types";

function rowTotal(date: string, focus: Focus): number {
  const row = BY_DATE.get(date);
  if (!row) return 0;
  if (focus.dim === "product") return row.revenue[focus.id];
  if (focus.dim === "region") return row.regional[focus.id];
  return sumProducts(row.revenue);
}

function sumProducts(revenue: Record<ProductId, number>): number {
  return PRODUCTS.reduce((s, p) => s + revenue[p.id], 0);
}

function sumRange(range: DateRangeValue, focus: Focus): number {
  let total = 0;
  for (const iso of enumerateDays(range.from, range.to)) {
    total += rowTotal(iso, focus);
  }
  return total;
}

function firstRowInRange(range: DateRangeValue) {
  for (const iso of enumerateDays(range.from, range.to)) {
    const row = BY_DATE.get(iso);
    if (row) return row;
  }
  return DAILY[0];
}

function lastRowInRange(range: DateRangeValue) {
  const days = enumerateDays(range.from, range.to);
  for (let i = days.length - 1; i >= 0; i--) {
    const row = BY_DATE.get(days[i]);
    if (row) return row;
  }
  return DAILY[DAILY.length - 1];
}

export function computeKpis(range: DateRangeValue, focus: Focus): KpiSet {
  const prior = priorRange(range);
  const revenue = sumRange(range, focus);
  const priorRevenue = sumRange(prior, focus);
  const growth = priorRevenue === 0 ? 0 : (revenue - priorRevenue) / priorRevenue;

  const days = enumerateDays(range.from, range.to);
  let lost = 0;
  let gained = 0;
  for (const iso of days) {
    const row = BY_DATE.get(iso);
    if (!row) continue;
    lost += row.churnedCustomers;
    gained += row.newCustomers;
  }
  const start = firstRowInRange(range);
  const opening = start.activeCustomers - start.newCustomers + start.churnedCustomers;
  const churn = opening <= 0 ? 0 : lost / opening;

  const priorDays = enumerateDays(prior.from, prior.to);
  let priorLost = 0;
  for (const iso of priorDays) {
    const row = BY_DATE.get(iso);
    if (row) priorLost += row.churnedCustomers;
  }
  const priorStart = firstRowInRange(prior);
  const priorOpening =
    priorStart.activeCustomers - priorStart.newCustomers + priorStart.churnedCustomers;
  const priorChurn = priorOpening <= 0 ? 0 : priorLost / priorOpening;

  const customers = lastRowInRange(range).activeCustomers;
  const daysN = Math.max(1, dayCount(range));
  const arpu = customers === 0 ? 0 : revenue / customers / daysN;

  return {
    revenue,
    priorRevenue,
    growth,
    churn,
    priorChurn,
    customers,
    netNew: gained - lost,
    arpu,
    lostCustomers: lost,
  };
}

export function computeBreakdown(
  range: DateRangeValue,
  dim: BreakdownDim,
): BreakdownRow[] {
  const prior = priorRange(range);
  const catalog = dim === "product" ? PRODUCTS : REGIONS;
  const current: Record<string, number> = {};
  const previous: Record<string, number> = {};
  for (const item of catalog) {
    current[item.id] = 0;
    previous[item.id] = 0;
  }

  for (const iso of enumerateDays(range.from, range.to)) {
    const row = BY_DATE.get(iso);
    if (!row) continue;
    for (const item of catalog) {
      current[item.id] +=
        dim === "product" ? row.revenue[item.id as ProductId] : row.regional[item.id as RegionId];
    }
  }
  for (const iso of enumerateDays(prior.from, prior.to)) {
    const row = BY_DATE.get(iso);
    if (!row) continue;
    for (const item of catalog) {
      previous[item.id] +=
        dim === "product" ? row.revenue[item.id as ProductId] : row.regional[item.id as RegionId];
    }
  }

  const total = Object.values(current).reduce((s, n) => s + n, 0);
  const daysN = Math.max(1, dayCount(range));

  return catalog.map((item) => {
    const revenue = current[item.id];
    const priorRevenue = previous[item.id];
    return {
      id: item.id,
      label: item.label,
      revenue,
      share: total === 0 ? 0 : revenue / total,
      growth: priorRevenue === 0 ? 0 : (revenue - priorRevenue) / priorRevenue,
      priorRevenue,
      dailyAvg: revenue / daysN,
    };
  });
}

type Grain = "day" | "week" | "month";

function grainFor(range: DateRangeValue): Grain {
  const days = dayCount(range);
  if (days <= 45) return "day";
  if (days <= 180) return "week";
  return "month";
}

function bucketKey(iso: string, grain: Grain): string {
  const date = fromISODate(iso);
  if (grain === "day") return iso;
  if (grain === "week") return toISODate(startOfWeek(date, { weekStartsOn: 1 }));
  return toISODate(startOfMonth(date));
}

function bucketLabel(key: string, grain: Grain): string {
  const date = fromISODate(key);
  if (grain === "day") return format(date, "MMM d");
  if (grain === "week") return format(date, "MMM d");
  return format(date, "MMM yyyy");
}

export function grainLabel(range: DateRangeValue): string {
  const g = grainFor(range);
  return g === "day" ? "Daily" : g === "week" ? "Weekly" : "Monthly";
}

type Acc = {
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
  opening: number;
};

function emptyAcc(): Acc {
  return {
    total: 0,
    payments: 0,
    marketplace: 0,
    cards: 0,
    banking: 0,
    crypto: 0,
    na: 0,
    eu: 0,
    apac: 0,
    latam: 0,
    newCustomers: 0,
    churnedCustomers: 0,
    activeCustomers: 0,
    opening: 0,
  };
}

function padFrom(range: DateRangeValue, grain: Grain): Date {
  const raw =
    grain === "day"
      ? subDays(range.from, 1)
      : grain === "week"
        ? subDays(range.from, 7)
        : subMonths(range.from, 1);
  return raw < DATA_START ? DATA_START : raw;
}

export function computeBuckets(range: DateRangeValue): BucketPoint[] {
  const grain = grainFor(range);
  const map = new Map<string, Acc>();
  const startKey = bucketKey(toISODate(range.from), grain);

  for (const iso of enumerateDays(padFrom(range, grain), range.to)) {
    const row = BY_DATE.get(iso);
    if (!row) continue;
    const key = bucketKey(iso, grain);
    const existing = map.get(key) ?? emptyAcc();
    const total = sumProducts(row.revenue);
    existing.total += total;
    existing.payments += row.revenue.payments;
    existing.marketplace += row.revenue.marketplace;
    existing.cards += row.revenue.cards;
    existing.banking += row.revenue.banking;
    existing.crypto += row.revenue.crypto;
    existing.na += row.regional.na;
    existing.eu += row.regional.eu;
    existing.apac += row.regional.apac;
    existing.latam += row.regional.latam;
    existing.newCustomers += row.newCustomers;
    existing.churnedCustomers += row.churnedCustomers;
    existing.activeCustomers = row.activeCustomers;
    if (existing.opening === 0) {
      existing.opening = row.activeCustomers - row.newCustomers + row.churnedCustomers;
    }
    map.set(key, existing);
  }

  const keys = [...map.keys()].sort();
  return keys
    .filter((key) => key >= startKey)
    .map((key) => {
      const b = map.get(key)!;
      const idx = keys.indexOf(key);
      const prev = idx === 0 ? null : map.get(keys[idx - 1]);
      let growth = !prev || prev.total === 0 ? 0 : (b.total - prev.total) / prev.total;
      let churn = b.opening <= 0 ? 0 : b.churnedCustomers / b.opening;
      if (grain === "day") {
        const rates = trailingRates(key, 7);
        growth = rates.growth;
        churn = rates.churn;
      }
      return {
        date: key,
        label: bucketLabel(key, grain),
        total: b.total,
        payments: b.payments,
        marketplace: b.marketplace,
        cards: b.cards,
        banking: b.banking,
        crypto: b.crypto,
        na: b.na,
        eu: b.eu,
        apac: b.apac,
        latam: b.latam,
        newCustomers: b.newCustomers,
        churnedCustomers: b.churnedCustomers,
        activeCustomers: b.activeCustomers,
        growth,
        churn,
      };
    });
}

function trailingRates(iso: string, window: number): { growth: number; churn: number } {
  const end = fromISODate(iso);
  const start = subDays(end, window - 1);
  const priorEnd = subDays(start, 1);
  const priorStart = subDays(priorEnd, window - 1);

  let revenue = 0;
  let priorRevenue = 0;
  let lost = 0;
  let opening = 0;

  for (const day of enumerateDays(start, end)) {
    const row = BY_DATE.get(day);
    if (!row) continue;
    revenue += sumProducts(row.revenue);
    lost += row.churnedCustomers;
    if (opening === 0) {
      opening = row.activeCustomers - row.newCustomers + row.churnedCustomers;
    }
  }
  for (const day of enumerateDays(priorStart, priorEnd)) {
    const row = BY_DATE.get(day);
    if (!row) continue;
    priorRevenue += sumProducts(row.revenue);
  }

  return {
    growth: priorRevenue === 0 ? 0 : (revenue - priorRevenue) / priorRevenue,
    churn: opening <= 0 ? 0 : lost / opening,
  };
}

export function sparkValues(range: DateRangeValue, focus: Focus): number[] {
  const buckets = computeBuckets(range);
  if (focus.dim === "product") return buckets.map((b) => b[focus.id]);
  if (focus.dim === "region") return buckets.map((b) => b[focus.id]);
  return buckets.map((b) => b.total);
}

export function sparkChurn(range: DateRangeValue): number[] {
  return computeBuckets(range).map((b) => b.churn);
}

export function sparkGrowth(range: DateRangeValue): number[] {
  return computeBuckets(range).map((b) => b.growth);
}
