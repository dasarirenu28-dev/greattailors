// routes/vendors.js

const express = require("express");
const Vendor = require("../models/Vendor");

const router = express.Router();

/* ================= GET ALL VENDORS ================= */
router.get("/", async (_req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    console.error("GET VENDORS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

/* ================= CREATE VENDOR ================= */
router.post("/", async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.json(vendor);
  } catch (err) {
    console.error("CREATE VENDOR ERROR:", err);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

module.exports = router;