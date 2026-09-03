import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as aiController from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { chatSchema } from "../validators/ai.validation.js";

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chat requests. Please slow down.",
  },
});

router.post(
  "/chat",
  protect,
  chatLimiter,
  validate(chatSchema),
  aiController.chat
);

export default router;
