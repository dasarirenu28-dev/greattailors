const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["CASH", "BANK", "UPI", "CARD"],
      default: "BANK",
    },
    paidAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    productName: String,
    quantity: Number,
    price: Number,
  },
  { _id: false }
);

const WarehousePurchaseSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
    },

    items: {
      type: [ItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    payments: {
      type: [PaymentSchema],
      default: [],
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.WarehousePurchase ||
  mongoose.model("WarehousePurchase", WarehousePurchaseSchema);