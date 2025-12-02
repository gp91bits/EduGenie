import Notification from "../models/Notification.js";
import NotificationRead from "../models/NotificationRead.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();

    const readDocs = await NotificationRead.find({ user: userId }).lean();
    const readSet = new Set(readDocs.map((d) => d.notification.toString()));

    const enriched = notifications.map(n => ({
      ...n,
      isRead: readSet.has(n._id.toString()),
    }));

    return res.status(200).json({ success: true, notifications: enriched });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};
export const markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "Missing id" });

    await NotificationRead.updateOne(
      { user: userId, notification: id },
      { $set: {} },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("markRead error:", err);
    return res.status(500).json({ success: false });
  }
};
