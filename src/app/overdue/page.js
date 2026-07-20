"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock, ShieldAlert, IndianRupee, Search, Download, FileSpreadsheet, Send } from "lucide-react";
import AppShell from "@/components/AppShell";
import ChallanTable from "@/components/ChallanTable";
import ChallanDrawer from "@/components/ChallanDrawer";
import { useApp } from "@/context/AppContext";
import { CHALLANS } from "@/data/mockData";
import { overdueBuckets } from "@/lib/stats";
import { DISTRICTS } from "@/data/districts";
import { exportPdf, exportExcel } from "@/lib/export";
import { buildChallanReport } from "@/lib/reportData";
import { formatINR, formatINRShort } from "@/lib/format";

export default function OverduePage() {
  const { t, lang, showToast } = useApp();
  const [district, setDistrict] = useState("ALL");
  const [bucket, setBucket] = useState("ALL"); // ALL | b3to6 | b6plus
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const buckets = useMemo(() => overdueBuckets(CHALLANS), []);

  // Only overdue challans (past the 3-month window).
  const overdueAll = useMemo(
    () => [...buckets.b3to6.items, ...buckets.b6plus.items].sort((a, b) => b.overdueDays - a.overdueDays),
    [buckets]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return overdueAll.filter((c) => {
      if (district !== "ALL" && c.district !== district) return false;
      if (bucket === "b3to6" && c.overdueDays > 90) return false;
      if (bucket === "b6plus" && c.overdueDays <= 90) return false;
      if (q && !`${c.challanNo} ${c.vehicleNo} ${c.ownerName} ${c.mobile}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [overdueAll, district, bucket, search]);

  const recoverable = rows.reduce((s, c) => s + c.amountDue, 0);

  const subtitle = `${district === "ALL" ? "All Districts" : district}  |  Overdue beyond 90 days  |  ${rows.length} cases`;
  const onPdf = () => {
    const { columns, data } = buildChallanReport(rows, lang, { includeOverdue: true });
    exportPdf({
      title: "Overdue Challan Recovery Report",
      subtitle, columns, rows: data,
      summary: [`Overdue cases: ${rows.length}`, `Recoverable: ${formatINRShort(recoverable)}`],
      fileName: `overdue-recovery-${district === "ALL" ? "all" : district}.pdf`,
    });
  };
  const onExcel = () => {
    const { columns, data } = buildChallanReport(rows, lang, { includeOverdue: true });
    exportExcel({ columns, rows: data, fileName: `overdue-recovery-${district === "ALL" ? "all" : district}.xlsx`, sheetName: "Overdue" });
  };

  const bulkRemind = () => showToast(lang === "hi" ? `${rows.length} वाहन मालिकों को रिमाइंडर एसएमएस भेजा गया` : `Reminder SMS queued to ${rows.length} vehicle owners`, "success");

  const selectCls = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0b3d91] focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/20";

  return (
    <AppShell title={t("overdue")}>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t("overdueTitle")}</h2>
          <p className="text-sm text-slate-500">{t("overdueSub")}</p>
        </div>

        {/* Aging buckets */}
        <div className="grid gap-4 md:grid-cols-4">
          <BucketCard icon={Clock} accent="#16a34a" active={false} label={t("bucket0")} count={buckets.within.count} amount={buckets.within.amount} note={lang === "hi" ? "अभी अतिदेय नहीं" : "Not yet overdue"} />
          <BucketCard icon={AlertTriangle} accent="#f59e0b" active={bucket === "b3to6"} onClick={() => setBucket(bucket === "b3to6" ? "ALL" : "b3to6")} label={t("bucket3")} count={buckets.b3to6.count} amount={buckets.b3to6.amount} />
          <BucketCard icon={ShieldAlert} accent="#dc2626" active={bucket === "b6plus"} onClick={() => setBucket(bucket === "b6plus" ? "ALL" : "b6plus")} label={t("bucket6")} count={buckets.b6plus.count} amount={buckets.b6plus.amount} />
          <div className="card flex flex-col justify-center p-4 text-white" style={{ background: "#0b3d91", borderColor: "#0b3d91" }}>
            <div className="flex items-center gap-2 text-sm text-white/80"><IndianRupee size={16} /> {t("totalRecoverable")}</div>
            <div className="mt-1 text-2xl font-bold text-white">{formatINRShort(recoverable)}</div>
            <div className="text-xs text-white/70">{rows.length} {lang === "hi" ? "अतिदेय मामले" : "overdue cases"}</div>
          </div>
        </div>

        {/* Filters + actions */}
        <div className="card flex flex-wrap items-center gap-2.5 p-3 sm:p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className={`${selectCls} w-full pl-9`} />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
            <option value="ALL">{t("allDistricts")}</option>
            {DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name} ({d.rto})</option>)}
          </select>
          <select value={bucket} onChange={(e) => setBucket(e.target.value)} className={selectCls}>
            <option value="ALL">{lang === "hi" ? "सभी अतिदेय" : "All overdue"}</option>
            <option value="b3to6">{t("bucket3")}</option>
            <option value="b6plus">{t("bucket6")}</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={bulkRemind} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d91] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0a2f73]"><Send size={15} /> {lang === "hi" ? "सभी को रिमाइंडर" : "Remind All"}</button>
            <button onClick={onPdf} className="inline-flex items-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]"><Download size={15} /> {t("downloadPdf")}</button>
            <button onClick={onExcel} className="inline-flex items-center gap-1.5 rounded-lg bg-[#138808] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0f6e06]"><FileSpreadsheet size={15} /> {t("downloadExcel")}</button>
          </div>
        </div>

        <ChallanTable
          rows={rows}
          onSelect={setSelected}
          extraColumn={{
            header: t("overdueBy"),
            render: (c) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.overdueDays > 90 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                {c.overdueDays} {t("days")}
              </span>
            ),
          }}
        />
      </div>

      {selected && <ChallanDrawer challan={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function BucketCard({ icon: Icon, accent, label, count, amount, note, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left transition ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg" : "cursor-default"} ${active ? "ring-2" : ""}`}
      style={active ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}` } : {}}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1a`, color: accent }}><Icon size={18} /></span>
        <span className="text-2xl font-bold text-slate-800">{count}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-slate-600">{label}</div>
      <div className="text-xs text-slate-400">{note || formatINR(amount)} {note ? "" : (label ? "due" : "")}</div>
    </button>
  );
}
