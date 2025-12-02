import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },
    // store picture in DB as binary + MIME type
    profilePicture: {
      data: { type: Buffer, default: null },
      contentType: { type: String, default: null },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
