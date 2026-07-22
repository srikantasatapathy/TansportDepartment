// Bilingual labels for the whole UI. Access with the useApp() hook: t("dashboard").
export const STRINGS = {
  // App / brand
  deptName: { en: "Transport Department, Government of Bihar", hi: "परिवहन विभाग, बिहार सरकार" },
  deptShort: { en: "Bihar Transport Dept.", hi: "बिहार परिवहन विभाग" },
  portalName: { en: "e-Challan Monitoring Portal", hi: "ई-चालान निगरानी पोर्टल" },
  officerConsole: { en: "Enforcement Officer Console", hi: "प्रवर्तन अधिकारी कंसोल" },

  // Auth
  login: { en: "Login", hi: "लॉगिन" },
  logout: { en: "Logout", hi: "लॉगआउट" },
  officerId: { en: "Officer ID", hi: "अधिकारी आईडी" },
  password: { en: "Password", hi: "पासवर्ड" },
  signIn: { en: "Sign In to Console", hi: "कंसोल में साइन इन करें" },
  loginHint: { en: "Demo: use any ID & password to enter", hi: "डेमो: प्रवेश हेतु कोई भी आईडी व पासवर्ड डालें" },
  welcome: { en: "Welcome", hi: "स्वागत है" },

  // Nav
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  challans: { en: "All Challans", hi: "सभी चालान" },
  overdue: { en: "Overdue & Recovery", hi: "अतिदेय एवं वसूली" },
  offenders: { en: "Repeat Offenders", hi: "बार-बार उल्लंघनकर्ता" },

  // KPIs
  totalChallans: { en: "Total Challans", hi: "कुल चालान" },
  totalCollected: { en: "Amount Collected", hi: "वसूली राशि" },
  totalPending: { en: "Amount Pending", hi: "बकाया राशि" },
  overdueCount: { en: "Overdue Challans", hi: "अतिदेय चालान" },
  recoveryRate: { en: "Recovery Rate", hi: "वसूली दर" },
  todayChallans: { en: "Issued Today", hi: "आज जारी" },

  // Charts
  byDistrict: { en: "Challans by District (Top 10)", hi: "जिलेवार चालान (शीर्ष 10)" },
  byViolation: { en: "Violation Breakdown", hi: "उल्लंघन विवरण" },
  collectionTrend: { en: "Monthly Collection Trend", hi: "मासिक वसूली प्रवृत्ति" },
  byStatus: { en: "Payment Status", hi: "भुगतान स्थिति" },
  byVehicle: { en: "Vehicle Type Mix", hi: "वाहन प्रकार मिश्रण" },
  bySource: { en: "Challan Source", hi: "चालान स्रोत" },
  districtMap: { en: "District Heatmap (Challan Density)", hi: "जिला हीटमैप (चालान घनत्व)" },
  recentActivity: { en: "Recent Activity", hi: "हाल की गतिविधि" },

  // Table headers
  challanNo: { en: "Challan No.", hi: "चालान सं." },
  vehicleNo: { en: "Vehicle No.", hi: "वाहन सं." },
  vehicleType: { en: "Vehicle", hi: "वाहन" },
  owner: { en: "Owner / Driver", hi: "मालिक / चालक" },
  mobile: { en: "Mobile", hi: "मोबाइल" },
  district: { en: "District", hi: "जिला" },
  violation: { en: "Violation", hi: "उल्लंघन" },
  amount: { en: "Fine (₹)", hi: "जुर्माना (₹)" },
  due: { en: "Due (₹)", hi: "बकाया (₹)" },
  status: { en: "Status", hi: "स्थिति" },
  issueDate: { en: "Issue Date", hi: "जारी तिथि" },
  dueDate: { en: "Due Date", hi: "देय तिथि" },
  paidDate: { en: "Paid Date", hi: "भुगतान तिथि" },
  source: { en: "Source", hi: "स्रोत" },
  officer: { en: "Issuing Officer", hi: "जारीकर्ता अधिकारी" },
  location: { en: "Location", hi: "स्थान" },
  overdueBy: { en: "Overdue By", hi: "अतिदेय" },
  actions: { en: "Actions", hi: "कार्रवाई" },

  // Filters / actions
  search: { en: "Search vehicle / challan / owner / mobile…", hi: "वाहन / चालान / मालिक / मोबाइल खोजें…" },
  allDistricts: { en: "All Districts", hi: "सभी जिले" },
  allViolations: { en: "All Violations", hi: "सभी उल्लंघन" },
  allStatuses: { en: "All Statuses", hi: "सभी स्थितियाँ" },
  allVehicles: { en: "All Vehicle Types", hi: "सभी वाहन प्रकार" },
  fromDate: { en: "From", hi: "से" },
  toDate: { en: "To", hi: "तक" },
  clearFilters: { en: "Clear Filters", hi: "फ़िल्टर साफ़ करें" },
  downloadPdf: { en: "Download PDF", hi: "पीडीएफ डाउनलोड" },
  downloadExcel: { en: "Download Excel", hi: "एक्सेल डाउनलोड" },
  showing: { en: "Showing", hi: "दिखा रहे हैं" },
  of: { en: "of", hi: "में से" },
  records: { en: "records", hi: "रिकॉर्ड" },
  viewDetails: { en: "View", hi: "देखें" },
  sendReminder: { en: "Send Reminder", hi: "रिमाइंडर भेजें" },
  escalate: { en: "Escalate", hi: "एस्केलेट करें" },
  details: { en: "Challan Details", hi: "चालान विवरण" },
  paymentHistory: { en: "Payment & Timeline", hi: "भुगतान एवं समयरेखा" },

  // Overdue page
  overdueTitle: { en: "Overdue Challan Recovery", hi: "अतिदेय चालान वसूली" },
  overdueSub: { en: "Challans unpaid beyond the 3-month (90-day) window", hi: "3 माह (90 दिन) की अवधि के बाद अवैतनिक चालान" },
  bucket0: { en: "0–3 Months (Within Window)", hi: "0–3 माह (अवधि के भीतर)" },
  bucket3: { en: "3–6 Months Overdue", hi: "3–6 माह अतिदेय" },
  bucket6: { en: "6+ Months Overdue", hi: "6+ माह अतिदेय" },
  totalRecoverable: { en: "Total Recoverable", hi: "कुल वसूली योग्य" },

  // Misc
  reminderSent: { en: "Reminder SMS queued to", hi: "रिमाइंडर एसएमएस भेजा गया" },
  escalated: { en: "Escalated for notice to", hi: "नोटिस हेतु एस्केलेट किया गया" },
  noRecords: { en: "No records match the current filters.", hi: "वर्तमान फ़िल्टर से कोई रिकॉर्ड मेल नहीं खाता।" },
  times: { en: "challans", hi: "चालान" },
  generatedOn: { en: "Generated on", hi: "तैयार किया गया" },
  quickStats: { en: "Quick Overview", hi: "त्वरित अवलोकन" },
  days: { en: "days", hi: "दिन" },

  // Ask AI assistant (offline chatbot)
  aiName: { en: "Saarthi AI", hi: "सारथी AI" },
  aiRole: { en: "e-Challan Data Assistant", hi: "ई-चालान डेटा सहायक" },
  aiGreeting: {
    en: "Hi, I'm Saarthi — your challan data assistant. Ask me anything, e.g. “How many challans are pending in Patna?”",
    hi: "नमस्ते, मैं सारथी हूँ — आपका चालान डेटा सहायक। कुछ भी पूछें, जैसे “पटना में कितने चालान बकाया हैं?”",
  },
  aiPlaceholder: { en: "Ask about challans, districts, dues…", hi: "चालान, जिले, बकाया के बारे में पूछें…" },
  aiOffline: { en: "Answers computed on-device from live data", hi: "उत्तर डिवाइस पर ही लाइव डेटा से" },
  aiSuggest: { en: "Try asking", hi: "यह पूछें" },
  aiTyping: { en: "Saarthi is typing…", hi: "सारथी लिख रहे हैं…" },
  aiClear: { en: "Clear chat", hi: "चैट साफ़ करें" },
};

export function translate(key, lang) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry.en;
}
