"use client";

import { useState } from "react";
import { Eye, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import StatusBadge from "./StatusBadge";
import { formatINR, formatDate } from "@/lib/format";

const PAGE_SIZE = 12;

export default function ChallanTable({ rows, onSelect, extraColumn }) {
  const { t, lang } = useApp();
  const [page, setPage] = useState(0);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (!rows.length) {
    return <div className="card p-10 text-center text-sm text-slate-400">{t("noRecords")}</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("challanNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("vehicleNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("owner")}</th>
              <th className="px-4 py-3 font-semibold">{t("district")}</th>
              <th className="px-4 py-3 font-semibold">{t("violation")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("amount")}</th>
              <th className="px-4 py-3 font-semibold">{t("status")}</th>
              {extraColumn && <th className="px-4 py-3 font-semibold">{extraColumn.header}</th>}
              <th className="px-4 py-3 font-semibold">{t("issueDate")}</th>
              <th className="px-4 py-3 text-center font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.challanNo}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{c.vehicleNo}</td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{c.ownerName}</div>
                  <div className="text-xs text-slate-400">{c.mobile}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.district}</td>
                <td className="px-4 py-3">
                  <span className="text-slate-700">{lang === "hi" ? c.violationHi : c.violationEn}</span>
                  <div className="text-xs text-slate-400">{c.violationCode}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatINR(c.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                {extraColumn && <td className="px-4 py-3">{extraColumn.render(c)}</td>}
                <td className="px-4 py-3 text-slate-600">{formatDate(c.issueDate, lang)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onSelect(c)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0b3d91]/10 px-2.5 py-1.5 text-xs font-semibold text-[#0b3d91] hover:bg-[#0b3d91]/20"
                  >
                    <Eye size={14} /> {t("viewDetails")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
        <span>
          {t("showing")} {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, rows.length)} {t("of")} {rows.length} {t("records")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:enabled:bg-slate-50"
          >
            ‹
          </button>
          <span className="px-2 text-xs">{safePage + 1} / {pages}</span>
          <button
            onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
            disabled={safePage >= pages - 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:enabled:bg-slate-50"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
