import { DISTRICTS } from "./districts";
import { VIOLATIONS, VEHICLE_TYPES, CHALLAN_SOURCES, STATUSES } from "./violations";

// ---- Deterministic PRNG so server-render and client-hydration produce identical data ----
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed "today" for the prototype keeps the overdue logic stable across demos.
export const TODAY = new Date("2026-06-24T00:00:00");
export const OVERDUE_DAYS = 90; // 3-month payment window

const FIRST_NAMES = [
  "Rakesh", "Amit", "Sunil", "Manoj", "Ravi", "Santosh", "Vikash", "Pankaj",
  "Rajesh", "Dinesh", "Abhishek", "Saurabh", "Chandan", "Brajesh", "Nitish",
  "Md. Imran", "Md. Sajid", "Arun", "Praveen", "Gautam", "Shyam", "Mukesh",
  "Priya", "Anjali", "Sunita", "Pooja", "Kavita", "Rekha", "Neha", "Sushma",
];
const LAST_NAMES = [
  "Kumar", "Singh", "Yadav", "Paswan", "Prasad", "Sharma", "Mishra", "Thakur",
  "Mahto", "Sah", "Choudhary", "Verma", "Gupta", "Rai", "Ansari", "Khan",
  "Jha", "Pandey", "Ram", "Das", "Roy", "Kumari", "Devi",
];

function weightedPick(rng, arr) {
  const total = arr.reduce((s, x) => s + (x.weight || 1), 0);
  let r = rng() * total;
  for (const x of arr) {
    r -= x.weight || 1;
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function pad(n, len) {
  return String(n).padStart(len, "0");
}

function randomPlate(rng, rto) {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const l1 = letters[Math.floor(rng() * letters.length)];
  const l2 = letters[Math.floor(rng() * letters.length)];
  const num = pad(Math.floor(rng() * 9999) + 1, 4);
  return `${rto}-${l1}${l2}-${num}`;
}

function dateMinusDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d;
}

// A fixed registry of vehicles. Challans are drawn from this pool (with a bias
// toward a subset) so the same plate recurs — producing realistic repeat offenders.
function buildRegistry(rng) {
  const COUNT = 300;
  const vehicles = [];
  for (let i = 0; i < COUNT; i++) {
    const district = weightedPick(rng, DISTRICTS.map((d, idx) => ({ ...d, weight: idx === 0 ? 30 : 38 - idx })));
    const vtype = weightedPick(rng, VEHICLE_TYPES);
    vehicles.push({
      vehicleNo: randomPlate(rng, district.rto),
      district,
      vtype,
      owner: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      mobile: `9${Math.floor(rng() * 9)}${pad(Math.floor(rng() * 99999999), 8)}`,
    });
  }
  return vehicles;
}

function generate() {
  const rng = mulberry32(20260624);
  const COUNT = 540;
  const challans = [];
  const registry = buildRegistry(rng);

  for (let i = 0; i < COUNT; i++) {
    // Bias toward lower indices (exponent > 1) so a subset of vehicles accumulate
    // several challans each — these surface on the Repeat Offenders leaderboard.
    const vehicle = registry[Math.floor(Math.pow(rng(), 1.7) * registry.length)];
    const district = vehicle.district;
    const vtype = vehicle.vtype;
    const violation = weightedPick(rng, VIOLATIONS);
    const source = weightedPick(rng, CHALLAN_SOURCES);

    // Issue date within the last ~280 days; older entries skew the overdue buckets.
    const ageDays = Math.floor(rng() * 280);
    const issueDate = dateMinusDays(TODAY, ageDays);

    // Some violations carry a slightly randomised fine around the base.
    const variance = [0, 0, 0, 100, 500][Math.floor(rng() * 5)];
    const amount = violation.fine + (rng() < 0.3 ? variance : 0);

    // Status logic — older unpaid challans are more likely to stay unpaid.
    let statusKey;
    const r = rng();
    if (r < 0.52) statusKey = "PAID";
    else if (r < 0.78) statusKey = "UNPAID";
    else if (r < 0.86) statusKey = "PARTIAL";
    else if (r < 0.94) statusKey = "DISPUTED";
    else statusKey = "COURT";

    let paidDate = null;
    let amountPaid = 0;
    if (statusKey === "PAID") {
      amountPaid = amount;
      paidDate = dateMinusDays(issueDate, -Math.floor(rng() * Math.min(ageDays, 60)));
    } else if (statusKey === "PARTIAL") {
      amountPaid = Math.round((amount * (0.3 + rng() * 0.4)) / 50) * 50;
    }

    const owner = vehicle.owner;
    const mobile = vehicle.mobile;

    const dueDate = dateMinusDays(issueDate, -OVERDUE_DAYS);
    const daysPending = Math.round((TODAY - issueDate) / 86400000);
    const isOutstanding = statusKey !== "PAID";
    const isOverdue = isOutstanding && TODAY > dueDate;

    challans.push({
      id: i + 1,
      challanNo: `BR${district.rto.replace("BR-", "")}E${issueDate.getFullYear()}${pad(100000 + i, 6)}`,
      vehicleNo: vehicle.vehicleNo,
      vehicleType: vtype.en,
      vehicleTypeHi: vtype.hi,
      vehicleIcon: vtype.icon,
      ownerName: owner,
      mobile,
      district: district.name,
      rto: district.rto,
      zone: district.zone,
      violationCode: violation.code,
      violationEn: violation.en,
      violationHi: violation.hi,
      amount,
      amountPaid,
      amountDue: Math.max(0, amount - amountPaid),
      status: statusKey,
      source: source.en,
      sourceHi: source.hi,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      paidDate: paidDate ? paidDate.toISOString() : null,
      daysPending,
      isOverdue,
      overdueDays: isOverdue ? Math.round((TODAY - dueDate) / 86400000) : 0,
      location: `${pick(rng, ["NH-31", "NH-22", "Ashok Rajpath", "Bailey Road", "Kankarbagh", "Boring Road", "Station Chowk", "Main Market", "Bypass Road", "GT Road"])}, ${district.name}`,
      officer: `${pick(rng, ["SI", "ASI", "TI", "ESI"])} ${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
    });
  }
  return challans;
}

// Generated once at module load — stable for the whole session.
export const CHALLANS = generate();

// Count distinct repeat-offender vehicles (more than one challan on the same plate).
export function getRepeatOffenders(list = CHALLANS) {
  const byVehicle = {};
  for (const c of list) {
    byVehicle[c.vehicleNo] = byVehicle[c.vehicleNo] || { vehicleNo: c.vehicleNo, owner: c.ownerName, district: c.district, count: 0, total: 0, due: 0 };
    byVehicle[c.vehicleNo].count += 1;
    byVehicle[c.vehicleNo].total += c.amount;
    byVehicle[c.vehicleNo].due += c.amountDue;
  }
  return Object.values(byVehicle)
    .filter((v) => v.count > 1)
    .sort((a, b) => b.count - a.count || b.due - a.due);
}
