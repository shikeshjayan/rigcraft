import crypto from "crypto";
import supportTicketRepository from "../repositories/support.repository.js";
import supportMessageRepository from "../repositories/support-message.repository.js";
import ApiError from "../utils/ApiError.js";
import SupportTicket from "../models/support-ticket.model.js";
import { TICKET_STATUS, TICKET_PRIORITY } from "../constants/support.constants.js";

const TICKET_PREFIX = "SUP";
const TICKET_NUMBER_RETRIES = 5;

export const generateTicketNumber = async () => {
  for (let attempt = 0; attempt < TICKET_NUMBER_RETRIES; attempt++) {
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    const ticketNumber = `${TICKET_PREFIX}-${random}`;

    const existing = await supportTicketRepository.findByTicketNumber(ticketNumber);
    if (!existing) return ticketNumber;
  }

  throw ApiError.internal("Failed to generate unique ticket number");
};

export const createTicket = async (userId, { order, issueType, subject, description, name }, files = []) => {
  const ticketNumber = await generateTicketNumber();

  const ticketData = {
    ticketNumber,
    user: userId,
    name,
    issueType,
    subject,
    description,
    status: TICKET_STATUS.OPEN,
    priority: TICKET_PRIORITY.MEDIUM,
    lastMessageAt: new Date(),
  };

  if (order) ticketData.order = order;

  const ticket = await supportTicketRepository.create(ticketData);

  const attachments = files.map((f) => ({
    url: f.path || f.url,
    publicId: f.filename || f.publicId,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
  }));

  await supportMessageRepository.create({
    ticket: ticket._id,
    sender: userId,
    senderRole: "customer",
    message: description || "",
    attachments,
  });

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
      .populate("assignedTo", "name email"),
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
    .populate("assignedTo", "name email");

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

  const attachments = files.map((f) => ({
    url: f.path || f.url,
    publicId: f.filename || f.publicId,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
  }));

  const msg = await supportMessageRepository.create({
    ticket: ticketId,
    sender: userId,
    senderRole: userRole,
    message: message || "",
    attachments,
  });

  const populated = await supportMessageRepository.model
    .findById(msg._id)
    .populate("sender", "name email avatar role");

  ticket.lastMessageAt = new Date();

  if (userRole === "customer" && ticket.status !== TICKET_STATUS.CLOSED) {
    ticket.status = TICKET_STATUS.OPEN;
  } else if (userRole !== "customer" && ticket.status === TICKET_STATUS.WAITING_CUSTOMER) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
  }

  await ticket.save({ validateBeforeSave: false });

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
      .populate("user", "name email avatar")
      .populate("order", "orderNumber total orderStatus")
      .populate("assignedTo", "name email"),
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
    .populate("user", "name email phone avatar")
    .populate("order", "orderNumber total orderStatus paymentMethod createdAt items")
    .populate("assignedTo", "name email role");

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
  return ticket;
};

export const adminAssignTicket = async (ticketId, assignedToId) => {
  const ticket = await supportTicketRepository.findById(ticketId);
  ticket.assignedTo = assignedToId;
  await ticket.save({ validateBeforeSave: false });
  return ticket;
};

export const adminUpdatePriority = async (ticketId, priority) => {
  const ticket = await supportTicketRepository.findById(ticketId);
  ticket.priority = priority;
  await ticket.save({ validateBeforeSave: false });
  return ticket;
};

export const adminDeleteTicket = async (ticketId) => {
  const ticket = await supportTicketRepository.findById(ticketId);
  await supportMessageRepository.model.deleteMany({ ticket: ticketId });
  await supportTicketRepository.deleteById(ticketId);
  return ticket;
};