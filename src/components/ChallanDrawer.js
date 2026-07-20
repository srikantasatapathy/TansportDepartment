"use client";

import { X, Car, MapPin, Phone, CalendarDays, ShieldAlert, Send, FileText, Clock, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import StatusBadge from "./StatusBadge";
import { formatINR, formatDate } from "@/lib/format";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-700 break-words">{value}</div>
      </div>
    </div>
  );
}

export default function ChallanDrawer({ challan, onClose }) {
  const { t, lang, showToast } = useApp();
  if (!challan) return null;
  const c = challan;

  const reminder = () => showToast(`${t("reminderSent")} ${c.mobile}`, "success");
  const escalate = () => showToast(`${t("escalated")} ${c.vehicleNo}`, "warn");

  const timeline = [
    { icon: FileText, label: lang === "hi" ? "चालान जारी" : "Challan issued", date: c.issueDate, done: true },
    { icon: Clock, label: lang === "hi" ? "भुगतान देय तिथि" : "Payment due", date: c.dueDate, done: new Date(c.dueDate) < new Date("2026-06-24") },
    c.paidDate
      ? { icon: CheckCircle2, label: lang === "hi" ? "भुगतान प्राप्त" : "Payment received", date: c.paidDate, done: true }
      : { icon: ShieldAlert, label: lang === "hi" ? "बकाया लंबित" : "Outstanding", date: null, done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="animate-slideIn relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="gov-gradient flex items-center justify-between px-5 py-4 text-white">
          <div>
            <div className="text-xs text-white/70">{t("details")}</div>
            <div className="font-mono text-sm font-bold">{c.challanNo}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Vehicle hero */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <div className="text-2xl font-bold text-slate-800">{c.vehicleNo}</div>
              <div className="text-sm text-slate-500">{c.vehicleIcon} {lang === "hi" ? c.vehicleTypeHi : c.vehicleType}</div>
            </div>
            <StatusBadge status={c.status} />
          </div>

          {/* Amount summary */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-xs text-slate-500">{t("amount")}</div>
              <div className="text-base font-bold text-[#0b3d91]">{formatINR(c.amount)}</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-xs text-slate-500">{lang === "hi" ? "भुगतान" : "Paid"}</div>
              <div className="text-base font-bold text-emerald-700">{formatINR(c.amountPaid)}</div>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <div className="text-xs text-slate-500">{t("due")}</div>
              <div className="text-base font-bold text-rose-700">{formatINR(c.amountDue)}</div>
            </div>
          </div>

          {c.isOverdue && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <ShieldAlert size={16} />
              {lang === "hi" ? `${c.overdueDays} दिन से अतिदेय (3 माह की सीमा पार)` : `Overdue by ${c.overdueDays} days (past 3-month limit)`}
            </div>
          )}

          {/* Details */}
          <div className="mt-3 divide-y divide-slate-100">
            <Row icon={ShieldAlert} label={t("violation")} value={`${lang === "hi" ? c.violationHi : c.violationEn} (${c.violationCode})`} />
            <Row icon={Car} label={t("owner")} value={c.ownerName} />
            <Row icon={Phone} label={t("mobile")} value={c.mobile} />
            <Row icon={MapPin} label={t("location")} value={c.location} />
            <Row icon={FileText} label={t("source")} value={lang === "hi" ? c.sourceHi : c.source} />
            <Row icon={ShieldAlert} label={t("officer")} value={c.officer} />
            <Row icon={CalendarDays} label={t("issueDate")} value={formatDate(c.issueDate, lang)} />
            <Row icon={CalendarDays} label={t("dueDate")} value={formatDate(c.dueDate, lang)} />
          </div>

          {/* Timeline */}
          <div className="mt-4">
            <div className="mb-2 text-sm font-bold text-slate-700">{t("paymentHistory")}</div>
            <div className="space-y-3">
              {timeline.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                      <Icon size={15} />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{step.label}</div>
                      <div className="text-xs text-slate-400">{step.date ? formatDate(step.date, lang) : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        {c.status !== "PAID" && (
          <div className="flex gap-2 border-t border-slate-100 p-4">
            <button onClick={reminder} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0b3d91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a2f73]">
              <Send size={15} /> {t("sendReminder")}
            </button>
            <button onClick={escalate} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100">
              <ShieldAlert size={15} /> {t("escalate")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
