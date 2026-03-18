const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Payment = require("../module/payment");

const router = express.Router();

/* ================= HELPERS ================= */
const calcTotal = (items = []) =>
  items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.price || 0),
    0
  );

const calcPaid = (payments = []) =>
  payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

const calcStatus = (total, paid) => {
  if (paid >= total && total > 0) return "Paid";
  if (paid > 0) return "Partial";
  return "Pending";
};

/* ======================================================
   GET ALL ORDERS
   ====================================================== */
router.get("/", async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name phone orderId")
      // Removed .populate("items.worker", "name status")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET /order ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   CREATE ORDER
   ====================================================== */
router.post("/", async (req, res) => {
  try {
    const { customerId, items = [], advancePaid = 0, deliveryDate } = req.body;

    const totalAmount = calcTotal(items);
    if (!customerId || totalAmount <= 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const payments =
      advancePaid > 0
        ? [{ amount: advancePaid, method: "CASH" }]
        : [];

    const paidTotal = calcPaid(payments);

    const order = await Order.create({
      customerId,
      items,
      totalAmount,
      payments,
      advancePaid: paidTotal,
      paymentStatus: calcStatus(totalAmount, paidTotal),
      deliveryDate,
    });

    res.json(order);
  } catch (err) {
    console.error("POST /order ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPDATE ORDER (PAYMENT / STATUS)
   ====================================================== */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paidNow,
      paymentMethod,
      deliveryStatus,
      workerStatus, // You might consider removing this if you don't want to handle it anymore
      deliveryDate,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid Order ID" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.items ||= [];
    order.payments ||= [];

    const totalAmount = calcTotal(order.items);
    order.totalAmount = totalAmount;

    const payNow = Number(paidNow || 0);
    const alreadyPaid = calcPaid(order.payments);
    const remaining = totalAmount - alreadyPaid;

    if (payNow > remaining) {
      return res.status(400).json({ error: "Payment exceeds remaining" });
    }

    if (payNow > 0) {
      order.payments.push({
        amount: payNow,
        method: paymentMethod || "CASH",
      });
    }

    const paidTotal = calcPaid(order.payments);
    order.advancePaid = paidTotal;
    order.paymentStatus = calcStatus(totalAmount, paidTotal);

    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (workerStatus) order.workerStatus = workerStatus; // you may want to remove this line
    if (deliveryDate) order.deliveryDate = deliveryDate;

    await order.save();

    /* ✅ INSERT INTO PAYMENTS COLLECTION (ONCE) */
    if (order.paymentStatus === "Paid") {
      const exists = await Payment.findOne({ order: order._id });

      if (!exists) {
        await Payment.create({
          order: order._id,
          customer: order.customerId,
          amount: order.totalAmount,
          method: order.paymentMethod,
        });
      }
    }

    const updated = await Order.findById(order._id)
      .populate("customerId", "name phone orderId");
      // Removed .populate("items.worker", "name status")

    res.json(updated);
  } catch (err) {
    console.error("PATCH /order ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
