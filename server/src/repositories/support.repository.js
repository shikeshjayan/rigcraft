import BaseRepository from "./base.repository.js";
import SupportTicket from "../models/support-ticket.model.js";

class SupportTicketRepository extends BaseRepository {
  constructor() {
    super(SupportTicket);
  }

  async findByTicketNumber(ticketNumber) {
    return this.model.findOne({ ticketNumber });
  }

  async findByUser(userId, options = {}) {
    const { sort = { lastMessageAt: -1, createdAt: -1 }, page, limit } = options;
    let query = this.model.find({ user: userId }).sort(sort);

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    return query;
  }

  async countByUser(userId) {
    return this.model.countDocuments({ user: userId });
  }

  async findOpenByUser(userId) {
    return this.model.find({
      user: userId,
      status: { $in: ["open", "in_progress", "waiting_customer"] },
    }).sort({ lastMessageAt: -1 });
  }
}

export default new SupportTicketRepository();