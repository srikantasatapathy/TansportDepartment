"use client";

import { STATUSES } from "@/data/violations";
import { useApp } from "@/context/AppContext";

export default function StatusBadge({ status }) {
  const { lang } = useApp();
  const s = STATUSES[status] || STATUSES.UNPAID;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: `${s.color}1a`, color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {lang === "hi" ? s.hi : s.en}
    </span>
  );
}
