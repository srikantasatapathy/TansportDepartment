"use client";

export default function KpiCard({ icon: Icon, label, value, sub, accent = "#0b3d91", trend }) {
  return (
    <div className="card relative overflow-hidden p-4 animate-fadeIn">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1a`, color: accent }}>
          {Icon && <Icon size={22} />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trend.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
