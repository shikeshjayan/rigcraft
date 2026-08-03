import { z } from "zod";
import mongoose from "mongoose";
import { COMPONENT_TYPES } from "../constants/constants.js";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

const componentSchema = z.object({
  type: z.nativeEnum(COMPONENT_TYPES),
  product: z.any(),
    quantity: z.number().int().min(1).max(4).default(1),
});

export const createBuildSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  components: z.array(componentSchema).optional().default([]),
  assemblyMode: z.enum(["parts", "assembled"]).optional().default("parts"),
});

export const updateBuildSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  components: z.array(componentSchema).optional(),
  isPublic: z.boolean().optional(),
  assemblyMode: z.enum(["parts", "assembled"]).optional(),
});

export const duplicateBuildSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
});

export const updateBuildSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  assemblyFeeEnabled: z.boolean().optional(),
  assemblyFeeType: z.enum(["percent", "fixed"]).optional(),
  assemblyFeeValue: z.number().min(0).optional(),
  requireCompleteBuild: z.boolean().optional(),
});