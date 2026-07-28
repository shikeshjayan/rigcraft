import BaseRepository from "./base.repository.js";
import Notification from "../models/notification.model.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByRecipient(recipientId, options = {}) {
    const { sort = { createdAt: -1 }, page, limit } = options;
    let query = this.model.find({ recipient: recipientId }).sort(sort);

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    return query;
  }

  async findByRole(role, options = {}) {
    const { sort = { createdAt: -1 }, page, limit } = options;
    const filter = { recipientRole: role };
    let query = this.model.find(filter).sort(sort);

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    return query;
  }

  async countByRecipient(recipientId) {
    return this.model.countDocuments({ recipient: recipientId });
  }

  async countByRole(role) {
    return this.model.countDocuments({ recipientRole: role });
  }

  async countUnreadByRecipient(recipientId) {
    return this.model.countDocuments({ recipient: recipientId, isRead: false });
  }

  async countUnreadByRole(role) {
    return this.model.countDocuments({ recipientRole: role, isRead: false });
  }

  async markAsRead(id) {
    return this.model.findByIdAndUpdate(
      id,
      { isRead: true },
      { returnDocument: "after" }
    );
  }

  async markAllAsRead(recipientId) {
    return this.model.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true }
    );
  }

  async markAllAsReadByRole(role) {
    return this.model.updateMany(
      { recipientRole: role, isRead: false },
      { isRead: true }
    );
  }

  async deleteOldNotifications(days) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.model.deleteMany({ createdAt: { $lt: cutoff } });
  }

  async findByIdAndRecipient(id, recipientId) {
    return this.model.findOne({ _id: id, recipient: recipientId });
  }
}

export default new NotificationRepository();
