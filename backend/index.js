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
import authMiddleware from "./middleware/auth.middleware.js";
import progressRoutes from "./routes/progress.routes.js";
import subjectNotesRoutes from "./routes/subjectsNotes.routes.js";
import isAdmin from "./middleware/admin.js";
import adminRoutes from "./routes/admin.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Create uploads directory for profile pictures
const uploadsDir = path.join(__dirname, "uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// reset Core Middleware reset
app.use(cookieParser());
app.use(express.json());
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// reset API Routes reset
app.use("/api/auth", authRoutes);
app.use("/api/event", authMiddleware, eventRoutes);
app.use("/api/task", authMiddleware, taskRoutes);
app.use("/api/quiz", authMiddleware, quizRoutes);
app.use("/api/user", userRoutes);
app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/subjectNotes",  authMiddleware, subjectNotesRoutes);
app.use("/api/admin",  authMiddleware, adminRoutes);

const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(frontendPath, "index.html"));
// });
// reset 404 Fallback reset
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//  Start Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
