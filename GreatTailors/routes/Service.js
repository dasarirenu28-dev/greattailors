import express from "express";
import Service from "../models/Service.js";

const router = express.Router();

/* GET SERVICES */
router.get("/", async (_req, res) => {
  const services = await Service.find({ active: true }).sort({ name: 1 });
  res.json(services);
});

/* CREATE SERVICE */
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Service name required" });
  }

  const exists = await Service.findOne({ name });
  if (exists) return res.json(exists);

  const service = await Service.create({ name });
  res.json(service);
});

export default router;
