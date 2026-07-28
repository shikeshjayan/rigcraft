import notificationRepository from "../repositories/notification.repository.js";

export const registerNotificationHandlers = (io, socket) => {
  const userId = socket.userId;
  const userRole = socket.userRole;

  socket.join(`user:${userId}`);

  if (userRole === "admin" || userRole === "manager") {
    socket.join(`admin:${userRole}`);
  }

  socket.on("notification:mark-read", async (notificationId) => {
    try {
      await notificationRepository.markAsRead(notificationId);
      io.to(`user:${userId}`).emit("notification:read-status", {
        notificationId,
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to mark notification as read" });
    }
  });

  socket.on("notification:mark-all-read", async () => {
    try {
      if (userRole === "customer") {
        await notificationRepository.markAllAsRead(userId);
      } else {
        await notificationRepository.markAllAsReadByRole(userRole);
      }
      io.to(`user:${userId}`).emit("notification:all-read");
    } catch (err) {
      socket.emit("error", {
        message: "Failed to mark all notifications as read",
      });
    }
  });
};

export const emitNotification = (io, userId, notificationData) => {
  io.to(`user:${userId}`).emit("notification:new", notificationData);
};

export const emitAdminNotification = (io, role, notificationData) => {
  io.to(`admin:${role}`).emit("notification:new", notificationData);
};
