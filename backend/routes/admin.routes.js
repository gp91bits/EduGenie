import express from "express";
import {
  createNews,
  createPublicEvent,
  deleteNews,
  getNews,
} from "../controllers/admin.controller.js";

import isAdmin from "../middleware/admin.js";

const adminRoutes = express.Router();

adminRoutes.post("/createNews", isAdmin, createNews);
adminRoutes.get("/getNews", getNews);
adminRoutes.delete("/deleteNews", isAdmin, deleteNews);
adminRoutes.post("/createPublicEvent", isAdmin, createPublicEvent);

export default adminRoutes;