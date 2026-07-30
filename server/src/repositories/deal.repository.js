import BaseRepository from "./base.repository.js";
import Deal from "../models/deal.model.js";

class DealRepository extends BaseRepository {
  constructor() {
    super(Deal);
  }

  async findBySlug(slug) {
    return this.model
      .findOne({ slug })
      .populate("products prebuiltPCs");
  }

  async findActive() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate("products prebuiltPCs")
      .sort({ displayOrder: 1, createdAt: -1 });
  }

  async findActiveForHomepage() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate("products prebuiltPCs")
      .limit(8)
      .sort({ displayOrder: 1, createdAt: -1 });
  }
}

export default new DealRepository();
