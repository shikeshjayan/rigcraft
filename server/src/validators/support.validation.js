import { z } from "zod";
import { ISSUE_TYPES, TICKET_STATUS, TICKET_PRIORITY } from "../constants/support.constants.js";

export const createTicketSchema = z.object({
  order: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
  issueType: z.enum(Object.values(ISSUE_TYPES)),
  subject: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  name: z.string().optional(),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

export const updateStatusSchema = z.object({
  status: z.enum(Object.values(TICKET_STATUS)),
});

export const assignTicketSchema = z.object({
  assignedTo: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(Object.values(TICKET_PRIORITY)),
});