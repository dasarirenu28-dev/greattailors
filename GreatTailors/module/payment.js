const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "BANK"],
      default: "CASH",
    },

    status: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Paid",
    },

    receiptNumber: {
      type: String,
      unique: true,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate receipt number
PaymentSchema.pre("validate", function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber =
      "RCPT-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  }
  next();
});

module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);