// routes/dashboard.js
const express = require("express");
const router = express.Router();

/**
 * Safe loader for models – tries multiple locations so you
 * don't get MODULE_NOT_FOUND every time a path is slightly different.
 */
function loadModel(possiblePaths, name) {
  for (const p of possiblePaths) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const m = require(p);
      console.log(`[dashboard] Loaded ${name} model from ${p}`);
      return m;
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") {
        console.error(`[dashboard] Error loading ${name} from ${p}:`, err);
        throw err;
      }
    }
  }
  const msg = `[dashboard] Could not find ${name} model. Tried: ${possiblePaths.join(
    ", "
  )}`;
  console.error(msg);
  throw new Error(msg);
}

// Adjust these arrays if you know exact locations
const Customer = loadModel(
  ["../module/customer", "../models/customer", "../models/Customer"],
  "Customer"
);

const Order = loadModel(
  [
    "../models/Order",
    "../models/order",
    "../module/order",
    "../module/Order",
  ],
  "Order"
);

const Payment = loadModel(
  [
    "../module/payment",
    "../module/Payment",
    "../models/payment",
    "../models/Payment",
  ],
  "Payment"
);

// ----------------- GET /dashboard/summary -----------------
router.get("/summary", async (_req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({});

    const revenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingPayments = orders
      .filter((o) => o.paymentStatus === "Unpaid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      totalCustomers,
      totalOrders,
      revenue,
      pendingPayments,
    });
  } catch (err) {
    console.error("GET /dashboard/summary ERROR:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
