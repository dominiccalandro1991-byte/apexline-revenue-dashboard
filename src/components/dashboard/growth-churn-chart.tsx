import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardMeta, CardTitle } from "@/components/ui/card";
import { formatAxisPct } from "@/lib/revenue/format";
import type { BucketPoint } from "@/lib/revenue/types";
import { ChartTooltip } from "./chart-tooltip";

export function GrowthChurnChart({ data, grain }: { data: BucketPoint[]; grain: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const rateHint =
    grain === "Daily" ? "trailing 7-day rate" : `${grain.toLowerCase()} vs prior ${grain.toLowerCase()}`;

  return (
    <Card className="rounded-2xl p-4 sm:p-5">
      <CardHeader className="mb-2 px-1">
        <div>
          <CardTitle>Growth and churn</CardTitle>
          <CardMeta className="mt-1">{rateHint}</CardMeta>
        </div>
      </CardHeader>
      <div className="h-56 w-full sm:h-64">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                yAxisId="growth"
                tickFormatter={formatAxisPct}
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              />
              <YAxis
                yAxisId="churn"
                orientation="right"
                tickFormatter={formatAxisPct}
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
                content={<ChartTooltip kind="rate" />}
              />
              <Line
                yAxisId="growth"
                type="monotone"
                dataKey="growth"
                name="Growth"
                stroke="var(--color-up)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3, fill: "var(--color-up)", strokeWidth: 0 }}
              />
              <Line
                yAxisId="churn"
                type="monotone"
                dataKey="churn"
                name="Churn"
                stroke="var(--color-down)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3, fill: "var(--color-down)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-md bg-elevated" />
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1">
        <li className="flex items-center gap-2 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-up" />
          Growth
        </li>
        <li className="flex items-center gap-2 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-down" />
          Churn
        </li>
      </ul>
    </Card>
  );
}
