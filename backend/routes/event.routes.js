import express from "express";
import { createEvent, getEvents } from "../controllers/event.controller.js";

const eventRoutes = express.Router();

eventRoutes.post("/createEvent",  createEvent);
eventRoutes.get("/getEvents",  getEvents);

export default eventRoutes;
