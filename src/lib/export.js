import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Generic PDF report with a government-style header band.
export function exportPdf({ title, subtitle, columns, rows, summary = [], fileName }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(11, 61, 145); // gov blue
  doc.rect(0, 0, pageWidth, 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Transport Department, Government of Bihar", 40, 24);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("e-Challan Monitoring Portal  |  Enforcement Officer Report", 40, 42);

  // Title + meta
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 40, 84);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  if (subtitle) doc.text(subtitle, 40, 100);
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, pageWidth - 40, 84, { align: "right" });

  // Summary chips line
  if (summary.length) {
    doc.text(summary.join("    •    "), 40, 116);
  }

  autoTable(doc, {
    startY: 128,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => r[c.key] ?? "")),
    styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [11, 61, 145], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 245, 252] },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(str, pageWidth - 40, doc.internal.pageSize.getHeight() - 16, { align: "right" });
      doc.text("Confidential — for official use only", 40, doc.internal.pageSize.getHeight() - 16);
    },
  });

  doc.save(fileName || "challan-report.pdf");
}

export function exportExcel({ columns, rows, fileName, sheetName = "Challans" }) {
  const data = rows.map((r) => {
    const obj = {};
    columns.forEach((c) => {
      obj[c.header] = r[c.key] ?? "";
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = columns.map((c) => ({ wch: c.width || 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName || "challan-report.xlsx");
}
