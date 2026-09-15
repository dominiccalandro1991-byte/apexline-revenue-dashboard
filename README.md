# Apexline

Revenue intelligence dashboard for the **APEX** financial-commerce platform.

Offline sample ledger. No accounts, no database, no live payments. Figures are generated, deterministic, and fully interactive.

Archived 2026-09-15 from the Grok Build session so the full product lives in this repo independently of any chat subscription.

---

## What it is

Apexline is a dark, editorial analytics console:

- Date range presets: **7d / 30d / 90d / YTD / 12m** plus a custom calendar
- KPI cards: **Revenue**, **Growth**, **Churn** (vs the prior equal-length window) with sparklines
- Secondary strip: active customers, net new, daily ARPU, prior-period revenue
- Stacked **revenue trend** by product (Payments, Marketplace, Cards, Banking, Crypto)
- **Growth vs churn** line chart (dual axis; daily grain uses a trailing 7-day rate)
- Sortable **breakdown table** by product or region
- Click a table row to isolate that series in the KPIs and charts
- Hover tooltips on charts and KPI info buttons
- Responsive layout (~390px mobile through desktop)

Sample data runs from **2025-01-01** through **2026-09-13**.

---

## Run it

Requires Node 22+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck   # TypeScript
npm run build       # production (Vercel / Nitro)
npm run preview     # serve the build on :4173
```

No `.env` file. No API keys. All metrics are computed in the browser from [`src/lib/revenue/sample-data.ts`](src/lib/revenue/sample-data.ts).

---

## File tree

```
apexline-revenue-dashboard/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── public/
│   └── favicon.svg
├── docs/
│   ├── PRODUCT.md                          # product spec, KPIs, data model, tokens
│   └── apex-architecture-specification.md  # APEX platform architecture (source spec)
└── src/
    ├── router.tsx
    ├── routeTree.gen.ts                    # TanStack Router generated tree
    ├── styles.css                          # Tailwind v4 tokens
    ├── routes/
    │   ├── __root.tsx
    │   └── index.tsx
    ├── components/
    │   ├── dashboard/                      # all dashboard UI
    │   └── ui/                             # button, card, popover, tooltip, separator
    └── lib/
        ├── utils.ts
        ├── error-component.tsx
        ├── og/site.json
        └── revenue/                        # types, catalog, dates, sample data, metrics, format
```

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 |
| Routing / SSR | TanStack Start + TanStack Router |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/styles.css`) |
| Charts | Recharts |
| Calendar | react-day-picker v9 |
| Dates | date-fns |
| Icons | lucide-react |
| Build | Vite 8 + Nitro (Vercel preset) |

Auth and database are **off**. This is a client-computed dashboard.

---

## Brand

| Token | Value |
| --- | --- |
| Name | Apexline |
| Display type | Instrument Serif (italic wordmark) |
| Body type | IBM Plex Sans |
| Numbers | IBM Plex Mono / tabular-nums |
| Background | `#0A0B0D` |
| Surface | `#12141A` |
| Elevated | `#181B22` |
| Foreground | `#ECEEF2` |
| Accent (steel) | `#C8CCD4` |
| Up | `#7D9A84` |
| Down | `#C47A7A` |

Share-card identity: [`src/lib/og/site.json`](src/lib/og/site.json) (`title: Apexline`, `color: C8CCD4`).

---

## Related spec

The original APEX Universal Fintech / Banking / Crypto / E-commerce architecture (web + iOS + Android) is preserved at:

[`docs/apex-architecture-specification.md`](docs/apex-architecture-specification.md)

Apexline is the **revenue intelligence surface** for that platform: fees by product line (payments, marketplace, cards, banking, crypto) and region, with ledger-style KPIs. It is not the full operating platform.

Product behavior is documented in [`docs/PRODUCT.md`](docs/PRODUCT.md).

---

## Owner

GitHub: [dominiccalandro1991-byte](https://github.com/dominiccalandro1991-byte)

This repository is a new, standalone archive. No other repositories were modified to create it.
