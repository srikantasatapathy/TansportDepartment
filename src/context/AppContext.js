"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translate } from "@/lib/i18n";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [officer, setOfficer] = useState(null);
  const [toast, setToast] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session + language preference on first mount.
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("btd_lang");
      const savedOfficer = localStorage.getItem("btd_officer");
      if (savedLang) setLang(savedLang);
      if (savedOfficer) setOfficer(JSON.parse(savedOfficer));
    } catch {}
    setReady(true);
  }, []);

  const changeLang = useCallback((l) => {
    setLang(l);
    try { localStorage.setItem("btd_lang", l); } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    changeLang(lang === "en" ? "hi" : "en");
  }, [lang, changeLang]);

  const loginOfficer = useCallback((data) => {
    setOfficer(data);
    try { localStorage.setItem("btd_officer", JSON.stringify(data)); } catch {}
  }, []);

  const logoutOfficer = useCallback(() => {
    setOfficer(null);
    try { localStorage.removeItem("btd_officer"); } catch {}
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const t = useCallback((key) => translate(key, lang), [lang]);

  return (
    <AppContext.Provider
      value={{ lang, t, toggleLang, changeLang, officer, loginOfficer, logoutOfficer, ready, showToast }}
    >
      {children}
      {toast && <Toast key={toast.id} toast={toast} onDone={() => setToast(null)} />}
    </AppContext.Provider>
  );
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2800);
    return () => clearTimeout(id);
  }, [onDone]);
  const bg = toast.type === "success" ? "bg-emerald-600" : toast.type === "warn" ? "bg-amber-600" : "bg-sky-600";
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[fadeIn_0.2s_ease]">
      <div className={`${bg} text-white px-5 py-3 rounded-lg shadow-2xl text-sm font-medium max-w-sm`}>
        {toast.message}
      </div>
    </div>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
