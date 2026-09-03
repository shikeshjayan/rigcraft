import { z } from "zod";

export const chatSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(20000),
});
