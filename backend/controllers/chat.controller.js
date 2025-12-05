import ChatMessage from "../models/Chat.js";

export const getMessages = async (req, res) => {
  try {
    const semesterId = Number(req.params.semesterId);
    const page = Number(req.query.page || 0);
    const limit = Number(req.query.limit || 50);

    const messages = await ChatMessage.find({ semesterId })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const semesterId = Number(req.params.semesterId);
    const { text, tempId } = req.body;

    if (!req.user)
      return res.status(401).json({ error: "Unauthorized" });

    const message = await ChatMessage.create({
      semesterId,
      text,
      tempId,
      sender: {
        id: req.user._id.toString(),
        name: req.user.name,
      },
    });

    return res.json({ success: true, message });
  } catch (err) {
    console.error("createMessage error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
