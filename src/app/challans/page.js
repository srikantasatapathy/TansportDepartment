"use client";

import { useMemo, useState } from "react";
import { FileText, IndianRupee, Clock, AlertTriangle } from "lucide-react";
import AppShell from "@/components/AppShell";
import FilterBar from "@/components/FilterBar";
import ChallanTable from "@/components/ChallanTable";
import ChallanDrawer from "@/components/ChallanDrawer";
import { useApp } from "@/context/AppContext";
import { CHALLANS } from "@/data/mockData";
import { applyFilters, computeKpis } from "@/lib/stats";
import { exportPdf, exportExcel } from "@/lib/export";
import { buildChallanReport } from "@/lib/reportData";
import { formatINRShort } from "@/lib/format";

const INITIAL = { search: "", district: "ALL", violation: "ALL", status: "ALL", vehicleType: "ALL", fromDate: "", toDate: "", overdueOnly: false };

export default function ChallansPage() {
  const { t, lang } = useApp();
  const [filters, setFilters] = useState(INITIAL);
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => applyFilters(CHALLANS, filters), [filters]);
  const k = useMemo(() => computeKpis(rows), [rows]);

  const districtLabel = filters.district === "ALL" ? "All Districts" : filters.district;
  const subtitle = `District: ${districtLabel}  |  ${rows.length} records`;

  const onPdf = () => {
    const { columns, data } = buildChallanReport(rows, lang);
    exportPdf({
      title: "Vehicle Challan Report",
      subtitle,
      columns, rows: data,
      summary: [`Total: ${k.total}`, `Collected: ${formatINRShort(k.collected)}`, `Pending: ${formatINRShort(k.pending)}`, `Overdue: ${k.overdueCount}`],
      fileName: `challan-report-${filters.district === "ALL" ? "all" : filters.district}.pdf`,
    });
  };
  const onExcel = () => {
    const { columns, data } = buildChallanReport(rows, lang);
    exportExcel({ columns, rows: data, fileName: `challan-report-${filters.district === "ALL" ? "all" : filters.district}.xlsx` });
  };

  return (
    <AppShell title={t("challans")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={FileText} label={t("totalChallans")} value={k.total.toLocaleString("en-IN")} accent="#0b3d91" />
          <Stat icon={IndianRupee} label={t("totalCollected")} value={formatINRShort(k.collected)} accent="#138808" />
          <Stat icon={Clock} label={t("totalPending")} value={formatINRShort(k.pending)} accent="#f59e0b" />
          <Stat icon={AlertTriangle} label={t("overdueCount")} value={k.overdueCount.toLocaleString("en-IN")} accent="#dc2626" />
        </div>

        <FilterBar filters={filters} setFilters={setFilters} onPdf={onPdf} onExcel={onExcel} />

        <ChallanTable rows={rows} onSelect={setSelected} />
      </div>

      {selected && <ChallanDrawer challan={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1a`, color: accent }}>
        <Icon size={20} />
      </span>
      <div>
        <div className="text-lg font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
