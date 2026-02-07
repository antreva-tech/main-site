"use client";

/**
 * Desktop-only chart section for the dashboard overview.
 * Visualizes pipeline by stage, revenue (MRR) by currency, and open tickets by priority.
 * Uses Recharts; hidden on viewports below lg (1024px).
 * Dark mode: chart cards and Recharts axes, grid, tooltip, and labels use dark theme colors.
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
import { useTheme } from "@/contexts/ThemeContext";

/** Brand colors for charts (Antreva Tech). */
const CHART_COLORS = {
  primary: "#1C6ED5",
  navy: "#0B132B",
  slate: "#8A8F98",
  green: "#22c55e",
  amber: "#f59e0b",
} as const;

/** Dark mode chart colors: grid, axes, text, tooltip. */
const DARK_CHART = {
  grid: "#374151",
  axis: "#9ca3af",
  text: "#e5e7eb",
  tooltipBg: "#1f2937",
  tooltipBorder: "#4b5563",
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
  isDark,
}: {
  data: PipelineStageDatum[];
  stageOrder: string[];
  isDark: boolean;
}) {
  const sorted = [...data].sort(
    (a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage)
  );
  const gridStroke = isDark ? DARK_CHART.grid : "#e5e7eb";
  const axisStroke = isDark ? DARK_CHART.axis : CHART_COLORS.slate;
  const tickStyle = { fontSize: 12, fill: isDark ? DARK_CHART.text : undefined };
  const tooltipStyle = isDark
    ? { backgroundColor: DARK_CHART.tooltipBg, border: `1px solid ${DARK_CHART.tooltipBorder}`, borderRadius: "8px", color: DARK_CHART.text }
    : { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" };
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis
          dataKey="label"
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: axisStroke }}
        />
        <YAxis
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
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
function RevenuePieChart({ data, isDark }: { data: RevenueDatum[]; isDark: boolean }) {
  const total = data.reduce((s, d) => s + d.mrr, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-[#8A8F98] dark:text-gray-400 text-sm">
        No active subscriptions
      </div>
    );
  }
  const colors = [CHART_COLORS.primary, CHART_COLORS.green];
  const tooltipStyle = isDark
    ? { backgroundColor: DARK_CHART.tooltipBg, border: `1px solid ${DARK_CHART.tooltipBorder}`, borderRadius: "8px", color: DARK_CHART.text }
    : { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" };
  const labelFill = isDark ? DARK_CHART.text : undefined;
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
          label={({ name, percent, cx, cy, midAngle = 0, outerRadius = 90 }) => {
            const r = Number(outerRadius) + 20;
            const rad = (midAngle * Math.PI) / 180;
            const x = (cx as number) + r * Math.cos(rad);
            const y = (cy as number) + r * Math.sin(rad);
            return (
              <text x={x} y={y} textAnchor="middle" fill={labelFill ?? "#0B132B"}>
                {`${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number | undefined, name: string | undefined, item: { payload?: RevenueDatum }) => {
            const v = value ?? 0;
            const sym = item.payload?.currency === "DOP" ? "RD$" : "$";
            return [`${sym}${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, item.payload?.label ?? name ?? ""];
          }}
        />
        <Legend wrapperStyle={{ color: labelFill ?? undefined }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Renders open tickets count by priority (bar).
 */
function TicketsBarChart({ data, isDark }: { data: TicketsDatum[]; isDark: boolean }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-[#8A8F98] dark:text-gray-400 text-sm">
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
  const gridStroke = isDark ? DARK_CHART.grid : "#e5e7eb";
  const axisStroke = isDark ? DARK_CHART.axis : CHART_COLORS.slate;
  const tickStyle = { fontSize: 12, fill: isDark ? DARK_CHART.text : undefined };
  const tooltipStyle = isDark
    ? { backgroundColor: DARK_CHART.tooltipBg, border: `1px solid ${DARK_CHART.tooltipBorder}`, borderRadius: "8px", color: DARK_CHART.text }
    : { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" };
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sorted} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis
          dataKey="label"
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: axisStroke }}
        />
        <YAxis
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tickets">
          {sorted.map((entry) => (
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <section
      className="hidden lg:block mt-8 mb-8"
      aria-label="Overview charts"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pipeline by stage
          </h3>
          <PipelineBarChart data={pipelineByStage} stageOrder={stageOrder} isDark={isDark} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Revenue (MRR) by currency
          </h3>
          <RevenuePieChart data={revenueByCurrency} isDark={isDark} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Open tickets by priority
          </h3>
          <TicketsBarChart data={ticketsByPriority} isDark={isDark} />
        </div>
      </div>
    </section>
  );
}
