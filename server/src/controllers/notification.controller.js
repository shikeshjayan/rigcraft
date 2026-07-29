import * as notificationService from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(
    req.user._id,
    req.query
  );
  ApiResponse.ok(result, "Notifications fetched successfully").send(res);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  ApiResponse.ok({ count }, "Unread count fetched successfully").send(res);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );
  ApiResponse.ok(notification, "Notification marked as read").send(res);
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  ApiResponse.ok(null, "All notifications marked as read").send(res);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  ApiResponse.ok(null, "Notification deleted successfully").send(res);
});

export const adminGetNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getAdminNotifications(
    req.user.role,
    req.query
  );
  ApiResponse.ok(result, "Notifications fetched successfully").send(res);
});

export const adminGetUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getAdminUnreadCount(req.user.role);
  ApiResponse.ok({ count }, "Unread count fetched successfully").send(res);
});

export const adminMarkAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.adminMarkAsRead(req.params.id);
  ApiResponse.ok(notification, "Notification marked as read").send(res);
});

export const adminGetNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.getAdminNotificationById(req.params.id);
  ApiResponse.ok(notification, "Notification fetched successfully").send(res);
});

export const adminMarkAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAdminAsRead(req.user.role);
  ApiResponse.ok(null, "All notifications marked as read").send(res);
});
