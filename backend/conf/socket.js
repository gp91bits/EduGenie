import { Server } from "socket.io";
import dotenv from "dotenv";
import ChatMessage from "../models/Chat.js";

dotenv.config();

export default function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
    });

    socket.on("message:create", async ({ room, text, tempId, user }, cb) => {
      const semesterId = Number(room.split(":")[1]);

      const msg = await ChatMessage.create({
        semesterId,
        text,
        tempId,
        sender: {
          id: user.id,
          name: user.name,
        },
      });

      io.to(room).emit("message:new", msg);

      cb?.({ message: msg });
    });

    socket.on("disconnect", () => {
    });
  });
}
