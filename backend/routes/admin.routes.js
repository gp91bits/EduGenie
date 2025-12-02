import express from "express";
import {
  createNews,
  createPublicEvent,
  deleteEvent,
  deleteNews,
  getNews,
  updateEvent,
  updateNews,
} from "../controllers/admin.controller.js";
import isAdmin from "../middleware/admin.js";

const adminRoutes = express.Router();

adminRoutes.post("/createNews", isAdmin, createNews);
adminRoutes.get("/getNews", getNews);
adminRoutes.delete("/deleteNews/:id", isAdmin, deleteNews);
adminRoutes.put("/updateNews/:id", isAdmin, updateNews);
adminRoutes.post("/createPublicEvent", isAdmin, createPublicEvent);


adminRoutes.put("/updateEvent/:id", isAdmin, updateEvent);
adminRoutes.delete("/deleteEvent/:id", isAdmin, deleteEvent);

export default adminRoutes;