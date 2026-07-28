import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

export const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

export const updateSubscriberSchema = z.object({
  status: z.enum(["active", "unsubscribed"]).optional(),
  notes: z.string().trim().optional(),
});
