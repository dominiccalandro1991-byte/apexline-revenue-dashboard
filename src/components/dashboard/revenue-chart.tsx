import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardMeta, CardTitle } from "@/components/ui/card";
import { PRODUCTS, REGIONS } from "@/lib/revenue/catalog";
import { formatAxisMoney } from "@/lib/revenue/format";
import type { BucketPoint, Focus } from "@/lib/revenue/types";
import { ChartTooltip } from "./chart-tooltip";

export function RevenueChart({
  data,
  grain,
  focus,
}: {
  data: BucketPoint[];
  grain: string;
  focus: Focus;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const series =
    focus.dim === "region"
      ? REGIONS
      : PRODUCTS;

  return (
    <Card className="rounded-2xl p-4 sm:p-5">
      <CardHeader className="mb-2 px-1">
        <div>
          <CardTitle>Revenue trend</CardTitle>
          <CardMeta className="mt-1">
            {grain} · {focus.dim === "all" ? "all products" : focus.dim === "product" ? PRODUCTS.find((p) => p.id === focus.id)?.label : REGIONS.find((r) => r.id === focus.id)?.label}
          </CardMeta>
        </div>
      </CardHeader>
      <div className="h-64 w-full sm:h-72">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              />
              <YAxis
                tickFormatter={formatAxisMoney}
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
                content={<ChartTooltip kind="money" />}
              />
              {series.map((item) => {
                const faded =
                  (focus.dim === "product" && item.id !== focus.id) ||
                  (focus.dim === "region" && item.id !== focus.id);
                const isolated =
                  (focus.dim === "product" && item.id === focus.id) ||
                  (focus.dim === "region" && item.id === focus.id);
                return (
                  <Area
                    key={item.id}
                    type="monotone"
                    dataKey={item.id}
                    name={item.label}
                    stackId={focus.dim === "all" ? "rev" : isolated ? "rev" : "other"}
                    stroke={item.token}
                    fill={item.token}
                    fillOpacity={faded ? 0.08 : focus.dim === "all" ? 0.85 : 0.55}
                    strokeOpacity={faded ? 0.2 : 1}
                    strokeWidth={isolated ? 2 : 1.25}
                    hide={focus.dim !== "all" && faded}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-md bg-elevated" />
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1">
        {series.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-xs text-muted">
            <span className="size-1.5 rounded-full" style={{ background: item.token }} />
            {item.short}
          </li>
        ))}
      </ul>
    </Card>
  );
}
