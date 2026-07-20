"use client";

import { useMemo } from "react";
import {
  FileText, IndianRupee, Clock, AlertTriangle, TrendingUp, CalendarDays,
  MapPin, Activity, Car, ShieldAlert, BarChart3, PieChart as PieIcon,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import BiharMap from "@/components/BiharMap";
import StatusBadge from "@/components/StatusBadge";
import { DistrictBar, ViolationDonut, StatusPie, TrendArea, VehicleBar, SourceDonut } from "@/components/Charts";
import { useApp } from "@/context/AppContext";
import { CHALLANS } from "@/data/mockData";
import {
  computeKpis, byDistrict, byViolation, byStatus, byVehicle, bySource, monthlyTrend,
} from "@/lib/stats";
import { formatINRShort, formatINR, formatDate } from "@/lib/format";

export default function DashboardPage() {
  const { t, lang } = useApp();

  const data = useMemo(() => {
    const dist = byDistrict();
    return {
      kpis: computeKpis(),
      district: dist.slice(0, 10),
      districtFull: dist,
      violation: byViolation(CHALLANS, lang),
      status: byStatus(CHALLANS, lang),
      vehicle: byVehicle(),
      source: bySource(),
      trend: monthlyTrend(),
      recent: [...CHALLANS].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 8),
    };
  }, [lang]);

  const k = data.kpis;

  return (
    <AppShell title={t("dashboard")}>
      <div className="space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard icon={FileText} label={t("totalChallans")} value={k.total.toLocaleString("en-IN")} accent="#0b3d91" sub={`${k.todayCount} ${t("todayChallans").toLowerCase()}`} />
          <KpiCard icon={IndianRupee} label={t("totalCollected")} value={formatINRShort(k.collected)} accent="#138808" trend="+8.2%" />
          <KpiCard icon={Clock} label={t("totalPending")} value={formatINRShort(k.pending)} accent="#f59e0b" />
          <KpiCard icon={AlertTriangle} label={t("overdueCount")} value={k.overdueCount.toLocaleString("en-IN")} accent="#dc2626" sub={lang === "hi" ? "3 माह से अधिक" : "past 3 months"} />
          <KpiCard icon={TrendingUp} label={t("recoveryRate")} value={`${k.recoveryRate}%`} accent="#8b5cf6" trend="+3.1%" />
          <KpiCard icon={CalendarDays} label={t("todayChallans")} value={k.todayCount.toLocaleString("en-IN")} accent="#0ea5e9" />
        </div>

        {/* Map + district bar */}
        <div className="grid gap-4 xl:grid-cols-5">
          <ChartCard title={t("districtMap")} icon={MapPin} className="xl:col-span-2" accent="#0b3d91">
            <BiharMap data={data.districtFull} />
          </ChartCard>
          <ChartCard title={t("byDistrict")} icon={BarChart3} className="xl:col-span-3" accent="#ff7722">
            <DistrictBar data={data.district} />
          </ChartCard>
        </div>

        {/* Trend full width */}
        <ChartCard title={t("collectionTrend")} icon={TrendingUp} accent="#138808">
          <TrendArea data={data.trend} />
        </ChartCard>

        {/* Violation + Status + Vehicle */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard title={t("byViolation")} icon={PieIcon} accent="#8b5cf6">
            <ViolationDonut data={data.violation} />
          </ChartCard>
          <ChartCard title={t("byStatus")} icon={Activity} accent="#0ea5e9">
            <StatusPie data={data.status} />
          </ChartCard>
          <ChartCard title={t("byVehicle")} icon={Car} accent="#f59e0b">
            <VehicleBar data={data.vehicle} />
          </ChartCard>
        </div>

        {/* Source + Recent activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard title={t("bySource")} icon={ShieldAlert} accent="#14b8a6">
            <SourceDonut data={data.source} />
          </ChartCard>

          <div className="card p-4 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0b3d91]/10 text-[#0b3d91]"><Activity size={16} /></span>
              <h3 className="text-sm font-bold text-slate-700">{t("recentActivity")}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {data.recent.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-xl">{c.vehicleIcon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{c.vehicleNo}</span>
                      <span className="text-xs text-slate-400">• {c.district}</span>
                    </div>
                    <div className="truncate text-xs text-slate-500">{lang === "hi" ? c.violationHi : c.violationEn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-700">{formatINR(c.amount)}</div>
                    <div className="text-xs text-slate-400">{formatDate(c.issueDate, lang)}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
