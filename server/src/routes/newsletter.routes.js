import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as newsletterController from "../controllers/newsletter.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  subscribeSchema,
  unsubscribeSchema,
  updateSubscriberSchema,
} from "../validators/newsletter.validation.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

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

router.get(
  "/export",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.newsletter.export),
  newsletterController.exportSubscribers
);

router.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.newsletter.list),
  newsletterController.getSubscribers
);

router.get(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.newsletter.read),
  newsletterController.getSubscriber
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.newsletter.update),
  validate(updateSubscriberSchema),
  newsletterController.updateSubscriber
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.newsletter.delete),
  newsletterController.deleteSubscriber
);

export default router;