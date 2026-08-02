import crypto from "crypto";
import supportTicketRepository from "../repositories/support.repository.js";
import supportMessageRepository from "../repositories/support-message.repository.js";
import ApiError from "../utils/ApiError.js";
import SupportTicket from "../models/support-ticket.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import * as uploadService from "./upload.service.js";
import { TICKET_STATUS, TICKET_PRIORITY } from "../constants/support.constants.js";
import { USER_ROLES } from "../constants/constants.js";
import * as orderService from "./order.service.js";
import { createNotification } from "./notification.service.js";
import { getIO } from "../socket/index.js";
import { emitNewMessage, emitTicketUpdate } from "../socket/support.socket.js";

const TICKET_PREFIX = "SUP";
const TICKET_NUMBER_RETRIES = 5;

const DEFAULT_PRIORITY_BY_ISSUE = {
  payment: TICKET_PRIORITY.HIGH,
  refund: TICKET_PRIORITY.HIGH,
  order: TICKET_PRIORITY.MEDIUM,
  shipping: TICKET_PRIORITY.MEDIUM,
  warranty: TICKET_PRIORITY.MEDIUM,
  return: TICKET_PRIORITY.MEDIUM,
  replacement: TICKET_PRIORITY.MEDIUM,
  product: TICKET_PRIORITY.LOW,
  other: TICKET_PRIORITY.LOW,
};

const safeEmit = (fn) => {
  try {
    fn(getIO());
  } catch (err) {
    // Socket.IO not initialized — skip realtime emit
  }
};

const toPlain = (doc) => (doc && typeof doc.toObject === "function" ? doc.toObject() : doc);

