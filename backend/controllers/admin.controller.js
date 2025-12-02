import mongoose from "mongoose";
import News from "../models/News.js";
import Event from "../models/Events.js";
import { createNotification } from "./helperFunctions.js";

// ------------------------------
// GET ALL NEWS
// ------------------------------
export const getNews = async (req, res) => {
  try {
    const items = await News.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, news: items });
  } catch (err) {
    console.error("getNews error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch news" });
  }
};

// ------------------------------
// CREATE NEWS
// ------------------------------
export const createNews = async (req, res) => {
  try {
    const { headline, news } = req.body;

    if (
      !headline ||
      typeof headline !== "string" ||
      !news ||
      typeof news !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "headline and news are required strings",
      });
    }

    const created = await News.create({
      headline: headline.trim(),
      news: news.trim(),
    });

    createNotification({
      category: "news",
      title: created.headline,
      msg: created.news,
      actionUrl: `/news/${created._id}`,
    }).catch((e) => console.error("news notification failed:", e));

    return res.status(201).json({ success: true, news: created });
  } catch (err) {
    console.error("createNews error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create news" });
  }
};

// ------------------------------
// CREATE PUBLIC EVENT
// ------------------------------
export const createPublicEvent = async (req, res) => {
  try {
    const { title, event, date } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      !event ||
      typeof event !== "string" ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "title, event, and date are required",
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      event: event.trim(),
      date,
      userId: null,
    });

    createNotification({
      category: "event",
      title: newEvent.title,
      msg: newEvent.event,
      actionUrl: `/events/${newEvent._id}`,
    }).catch((e) => console.error("event notification failed:", e));

    return res.status(201).json({
      success: true,
      message: "Event creation successful",
      event: newEvent,
    });
  } catch (error) {
    console.error("createEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
// ------------------------------
// UPDATE NEWS
// ------------------------------
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid news id" });
    }

    const { headline, news } = req.body;
    const updatePayload = {};
    if (typeof headline === "string") updatePayload.headline = headline.trim();
    if (typeof news === "string") updatePayload.news = news.trim();
   

    const updated = await News.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    return res.status(200).json({ success: true, message: "News updated", news: updated });
  } catch (error) {
    console.error("updateNews error:", error);
    return res.status(500).json({ success: false, message: "Failed to update news" });
  }
};

// ------------------------------
// DELETE NEWS
// ------------------------------
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid news id" });
    }

    const removed = await News.findByIdAndDelete(id);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    return res.status(200).json({
      success: true,
      message: "News deleted",
      news: removed,
    });
  } catch (err) {
    console.error("deleteNews error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete news" });
  }
};

// ------------------------------
// UPDATE EVENT
// ------------------------------
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const { title, event, date } = req.body;
    const updatePayload = {};
    if (typeof title === "string") updatePayload.title = title.trim();
    if (typeof event === "string") updatePayload.event = event.trim();
    if (date) updatePayload.date = date;

    const updated = await Event.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({ success: true, message: "Event updated", event: updated });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res.status(500).json({ success: false, message: "Failed to update event" });
  }
};

// ------------------------------
// DELETE EVENT
// ------------------------------
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const removed = await Event.findByIdAndDelete(id);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted",
      event: removed,
    });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete event" });
  }
};

