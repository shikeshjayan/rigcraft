import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.get("/", protect, notificationController.getNotifications);

router.get("/unread", protect, notificationController.getUnreadCount);

router.put("/:id/read", protect, notificationController.markAsRead);

router.put("/read-all", protect, notificationController.markAllAsRead);

router.delete("/:id", protect, notificationController.deleteNotification);

export default router;

export const adminNotificationRoutes = Router();

adminNotificationRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  notificationController.adminGetNotifications
);

adminNotificationRoutes.get(
  "/unread",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  notificationController.adminGetUnreadCount
);

adminNotificationRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  notificationController.adminGetNotification
);

adminNotificationRoutes.put(
  "/:id/read",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  notificationController.adminMarkAsRead
);

adminNotificationRoutes.put(
  "/read-all",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  notificationController.adminMarkAllAsRead
);
