// module/customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    measurement: { type: String, default: "" },
    service: { type: String, default: "" },
    orderId: { type: String, default: "" }, // old field if still used

    // relationship - list of orders
    orders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        number: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// ✅ FIX OverwriteModelError
const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

module.exports = Customer;
