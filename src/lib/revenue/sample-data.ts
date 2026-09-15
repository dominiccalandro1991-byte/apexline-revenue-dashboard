import { PRODUCT_IDS, REGION_IDS, type DailyRow, type ProductId, type RegionId } from "./types";
import { DATA_START, TODAY, toISODate } from "./dates";
import { PRODUCT_WEIGHT, REGION_WEIGHT } from "./catalog";
import { addDays } from "date-fns";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoMonthDay(iso: string): { month: number; day: number; dow: number } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return { month: m, day: d, dow: date.getDay() };
}

function eventMultiplier(iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  let x = 1;
  if (y === 2025 && m === 3) x *= 0.91;
  if (y === 2025 && m === 11) x *= 1.18;
  if (y === 2025 && m === 12) x *= 1.12;
  if (y === 2026 && m === 1) x *= 0.94;
  if (y === 2026 && m === 4) x *= 1.09;
  if (y === 2026 && m === 8) x *= 0.97;
  return x;
}

function productDrift(id: ProductId, iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  if (id === "crypto") {
    if (y === 2025 && m === 3) return 0.72;
    if (y === 2026 && m >= 7) return 1.22;
    return 0.96 + (m % 4) * 0.02;
  }
  if (id === "marketplace") {
    if (m === 11 || m === 12) return 1.28;
    return 1;
  }
  if (id === "payments") {
    if (y === 2026 && m >= 3) return 1.08;
    return 1;
  }
  if (id === "banking") {
    if (y === 2026 && m >= 2) return 1.14;
    return 0.95;
  }
  return 1;
}

function buildSeries(): DailyRow[] {
  const rand = mulberry32(20260913);
  const rows: DailyRow[] = [];
  let customers = 48200;
  let cursor = DATA_START;
  let dayIndex = 0;

  while (cursor <= TODAY) {
    const iso = toISODate(cursor);
    const { month, day, dow } = isoMonthDay(iso);
    const t = dayIndex / 600;
    const trend = 380_000 * (1 + 0.92 * t + 0.18 * t * t);
    const weekly = dow === 0 ? 0.7 : dow === 6 ? 0.78 : dow === 5 ? 1.14 : dow === 1 ? 0.94 : 1;
    const monthEnd = day >= 28 ? 1.16 : day <= 2 ? 1.08 : 1;
    const noise = 0.93 + rand() * 0.14;
    const total = trend * weekly * monthEnd * eventMultiplier(iso) * noise;

    const revenue = {} as Record<ProductId, number>;
    let productSum = 0;
    for (const id of PRODUCT_IDS) {
      const wiggle = 0.88 + rand() * 0.24;
      const value = total * PRODUCT_WEIGHT[id] * productDrift(id, iso) * wiggle;
      revenue[id] = value;
      productSum += value;
    }
    const scale = total / productSum;
    for (const id of PRODUCT_IDS) revenue[id] *= scale;

    const regional = {} as Record<RegionId, number>;
    let regionSum = 0;
    for (const id of REGION_IDS) {
      const value = total * REGION_WEIGHT[id] * (0.9 + rand() * 0.2);
      regional[id] = value;
      regionSum += value;
    }
    const rScale = total / regionSum;
    for (const id of REGION_IDS) regional[id] *= rScale;

    const newCustomers = Math.round(92 + t * 70 + (dow === 1 ? 18 : 0) + (rand() - 0.5) * 28);
    const churnRate = 0.00082 + (month === 8 && yIs(iso, 2026) ? 0.00022 : 0) + rand() * 0.00018;
    const churnedCustomers = Math.max(8, Math.round(customers * churnRate));
    customers = Math.max(12_000, customers + newCustomers - churnedCustomers);

    rows.push({
      date: iso,
      revenue,
      regional,
      newCustomers,
      churnedCustomers,
      activeCustomers: customers,
    });

    cursor = addDays(cursor, 1);
    dayIndex += 1;
  }

  return rows;
}

function yIs(iso: string, year: number) {
  return iso.startsWith(String(year));
}

export const DAILY: DailyRow[] = buildSeries();

export const BY_DATE: Map<string, DailyRow> = new Map(DAILY.map((row) => [row.date, row]));
