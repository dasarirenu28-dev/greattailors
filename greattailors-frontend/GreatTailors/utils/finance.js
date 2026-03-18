// utils/finance.js
const Payment = require("../module/payment");

// FY like "2025-26" (Apr 1 -> Mar 31)
function getFY(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth(); // 0=Jan, 3=Apr
  const startYear = m >= 3 ? y : y - 1;
  const endYear = String(startYear + 1).slice(-2);
  return `${startYear}-${endYear}`;
}

// Next receipt number: INV-YYYY-YY-0001
async function nextReceiptNumber() {
  const fy = getFY();
  const prefix = `INV-${fy}-`;
  const last = await Payment.findOne({ receiptNumber: { $regex: `^${prefix}` } })
    .sort({ receiptNumber: -1 })
    .lean();

  let seq = 1;
  if (last?.receiptNumber) {
    const tail = parseInt(last.receiptNumber.split("-").pop(), 10);
    if (!Number.isNaN(tail)) seq = tail + 1;
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

module.exports = { getFY, nextReceiptNumber };
