// Server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();


// Import Routes (CHECK SPELLING!)
const customerRoutes = require("./routes/customer");
const orderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/payment");
const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require("./routes/auth");
const workerRoutes = require("./routes/workers");
const vendorRoutes = require("./routes/vendors");
const warehouseRoutes = require("./routes/warehousePurchases");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes

console.log("authRoutes:", typeof authRoutes);
console.log("customerRoutes:", typeof customerRoutes);
console.log("orderRoutes:", typeof orderRoutes);
console.log("paymentRoutes:", typeof paymentRoutes);
console.log("workerRoutes:", typeof workerRoutes);
console.log("dashboardRoutes:", typeof dashboardRoutes);
console.log("vendorRoutes:", typeof vendorRoutes);
console.log("warehouseRoutes:", typeof warehouseRoutes);

app.use("/auth", authRoutes);
app.use("/customer", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/workers", workerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/vendors", vendorRoutes);
app.use("/warehouse-purchases", warehouseRoutes);

// Root Test
app.get("/", (req, res) => {
  res.send("🚀 GreatTailors API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});