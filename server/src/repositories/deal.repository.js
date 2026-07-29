import BaseRepository from "./base.repository.js";
import Deal from "../models/deal.model.js";

class DealRepository extends BaseRepository {
  constructor() {
    super(Deal);
  }

  async findBySlug(slug) {
    return this.model
      .findOne({ slug })
      .populate("products prebuiltPcs");
  }

  async findByCode(code) {
    return this.model
      .findOne({ code })
      .populate("products prebuiltPcs");
  }

  async findActive() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate("products prebuiltPcs")
      .sort({ createdAt: -1 });
  }

  async findActiveForHomepage() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate("products prebuiltPcs")
      .limit(8)
      .sort({ createdAt: -1 });
  }
}

export default new DealRepository();
