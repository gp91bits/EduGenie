import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./conf/database.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import taskRoutes from "./routes/task.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import initSocket from "./conf/socket.js";

import authMiddleware from "./middleware/auth.middleware.js";
import progressRoutes from "./routes/progress.routes.js";
import subjectNotesRoutes from "./routes/subjectsNotes.routes.js";
import isAdmin from "./middleware/admin.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Upload directory
const uploadsDir = path.join(__dirname, "uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Core middleware
app.use(cookieParser());
app.use(express.json());

// CORS — allow only FRONTEND_URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// HTTP server + socket
const server = http.createServer(app);
initSocket(server);

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/event", authMiddleware, eventRoutes);
app.use("/api/task", authMiddleware, taskRoutes);
app.use("/api/quiz", authMiddleware, quizRoutes);
app.use("/api/user", userRoutes);
app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/subjectNotes", authMiddleware, subjectNotesRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/chat", chatRoutes);

// 404 fallback
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
