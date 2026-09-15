# Apexline product specification

Complete behavior of the revenue dashboard as shipped 2026-09-15.

## Frozen clock

All “today” calculations use a frozen calendar date so SSR and the client never disagree:

- `TODAY` = **2026-09-13**
- `DATA_START` = **2025-01-01**

Defined in `src/lib/revenue/catalog.ts` and `src/lib/revenue/dates.ts`.

## Date ranges

Presets (inclusive, ending on TODAY):

| Id | Window |
| --- | --- |
| `7d` | last 7 calendar days |
| `30d` | last 30 calendar days (default) |
| `90d` | last 90 calendar days |
| `ytd` | start of year → TODAY |
| `12m` | rolling 12 months |
| `custom` | user-picked range via DayPicker (disabled outside `[DATA_START, TODAY]`) |

Comparison window = the immediately previous period of the same length, clamped to `DATA_START`.

Chart grain auto-selects:

| Range length | Grain |
| --- | --- |
| ≤ 45 days | daily |
| ≤ 180 days | weekly (Monday start) |
| longer | monthly |

Daily **growth/churn** series uses a trailing 7-day rate so weekend seasonality does not dominate the chart. Weekly/monthly series compare bucket vs prior bucket.

## KPIs

Computed in `src/lib/revenue/metrics.ts` → `computeKpis(range, focus)`.

| Card | Definition |
| --- | --- |
| **Revenue** | Sum of platform fee revenue in the selected window (optionally filtered to one product or region). |
| **Growth** | `(current − prior) / prior` for that same revenue series. |
| **Churn** | Customers lost in the window ÷ opening customer base. Stays **platform-level** even when a product/region is isolated. |
| Active customers | End-of-window customer count. |
| Net new | `newCustomers − churnedCustomers` in the window. |
| Daily ARPU | `revenue / customers / dayCount`. |
| Prior period | Revenue of the comparison window. |

## Focus / isolation

`Focus` is one of:

- `{ dim: "all" }` (default)
- `{ dim: "product", id }`
- `{ dim: "region", id }`

Clicking a breakdown row sets focus. Clicking it again, switching dimension, or dismissing the chip returns to `all`. Isolated focus filters KPI revenue/growth, the stacked area (that series only), and the sparkline.

## Products (fee mix)

| Id | Label | Base weight |
| --- | --- | --- |
| `payments` | Payments | 42% |
| `marketplace` | Marketplace | 22% |
| `cards` | Cards | 16% |
| `banking` | Banking | 12% |
| `crypto` | Crypto | 8% |

## Regions

| Id | Label | Base weight |
| --- | --- | --- |
| `na` | North America | 48% |
| `eu` | Europe | 27% |
| `apac` | Asia Pacific | 17% |
| `latam` | Latin America | 8% |

Product totals and region totals are generated independently, each scaled to the same daily total.

## Sample ledger

`src/lib/revenue/sample-data.ts` builds one row per day with a seeded PRNG (`mulberry32(20260913)`), so regenerating the module always yields the same numbers.

Each `DailyRow`:

- `date` — `YYYY-MM-DD`
- `revenue` — per-product fees
- `regional` — per-region split of the same total
- `newCustomers` / `churnedCustomers` / `activeCustomers`

Shape of the generator:

- Base daily fees grow from ~$380k (Jan 2025) with a quadratic trend
- Weekly seasonality (Sun/Sat lower, Friday higher)
- Month-end lift
- Event multipliers (e.g. 2025-03 dip, 2025-11/12 holiday spike, 2026-01 dip, 2026-04 lift, 2026-08 stall)
- Product-specific drift (crypto March 2025 drawdown, marketplace holiday spike, banking 2026 lift)
- Customer base starts at 48,200 and compounds with noisy daily new/churned counts

This is **not** live financial data and is labeled in the UI as a sample ledger.

## UI map

| File | Role |
| --- | --- |
| `src/components/dashboard/dashboard.tsx` | State: preset, range, focus, dimension, sort |
| `src/components/dashboard/app-header.tsx` | Wordmark + date range bar |
| `src/components/dashboard/date-range-bar.tsx` | Preset tabs + custom DayPicker popover |
| `src/components/dashboard/kpi-grid.tsx` | Revenue / growth / churn cards |
| `src/components/dashboard/micro-strip.tsx` | Secondary metrics |
| `src/components/dashboard/revenue-chart.tsx` | Stacked area (Recharts) |
| `src/components/dashboard/growth-churn-chart.tsx` | Dual-axis lines |
| `src/components/dashboard/breakdown-table.tsx` | Product / region table |
| `src/components/dashboard/chart-tooltip.tsx` | Chart hover card |
| `src/components/dashboard/sparkline.tsx` | KPI sparkline SVG |

## Money formatting

`src/lib/revenue/format.ts` is **deterministic** (no `Intl` compact notation) so SSR and the client never hydrate-mismatch:

- Full: `$22,354,577`
- Compact: `$22.1M`, `$316.2K`
- Percents always one decimal: `+1.0%`, `3.1%`, `9.0%`
- Near-zero deltas render `0.0%` (no `−0.0%`)

## Interactions to verify

1. Default 30d revenue matches the sum of product rows.
2. 7d / 90d / YTD / 12m change the headline number and chart grain.
3. Custom range: two clicks on the calendar commit `from`+`to`; Reset returns to 30d.
4. Click Payments → KPI equals that row; stacked area shows Payments only; chip clears focus.
5. Region tab shows NA / EU / APAC / LATAM sharing 100%.
6. Column headers sort; second click reverses.
7. Chart hover shows per-series values and a total on stacked revenue.

## Out of scope (intentionally)

- Sign-in, KYC, live ledger, webhooks, PCI
- Persisted user preferences
- Real market data or bank feeds
- iOS / Android native shells (see the APEX architecture spec)

Those belong to the platform spec in `docs/apex-architecture-specification.md`, not this dashboard.
