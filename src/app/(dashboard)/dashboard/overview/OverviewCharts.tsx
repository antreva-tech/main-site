"use client";

/**
 * Desktop-only chart section for the dashboard overview.
 * Visualizes pipeline by stage, revenue (MRR) by currency, and open tickets by priority.
 * Uses Recharts; hidden on viewports below lg (1024px).
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/** Brand colors for charts (Antreva Tech). */
const CHART_COLORS = {
  primary: "#1C6ED5",
  navy: "#0B132B",
  slate: "#8A8F98",
  green: "#22c55e",
  amber: "#f59e0b",
} as const;

export interface PipelineStageDatum {
  stage: string;
  label: string;
  count: number;
  value: number;
}

export interface RevenueDatum {
  currency: string;
  label: string;
  mrr: number;
}

export interface TicketsDatum {
  priority: string;
  label: string;
  count: number;
}

export interface OverviewChartsProps {
  pipelineByStage: PipelineStageDatum[];
  revenueByCurrency: RevenueDatum[];
  ticketsByPriority: TicketsDatum[];
  /** Stage order for consistent bar order. */
  stageOrder: string[];
}

/**
 * Renders pipeline leads count per stage (bar) and optional value in tooltip.
 */
function PipelineBarChart({
  data,
  stageOrder,
}: {
  data: PipelineStageDatum[];
  stageOrder: string[];
}) {
  const sorted = [...data].sort(
    (a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage)
  );
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.slate }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value: number | undefined, name: string | undefined) => [
            value ?? 0,
            name === "count" ? "Leads" : "Value (DOP)",
          ]}
          labelFormatter={(_, payload) => {
            const p = payload?.[0]?.payload as PipelineStageDatum | undefined;
            return p ? `${p.label} — ${p.value > 0 ? `RD$${p.value.toLocaleString()}` : ""}` : "";
          }}
        />
        <Bar
          dataKey="count"
          fill={CHART_COLORS.primary}
          radius={[4, 4, 0, 0]}
          name="count"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Renders MRR by currency as a pie (DOP / USD).
 */
function RevenuePieChart({ data }: { data: RevenueDatum[] }) {
  const total = data.reduce((s, d) => s + d.mrr, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-[#8A8F98] text-sm">
        No active subscriptions
      </div>
    );
  }
  const colors = [CHART_COLORS.primary, CHART_COLORS.green];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="mrr"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          label={({ name, percent }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value: number | undefined, name: string | undefined, item: { payload?: RevenueDatum }) => {
            const v = value ?? 0;
            const sym = item.payload?.currency === "DOP" ? "RD$" : "$";
            return [`${sym}${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, item.payload?.label ?? name ?? ""];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Renders open tickets count by priority (bar).
 */
function TicketsBarChart({ data }: { data: TicketsDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-[#8A8F98] text-sm">
        No open tickets
      </div>
    );
  }
  const priorityOrder = ["urgent", "high", "medium", "low"];
  const sorted = [...data].sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  );
  const colorMap: Record<string, string> = {
    urgent: "#dc2626",
    high: CHART_COLORS.amber,
    medium: CHART_COLORS.slate,
    low: "#94a3b8",
  };
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.slate }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tickets">
          {sorted.map((entry, i) => (
            <Cell key={entry.priority} fill={colorMap[entry.priority] ?? CHART_COLORS.slate} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Charts section: visible only on lg+ (desktop). Shows pipeline, revenue, tickets.
 */
export function OverviewCharts({
  pipelineByStage,
  revenueByCurrency,
  ticketsByPriority,
  stageOrder,
}: OverviewChartsProps): React.ReactElement {
  return (
    <section
      className="hidden lg:block mt-8 mb-8"
      aria-label="Overview charts"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Pipeline by stage
          </h3>
          <PipelineBarChart data={pipelineByStage} stageOrder={stageOrder} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Revenue (MRR) by currency
          </h3>
          <RevenuePieChart data={revenueByCurrency} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Open tickets by priority
          </h3>
          <TicketsBarChart data={ticketsByPriority} />
        </div>
      </div>
    </section>
  );
}
