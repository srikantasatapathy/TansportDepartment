"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import LanguageToggle from "./LanguageToggle";
import { computeKpis } from "@/lib/stats";

export default function Topbar({ onMenu, title }) {
  const { t, officer, logoutOfficer, lang } = useApp();
  const router = useRouter();
  const kpis = computeKpis();

  const handleLogout = () => {
    logoutOfficer();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-20 gov-gradient text-white shadow-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button onClick={onMenu} className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden">
          <Menu size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold sm:text-lg">{title}</div>
          <div className="hidden text-[11px] text-white/70 sm:block">{t("deptName")}</div>
        </div>

        <LanguageToggle />

        <button className="relative rounded-lg p-2 hover:bg-white/10" title="Notifications">
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-900">
            {kpis.overdueCount > 99 ? "99+" : kpis.overdueCount}
          </span>
        </button>

        <div className="hidden items-center gap-2 border-l border-white/20 pl-3 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {officer?.name?.[0] || "O"}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{officer?.name || "Officer"}</div>
            <div className="text-[11px] text-white/70">{officer?.role?.[lang] || officer?.role?.en || "Enforcement Officer"}</div>
          </div>
        </div>

        <button onClick={handleLogout} className="rounded-lg p-2 hover:bg-white/10" title={t("logout")}>
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}
