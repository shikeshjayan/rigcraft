import notificationRepository from "../repositories/notification.repository.js";
import { getIO } from "../socket/index.js";
import { USER_ROLES } from "../constants/constants.js";
import ApiError from "../utils/ApiError.js";

export const STAFF_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.PRODUCT_MANAGER,
  USER_ROLES.ORDER_MANAGER,
  USER_ROLES.SUPPORT_EXECUTIVE,
];

export const createNotification = async (data) => {
  const notification = await notificationRepository.create(data);

  try {
    const io = getIO();
    const payload = {
      _id: notification._id,
      recipient: notification.recipient,
      recipientRole: notification.recipientRole,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      module: notification.module,
      reference: notification.reference,
      priority: notification.priority,
      isRead: notification.isRead,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    };

    if (data.recipientRole === "customer") {
      io.to(`user:${notification.recipient}`).emit("notification:new", payload);
    } else {
      io.to(`admin:${notification.recipientRole}`).emit("notification:new", payload);
    }
  } catch (err) {
    // Socket not initialized — notification still saved
  }

  return notification;
};

export const getNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    notificationRepository.findByRecipient(userId, {
      sort: { createdAt: -1 },
      page,
      limit,
    }),
    notificationRepository.countByRecipient(userId),
    notificationRepository.countUnreadByRecipient(userId),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAdminNotifications = async (role, query = {}) => {
  const { page = 1, limit = 20 } = query;

  const [notifications, total, unreadCount] = await Promise.all([
    notificationRepository.findForAdmin(role, {
      sort: { createdAt: -1 },
      page,
      limit,
    }),
    notificationRepository.countForAdmin(role),
    notificationRepository.countUnreadForAdmin(role),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getUnreadCount = async (userId) => {
  return notificationRepository.countUnreadByRecipient(userId);
};

export const getAdminUnreadCount = async (role) => {
  return notificationRepository.countUnreadForAdmin(role);
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.findByIdAndRecipient(
    notificationId,
    userId
  );
  if (!notification) throw ApiError.notFound("Notification not found");

  return notificationRepository.markAsRead(notificationId);
};

export const markAllAsRead = async (userId) => {
  return notificationRepository.markAllAsRead(userId);
};

export const adminMarkAsRead = async (notificationId) => {
  return notificationRepository.markAsRead(notificationId);
};

export const markAllAdminAsRead = async (role) => {
  return notificationRepository.markAllAsReadForAdmin(role);
};

export const getNotificationById = async (notificationId) => {
  return notificationRepository.findById(notificationId);
};

export const getAdminNotificationById = async (notificationId) => {
  return notificationRepository.findById(notificationId);
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await notificationRepository.findByIdAndRecipient(
    notificationId,
    userId
  );
  if (!notification) throw ApiError.notFound("Notification not found");

  return notificationRepository.deleteById(notificationId);
};

export const cleanupOldNotifications = async (days = 90) => {
  return notificationRepository.deleteOldNotifications(days);
};
