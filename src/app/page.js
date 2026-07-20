"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight, Activity, FileText, AlertTriangle, MapPin, Languages } from "lucide-react";
import { useApp } from "@/context/AppContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  const { t, lang, loginOfficer, officer, ready } = useApp();
  const router = useRouter();
  const [id, setId] = useState("BR-ENF-1024");
  const [pwd, setPwd] = useState("demo@123");

  useEffect(() => {
    if (ready && officer) router.replace("/dashboard");
  }, [ready, officer, router]);

  const submit = (e) => {
    e.preventDefault();
    loginOfficer({
      id,
      name: "Sanjay Kumar Singh",
      role: { en: "District Transport Officer", hi: "जिला परिवहन अधिकारी" },
      district: "Patna",
    });
    router.push("/dashboard");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="gov-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="tricolor-bar absolute inset-x-0 top-0 h-1.5" />
        {/* subtle decorative rings */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-20 h-96 w-96 rounded-full border border-white/10" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">🛞</div>
            <div>
              <div className="text-lg font-bold">{t("deptName")}</div>
              <div className="text-sm text-white/70">{t("portalName")}</div>
            </div>
          </div>

          <div className="mt-20 max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              <ShieldCheck size={13} /> {lang === "hi" ? "सरकारी प्रवर्तन पोर्टल" : "Government Enforcement Portal"}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-snug">
              {lang === "hi"
                ? "एकीकृत वाहन चालान निगरानी एवं प्रवर्तन डैशबोर्ड"
                : "Unified Vehicle Challan Monitoring & Enforcement Dashboard"}
            </h1>
            <p className="mt-3 text-white/80">
              {lang === "hi"
                ? "सभी 38 जिलों में चालान, वसूली और अतिदेय मामलों की वास्तविक समय निगरानी।"
                : "Real-time oversight of challans, recovery and overdue cases across all 38 districts."}
            </p>
          </div>

          {/* Key capabilities */}
          <div className="mt-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: Activity, en: "Interactive dashboards & live KPIs", hi: "इंटरैक्टिव डैशबोर्ड एवं लाइव KPI" },
              { icon: MapPin, en: "District-wise heatmap & filters", hi: "जिलेवार हीटमैप एवं फ़िल्टर" },
              { icon: FileText, en: "One-click PDF & Excel reports", hi: "एक-क्लिक PDF एवं एक्सेल रिपोर्ट" },
              { icon: AlertTriangle, en: "3-month overdue recovery tracking", hi: "3-माह अतिदेय वसूली ट्रैकिंग" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.en} className="flex items-start gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm leading-snug text-white/90">{lang === "hi" ? f.hi : f.en}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-8">
          <div className="grid grid-cols-4 gap-3">
            {[
              { k: "38", v: lang === "hi" ? "जिले" : "Districts" },
              { k: "540+", v: lang === "hi" ? "चालान" : "Challans" },
              { k: "₹46L+", v: lang === "hi" ? "वसूली" : "Collected" },
              { k: "24×7", v: lang === "hi" ? "निगरानी" : "Monitoring" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl bg-white/10 p-3 text-center">
                <div className="text-xl font-bold">{s.k}</div>
                <div className="text-[11px] text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/60">
            <Languages size={14} />
            {lang === "hi"
              ? "द्विभाषी इंटरफ़ेस (हिंदी / English) • केवल आधिकारिक उपयोग हेतु"
              : "Bilingual interface (English / हिंदी) • For official use only"}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col bg-[#eef2f7]">
        <div className="flex justify-end p-4">
          <div className="rounded-lg bg-[#0b3d91] p-1">
            <LanguageToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <form onSubmit={submit} className="card w-full max-w-md p-8 animate-popIn">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b3d91] text-2xl text-white">🛞</div>
              <div>
                <div className="text-sm font-bold text-slate-800">{t("deptShort")}</div>
                <div className="text-xs text-slate-500">{t("portalName")}</div>
              </div>
            </div>

            <div className="mb-1 flex items-center gap-2 text-[#0b3d91]">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">{t("officerConsole")}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{t("signIn")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("loginHint")}</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">{t("officerId")}</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#0b3d91] focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">{t("password")}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#0b3d91] focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/20"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3d91] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0a2f73]"
            >
              {t("signIn")} <ArrowRight size={16} />
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              {lang === "hi" ? "© बिहार परिवहन विभाग — डेमो प्रोटोटाइप" : "© Bihar Transport Department"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
