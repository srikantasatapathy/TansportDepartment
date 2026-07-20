// Violation taxonomy based on the Motor Vehicles (Amendment) Act, 2019.
// `weight` biases how often a violation appears in the mock dataset (higher = more common).

export const VIOLATIONS = [
  { code: "MV-177", en: "Driving without Helmet", hi: "बिना हेलमेट वाहन चलाना", fine: 1000, weight: 22 },
  { code: "MV-183", en: "Over Speeding", hi: "तेज़ रफ़्तार (ओवर स्पीडिंग)", fine: 2000, weight: 16 },
  { code: "MV-184", en: "Red Light / Signal Jump", hi: "रेड लाइट / सिग्नल तोड़ना", fine: 1000, weight: 12 },
  { code: "MV-194D", en: "No Seat Belt", hi: "सीट बेल्ट न लगाना", fine: 1000, weight: 10 },
  { code: "MV-146", en: "Driving without Insurance", hi: "बिना बीमा वाहन चलाना", fine: 2000, weight: 9 },
  { code: "MV-3", en: "Driving without Licence", hi: "बिना लाइसेंस वाहन चलाना", fine: 5000, weight: 7 },
  { code: "MV-184C", en: "Using Mobile while Driving", hi: "वाहन चलाते समय मोबाइल का प्रयोग", fine: 5000, weight: 7 },
  { code: "MV-190", en: "No Pollution (PUC) Certificate", hi: "प्रदूषण प्रमाणपत्र (PUC) न होना", fine: 10000, weight: 6 },
  { code: "MV-194", en: "Overloading of Goods", hi: "माल का ओवरलोडिंग", fine: 20000, weight: 4 },
  { code: "MV-185", en: "Drunken Driving", hi: "शराब पीकर वाहन चलाना", fine: 10000, weight: 3 },
  { code: "MV-184A", en: "Wrong Side Driving", hi: "गलत दिशा में वाहन चलाना", fine: 1100, weight: 5 },
  { code: "MV-128", en: "Triple Riding", hi: "तीन सवारी (ट्रिपल राइडिंग)", fine: 1000, weight: 5 },
  { code: "MV-39", en: "Driving without Registration", hi: "बिना पंजीकरण वाहन चलाना", fine: 5000, weight: 3 },
  { code: "MV-184B", en: "Dangerous / Rash Driving", hi: "खतरनाक / लापरवाह ड्राइविंग", fine: 5000, weight: 3 },
  { code: "MV-15", en: "Illegal Parking", hi: "अवैध पार्किंग", fine: 500, weight: 8 },
];

export const VEHICLE_TYPES = [
  { en: "Two Wheeler", hi: "दोपहिया", weight: 40, icon: "🏍️" },
  { en: "Car / LMV", hi: "कार / एलएमवी", weight: 25, icon: "🚗" },
  { en: "Auto Rickshaw", hi: "ऑटो रिक्शा", weight: 12, icon: "🛺" },
  { en: "Goods Truck", hi: "मालवाहक ट्रक", weight: 9, icon: "🚛" },
  { en: "Bus", hi: "बस", weight: 6, icon: "🚌" },
  { en: "Tractor", hi: "ट्रैक्टर", weight: 5, icon: "🚜" },
  { en: "Commercial Van", hi: "व्यावसायिक वैन", weight: 3, icon: "🚐" },
];

export const CHALLAN_SOURCES = [
  { en: "CCTV e-Challan", hi: "सीसीटीवी ई-चालान", weight: 45 },
  { en: "On-Spot (Officer)", hi: "मौके पर (अधिकारी)", weight: 38 },
  { en: "Interceptor Vehicle", hi: "इंटरसेप्टर वाहन", weight: 17 },
];

// Payment status master. `key` is stable; labels are localised.
export const STATUSES = {
  PAID: { key: "PAID", en: "Paid", hi: "भुगतान किया", color: "#16a34a" },
  UNPAID: { key: "UNPAID", en: "Unpaid", hi: "अवैतनिक", color: "#dc2626" },
  PARTIAL: { key: "PARTIAL", en: "Partially Paid", hi: "आंशिक भुगतान", color: "#f59e0b" },
  DISPUTED: { key: "DISPUTED", en: "Disputed", hi: "विवादित", color: "#8b5cf6" },
  COURT: { key: "COURT", en: "In Court", hi: "न्यायालय में", color: "#0ea5e9" },
};
