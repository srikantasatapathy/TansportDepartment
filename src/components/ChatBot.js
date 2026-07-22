"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Eraser } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { answerQuestion, SUGGESTED_QUESTIONS } from "@/lib/askEngine";

// Floating offline AI assistant. An avatar button pinned bottom-right opens a
// chat panel; questions are answered from the challan dataset via askEngine.
export default function ChatBot() {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the transcript pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = (q) => {
    const question = (q ?? input).trim();
    if (!question || typing) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setTyping(true);
    // Small delay so the "typing…" indicator reads like a real assistant.
    setTimeout(() => {
      const ans = answerQuestion(question, lang);
      setMessages((m) => [...m, { role: "bot", ...ans }]);
      setTyping(false);
    }, 450);
  };

  const clearChat = () => setMessages([]);

  const suggestions = SUGGESTED_QUESTIONS[lang] || SUGGESTED_QUESTIONS.en;
  const showSuggestions = messages.length === 0;

  return (
    <>
      {/* Floating avatar launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask AI assistant"
        className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3d91] to-[#1e5fc0] text-white shadow-xl ring-4 ring-white/60 transition hover:scale-105 active:scale-95"
      >
        {open ? <X size={24} /> : <Bot size={26} />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
              <Sparkles size={9} className="text-white" />
            </span>
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[90] flex h-[560px] max-h-[calc(100vh-8rem)] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-[fadeIn_0.15s_ease]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#0b3d91] to-[#1e5fc0] px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                {t("aiName")}
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="truncate text-[11px] text-white/70">{t("aiRole")}</div>
            </div>
            <button onClick={clearChat} title={t("aiClear")} className="rounded-md p-1.5 text-white/80 hover:bg-white/15">
              <Eraser size={16} />
            </button>
            <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-white/80 hover:bg-white/15">
              <X size={18} />
            </button>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#f5f7fb] p-3">
            {/* Greeting is derived from t() so it always follows the current language */}
            <Message msg={{ role: "bot", text: t("aiGreeting"), stats: [], chips: [] }} />
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}

            {typing && (
              <div className="flex items-center gap-1.5 pl-1 text-slate-400">
                <Bot size={16} />
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
                <span className="text-[11px]">{t("aiTyping")}</span>
              </div>
            )}

            {showSuggestions && !typing && (
              <div className="space-y-1.5 pt-1">
                <div className="px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{t("aiSuggest")}</div>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 shadow-sm transition hover:border-[#0b3d91]/40 hover:text-[#0b3d91]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 bg-white p-2.5">
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={t("aiPlaceholder")}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#0b3d91] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/15"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b3d91] text-white shadow-sm transition hover:bg-[#092f70] disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Sparkles size={10} /> {t("aiOffline")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#0b3d91] px-3.5 py-2 text-sm text-white shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b3d91]/10 text-[#0b3d91]">
        <Bot size={15} />
      </span>
      <div className="max-w-[85%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm">
          {msg.text}
        </div>
        {msg.stats?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.stats.map((s, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-sm">
                <div className="text-sm font-bold text-slate-800">{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
