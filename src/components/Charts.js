"use client";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area,
  LineChart, Line,
} from "recharts";
import { formatINRShort } from "@/lib/format";

export const PALETTE = [
  "#0b3d91", "#ff7722", "#138808", "#8b5cf6", "#0ea5e9",
  "#f59e0b", "#dc2626", "#14b8a6", "#ec4899", "#65a30d",
  "#6366f1", "#f97316", "#06b6d4", "#a855f7", "#84cc16",
];

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 12,
  boxShadow: "0 8px 24px -12px rgba(15,23,42,0.3)",
};

export function DistrictBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="#eef2f7" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis type="category" dataKey="district" width={90} tick={{ fontSize: 11 }} stroke="#64748b" />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="count" name="Challans" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ViolationDonut({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.value}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color || PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: 8, right: 16 }}>
        <defs>
          <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#138808" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#138808" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#eef2f7" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 11 }} stroke="#94a3b8" width={64} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINRShort(v)} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="collected" name="Collected" stroke="#138808" fill="url(#gCollected)" strokeWidth={2} />
        <Area type="monotone" dataKey="pending" name="Pending" stroke="#dc2626" fill="url(#gPending)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VehicleBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="#eef2f7" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="value" name="Challans" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SourceDonut({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[(i + 4) % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
