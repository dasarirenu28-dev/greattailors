import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String },
    hourlyRate: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Worker ||
  mongoose.model("Worker", workerSchema);
