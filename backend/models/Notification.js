import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["event", "news", "notes"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    msg: { type: String, required: true },
    actionUrl: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    priority: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);


notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;