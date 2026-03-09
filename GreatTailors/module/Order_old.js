// module/Order.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String },
  service: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 },

  // ⭐ REQUIRED FOR POPULATE
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    default: null,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [itemSchema],

    totalAmount: { type: Number, default: 0 },
    dueDate: Date,

    orderNumber: String,
    paymentStatus: { type: String, default: "Unpaid" },
    deliveryStatus: { type: String, default: "Pending" },

    paymentMethod: { type: String, default: "CASH" },
  },
  { timestamps: true }
);

// FIX overwrite error
export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
