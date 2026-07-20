"use client";

import { useApp } from "@/context/AppContext";

export default function LanguageToggle() {
  const { lang, changeLang } = useApp();
  return (
    <div className="inline-flex rounded-lg border border-white/30 bg-white/10 p-0.5 text-xs font-semibold">
      <button
        onClick={() => changeLang("en")}
        className={`rounded-md px-2.5 py-1 transition ${lang === "en" ? "bg-white text-[#0b3d91]" : "text-white/80 hover:text-white"}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLang("hi")}
        className={`rounded-md px-2.5 py-1 transition ${lang === "hi" ? "bg-white text-[#0b3d91]" : "text-white/80 hover:text-white"}`}
      >
        हिं
      </button>
    </div>
  );
}
