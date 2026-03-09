// models/Worker.js
import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    mobile: { type: String },          // ✅ FIX
    specialization: { type: String },  // ✅ FIX

    status: { type: String, default: "Active" },
    hourlyRate: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Worker ||
  mongoose.model("Worker", WorkerSchema);
