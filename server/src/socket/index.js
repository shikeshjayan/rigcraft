import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerSupportHandlers } from "./support.socket.js";
import { registerNotificationHandlers } from "./notification.socket.js";

let io = null;

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN, "http://localhost:5173"] : "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (() => {
        const cookie = socket.handshake.headers?.cookie || "";
        const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
      })();
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role || "customer";
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    registerSupportHandlers(io, socket);
    registerNotificationHandlers(io, socket);
  });

  return io;
};