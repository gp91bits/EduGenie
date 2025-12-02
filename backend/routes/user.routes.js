import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  upload,
  uploadProfilePicture,
  removeProfilePicture,
  getProfilePicture,
  updateName,
  updateSemester,
  getProfileStats,
} from "../controllers/user.controller.js";

const router = express.Router();

// frontend expects these endpoints:
router.get("/profile-stats", auth, getProfileStats);
router.post(
  "/upload-profile-picture",
  auth,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/remove-profile-picture", auth, removeProfilePicture);
router.get("/profile", auth, getProfilePicture);
router.put("/update-name", auth, updateName);
router.put("/update-semester", auth, updateSemester);

export default router;
