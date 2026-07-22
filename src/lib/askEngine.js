// ─────────────────────────────────────────────────────────────────────────────
// Ask-AI answer engine  (fully offline, no LLM / no network)
//
// Turns a natural-language question into a spoken-style answer computed live from
// the challan dataset. Pipeline:
//   1. parseQuery()  → structured filters (district / violation / status / …)
//   2. detectIntent() → which metric the officer is asking about
//   3. compute on the filtered rows and phrase a bilingual reply
//
// It answers questions like "how many challans are pending in Patna?" by
// counting real records — so numbers are always correct, unlike a hallucinating
// chatbot.
// ─────────────────────────────────────────────────────────────────────────────

import { CHALLANS, getRepeatOffenders } from "@/data/mockData";
import { applyFilters, computeKpis, byDistrict, byViolation } from "./stats";
import { formatINR, formatINRShort } from "./format";
import { parseQuery } from "./nlQuery";

// Which metric is the question about? First match wins (order = priority).
const INTENTS = [
  { key: "recoveryRate", re: /recovery rate|collection rate|वसूली दर/i },
  { key: "topDistrict", re: /which district|top district|most challans|highest.*(district|challan)|worst district|कौन ?सा ?जिला|सबसे ज़्यादा.*जिला/i },
  { key: "topViolation", re: /which violation|top violation|most common|common violation|frequent violation|सबसे आम|आम उल्लंघन/i },
  { key: "offenders", re: /repeat offender|offender|habitual|बार-?बार|उल्लंघनकर्ता/i },
  { key: "average", re: /average|avg|mean|औसत/i },
  { key: "collected", re: /collect|recovered|received|realis|वसूल|प्राप्त/i },
  { key: "overdue", re: /overdue|अतिदेय/i },
  { key: "pending", re: /pending|due|outstanding|unpaid|not paid|remaining|बकाया|लंबित|अवैतनिक/i },
  { key: "count", re: /how many|number of|count|total|how much.*challan|कितने|संख्या|कुल/i },
];

function detectIntent(text) {
  for (const it of INTENTS) if (it.re.test(text)) return it.key;
  return "summary";
}

// A short, human scope phrase built from the parsed chips, e.g. "Patna · Drunken Driving".
function scopeLabel(chips) {
  return chips.map((c) => c.label.replace(/^[^:]+:\s*/, "")).join(" · ");
}

/**
 * Answer a natural-language question from the challan data.
 * @param {string} question
 * @param {"en"|"hi"} lang
 * @returns {{ text:string, stats:{label:string,value:string}[], chips:any[] }}
 */
