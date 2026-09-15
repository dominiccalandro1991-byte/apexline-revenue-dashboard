import {
  addDays,
  differenceInCalendarDays,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { DATA_START_ISO, TODAY_ISO } from "./catalog";
import type { DateRangeValue, PresetId } from "./types";

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const TODAY = fromISODate(TODAY_ISO);
export const DATA_START = fromISODate(DATA_START_ISO);

export function clampDate(date: Date): Date {
  if (date < DATA_START) return DATA_START;
  if (date > TODAY) return TODAY;
  return date;
}

export function rangeForPreset(
  id: Exclude<PresetId, "custom">,
  today: Date = TODAY,
): DateRangeValue {
  const to = today;
  switch (id) {
    case "7d":
      return { from: subDays(to, 6), to };
    case "30d":
      return { from: subDays(to, 29), to };
    case "90d":
      return { from: subDays(to, 89), to };
    case "ytd":
      return { from: startOfYear(to), to };
    case "12m":
      return { from: addDays(subMonths(to, 12), 1), to };
  }
}

export function priorRange(range: DateRangeValue): DateRangeValue {
  const days = differenceInCalendarDays(range.to, range.from) + 1;
  const to = subDays(range.from, 1);
  const from = subDays(to, days - 1);
  return { from: clampDate(from), to: clampDate(to) };
}

export function enumerateDays(from: Date, to: Date): string[] {
  const start = fromISODate(toISODate(from));
  const end = fromISODate(toISODate(to));
  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(toISODate(d));
  }
  return days;
}

export function dayCount(range: DateRangeValue): number {
  return differenceInCalendarDays(range.to, range.from) + 1;
}
