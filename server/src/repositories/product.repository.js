import BaseRepository from "./base.repository.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findById(id) {
    const doc = await this.model
      .findById(id)
      .populate("category", "name slug")
      .populate("brand", "name slug logo");
    if (!doc) throw ApiError.notFound(`${this.model.modelName} not found`);
    return doc;
  }

  async findBySlug(slug) {
    return this.model
      .findOne({ slug, isDeleted: false })
      .populate("category", "name slug")
      .populate("brand", "name slug logo");
  }

  async findPublishedBySlug(slug) {
    return this.model
      .findOne({ slug, status: "active", isDeleted: false })
      .populate("category", "name slug")
      .populate("brand", "name slug logo");
  }

  async findAllPaginated(filter, options) {
    const defaultFilter = { isDeleted: false, ...filter };
    const defaultOptions = {
      page: 1,
      limit: 20,
      sort: { createdAt: -1 },
      populate: [
        { path: "category", select: "name slug" },
        { path: "brand", select: "name slug logo" },
      ],
      ...options,
    };

    return this.model.paginate(defaultFilter, defaultOptions);
  }

  async findFeatured(limit = 8) {
    return this.model
      .find({
        isFeatured: true,
        status: "active",
        isDeleted: false,
      })
      .sort({ featuredOrder: 1, createdAt: -1 })
      .limit(limit)
      .populate("category", "name slug")
      .populate("brand", "name slug logo");
  }

  async search(query, options = {}) {
    const filter = {
      isDeleted: false,
      status: "active",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { shortDescription: { $regex: query, $options: "i" } },
      ],
    };

    return this.findAllPaginated(filter, options);
  }

  async softDelete(id) {
    return this.updateById(id, { isDeleted: true, status: "archived" });
  }

  async findRelated(product, limit = 6) {
    return this.model
      .find({
        _id: { $ne: product._id },
        category: product.category,
        status: "active",
        isDeleted: false,
      })
      .limit(limit)
      .populate("category", "name slug")
      .populate("brand", "name slug logo");
  }
}

export default new ProductRepository();
