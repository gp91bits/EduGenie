import News from "../models/News.js";
import Event from "../models/Events.js";
import mongoose from "mongoose";

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
    return res.status(201).json({ success: true, news: created });
  } catch (err) {
    console.error("createNews error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create news" });
  }
};

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

    return res
      .status(200)
      .json({ success: true, message: "News deleted", news: removed });
  } catch (err) {
    console.error("deleteNews error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete news" });
  }
};

// Create Event for all users
export const createPublicEvent = async (req, res) => {
  try {
    const { title, event, date, userId } = req.body;

    if (
      !title ||
      typeof title !== "string" ||
      !event ||
      typeof event !== "string" ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "title, event and date are required",
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      event: event.trim(),
      date,
      userId: null,
    });

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

    return res
      .status(200)
      .json({ success: true, message: "Event deleted", event: removed });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete event" });
  }
};
