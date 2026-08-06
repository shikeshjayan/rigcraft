import BaseRepository from "./base.repository.js";
import Bundle from "../models/bundle.model.js";

class BundleRepository extends BaseRepository {
  constructor() {
    super(Bundle);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug }).populate("products prebuiltPCs");
  }

  async findByIdPopulated(id) {
    return this.model.findById(id).populate("products prebuiltPCs");
  }

  async findActive() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        $or: [
          { startDate: { $lte: now } },
          { startDate: { $exists: false } },
        ],
        $and: [
          {
            $or: [
              { endDate: { $gte: now } },
              { endDate: null },
              { endDate: { $exists: false } },
            ],
          },
        ],
      })
      .populate("products prebuiltPCs")
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });
  }

  async getActiveBundleById(id) {
    const now = new Date();
    return this.model.findOne({
      _id: id,
      isActive: true,
      $or: [{ startDate: { $lte: now } }, { startDate: { $exists: false } }],
      $and: [
        {
          $or: [
            { endDate: { $gte: now } },
            { endDate: null },
            { endDate: { $exists: false } },
          ],
        },
      ],
    });
  }
}

export default new BundleRepository();
