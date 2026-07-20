import { STATUSES } from "@/data/violations";
import { formatDate } from "./format";

// Flatten challans into export-ready rows + column definitions for PDF/Excel.
export function buildChallanReport(rows, lang = "en", { includeOverdue = false } = {}) {
  const columns = [
    { key: "challanNo", header: "Challan No.", width: 22 },
    { key: "vehicleNo", header: "Vehicle No.", width: 16 },
    { key: "vehicleType", header: "Vehicle", width: 14 },
    { key: "ownerName", header: "Owner/Driver", width: 18 },
    { key: "mobile", header: "Mobile", width: 14 },
    { key: "district", header: "District", width: 14 },
    { key: "violation", header: "Violation", width: 22 },
    { key: "amount", header: "Fine (Rs)", width: 12 },
    { key: "amountDue", header: "Due (Rs)", width: 12 },
    { key: "status", header: "Status", width: 14 },
    { key: "issueDate", header: "Issue Date", width: 14 },
    { key: "dueDate", header: "Due Date", width: 14 },
  ];
  if (includeOverdue) columns.push({ key: "overdueDays", header: "Overdue (days)", width: 14 });

  const data = rows.map((c) => {
    const r = {
      challanNo: c.challanNo,
      vehicleNo: c.vehicleNo,
      vehicleType: c.vehicleType,
      ownerName: c.ownerName,
      mobile: c.mobile,
      district: `${c.district} (${c.rto})`,
      violation: `${lang === "hi" ? c.violationHi : c.violationEn}`,
      amount: c.amount,
      amountDue: c.amountDue,
      status: STATUSES[c.status]?.en || c.status,
      issueDate: formatDate(c.issueDate),
      dueDate: formatDate(c.dueDate),
    };
    if (includeOverdue) r.overdueDays = c.overdueDays;
    return r;
  });

  return { columns, data };
}
