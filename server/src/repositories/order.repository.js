import BaseRepository from "./base.repository.js";
import Order from "../models/order.model.js";

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByOrderNumber(orderNumber) {
    return this.model.findOne({ orderNumber });
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

  async countByUser(userId) {
    return this.model.countDocuments({ user: userId });
  }

  async findByRazorpayOrderId(razorpayOrderId) {
    return this.model.findOne({ "razorpay.orderId": razorpayOrderId });
  }
}

export default new OrderRepository();
