import supportMessageRepository from "../repositories/support-message.repository.js";

export const registerSupportHandlers = (io, socket) => {
  socket.on("support:join", (ticketId) => {
    const room = `support:${ticketId}`;
    socket.join(room);
  });

  socket.on("support:leave", (ticketId) => {
    const room = `support:${ticketId}`;
    socket.leave(room);
  });

  socket.on("support:mark-read", async (ticketId) => {
    try {
      await supportMessageRepository.markAsRead(ticketId, socket.userId);
      io.to(`support:${ticketId}`).emit("support:read-status", { ticketId, readBy: socket.userId });
    } catch (err) {
      socket.emit("error", { message: "Failed to mark messages as read" });
    }
  });
};

export const emitNewMessage = (io, ticketId, messageData) => {
  io.to(`support:${ticketId}`).emit("support:new-message", messageData);
};

export const emitTicketUpdate = (io, ticketId, ticketData) => {
  io.to(`support:${ticketId}`).emit("support:ticket-updated", ticketData);
};