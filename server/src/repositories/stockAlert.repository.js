import BaseRepository from "./base.repository.js";
import StockAlert from "../models/stockAlert.model.js";

class StockAlertRepository extends BaseRepository {
  constructor() {
    super(StockAlert);
  }

  async findByUserAndItem(userId, itemType, itemId) {
    return this.model.findOne({ user: userId, itemType, item: itemId });
  }

  async findPendingByItem(itemType, itemId) {
    return this.model.find({ itemType, item: itemId, status: "pending" });
  }

  async findByUser(userId, options = {}) {
    const { sort = { createdAt: -1 }, page, limit } = options;
    let query = this.model.find({ user: userId }).sort(sort);

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    return query;
  }
}

export default new StockAlertRepository();
