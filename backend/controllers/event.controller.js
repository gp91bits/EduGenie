import Event from "../models/Events.js";

import User from "../models/Users.js"; 

// Create Event for a logged-in user
export const createEvent = async (req, res) => {
  try {
    const userId = req.user?.id; // assuming you attach user from auth middleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, event, date } = req.body;

    const newEvent = await Event.create({
      title,
      event,
      date,
      userId, 
    });

    return res.status(200).json({
      message: "Event creation successful",
      event: newEvent,
    });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Include user's events AND global/admin events (where userId is null or missing)
    const events = await Event.find({
      $or: [
        { userId: userId },
        { userId: { $exists: false } },
        { userId: null },
      ],
    }).sort({ date: 1 });

    return res.status(200).json({ events });
  } catch (error) {
    console.error("getEvents error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, event, date } = req.body;

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, userId },
      { title, event, date },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const event = await Event.findOneAndDelete({ _id: id, userId });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
