import { Router } from "express";
import * as faqController from "../controllers/faq.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { createFAQSchema, updateFAQSchema } from "../validators/faq.validation.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.get("/", faqController.listPublic);

export default router;

export const adminFaqRoutes = Router();

adminFaqRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  faqController.adminList
);

adminFaqRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  faqController.getById
);

adminFaqRoutes.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN),
  validate(createFAQSchema),
  faqController.create
);

adminFaqRoutes.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  validate(updateFAQSchema),
  faqController.update
);

adminFaqRoutes.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  faqController.remove
);