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
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });
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
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });
  }

  async findPromotions() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .select(
        "title slug description startDate endDate desktopBanner mobileBanner buttonText buttonLink isFeatured promotion displayOrder",
      )
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });
  }
}

export default new DealRepository();