const notifyStaff = async (ticket, title, message) => {
  try {
    const [admin, manager] = await Promise.all([
      User.findOne({ role: USER_ROLES.ADMIN, isBlocked: { $ne: true } }),
      User.findOne({ role: USER_ROLES.MANAGER, isBlocked: { $ne: true } }),
    ]);

    const targets = [
      admin ? { userId: admin._id, role: USER_ROLES.ADMIN } : null,
      manager ? { userId: manager._id, role: USER_ROLES.MANAGER } : null,
    ].filter(Boolean);

    await Promise.all(
      targets.map(({ userId, role }) =>
        createNotification({
          recipient: userId,
          recipientRole: role,
          type: "support",
          module: "Support",
          reference: ticket._id,
          referenceModel: "SupportTicket",
          priority: "normal",
          title,
          message,
          actionUrl: `/admin/support/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber, issueType: ticket.issueType },
        })
      )
    );
  } catch (err) {
    // Notification is best-effort
  }
};

const uploadAttachments = async (files) => {
  if (!files || files.length === 0) return [];

  const uploaded = await uploadService.uploadMultipleImages(files, "support");

  return uploaded.map((uploadedItem, i) => ({
    url: uploadedItem?.url,
    publicId: uploadedItem?.publicId || null,
    originalName: files[i]?.originalname,
    mimeType: files[i]?.mimetype,
    size: files[i]?.size,
  }));
};

export const generateTicketNumber = async () => {
  for (let attempt = 0; attempt < TICKET_NUMBER_RETRIES; attempt++) {
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    const ticketNumber = `${TICKET_PREFIX}-${random}`;

    const existing = await supportTicketRepository.findByTicketNumber(ticketNumber);
    if (!existing) return ticketNumber;
  }

  throw ApiError.internal("Failed to generate unique ticket number");
};

export const createTicket = async (userId, { order, issueType, subject, description, name, cancelOrder, priority }, files = []) => {
  const ticketNumber = await generateTicketNumber();

  let resolvedPriority = priority || DEFAULT_PRIORITY_BY_ISSUE[issueType] || TICKET_PRIORITY.MEDIUM;
  const keywordText = `${subject || ""} ${description || ""}`.toLowerCase();
  if (/urgent|asap|immediately|right away/i.test(keywordText)) {
    resolvedPriority = TICKET_PRIORITY.URGENT;
  }

  let cancellationNote = "";

  if (order) {
    const existingOrder = await Order.findById(order);
    if (!existingOrder) throw ApiError.notFound("Order not found");
    if (existingOrder.user.toString() !== userId.toString()) {
      throw ApiError.forbidden("You can only create a ticket for your own orders");
    }

    if (cancelOrder) {
      try {
        await orderService.cancelOrder(
          existingOrder._id,
          userId,
          { _id: userId, role: "customer" },
          "Cancelled via support ticket"
        );
        cancellationNote =
          "Your order was cancelled successfully. If you already paid, a refund will be processed.";
      } catch (err) {
        cancellationNote = `Your cancellation request could not be completed: ${
          err.message || "please contact support for help"
        }`;
      }
    }
  }

  const ticketData = {
    ticketNumber,
    user: userId,
    name,
    issueType,
    subject,
    description,
    status: TICKET_STATUS.OPEN,
    priority: resolvedPriority,
    lastMessageAt: new Date(),
  };

  if (order) ticketData.order = order;

  const ticket = await supportTicketRepository.create(ticketData);

  const attachments = await uploadAttachments(files);

  const firstMessage = [description, cancellationNote].filter(Boolean).join("\n\n---\n\n");

  const firstMessageDoc = await supportMessageRepository.create({
    ticket: ticket._id,
    sender: userId,
    senderRole: "customer",
    message: firstMessage,
    attachments,
  });

  safeEmit((io) => {
    emitNewMessage(io, ticket._id, {
      _id: firstMessageDoc._id,
      ticket: ticket._id,
      sender: userId,
      senderRole: "customer",
      message: firstMessage,
      attachments,
      createdAt: firstMessageDoc.createdAt,
    });
    emitTicketUpdate(io, ticket._id, toPlain(ticket));
  });

  await notifyStaff(ticket, "New support ticket", `${ticket.ticketNumber}: ${subject || "Support request"}`);

  return ticket;
};

export const getMyTickets = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    SupportTicket.find({ user: userId })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("order", "orderNumber total orderStatus")
      .populate("assignedTo", "firstName lastName email"),
    SupportTicket.countDocuments({ user: userId }),
  ]);

  return {
    tickets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getMyTicket = async (ticketId, userId) => {
  const ticket = await SupportTicket.findById(ticketId)
    .populate("order", "orderNumber total orderStatus createdAt")
    .populate("assignedTo", "firstName lastName email");

  if (!ticket) throw ApiError.notFound("Ticket not found");
  if (ticket.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only view your own tickets");
  }

  const messages = await supportMessageRepository.findByTicket(ticketId);
  return { ticket, messages };
};

export const sendMessage = async (ticketId, userId, userRole, { message }, files = []) => {
  const ticket = await supportTicketRepository.findById(ticketId);

  if (ticket.status === TICKET_STATUS.CLOSED) {
    throw ApiError.badRequest("Cannot reply to a closed ticket");
  }

  if (userRole === "customer" && ticket.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only reply to your own tickets");
  }

  const attachments = await uploadAttachments(files);

  const msg = await supportMessageRepository.create({
    ticket: ticketId,
    sender: userId,
    senderRole: userRole,
    message: message || "",
    attachments,
  });

  const populated = await supportMessageRepository.model
    .findById(msg._id)
    .populate("sender", "firstName lastName email avatar role");

  ticket.lastMessageAt = new Date();

  if (userRole === "customer" && ticket.status !== TICKET_STATUS.CLOSED) {
    ticket.status = TICKET_STATUS.OPEN;
  } else if (userRole !== "customer" && ticket.status === TICKET_STATUS.WAITING_CUSTOMER) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
  }

  await ticket.save({ validateBeforeSave: false });

  safeEmit((io) => {
    emitNewMessage(io, ticketId, toPlain(populated));
    emitTicketUpdate(io, ticketId, toPlain(ticket));
  });

  try {
    if (userRole === "customer") {
      await notifyStaff(ticket, "New reply on a ticket", `${ticket.ticketNumber}: ${(message || "").slice(0, 120)}`);
    } else {
      await createNotification({
        recipient: ticket.user,
        recipientRole: "customer",
        type: "support",
        module: "Support",
        reference: ticket._id,
        referenceModel: "SupportTicket",
        priority: "normal",
        title: "New reply on your ticket",
        message: `${ticket.ticketNumber}: ${(message || "").slice(0, 120)}`,
        actionUrl: `/my-tickets/${ticket._id}`,
        metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
      });
    }
  } catch (err) {
    // Notification is best-effort
  }

  return { message: populated, ticket };
};

export const closeTicket = async (ticketId, userId) => {
  const ticket = await supportTicketRepository.findById(ticketId);

  if (ticket.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only close your own tickets");
  }

  if (ticket.status === TICKET_STATUS.CLOSED) {
    throw ApiError.badRequest("Ticket is already closed");
  }

  ticket.status = TICKET_STATUS.CLOSED;
  ticket.closedAt = new Date();
  await ticket.save({ validateBeforeSave: false });

  safeEmit((io) => emitTicketUpdate(io, ticketId, toPlain(ticket)));

  return ticket;
};

export const adminGetAllTickets = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { lastMessageAt: -1 },
    status,
    priority,
    issueType,
    search,
  } = query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (issueType) filter.issueType = issueType;
  if (search) {
    filter.$or = [
      { ticketNumber: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "firstName lastName email avatar")
      .populate("order", "orderNumber total orderStatus")
      .populate("assignedTo", "firstName lastName email"),
    SupportTicket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const adminGetTicket = async (ticketId) => {
  const ticket = await SupportTicket.findById(ticketId)
    .populate("user", "firstName lastName email phone avatar")
    .populate("order", "orderNumber total orderStatus paymentMethod createdAt items")
    .populate("assignedTo", "firstName lastName email role");

  if (!ticket) throw ApiError.notFound("Ticket not found");

  const messages = await supportMessageRepository.findByTicket(ticketId);

  return { ticket, messages };
};

export const adminUpdateStatus = async (ticketId, status, user) => {
  const ticket = await supportTicketRepository.findById(ticketId);
  const validTransitions = {
    [TICKET_STATUS.OPEN]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.CLOSED],
    [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.WAITING_CUSTOMER, TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED],
    [TICKET_STATUS.WAITING_CUSTOMER]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED],
    [TICKET_STATUS.RESOLVED]: [TICKET_STATUS.CLOSED, TICKET_STATUS.IN_PROGRESS],
    [TICKET_STATUS.CLOSED]: [TICKET_STATUS.IN_PROGRESS],
  };

  const allowed = validTransitions[ticket.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`Cannot transition from "${ticket.status}" to "${status}"`);
  }

  ticket.status = status;
  if (status === TICKET_STATUS.RESOLVED || status === TICKET_STATUS.CLOSED) {
    ticket.closedAt = new Date();
  } else if (status === TICKET_STATUS.IN_PROGRESS && ticket.closedAt) {
    ticket.closedAt = undefined;
  }

  await ticket.save({ validateBeforeSave: false });

  safeEmit((io) => emitTicketUpdate(io, ticketId, toPlain(ticket)));

  try {
    if (status === TICKET_STATUS.RESOLVED || status === TICKET_STATUS.CLOSED) {
      await createNotification({
        recipient: ticket.user,
        recipientRole: "customer",
        type: "support",
        module: "Support",
        reference: ticket._id,
        referenceModel: "SupportTicket",
        priority: "normal",
        title: "Your ticket was updated",
        message: `${ticket.ticketNumber}: status changed to "${status.replace(/_/g, " ")}".`,
        actionUrl: `/my-tickets/${ticket._id}`,
        metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
      });
    }
  } catch (err) {
    // Notification is best-effort
  }

  return ticket;
};

export const adminAssignTicket = async (ticketId, assignedToId) => {
  const ticket = await supportTicketRepository.findById(ticketId);

  const assignee = await User.findById(assignedToId);
  if (!assignee) throw ApiError.notFound("User not found");
  if (![USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(assignee.role)) {
    throw ApiError.badRequest("Can only assign a ticket to an admin or manager");
  }

  ticket.assignedTo = assignedToId;
  await ticket.save({ validateBeforeSave: false });

  safeEmit((io) => emitTicketUpdate(io, ticketId, toPlain(ticket)));

  return ticket;
};

export const adminUpdatePriority = async (ticketId, priority) => {
  const ticket = await supportTicketRepository.findById(ticketId);
  ticket.priority = priority;
  await ticket.save({ validateBeforeSave: false });

  safeEmit((io) => emitTicketUpdate(io, ticketId, toPlain(ticket)));

  return ticket;
};

export const adminDeleteTicket = async (ticketId) => {
  const ticket = await supportTicketRepository.findById(ticketId);
  await supportMessageRepository.model.deleteMany({ ticket: ticketId });
  await supportTicketRepository.deleteById(ticketId);
  return ticket;
};