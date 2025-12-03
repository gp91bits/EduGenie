import express from "express";
import {
  createNews,
  createPublicEvent,
  deleteEvent,
  deleteNews,
  getNews,
  updateEvent,
  updateNews,
  getAllUsers,
  deleteUser,
  blockUnblockUser,
} from "../controllers/admin.controller.js";
import isAdmin from "../middleware/admin.js";

const adminRoutes = express.Router();

// News Routes
adminRoutes.post("/createNews", isAdmin, createNews);
adminRoutes.get("/getNews", getNews);
adminRoutes.delete("/deleteNews/:id", isAdmin, deleteNews);
adminRoutes.put("/updateNews/:id", isAdmin, updateNews);

// Event Routes
adminRoutes.post("/createPublicEvent", isAdmin, createPublicEvent);
adminRoutes.put("/updateEvent/:id", isAdmin, updateEvent);
adminRoutes.delete("/deleteEvent/:id", isAdmin, deleteEvent);

// User Management Routes
adminRoutes.get("/users", isAdmin, getAllUsers);
adminRoutes.delete("/users/:id", isAdmin, deleteUser);
adminRoutes.put("/users/:id/block", isAdmin, blockUnblockUser);

export default adminRoutes;