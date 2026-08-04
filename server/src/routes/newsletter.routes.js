import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as newsletterController from "../controllers/newsletter.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  subscribeSchema,
  unsubscribeSchema,
  updateSubscriberSchema,
} from "../validators/newsletter.validation.js";

const router = Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many subscription attempts. Please try again later.",
  },
});

router.post("/subscribe", subscribeLimiter, validate(subscribeSchema), newsletterController.subscribe);

router.post("/unsubscribe", validate(unsubscribeSchema), newsletterController.unsubscribe);

router.get("/export", protect, authorize("admin", "manager"), newsletterController.exportSubscribers);

router.get("/", protect, authorize("admin", "manager"), newsletterController.getSubscribers);

router.get("/:id", protect, authorize("admin", "manager"), newsletterController.getSubscriber);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateSubscriberSchema),
  newsletterController.updateSubscriber
);

router.delete("/:id", protect, authorize("admin"), newsletterController.deleteSubscriber);

export default router;
