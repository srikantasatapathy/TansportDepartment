"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatBot from "./ChatBot";

export default function AppShell({ title, children }) {
  const { officer, ready } = useApp();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Mock auth guard — bounce to login if no session once context has hydrated.
  useEffect(() => {
    if (ready && !officer) router.replace("/");
  }, [ready, officer, router]);

  if (!ready || !officer) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#eef2f7] text-slate-500">
        <div className="animate-pulse text-sm">Loading console…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f7]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
      <ChatBot />
    </div>
  );
}
