import Worker from "../module/worker.js";
import Order from "../models/order.js";

/* ======================================================
   LIST ALL WORKERS
   ====================================================== */
export async function listWorkers(req, res) {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    console.error("listWorkers error:", err);
    res.status(500).json({ error: "Failed to load workers" });
  }
}

/* ======================================================
   LIST WORKERS WITH ASSIGNED WORKS (IMPORTANT)
   ====================================================== */
export async function listWorkersWithWorks(req, res) {
  try {
    const workers = await Worker.find().lean();

    // get all orders with required data
    const orders = await Order.find()
      .populate("customerId", "name")
      .populate("items.worker", "name")
      .lean();

    const workerMap = {};

    // initialize worker map
    workers.forEach((w) => {
      workerMap[w._id.toString()] = {
        ...w,
        currentWorks: [],
      };
    });

    // assign works to workers
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.worker) return;

        const wid =
          typeof item.worker === "object"
            ? item.worker._id.toString()
            : item.worker.toString();

        if (!workerMap[wid]) return;

        workerMap[wid].currentWorks.push({
          // ✅ ORDER INFO
          orderId: order._id,
          orderNumber: order.orderId,        // shown as Order ID
          orderCreatedAt: order.createdAt,   // ✅ DATE FIX

          // ✅ CUSTOMER & ITEM
          customerName: order.customerId?.name || "—",
          service: item.service || item.itemName || "—",
          quantity: item.quantity || 1,

          // ✅ STATUS
          workStatus: order.workerStatus || "Pending",
        });
      });
    });

    res.json(Object.values(workerMap));
  } catch (err) {
    console.error("listWorkersWithWorks error:", err);
    res.status(500).json({ error: "Failed to load worker assignments" });
  }
}

/* ======================================================
   GET SINGLE WORKER
   ====================================================== */
export async function getWorker(req, res) {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch worker" });
  }
}

/* ======================================================
   CREATE WORKER
   ====================================================== */
export async function createWorker(req, res) {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json(worker);
  } catch (err) {
    console.error("createWorker error:", err);
    res.status(400).json({ error: err.message });
  }
}

/* ======================================================
   UPDATE WORKER
   ====================================================== */
export async function updateWorker(req, res) {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    res.json(worker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/* ======================================================
   DELETE WORKER
   ====================================================== */
export async function deleteWorker(req, res) {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete worker" });
  }
}
