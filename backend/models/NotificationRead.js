import mongoose from "mongoose";

const notificationReadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notification: { type: mongoose.Schema.Types.ObjectId, ref: "Notification", required: true },
  },
  { timestamps: true }
);

notificationReadSchema.index({ user: 1, notification: 1 }, { unique: true });

export default mongoose.model("NotificationRead", notificationReadSchema);
