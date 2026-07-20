"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, AlertTriangle, Users, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/challans", key: "challans", icon: FileText },
  { href: "/overdue", key: "overdue", icon: AlertTriangle },
  { href: "/offenders", key: "offenders", icon: Users },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-[#0b2a5e] text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl">🛞</div>
          <div className="leading-tight">
            <div className="text-sm font-bold">{t("deptShort")}</div>
            <div className="text-[11px] text-white/60">{t("portalName")}</div>
          </div>
        </div>
        <div className="tricolor-bar mx-5 h-1 rounded-full" />

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-white text-[#0b2a5e] shadow" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* <div className="m-3 rounded-xl bg-white/10 p-3 text-xs text-white/70">
          <div className="flex items-center gap-2 font-semibold text-white">
            <ShieldAlert size={15} /> Demo Prototype
          </div>
          <p className="mt-1 leading-relaxed">
            Data shown is simulated for demonstration to the Transport Department.
          </p>
        </div> */}
      </aside>
    </>
  );
}
