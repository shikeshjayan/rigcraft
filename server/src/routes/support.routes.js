import { Router } from "express";
import * as supportController from "../controllers/support.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import { uploadAnyFiles } from "../middlewares/upload.middleware.js";
import {
  createTicketSchema,
  sendMessageSchema,
  updateStatusSchema,
  assignTicketSchema,
  updatePrioritySchema,
} from "../validators/support.validation.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.post(
  "/",
  protect,
  hasPermission(PERMISSIONS.support.createTicket),
  uploadAnyFiles("attachments", 5),
  validate(createTicketSchema),
  supportController.create
);

router.get(
  "/",
  protect,
  hasPermission(PERMISSIONS.support.list),
  supportController.list
);

router.get(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.support.read),
  supportController.getById
);

router.post(
  "/:id/messages",
  protect,
  hasPermission(PERMISSIONS.support.reply),
  uploadAnyFiles("attachments", 5),
  validate(sendMessageSchema),
  supportController.sendMessage
);

router.put(
  "/:id/close",
  protect,
  hasPermission(PERMISSIONS.support.updateStatus),
  supportController.close
);

export default router;

export const adminSupportRoutes = Router();

adminSupportRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.support.list),
  supportController.adminList
);

adminSupportRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.support.read),
  supportController.adminGetById
);

adminSupportRoutes.post(
  "/:id/messages",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.support.reply),
  uploadAnyFiles("attachments", 5),
  validate(sendMessageSchema),
  supportController.adminReply
);

adminSupportRoutes.put(
  "/:id/status",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.support.updateStatus),
  validate(updateStatusSchema),
  supportController.adminUpdateStatus
);

adminSupportRoutes.put(
  "/:id/assign",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.support.assign),
  validate(assignTicketSchema),
  supportController.adminAssign
);

adminSupportRoutes.put(
  "/:id/priority",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.support.updatePriority),
  validate(updatePrioritySchema),
  supportController.adminUpdatePriority
);

adminSupportRoutes.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.support.delete),
  supportController.adminDelete
);