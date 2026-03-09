const mongoose = require("mongoose");

/* ========== EMBEDDED PAYMENTS (ORDER HISTORY) ========== */
const EmbeddedPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    method: { type: String, default: "CASH" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ========== ITEMS ========== */
const ItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    service: {
      type: String,
      enum: ["Alteration", "New"],
      required: true,
    },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

/* ========== ORDER ========== */
const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    orderId: String,

    items: {
      type: [ItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
    },

    payments: {
      type: [EmbeddedPaymentSchema],
      default: [],
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    paymentMethod: { type: String, default: "CASH" },
    deliveryStatus: { type: String, default: "Pending" },
    workerStatus: { type: String, default: "Pending" },

    deliveryDate: Date,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);