"use client";

import { Search, Download, FileSpreadsheet, X, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DISTRICTS } from "@/data/districts";
import { VIOLATIONS, VEHICLE_TYPES, STATUSES } from "@/data/violations";

export default function FilterBar({ filters, setFilters, onPdf, onExcel, options = {} }) {
  const { t, lang } = useApp();
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const {
    showViolation = true, showStatus = true, showVehicle = true, showDates = true,
  } = options;

  const clear = () =>
    setFilters({ search: "", district: "ALL", violation: "ALL", status: "ALL", vehicleType: "ALL", fromDate: "", toDate: "", overdueOnly: filters.overdueOnly });

  const selectCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0b3d91] focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/20";

  return (
    <div className="card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder={t("search")}
            className={`${selectCls} w-full pl-9`}
          />
        </div>

        <select value={filters.district} onChange={(e) => set("district", e.target.value)} className={selectCls}>
          <option value="ALL">{t("allDistricts")}</option>
          {DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>{d.name} ({d.rto})</option>
          ))}
        </select>

        {showViolation && (
          <select value={filters.violation} onChange={(e) => set("violation", e.target.value)} className={selectCls}>
            <option value="ALL">{t("allViolations")}</option>
            {VIOLATIONS.map((v) => (
              <option key={v.code} value={v.code}>{lang === "hi" ? v.hi : v.en}</option>
            ))}
          </select>
        )}

        {showStatus && (
          <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
            <option value="ALL">{t("allStatuses")}</option>
            {Object.values(STATUSES).map((s) => (
              <option key={s.key} value={s.key}>{lang === "hi" ? s.hi : s.en}</option>
            ))}
          </select>
        )}

        {showVehicle && (
          <select value={filters.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} className={selectCls}>
            <option value="ALL">{t("allVehicles")}</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v.en} value={v.en}>{lang === "hi" ? v.hi : v.en}</option>
            ))}
          </select>
        )}

        {showDates && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">{t("fromDate")}</label>
            <input type="date" value={filters.fromDate} onChange={(e) => set("fromDate", e.target.value)} className={selectCls} />
            <label className="text-xs text-slate-500">{t("toDate")}</label>
            <input type="date" value={filters.toDate} onChange={(e) => set("toDate", e.target.value)} className={selectCls} />
          </div>
        )}

        <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <X size={15} /> {t("clearFilters")}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={onPdf} className="inline-flex items-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b91c1c]">
            <Download size={15} /> {t("downloadPdf")}
          </button>
          <button onClick={onExcel} className="inline-flex items-center gap-1.5 rounded-lg bg-[#138808] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0f6e06]">
            <FileSpreadsheet size={15} /> {t("downloadExcel")}
          </button>
        </div>
      </div>
    </div>
  );
}
