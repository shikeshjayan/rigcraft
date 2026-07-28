import { z } from "zod";
import { FAQ_CATEGORIES } from "../constants/support.constants.js";

export const createFAQSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(1),
  category: z.enum(Object.values(FAQ_CATEGORIES)).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateFAQSchema = z.object({
  question: z.string().min(3).max(300).optional(),
  answer: z.string().min(1).optional(),
  category: z.enum(Object.values(FAQ_CATEGORIES)).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});