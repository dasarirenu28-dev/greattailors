// routes/customers.js
const express = require("express");
const router = express.Router();
const Customer = require("../module/customer");
const Order = require("../models/order");

// Create customer (optional initial order)
router.post("/", async (req, res) => {
  try {
    const { name, phone, measurement, orderId, service } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });

    const exists = await Customer.findOne({ phone }).lean();
    if (exists) return res.status(409).json({ error: "Phone already exists" });

    const customer = await Customer.create({
      name,
      phone,
      measurement: measurement || "",
      orderId: orderId || "",
      service: service || "",
    });

    return res.status(201).json(customer);
  } catch (err) {
    console.error("customers.post error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Get all customers
router.get("/", async (req, res) => {
  try {
    // return orders array as stored (not populated)
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();
    return res.json(customers);
  } catch (err) {
    console.error("customers.get error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Get single customer (populate orders.orderId -> Order.number)
router.get("/:id", async (req, res) => {
  try {
    const cust = await Customer.findById(req.params.id).lean();
    if (!cust) return res.status(404).json({ error: "Customer not found" });

    // optionally populate each orders[].orderId to get number (manual lookup)
    const populatedOrders = [];
    if (cust.orders && cust.orders.length) {
      const OrderModel = require("../models/order");
      for (const o of cust.orders) {
        const ord = await OrderModel.findById(o.orderId).lean().select("number");
        populatedOrders.push({ ...o, number: ord ? ord.number : o.number });
      }
    }
    return res.json({ ...cust, orders: populatedOrders.length ? populatedOrders : cust.orders });
  } catch (err) {
    console.error("customers.get/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Update customer
router.patch("/:id", async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.measurement !== undefined) updates.measurement = req.body.measurement;
    if (req.body.service !== undefined) updates.service = req.body.service;
    if (req.body.orderId !== undefined) updates.orderId = req.body.orderId;

    if (updates.phone) {
      const clash = await Customer.findOne({ phone: updates.phone, _id: { $ne: req.params.id } }).lean();
      if (clash) return res.status(409).json({ error: "Another customer with this phone exists" });
    }

    const updated = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Customer not found" });
    return res.json(updated);
  } catch (err) {
    console.error("customers.patch error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    const removed = await Customer.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: "Customer not found" });
    // Optionally also delete related orders/payments — not done here automatically
    return res.json({ message: "Customer deleted", id: removed._id });
  } catch (err) {
    console.error("customers.delete error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
