// routes/warehousePurchases.js

const express = require("express");
const mongoose = require("mongoose");
const WarehousePurchase = require("../models/WarehousePurchase");

const router = express.Router();

/* ================= GET ALL PURCHASES ================= */
router.get("/", async (_req, res) => {
  try {
    const purchases = await WarehousePurchase.find()
      .populate("vendor", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(purchases);
  } catch (err) {
    console.error("GET PURCHASE ERROR:", err);
    res.status(500).json({ error: "Failed to load purchases" });
  }
});

/* ================= CREATE PURCHASE ================= */
router.post("/", async (req, res) => {
  try {
    const { vendor, invoiceNumber, items = [] } = req.body;

    if (!vendor || !invoiceNumber || !items.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.price),
      0
    );

    const purchase = await WarehousePurchase.create({
      vendor,
      invoiceNumber,
      items,
      totalAmount,
      paidAmount: 0,
      payments: [],
      paymentStatus: "Unpaid",
    });

    res.json(purchase);
  } catch (err) {
    console.error("CREATE PURCHASE ERROR:", err);
    res.status(500).json({ error: "Create purchase failed" });
  }
});

/* ================= PAY VENDOR ================= */
router.post("/:id/pay", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const purchase = await WarehousePurchase.findById(id);

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    if (!purchase.paidAmount) purchase.paidAmount = 0;
    if (!purchase.payments) purchase.payments = [];

    purchase.payments.push({
      amount: Number(amount),
      method: method || "BANK",
    });

    purchase.paidAmount += Number(amount);

    purchase.paymentStatus =
      purchase.paidAmount >= purchase.totalAmount
        ? "Paid"
        : "Partial";

    await purchase.save();

    res.json(purchase);
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ error: "Payment failed" });
  }
});

module.exports = router;