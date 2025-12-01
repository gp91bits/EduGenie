import mongoose from "mongoose";

// Event Schema
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
     
    },
    event: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
