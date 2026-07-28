import { Router } from "express";
import * as supportController from "../controllers/support.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";
import {
  createTicketSchema,
  sendMessageSchema,
  updateStatusSchema,
  assignTicketSchema,
  updatePrioritySchema,
} from "../validators/support.validation.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.post("/", protect, uploadMultipleImages("attachments", 5), validate(createTicketSchema), supportController.create);
router.get("/", protect, supportController.list);
router.get("/:id", protect, supportController.getById);
router.post("/:id/messages", protect, uploadMultipleImages("attachments", 5), validate(sendMessageSchema), supportController.sendMessage);
router.put("/:id/close", protect, supportController.close);

export default router;

export const adminSupportRoutes = Router();

adminSupportRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  supportController.adminList
);

adminSupportRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  supportController.adminGetById
);

adminSupportRoutes.post(
  "/:id/messages",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  uploadMultipleImages("attachments", 5),
  validate(sendMessageSchema),
  supportController.adminReply
);

adminSupportRoutes.put(
  "/:id/status",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(updateStatusSchema),
  supportController.adminUpdateStatus
);

adminSupportRoutes.put(
  "/:id/assign",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(assignTicketSchema),
  supportController.adminAssign
);

adminSupportRoutes.put(
  "/:id/priority",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(updatePrioritySchema),
  supportController.adminUpdatePriority
);

adminSupportRoutes.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  supportController.adminDelete
);