import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.get("/", protect, hasPermission(PERMISSIONS.notifications.read), notificationController.getNotifications);

router.get("/unread", protect, hasPermission(PERMISSIONS.notifications.read), notificationController.getUnreadCount);

router.put("/:id/read", protect, hasPermission(PERMISSIONS.notifications.markRead), notificationController.markAsRead);

router.put("/read-all", protect, hasPermission(PERMISSIONS.notifications.markAllRead), notificationController.markAllAsRead);

router.delete("/:id", protect, hasPermission(PERMISSIONS.notifications.delete), notificationController.deleteNotification);

export default router;

export const adminNotificationRoutes = Router();

adminNotificationRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.notifications.adminList),
  notificationController.adminGetNotifications
);

adminNotificationRoutes.get(
  "/unread",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.notifications.adminList),
  notificationController.adminGetUnreadCount
);

adminNotificationRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.notifications.adminList),
  notificationController.adminGetNotification
);

adminNotificationRoutes.put(
  "/:id/read",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.notifications.adminList),
  notificationController.adminMarkAsRead
);

adminNotificationRoutes.put(
  "/read-all",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.notifications.adminList),
  notificationController.adminMarkAllAsRead
);