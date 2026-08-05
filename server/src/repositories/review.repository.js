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
      sort = { isVerifiedPurchase: -1, createdAt: -1 },
      rating,
      minRating,
      verifiedOnly,
    } = options;

    const filter = { item: itemId, itemType, status: "approved" };
    if (rating) filter.rating = Number(rating);
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (verifiedOnly) filter.isVerifiedPurchase = true;

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
      .populate("user", "firstName lastName avatar")
      .populate("item", "name slug sku images")
      .populate("adminReply.admin", "firstName lastName");
    if (!review) return null;
    return review;
  }

  async findTestimonials() {
    return this.model
      .find({ reviewType: "website", status: "approved", featured: true })
      .populate("user", "firstName lastName avatar")
      .sort({ displayOrder: 1, createdAt: -1 });
  }

  async addHelpfulVote(reviewId, userId) {
    return this.model.findByIdAndUpdate(
      reviewId,
      { $addToSet: { helpfulVotes: userId }, $inc: { helpfulCount: 1 } },
      { new: true }
    );
  }

  async removeHelpfulVote(reviewId, userId) {
    return this.model.findByIdAndUpdate(
      reviewId,
      { $pull: { helpfulVotes: userId }, $inc: { helpfulCount: -1 } },
      { new: true }
    );
  }

  async addReport(reviewId, report) {
    return this.model.findByIdAndUpdate(
      reviewId,
      { $push: { reports: report } },
      { new: true }
    );
  }

  async clearReports(reviewId) {
    return this.model.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          reports: [],
          spamFlagged: false,
          spamScore: 0,
          spamReason: "",
        },
      },
      { new: true }
    );
  }

  async clearSpamFlag(reviewId) {
    return this.model.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          spamFlagged: false,
          spamScore: 0,
          spamReason: "",
        },
      },
      { new: true }
    );
  }

  async getReviewStats() {
    const result = await this.model.aggregate([
      {
        $facet: {
          totals: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          byType: [
            { $group: { _id: "$reviewType", count: { $sum: 1 } } },
          ],
          ratingDistribution: [
            { $match: { status: "approved" } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          avgRating: [
            { $match: { status: "approved" } },
            { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
          ],
          helpful: [
            { $group: { _id: null, total: { $sum: "$helpfulCount" } } },
          ],
          reported: [
            { $match: { "reports.0": { $exists: true } } },
            { $count: "count" },
          ],
          flagged: [
            { $match: { spamFlagged: true } },
            { $count: "count" },
          ],
          dailyTrend: [
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const facet = result[0] || {};
    const toMap = (arr) =>
      (arr || []).reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

    return {
      totals: toMap(facet.totals),
      byType: toMap(facet.byType),
      ratingDistribution: toMap(facet.ratingDistribution),
      avgRating: facet.avgRating?.[0]?.average || 0,
      avgRatingCount: facet.avgRating?.[0]?.count || 0,
      helpfulTotal: facet.helpful?.[0]?.total || 0,
      reported: facet.reported?.[0]?.count || 0,
      flagged: facet.flagged?.[0]?.count || 0,
      dailyTrend: (facet.dailyTrend || []).map((d) => ({
        date: d._id,
        count: d.count,
      })),
    };
  }

  async getRatingStats(itemId, itemType) {
    const stats = await this.model.aggregate([
      { $match: { item: itemId, itemType, status: "approved" } },
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

  async getRatingDistribution(itemId, itemType) {
    const rows = await this.model.aggregate([
      { $match: { item: itemId, itemType, status: "approved" } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows) {
      if (row._id >= 1 && row._id <= 5) distribution[row._id] = row.count;
    }
    return distribution;
  }

  async adminFindAll(options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 }, filter = {} } = options;

    return this.model.paginate(
      filter,
      {
        page,
        limit,
        sort,
        populate: [
          { path: "user", select: "firstName lastName email avatar" },
          { path: "item", select: "name slug sku images" },
        ],
      }
    );
  }
}

export default new ReviewRepository();
