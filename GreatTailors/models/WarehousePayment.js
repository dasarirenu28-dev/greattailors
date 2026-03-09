import mongoose from "mongoose";

const WarehousePaymentSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehousePurchase",
    },

    amount: Number,
    method: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "WarehousePayment",
  WarehousePaymentSchema
);
