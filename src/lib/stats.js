import { CHALLANS, TODAY } from "@/data/mockData";
import { VIOLATIONS, STATUSES } from "@/data/violations";
import { monthKey, monthLabel } from "./format";

export function applyFilters(list, f) {
  const q = (f.search || "").trim().toLowerCase();
  const from = f.fromDate ? new Date(f.fromDate) : null;
  const to = f.toDate ? new Date(f.toDate + "T23:59:59") : null;
  return list.filter((c) => {
    if (f.district && f.district !== "ALL" && c.district !== f.district) return false;
    if (f.violation && f.violation !== "ALL" && c.violationCode !== f.violation) return false;
    if (f.status && f.status !== "ALL" && c.status !== f.status) return false;
    if (f.vehicleType && f.vehicleType !== "ALL" && c.vehicleType !== f.vehicleType) return false;
    if (f.overdueOnly && !c.isOverdue) return false;
    if (from && new Date(c.issueDate) < from) return false;
    if (to && new Date(c.issueDate) > to) return false;
    if (q) {
      const hay = `${c.challanNo} ${c.vehicleNo} ${c.ownerName} ${c.mobile}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function computeKpis(list = CHALLANS) {
  let collected = 0, pending = 0, overdueCount = 0, paidCount = 0, todayCount = 0;
  const todayStr = TODAY.toDateString();
  for (const c of list) {
    collected += c.amountPaid;
    pending += c.amountDue;
    if (c.isOverdue) overdueCount += 1;
    if (c.status === "PAID") paidCount += 1;
    if (new Date(c.issueDate).toDateString() === todayStr) todayCount += 1;
  }
  const recoveryRate = list.length ? Math.round((collected / (collected + pending || 1)) * 100) : 0;
  return {
    total: list.length,
    collected,
    pending,
    overdueCount,
    paidCount,
    todayCount,
    recoveryRate,
  };
}

export function byDistrict(list = CHALLANS) {
  const map = {};
  for (const c of list) {
    map[c.district] = map[c.district] || { district: c.district, count: 0, due: 0 };
    map[c.district].count += 1;
    map[c.district].due += c.amountDue;
  }
  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function byViolation(list = CHALLANS, lang = "en") {
  const map = {};
  for (const c of list) {
    const key = c.violationCode;
    if (!map[key]) {
      const v = VIOLATIONS.find((x) => x.code === key);
      map[key] = { name: lang === "hi" ? v?.hi : v?.en, count: 0 };
    }
    map[key].count += 1;
  }
  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function byStatus(list = CHALLANS, lang = "en") {
  const map = {};
  for (const c of list) {
    map[c.status] = (map[c.status] || 0) + 1;
  }
  return Object.entries(map).map(([key, count]) => {
    const s = STATUSES[key];
    return { name: lang === "hi" ? s.hi : s.en, value: count, color: s.color, key };
  });
}

export function byVehicle(list = CHALLANS) {
  const map = {};
  for (const c of list) {
    map[c.vehicleType] = (map[c.vehicleType] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function bySource(list = CHALLANS) {
  const map = {};
  for (const c of list) {
    map[c.source] = (map[c.source] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function monthlyTrend(list = CHALLANS) {
  const map = {};
  for (const c of list) {
    const k = monthKey(c.issueDate);
    map[k] = map[k] || { key: k, collected: 0, pending: 0, count: 0 };
    map[k].collected += c.amountPaid;
    map[k].pending += c.amountDue;
    map[k].count += 1;
  }
  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((m) => ({ ...m, month: monthLabel(m.key) }));
}

// Overdue aging buckets for the recovery module.
export function overdueBuckets(list = CHALLANS) {
  const buckets = {
    within: { key: "within", count: 0, amount: 0, items: [] },
    b3to6: { key: "b3to6", count: 0, amount: 0, items: [] },
    b6plus: { key: "b6plus", count: 0, amount: 0, items: [] },
  };
  for (const c of list) {
    if (c.status === "PAID") continue;
    if (!c.isOverdue) {
      buckets.within.count += 1;
      buckets.within.amount += c.amountDue;
      buckets.within.items.push(c);
    } else if (c.overdueDays <= 90) {
      buckets.b3to6.count += 1;
      buckets.b3to6.amount += c.amountDue;
      buckets.b3to6.items.push(c);
    } else {
      buckets.b6plus.count += 1;
      buckets.b6plus.amount += c.amountDue;
      buckets.b6plus.items.push(c);
    }
  }
  return buckets;
}
