import BaseRepository from "./base.repository.js";
import SupportMessage from "../models/support-message.model.js";

class SupportMessageRepository extends BaseRepository {
  constructor() {
    super(SupportMessage);
  }

  async findByTicket(ticketId, options = {}) {
    const { sort = { createdAt: 1 } } = options;
    return this.model.find({ ticket: ticketId }).sort(sort).populate("sender", "name email avatar role");
  }

  async markAsRead(ticketId, notBySenderId) {
    return this.model.updateMany(
      { ticket: ticketId, sender: { $ne: notBySenderId }, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async countUnreadByTicket(ticketId, notBySenderId) {
    return this.model.countDocuments({
      ticket: ticketId,
      sender: { $ne: notBySenderId },
      isRead: false,
    });
  }

  async getLastMessage(ticketId) {
    return this.model.findOne({ ticket: ticketId }).sort({ createdAt: -1 });
  }
}

export default new SupportMessageRepository();