export function answerQuestion(question, lang = "en") {
  const HI = lang === "hi";
  const q = (question || "").trim();
  if (!q) {
    return {
      text: HI
        ? "नमस्ते! मुझसे चालान के आँकड़ों के बारे में पूछें — जैसे “पटना में कितने चालान बकाया हैं?”"
        : "Hello! Ask me about challan data — e.g. “How many challans are pending in Patna?”",
      stats: [],
      chips: [],
    };
  }

  const { filters, chips, empty } = parseQuery(q, lang);
  const text = ` ${q.toLowerCase()} `;
  const rows = applyFilters(CHALLANS, filters);
  const k = computeKpis(rows);
  const scope = scopeLabel(chips);
  const inScope = scope ? (HI ? ` (${scope})` : ` for ${scope}`) : "";
  const intent = detectIntent(text);

  // No records matched the parsed filters.
  if (rows.length === 0 && !empty) {
    return {
      text: HI
        ? `${scope} के लिए कोई चालान नहीं मिला।`
        : `No challans found for ${scope}.`,
      stats: [],
      chips,
    };
  }

  const nfmt = (n) => n.toLocaleString(HI ? "hi-IN" : "en-IN");

  switch (intent) {
    case "recoveryRate":
      return {
        text: HI
          ? `वसूली दर${inScope} ${k.recoveryRate}% है — ${nfmt(k.total)} चालानों में से ${formatINRShort(k.collected)} वसूल हुए, ${formatINRShort(k.pending)} बकाया।`
          : `The recovery rate${inScope} is ${k.recoveryRate}% — ${formatINRShort(k.collected)} recovered out of ${nfmt(k.total)} challans, with ${formatINRShort(k.pending)} still pending.`,
        stats: [
          { label: HI ? "वसूली दर" : "Recovery rate", value: `${k.recoveryRate}%` },
          { label: HI ? "वसूल" : "Collected", value: formatINRShort(k.collected) },
          { label: HI ? "बकाया" : "Pending", value: formatINRShort(k.pending) },
        ],
        chips,
      };

    case "collected":
      return {
        text: HI
          ? `${inScope ? inScope.trim() + " " : ""}कुल ${formatINR(k.collected)} की वसूली हुई है (${nfmt(k.total)} चालान)।`
          : `${formatINR(k.collected)} has been collected${inScope} across ${nfmt(k.total)} challans.`,
        stats: [
          { label: HI ? "वसूल राशि" : "Collected", value: formatINR(k.collected) },
          { label: HI ? "चालान" : "Challans", value: nfmt(k.total) },
        ],
        chips,
      };

    case "pending": {
      const pendingCount = k.total - k.paidCount;
      return {
        text: HI
          ? `${nfmt(pendingCount)} चालान बकाया हैं${inScope}, जिनमें ${formatINR(k.pending)} की वसूली शेष है।`
          : `${nfmt(pendingCount)} challans are pending${inScope}, with ${formatINR(k.pending)} still to be recovered.`,
        stats: [
          { label: HI ? "बकाया चालान" : "Pending challans", value: nfmt(pendingCount) },
          { label: HI ? "बकाया राशि" : "Amount due", value: formatINR(k.pending) },
          { label: HI ? "अतिदेय" : "Overdue", value: nfmt(k.overdueCount) },
        ],
        chips,
      };
    }

    case "overdue":
      return {
        text: HI
          ? `${nfmt(k.overdueCount)} चालान अतिदेय हैं${inScope} (90 दिन की अवधि के बाद), कुल बकाया ${formatINR(k.pending)}।`
          : `${nfmt(k.overdueCount)} challans are overdue${inScope} (past the 90-day window), totalling ${formatINR(k.pending)} outstanding.`,
        stats: [
          { label: HI ? "अतिदेय चालान" : "Overdue", value: nfmt(k.overdueCount) },
          { label: HI ? "बकाया राशि" : "Outstanding", value: formatINR(k.pending) },
        ],
        chips,
      };

    case "average": {
      const avg = k.total ? Math.round((k.collected + k.pending) / k.total) : 0;
      return {
        text: HI
          ? `औसत जुर्माना${inScope} ${formatINR(avg)} है (${nfmt(k.total)} चालान)।`
          : `The average fine${inScope} is ${formatINR(avg)} across ${nfmt(k.total)} challans.`,
        stats: [{ label: HI ? "औसत जुर्माना" : "Average fine", value: formatINR(avg) }],
        chips,
      };
    }

    case "topDistrict": {
      const top = byDistrict(rows).slice(0, 3);
      if (!top.length) break;
      const lead = top[0];
      return {
        text: HI
          ? `सबसे अधिक चालान ${lead.district} में हैं — ${nfmt(lead.count)} चालान, ${formatINR(lead.due)} बकाया।`
          : `${lead.district} has the most challans — ${nfmt(lead.count)} challans with ${formatINR(lead.due)} due.`,
        stats: top.map((d) => ({ label: d.district, value: nfmt(d.count) })),
        chips,
      };
    }

    case "topViolation": {
      const top = byViolation(rows, lang).slice(0, 3);
      if (!top.length) break;
      const lead = top[0];
      return {
        text: HI
          ? `सबसे आम उल्लंघन${inScope} “${lead.name}” है — ${nfmt(lead.count)} चालान।`
          : `The most common violation${inScope} is “${lead.name}” — ${nfmt(lead.count)} challans.`,
        stats: top.map((v) => ({ label: v.name, value: nfmt(v.count) })),
        chips,
      };
    }

    case "offenders": {
      const off = getRepeatOffenders(rows);
      const lead = off[0];
      return {
        text: HI
          ? `${nfmt(off.length)} वाहन बार-बार उल्लंघनकर्ता हैं${inScope}।${lead ? ` शीर्ष: ${lead.vehicleNo} — ${nfmt(lead.count)} चालान, ${formatINR(lead.due)} बकाया।` : ""}`
          : `${nfmt(off.length)} vehicles are repeat offenders${inScope}.${lead ? ` Top: ${lead.vehicleNo} — ${nfmt(lead.count)} challans, ${formatINR(lead.due)} due.` : ""}`,
        stats: off.slice(0, 3).map((o) => ({ label: o.vehicleNo, value: `${nfmt(o.count)}×` })),
        chips,
      };
    }

    case "count":
      return {
        text: HI
          ? `${nfmt(k.total)} चालान मिले${inScope}। ${formatINRShort(k.collected)} वसूल, ${formatINRShort(k.pending)} बकाया।`
          : `There are ${nfmt(k.total)} challans${inScope}. ${formatINRShort(k.collected)} collected, ${formatINRShort(k.pending)} pending.`,
        stats: [
          { label: HI ? "कुल चालान" : "Total challans", value: nfmt(k.total) },
          { label: HI ? "बकाया" : "Pending", value: formatINRShort(k.pending) },
        ],
        chips,
      };
  }

  // Fallback: overall summary of whatever scope was understood.
  if (empty) {
    return {
      text: HI
        ? `मैं चालान के आँकड़ों में मदद कर सकता हूँ। पूछें: बकाया चालान, वसूली दर, अतिदेय, शीर्ष जिला, या बार-बार उल्लंघनकर्ता — किसी जिले/उल्लंघन के साथ।`
        : `I can help with challan data. Try asking about pending challans, recovery rate, overdue, top district, or repeat offenders — optionally with a district or violation.`,
      stats: [],
      chips,
    };
  }
  return {
    text: HI
      ? `${nfmt(k.total)} चालान${inScope}: ${formatINRShort(k.collected)} वसूल, ${formatINRShort(k.pending)} बकाया, ${nfmt(k.overdueCount)} अतिदेय।`
      : `Found ${nfmt(k.total)} challans${inScope}: ${formatINRShort(k.collected)} collected, ${formatINRShort(k.pending)} pending, ${nfmt(k.overdueCount)} overdue.`,
    stats: [
      { label: HI ? "चालान" : "Challans", value: nfmt(k.total) },
      { label: HI ? "वसूल" : "Collected", value: formatINRShort(k.collected) },
      { label: HI ? "बकाया" : "Pending", value: formatINRShort(k.pending) },
    ],
    chips,
  };
}

export const SUGGESTED_QUESTIONS = {
  en: [
    "How many challans are pending in Patna?",
    "Total amount collected this year",
    "Overdue truck challans over ₹10,000",
    "Which district has the most challans?",
    "Top repeat offenders in Gaya",
  ],
  hi: [
    "पटना में कितने चालान बकाया हैं?",
    "इस साल कुल कितनी वसूली हुई?",
    "₹10,000 से अधिक के अतिदेय ट्रक चालान",
    "किस जिले में सबसे अधिक चालान हैं?",
    "गया में शीर्ष बार-बार उल्लंघनकर्ता",
  ],
};
