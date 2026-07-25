import BaseRepository from "./base.repository.js";
import Review from "../models/review.model.js";

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByItem(itemId, itemType, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      rating,
    } = options;

    const filter = { item: itemId, itemType, isVisible: true };
    if (rating) filter.rating = Number(rating);

    return this.model.paginate(filter, {
      page,
      limit,
      sort,
      populate: { path: "user", select: "firstName lastName avatar" },
    });
  }

  async findByUser(userId, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;

    return this.model.paginate(
      { user: userId },
      {
        page,
        limit,
        sort,
      }
    );
  }

  async findOneByUserAndItem(userId, itemId, itemType) {
    return this.model.findOne({ user: userId, item: itemId, itemType });
  }

  async findWithUser(reviewId) {
    const review = await this.model
      .findById(reviewId)
      .populate("user", "firstName lastName avatar");
    if (!review) return null;
    return review;
  }

  async getRatingStats(itemId, itemType) {
    const stats = await this.model.aggregate([
      { $match: { item: itemId, itemType, isVisible: true } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    return stats.length > 0 ? stats[0] : { average: 0, count: 0 };
  }

  async adminFindAll(options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;

    return this.model.paginate(
      {},
      {
        page,
        limit,
        sort,
        populate: { path: "user", select: "firstName lastName email avatar" },
      }
    );
  }
}

export default new ReviewRepository();
