// Indian-numbering currency + date helpers.

export function formatINR(n, withSymbol = true) {
  const v = Math.round(Number(n) || 0);
  const s = v.toLocaleString("en-IN");
  return withSymbol ? `₹${s}` : s;
}

// Compact form for KPI cards: ₹1.2 Cr, ₹3.4 L, ₹45,000
export function formatINRShort(n) {
  const v = Math.round(Number(n) || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

export function formatDate(iso, lang = "en") {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function monthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
