import User from "../models/Users.js";
import QuizAttempt from "../models/QuizAttempt.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use memory storage so files are not written to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get user profile stats
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email semester streak bestStreak lastLoginDate profilePicture');

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const quizAttempts = await QuizAttempt.find({ user: userId, isArchived: true }).sort({ createdAt: -1 });

    const totalQuizzes = quizAttempts.length;
    let bestScore = 0, totalScore = 0, totalCorrect = 0, totalIncorrect = 0, totalQuestions = 0;
    const topicCounts = {};

    quizAttempts.forEach(attempt => {
      if (attempt.score > bestScore) bestScore = attempt.score;
      totalScore += attempt.score || 0;
      totalCorrect += attempt.correctAnswers || 0;
      totalIncorrect += attempt.incorrectAnswers || 0;
      totalQuestions += attempt.totalQuestions || 0;
      if (attempt.topic) topicCounts[attempt.topic] = (topicCounts[attempt.topic] || 0) + 1;
    });

    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const favoriteTopics = Object.entries(topicCounts).map(([topic, count]) => ({ topic, count }))
      .sort((a,b) => b.count - a.count).slice(0,5);
    const recentQuizzes = quizAttempts.slice(0,6).map(q => ({
      _id: q._id, topic: q.topic, score: q.score, correctAnswers: q.correctAnswers, totalQuestions: q.totalQuestions, createdAt: q.createdAt
    }));

    // convert profilePicture to data URL if exists
    let profilePicture = null;
    if (user.profilePicture && user.profilePicture.data) {
      const b64 = user.profilePicture.data.toString("base64");
      profilePicture = `data:${user.profilePicture.contentType};base64,${b64}`;
    }

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        semester: user.semester,
        currentStreak: user.streak || 0,
        bestStreak: user.bestStreak || user.streak || 0,
        profilePicture,
        totalQuizzes,
        bestScore,
        averageScore,
        totalCorrect,
        totalIncorrect,
        totalQuestions,
        favoriteTopics,
        recentQuizzes
      }
    });
  } catch (error) {
    console.error("Get profile stats error:", error);
    res.status(500).json({ success: false, message: "Failed to get profile stats", error: error.message });
  }
};

// Update user name
export const updateName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: "Name is required" });

    const user = await User.findByIdAndUpdate(userId, { name: name.trim() }, { new: true }).select('name email semester streak profilePicture');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // convert profilePicture to data URL if exists
    let profilePicture = null;
    if (user.profilePicture && user.profilePicture.data) {
      profilePicture = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`;
    }

    res.json({ success: true, message: "Name updated successfully", data: { name: user.name, email: user.email, semester: user.semester, streak: user.streak, profilePicture } });
  } catch (error) {
    console.error("Update name error:", error);
    res.status(500).json({ success: false, message: "Failed to update name", error: error.message });
  }
};

// Update user semester
export const updateSemester = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.body;
    if (semester === undefined || semester === null || semester < 1 || semester > 8) {
      return res.status(400).json({ success: false, message: "Semester must be between 1 and 8" });
    }

    const user = await User.findByIdAndUpdate(userId, { semester: parseInt(semester) }, { new: true }).select('name email semester streak profilePicture');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let profilePicture = null;
    if (user.profilePicture && user.profilePicture.data) {
      profilePicture = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`;
    }

    res.json({ success: true, message: "Semester updated successfully", data: { name: user.name, email: user.email, semester: user.semester, streak: user.streak, profilePicture } });
  } catch (error) {
    console.error("Update semester error:", error);
    res.status(500).json({ success: false, message: "Failed to update semester", error: error.message });
  }
};

// Upload profile picture (store in DB)
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file || !req.file.buffer) return res.status(400).json({ success: false, message: "No file uploaded" });

    // validate mime type server-side as well
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: "Invalid image type" });
    }

    const update = {
      profilePicture: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    };

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true }).select('name email profilePicture');

    // return data URL
    const profilePicture = updatedUser.profilePicture && updatedUser.profilePicture.data
      ? `data:${updatedUser.profilePicture.contentType};base64,${updatedUser.profilePicture.data.toString("base64")}`
      : null;

    res.json({ success: true, message: "Profile picture uploaded successfully", data: { profilePicture } });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ success: false, message: "Failed to upload profile picture", error: error.message });
  }
};

// Remove profile picture
export const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('profilePicture');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // clear profilePicture object
    await User.findByIdAndUpdate(userId, { $set: { "profilePicture.data": null, "profilePicture.contentType": null } });

    res.json({ success: true, message: "Profile picture removed successfully" });
  } catch (error) {
    console.error("Remove profile picture error:", error);
    res.status(500).json({ success: false, message: "Failed to remove profile picture", error: error.message });
  }
};

// Get profile picture (and basic profile)
export const getProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('profilePicture name email semester');

    let profilePicture = null;
    if (user?.profilePicture?.data) {
      profilePicture = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`;
    }

    res.json({ success: true, data: { profilePicture, name: user?.name, email: user?.email, semester: user?.semester } });
  } catch (error) {
    console.error("Get profile picture error:", error);
    res.status(500).json({ success: false, message: "Failed to get profile picture", error: error.message });
  }
};
