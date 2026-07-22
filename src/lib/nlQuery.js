// ─────────────────────────────────────────────────────────────────────────────
// Offline natural-language query parser  ("Ask the data")
//
// No LLM / no network. It maps a plain-language question (English or Hindi) onto
// the SAME filter object the Challans page already understands, plus optional
// amount-range fields (minAmount / maxAmount).
//
// Because the whole domain — districts, violations, statuses, vehicle types — is
// enumerated in src/data/, deterministic keyword matching covers the realistic
// query space and, unlike an LLM, it can show the officer EXACTLY what it
// understood (see the returned `chips`). That transparency is the whole point of
// keeping this in-code.
//
// Returns: { filters, chips, unmatched, empty }
//   filters   – partial filter object to merge onto the page's INITIAL state
//   chips     – [{ field, value, label }] human-readable interpretation to show
//   unmatched – tokens we could not place (surfaced so the user can rephrase)
//   empty     – true when nothing at all was understood
// ─────────────────────────────────────────────────────────────────────────────

import { DISTRICTS } from "@/data/districts";
import { VIOLATIONS, VEHICLE_TYPES, STATUSES } from "@/data/violations";
import { TODAY } from "@/data/mockData";
import { formatINR } from "./format";

// Extra keywords that don't appear verbatim in the data taxonomy.
const VIOLATION_KEYWORDS = {
  "MV-177": ["helmet", "बिना हेलमेट", "हेलमेट"],
  "MV-183": ["over speed", "overspeed", "over-speed", "speeding", "speed", "तेज़", "रफ्तार", "रफ़्तार"],
  "MV-184": ["red light", "signal jump", "signal", "jump", "रेड लाइट", "सिग्नल"],
  "MV-194D": ["seat belt", "seatbelt", "सीट बेल्ट"],
  "MV-146": ["insurance", "uninsured", "no insurance", "बीमा"],
  "MV-3": ["licence", "license", "without licence", "no licence", "लाइसेंस"],
  "MV-184C": ["mobile", "phone", "cellphone", "texting", "मोबाइल"],
  "MV-190": ["pollution", "puc", "pucc", "प्रदूषण"],
  "MV-194": ["overload", "overloading", "over loading", "ओवरलोड", "ओवरलोडिंग"],
  "MV-185": ["drunk", "drunken", "drink", "alcohol", "शराब", "नशे"],
  "MV-184A": ["wrong side", "wrong-side", "गलत दिशा"],
  "MV-128": ["triple", "triple riding", "triple ride", "तीन सवारी", "ट्रिपल"],
  "MV-39": ["registration", "unregistered", "no registration", "पंजीकरण"],
  "MV-184B": ["rash", "dangerous", "reckless", "खतरनाक", "लापरवाह"],
  "MV-15": ["illegal parking", "parking", "अवैध पार्किंग", "पार्किंग"],
};

const VEHICLE_KEYWORDS = {
  "Two Wheeler": ["two wheeler", "two-wheeler", "2 wheeler", "bike", "motorbike", "motorcycle", "scooter", "scooty", "दोपहिया", "बाइक"],
  "Car / LMV": ["car", "lmv", "light motor", "कार"],
  "Auto Rickshaw": ["auto rickshaw", "auto-rickshaw", "auto", "rickshaw", "ऑटो", "रिक्शा"],
  "Goods Truck": ["goods truck", "truck", "goods", "lorry", "ट्रक", "मालवाहक"],
  "Bus": ["bus", "बस"],
  "Tractor": ["tractor", "ट्रैक्टर"],
  "Commercial Van": ["commercial van", "van", "वैन"],
};

