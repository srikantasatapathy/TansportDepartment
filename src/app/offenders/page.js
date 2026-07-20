"use client";

import { useMemo, useState } from "react";
import { Users, Search, Download, Trophy } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/context/AppContext";
import { CHALLANS, getRepeatOffenders } from "@/data/mockData";
import { DISTRICTS } from "@/data/districts";
import { exportPdf } from "@/lib/export";
import { formatINR, formatINRShort } from "@/lib/format";

export default function OffendersPage() {
  const { t, lang } = useApp();
  const [district, setDistrict] = useState("ALL");
  const [search, setSearch] = useState("");

  const all = useMemo(() => getRepeatOffenders(CHALLANS), []);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((o) => {
      if (district !== "ALL" && o.district !== district) return false;
      if (q && !`${o.vehicleNo} ${o.owner}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, district, search]);

  const totalDue = rows.reduce((s, o) => s + o.due, 0);

  const onPdf = () => {
    exportPdf({
      title: "Repeat Offenders Report",
      subtitle: `${district === "ALL" ? "All Districts" : district}  |  ${rows.length} vehicles`,
      columns: [
        { key: "rank", header: "#" },
        { key: "vehicleNo", header: "Vehicle No." },
        { key: "owner", header: "Owner/Driver" },
        { key: "district", header: "District" },
        { key: "count", header: "Challans" },
        { key: "total", header: "Total Fine (Rs)" },
        { key: "due", header: "Due (Rs)" },
      ],
      rows: rows.map((o, i) => ({ ...o, rank: i + 1 })),
      summary: [`Vehicles: ${rows.length}`, `Outstanding: ${formatINRShort(totalDue)}`],
      fileName: `repeat-offenders-${district === "ALL" ? "all" : district}.pdf`,
    });
  };

  const selectCls = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0b3d91] focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/20";
  const medal = ["#f59e0b", "#94a3b8", "#b45309"];

  return (
    <AppShell title={t("offenders")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b3d91]/10 text-[#0b3d91]"><Users size={20} /></span>
            <div><div className="text-lg font-bold text-slate-800">{rows.length}</div><div className="text-xs text-slate-500">{lang === "hi" ? "बार-बार उल्लंघनकर्ता वाहन" : "Repeat offender vehicles"}</div></div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><Trophy size={20} /></span>
            <div><div className="text-lg font-bold text-slate-800">{rows[0]?.count || 0}</div><div className="text-xs text-slate-500">{lang === "hi" ? "अधिकतम चालान (एक वाहन)" : "Most challans (single vehicle)"}</div></div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Download size={20} /></span>
            <div><div className="text-lg font-bold text-slate-800">{formatINRShort(totalDue)}</div><div className="text-xs text-slate-500">{lang === "hi" ? "कुल बकाया" : "Total outstanding"}</div></div>
          </div>
        </div>

        <div className="card flex flex-wrap items-center gap-2.5 p-3 sm:p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={lang === "hi" ? "वाहन / मालिक खोजें…" : "Search vehicle / owner…"} className={`${selectCls} w-full pl-9`} />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
            <option value="ALL">{t("allDistricts")}</option>
            {DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name} ({d.rto})</option>)}
          </select>
          <button onClick={onPdf} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]"><Download size={15} /> {t("downloadPdf")}</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">{t("vehicleNo")}</th>
                  <th className="px-4 py-3 font-semibold">{t("owner")}</th>
                  <th className="px-4 py-3 font-semibold">{t("district")}</th>
                  <th className="px-4 py-3 text-center font-semibold">{lang === "hi" ? "चालान" : "Challans"}</th>
                  <th className="px-4 py-3 text-right font-semibold">{lang === "hi" ? "कुल जुर्माना" : "Total Fine"}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("due")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((o, i) => (
                  <tr key={o.vehicleNo} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: medal[i] || "#cbd5e1" }}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{o.vehicleNo}</td>
                    <td className="px-4 py-3 text-slate-600">{o.owner}</td>
                    <td className="px-4 py-3 text-slate-600">{o.district}</td>
                    <td className="px-4 py-3 text-center"><span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">{o.count}</span></td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{formatINR(o.total)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600">{formatINR(o.due)}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">{t("noRecords")}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
