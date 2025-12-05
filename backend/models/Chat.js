import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    semesterId: {
      type: Number,
      required: true,
      index: true,
    },
    sender: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    text: {
      type: String,
      required: true,
    },
    tempId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", ChatMessageSchema);
