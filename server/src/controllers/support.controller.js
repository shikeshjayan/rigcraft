import asyncHandler from "../utils/asyncHandler.js";
import * as supportService from "../services/support.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const create = asyncHandler(async (req, res) => {
  const ticket = await supportService.createTicket(
    req.user.id,
    req.body,
    req.files || []
  );
  ApiResponse.created(ticket, "Ticket created").send(res);
});

export const list = asyncHandler(async (req, res) => {
  const result = await supportService.getMyTickets(req.user.id, req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const result = await supportService.getMyTicket(req.params.id, req.user.id);
  ApiResponse.ok(result).send(res);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const result = await supportService.sendMessage(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
    req.files || []
  );
  ApiResponse.ok(result, "Message sent").send(res);
});

export const close = asyncHandler(async (req, res) => {
  const ticket = await supportService.closeTicket(req.params.id, req.user.id);
  ApiResponse.ok(ticket, "Ticket closed").send(res);
});

export const adminList = asyncHandler(async (req, res) => {
  const result = await supportService.adminGetAllTickets(req.query);
  ApiResponse.ok(result).send(res);
});

export const adminGetById = asyncHandler(async (req, res) => {
  const result = await supportService.adminGetTicket(req.params.id);
  ApiResponse.ok(result).send(res);
});

export const adminReply = asyncHandler(async (req, res) => {
  const result = await supportService.sendMessage(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
    req.files || []
  );
  ApiResponse.ok(result, "Reply sent").send(res);
});

export const adminUpdateStatus = asyncHandler(async (req, res) => {
  const ticket = await supportService.adminUpdateStatus(
    req.params.id,
    req.body.status,
    req.user
  );
  ApiResponse.ok(ticket, "Status updated").send(res);
});

export const adminAssign = asyncHandler(async (req, res) => {
  const ticket = await supportService.adminAssignTicket(
    req.params.id,
    req.body.assignedTo
  );
  ApiResponse.ok(ticket, "Ticket assigned").send(res);
});

export const adminUpdatePriority = asyncHandler(async (req, res) => {
  const ticket = await supportService.adminUpdatePriority(
    req.params.id,
    req.body.priority
  );
  ApiResponse.ok(ticket, "Priority updated").send(res);
});

export const adminDelete = asyncHandler(async (req, res) => {
  await supportService.adminDeleteTicket(req.params.id);
  ApiResponse.ok(null, "Ticket deleted").send(res);
});