// routes/workers.js

const express = require("express");
const workerController = require("../controllers/workerController");

const router = express.Router();

// ✅ MUST BE FIRST (specific route first)
router.get("/with-works", workerController.listWorkersWithWorks);

router.get("/", workerController.listWorkers);
router.get("/:id", workerController.getWorker);
router.post("/", workerController.createWorker);
router.put("/:id", workerController.updateWorker);
router.delete("/:id", workerController.deleteWorker);

module.exports = router;