import express from "express";
import { getNotifications, markRead } from "../controllers/notifications.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", auth, getNotifications);
router.post("/mark-read", auth, markRead);

export default router;