// Status priority order matters: "unpaid" contains "paid", so test it first.
const STATUS_KEYWORDS = [
  { key: "UNPAID", words: ["unpaid", "not paid", "un-paid", "अवैतनिक", "बकाया"] },
  { key: "PARTIAL", words: ["partially paid", "partial", "partially", "आंशिक"] },
  { key: "DISPUTED", words: ["disputed", "dispute", "विवादित"] },
  { key: "COURT", words: ["in court", "court", "न्यायालय", "कोर्ट"] },
  { key: "PAID", words: ["fully paid", "paid", "cleared", "भुगतान"] },
];

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-phrase match (word boundaries for ASCII; loose contains for Devanagari,
// which has no \b in JS regex).
function has(text, phrase) {
  const p = phrase.toLowerCase();
  if (/[a-z0-9]/i.test(p)) {
    return new RegExp(`(^|[^a-z0-9])${esc(p)}([^a-z0-9]|$)`, "i").test(text);
  }
  return text.includes(p);
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

// Parse a money token: ₹5,000 / rs 5000 / 5k / 2 lakh / 10000  → number
function parseAmount(raw) {
  if (!raw) return null;
  let s = raw.toLowerCase().replace(/[₹,\s]/g, "").replace(/rs\.?|inr/g, "");
  let mult = 1;
  if (/(lakh|lac|l)$/.test(s)) { mult = 100000; s = s.replace(/(lakh|lac|l)$/, ""); }
  else if (/k$/.test(s)) { mult = 1000; s = s.replace(/k$/, ""); }
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * mult) : null;
}

const AMT = "(?:₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d+)?\\s*(?:k|lakh|lac|l)?)";

// ── Date-range extraction (relative to the app's fixed TODAY) ────────────────
function parseDateRange(text) {
  // between two explicit yyyy-mm-dd / dd-mm-yyyy is out of scope; we handle the
  // relative phrases officers actually type.
  let m;

  if (has(text, "today") || text.includes("आज")) {
    const d = toISODate(TODAY);
    return { fromDate: d, toDate: d, label: "Today" };
  }
  if (has(text, "yesterday") || text.includes("कल")) {
    const d = toISODate(addDays(TODAY, -1));
    return { fromDate: d, toDate: d, label: "Yesterday" };
  }

  m = text.match(/(?:last|past|previous)\s+(\d+)\s+day/);
  if (m) {
    const n = parseInt(m[1], 10);
    return { fromDate: toISODate(addDays(TODAY, -n)), toDate: toISODate(TODAY), label: `Last ${n} days` };
  }
  m = text.match(/(?:last|past|previous)\s+(\d+)\s+month/);
  if (m) {
    const n = parseInt(m[1], 10);
    const from = new Date(TODAY); from.setMonth(from.getMonth() - n);
    return { fromDate: toISODate(from), toDate: toISODate(TODAY), label: `Last ${n} months` };
  }

  if (has(text, "last week") || has(text, "past week") || text.includes("पिछले सप्ताह")) {
    return { fromDate: toISODate(addDays(TODAY, -7)), toDate: toISODate(TODAY), label: "Last week" };
  }
  if (has(text, "last month") || has(text, "past month") || text.includes("पिछले महीने")) {
    const from = new Date(TODAY); from.setMonth(from.getMonth() - 1);
    return { fromDate: toISODate(from), toDate: toISODate(TODAY), label: "Last month" };
  }
  if (has(text, "last year") || text.includes("पिछले साल")) {
    const from = new Date(TODAY); from.setFullYear(from.getFullYear() - 1);
    return { fromDate: toISODate(from), toDate: toISODate(TODAY), label: "Last year" };
  }
  if (has(text, "this month") || text.includes("इस महीने")) {
    const from = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    return { fromDate: toISODate(from), toDate: toISODate(TODAY), label: "This month" };
  }
  if (has(text, "this year") || text.includes("इस साल")) {
    const from = new Date(TODAY.getFullYear(), 0, 1);
    return { fromDate: toISODate(from), toDate: toISODate(TODAY), label: "This year" };
  }

  m = text.match(/(?:in|during|for)\s+(20\d{2})/) || text.match(/\b(20\d{2})\b/);
  if (m) {
    const y = parseInt(m[1], 10);
    return { fromDate: `${y}-01-01`, toDate: `${y}-12-31`, label: String(y) };
  }
  return null;
}

// ── Amount-range extraction ─────────────────────────────────────────────────
function parseAmountRange(text) {
  const out = {};
  const labels = [];

  let m = text.match(new RegExp(`between\\s+${AMT}\\s+and\\s+${AMT}`, "i"));
  if (m) {
    const a = parseAmount(m[1]);
    const b = parseAmount(m[2]);
    if (a != null && b != null) {
      out.minAmount = Math.min(a, b);
      out.maxAmount = Math.max(a, b);
      labels.push({ field: "amount", value: `${out.minAmount}-${out.maxAmount}`, label: `Fine ${formatINR(out.minAmount)} – ${formatINR(out.maxAmount)}` });
      return { out, labels };
    }
  }

  m = text.match(new RegExp(`(?:over|above|more than|greater than|>=?|at least|minimum)\\s+${AMT}`, "i"));
  if (m) {
    const a = parseAmount(m[1]);
    if (a != null) {
      out.minAmount = a;
      labels.push({ field: "amount", value: `>=${a}`, label: `Fine ≥ ${formatINR(a)}` });
    }
  }

  m = text.match(new RegExp(`(?:under|below|less than|cheaper than|<=?|at most|maximum)\\s+${AMT}`, "i"));
  if (m) {
    const a = parseAmount(m[1]);
    if (a != null) {
      out.maxAmount = a;
      labels.push({ field: "amount", value: `<=${a}`, label: `Fine ≤ ${formatINR(a)}` });
    }
  }
  return { out, labels };
}

// Normalise a plate-like token to the stored format  BR-01-AB-1234
function normalisePlate(text) {
  const m = text.match(/\bbr[\s-]?\d{2}[\s-]?[a-z]{1,2}[\s-]?\d{1,4}\b/i);
  if (!m) return null;
  const raw = m[0].replace(/[^a-z0-9]/gi, "").toUpperCase(); // BR01AB1234
  const mm = raw.match(/^BR(\d{2})([A-Z]{1,2})(\d{1,4})$/);
  if (!mm) return null;
  return `${"BR"}-${mm[1]}-${mm[2]}-${mm[3].padStart(4, "0")}`;
}

/**
 * Parse a natural-language question into a filter object.
 * @param {string} query
 * @param {"en"|"hi"} lang  language for chip labels
 */
export function parseQuery(query, lang = "en") {
  const chips = [];
  const filters = {};
  const raw = (query || "").trim();
  if (!raw) return { filters, chips, unmatched: [], empty: true };

  const text = ` ${raw.toLowerCase()} `;

  // 1) District (also RTO code like BR-01)
  for (const d of DISTRICTS) {
    if (has(text, d.name) || has(text, d.rto)) {
      filters.district = d.name;
      chips.push({ field: "district", value: d.name, label: `${lang === "hi" ? "जिला" : "District"}: ${d.name}` });
      break;
    }
  }

  // 2) Violation
  for (const v of VIOLATIONS) {
    const words = [v.code, v.en, v.hi, ...(VIOLATION_KEYWORDS[v.code] || [])];
    if (words.some((w) => w && has(text, w))) {
      filters.violation = v.code;
      chips.push({ field: "violation", value: v.code, label: `${lang === "hi" ? "उल्लंघन" : "Violation"}: ${lang === "hi" ? v.hi : v.en}` });
      break;
    }
  }

  // 3) Vehicle type
  for (const vt of VEHICLE_TYPES) {
    const words = [vt.en, vt.hi, ...(VEHICLE_KEYWORDS[vt.en] || [])];
    if (words.some((w) => w && has(text, w))) {
      filters.vehicleType = vt.en;
      chips.push({ field: "vehicleType", value: vt.en, label: `${lang === "hi" ? "वाहन" : "Vehicle"}: ${lang === "hi" ? vt.hi : vt.en}` });
      break;
    }
  }

  // 4) Overdue flag (before status, since "overdue" implies outstanding)
  if (has(text, "overdue") || has(text, "over due") || has(text, "not recovered") || text.includes("अतिदेय") || text.includes("बकाया")) {
    filters.overdueOnly = true;
    chips.push({ field: "overdueOnly", value: true, label: lang === "hi" ? "केवल अतिदेय" : "Overdue only" });
  }

  // 5) Payment status
  for (const s of STATUS_KEYWORDS) {
    if (s.words.some((w) => has(text, w))) {
      filters.status = s.key;
      const meta = STATUSES[s.key];
      chips.push({ field: "status", value: s.key, label: `${lang === "hi" ? "स्थिति" : "Status"}: ${lang === "hi" ? meta.hi : meta.en}` });
      break;
    }
  }

  // 6) Amount range
  const { out: amt, labels: amtLabels } = parseAmountRange(text);
  Object.assign(filters, amt);
  chips.push(...amtLabels);

  // 7) Date range
  const dr = parseDateRange(text);
  if (dr) {
    filters.fromDate = dr.fromDate;
    filters.toDate = dr.toDate;
    chips.push({ field: "date", value: `${dr.fromDate}:${dr.toDate}`, label: `${lang === "hi" ? "अवधि" : "Period"}: ${dr.label}` });
  }

  // 8) Free-text search — a plate number or an explicitly quoted phrase
  const plate = normalisePlate(raw);
  const quoted = raw.match(/["'“](.+?)["'”]/);
  const searchTerm = plate || (quoted ? quoted[1] : null);
  if (searchTerm) {
    filters.search = searchTerm;
    chips.push({ field: "search", value: searchTerm, label: `${lang === "hi" ? "खोज" : "Search"}: ${searchTerm}` });
  }

  return { filters, chips, unmatched: [], empty: chips.length === 0 };
}

// A few ready-made prompts shown under the box to teach the query grammar.
export const EXAMPLE_QUERIES = {
  en: [
    "Unpaid drunk driving challans in Patna",
    "Overdue truck challans over ₹10,000",
    "Two wheeler helmet violations last month",
    "Disputed challans in Gaya this year",
  ],
  hi: [
    "पटना में अवैतनिक शराब पीकर चलाने के चालान",
    "₹10,000 से अधिक के अतिदेय ट्रक चालान",
    "पिछले महीने दोपहिया हेलमेट उल्लंघन",
    "इस साल गया में विवादित चालान",
  ],
};
