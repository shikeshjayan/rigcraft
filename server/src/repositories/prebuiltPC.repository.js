import BaseRepository from "./base.repository.js";
import PrebuiltPC from "../models/prebuiltPC.model.js";
import ApiError from "../utils/ApiError.js";

const COMPONENT_POPULATE = [
  {
    path: "components.product",
    model: "Product",
    select: "name slug price salePrice images specifications brand",
    populate: { path: "brand", select: "name slug" },
  },
];

class PrebuiltPCRepository extends BaseRepository {
  constructor() {
    super(PrebuiltPC);
  }

  async findById(id) {
    const doc = await this.model.findById(id).populate(COMPONENT_POPULATE);
    if (!doc || doc.isDeleted) throw ApiError.notFound("Prebuilt PC not found");
    return doc;
  }

  async findBySlug(slug) {
    return this.model
      .findOne({ slug, isDeleted: false })
      .populate(COMPONENT_POPULATE);
  }

  async findPublishedBySlug(slug) {
    return this.model
      .findOne({ slug, status: "active", isDeleted: false })
      .populate(COMPONENT_POPULATE);
  }

  async findAllPaginated(filter, options) {
    const defaultFilter = { isDeleted: false, ...filter };
    const defaultOptions = {
      page: 1,
      limit: 20,
      sort: { createdAt: -1 },
      populate: COMPONENT_POPULATE,
      ...options,
    };

    return this.model.paginate(defaultFilter, defaultOptions);
  }

  async findFeatured(limit = 8) {
    return this.model
      .find({ isFeatured: true, status: "active", isDeleted: false })
      .sort({ featuredOrder: 1, createdAt: -1 })
      .limit(limit)
      .populate(COMPONENT_POPULATE);
  }

  async findByCategory(category, options = {}) {
    const defaultOptions = {
      page: 1,
      limit: 20,
      sort: { createdAt: -1 },
      populate: COMPONENT_POPULATE,
      ...options,
    };

    return this.model.paginate(
      { category, status: "active", isDeleted: false },
      defaultOptions
    );
  }

  async findSimilar(prebuilt, limit = 4) {
    return this.model
      .find({
        category: prebuilt.category,
        _id: { $ne: prebuilt._id },
        status: "active",
        isDeleted: false,
      })
      .limit(limit)
      .populate(COMPONENT_POPULATE)
      .sort({ featuredOrder: 1, createdAt: -1 });
  }

  async softDelete(id) {
    return this.updateById(id, { isDeleted: true, status: "archived" });
  }
}

export default new PrebuiltPCRepository();
