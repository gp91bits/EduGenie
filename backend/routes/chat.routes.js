import express from "express";
import { getMessages, createMessage } from "../controllers/chat.controller.js";

const chatRoutes = express.Router();

chatRoutes.get("/semester/:semesterId/messages", getMessages);
chatRoutes.post("/semester/:semesterId/messages", createMessage);

export default chatRoutes;
