// routes/payment.js
const express = require("express");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Payment = require("../module/payment");
const Order = require("../module/Order_old");

const router = express.Router();

/* ======================================================
   Helper: Generate Receipt Number
   ====================================================== */
function generateReceiptNumber() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCPT-${ts}-${rnd}`;
}

/* ======================================================
   GET /payments
   ====================================================== */
router.get("/", async (_req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("order")
      .populate("customer")
      .sort({ paidAt: -1 });

    const response = payments.map((p) => ({
      paymentId: p._id,
      receiptNumber: p.receiptNumber,
      amount: p.amount,
      method: p.method,
      status: p.status,
      paidAt: p.paidAt,
      orderId: p.order?._id || null,
      orderNumber: p.order?.orderId || null,
      customerId: p.customer?._id || null,
      customerName: p.customer?.name || null,
      customerPhone: p.customer?.phone || null,
    }));

    return res.json(response);
  } catch (err) {
    console.error("GET /payments ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   POST /payments
   ====================================================== */
router.post("/", async (req, res) => {
  console.log("HIT POST /payments", req.body);

  try {
    const { orderId, amount, method = "Cash", notes, force = false } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ error: "Invalid orderId" });
    }

    const order = await Order.findById(orderId).populate("customerId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // prevent duplicate payment unless forced
    const existing = await Payment.findOne({ order: order._id });
    if (existing && order.paymentStatus === "Paid" && !force) {
      return res.status(409).json({
        error: "Payment already exists",
        paymentId: existing._id,
      });
    }

    const payment = await Payment.create({
      order: order._id,
      customer: order.customerId?._id || order.customerId,
      amount: amount ?? order.totalAmount ?? 0,
      method,
      notes,
      receiptNumber: generateReceiptNumber(),
      status: "Paid",
      paidAt: new Date(),
    });

    // update order status
    order.paymentStatus = "Paid";
    order.paymentMethod = method;
    await order.save();

    return res.status(201).json({
      paymentId: payment._id,
      receiptNumber: payment.receiptNumber,
      orderId: order._id,
      orderNumber: order.orderId,
      customerName: order.customerId?.name || null,
      customerPhone: order.customerId?.phone || null,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt,
    });
  } catch (err) {
    console.error("POST /payments ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET /payments/:id/invoice  (PDF)
   ====================================================== */
router.get("/:id/invoice", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("order")
      .populate("customer");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${payment.receiptNumber}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Great Tailors - Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Receipt No : ${payment.receiptNumber}`);
    doc.text(`Date       : ${new Date(payment.paidAt).toLocaleString()}`);
    doc.text(`Customer   : ${payment.customer?.name || "-"}`);
    doc.text(`Phone      : ${payment.customer?.phone || "-"}`);
    doc.text(`Order ID   : ${payment.order?.orderId || "-"}`);
    doc.text(`Amount     : ₹${payment.amount}`);
    doc.text(`Method     : ${payment.method}`);
    doc.text(`Status     : ${payment.status}`);

    if (payment.notes) {
      doc.moveDown();
      doc.text(`Notes: ${payment.notes}`);
    }

    doc.end();
  } catch (err) {
    console.error("Invoice ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
module.exports = router;
