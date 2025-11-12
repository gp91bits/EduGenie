import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./conf/database.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "./middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

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

// reset API Routes reset
app.use("/api/auth", authRoutes);
app.use("/api/event", authMiddleware, eventRoutes);

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
