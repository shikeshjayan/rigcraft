import BaseRepository from "./base.repository.js";
import SavedBuild from "../models/saved-build.model.js";

const COMPONENT_POPULATE = [
  {
    path: "components.product",
    model: "Product",
    select:
      "name slug price salePrice images compatibility specifications brand weight",
    populate: { path: "brand", select: "name slug" },
  },
];

class BuildRepository extends BaseRepository {
  constructor() {
    super(SavedBuild);
  }

  async getUserBuilds(userId, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;

    return this.model.paginate
      ? this.model.paginate(
          { user: userId },
          { page, limit, sort, populate: COMPONENT_POPULATE }
        )
      : this.model
          .find({ user: userId })
          .sort(sort)
          .populate(COMPONENT_POPULATE)
          .skip((page - 1) * limit)
          .limit(limit);
  }

  async findBuildById(id, userId) {
    return this.model
      .findOne({ _id: id, user: userId })
      .populate(COMPONENT_POPULATE);
  }

  async duplicateBuild(id, userId, newName) {
    const build = await this.model.findOne({ _id: id, user: userId });
    if (!build) return null;

    const data = build.toObject();
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;

    data.name = newName || `${build.name} (Copy)`;

    return this.model.create(data);
  }

  async updateComponents(id, userId, components) {
    return this.model
      .findOneAndUpdate(
        { _id: id, user: userId },
        { components },
        { new: true, runValidators: true }
      )
      .populate(COMPONENT_POPULATE);
  }

  async getAllBuilds(query = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = query;
    const filter = {};

    if (query.status) {
      filter["compatibility.status"] = query.status;
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }

    return this.model.paginate
      ? this.model.paginate(filter, {
          page: Number(page),
          limit: Number(limit),
          sort,
          populate: [{ path: "user", select: "firstName lastName email" }],
        })
      : this.model
          .find(filter)
          .sort(sort)
          .populate("user", "firstName lastName email")
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit));
  }

  async getBuildAnalytics() {
    const totalBuilds = await this.model.countDocuments();

    const componentStats = await this.model.aggregate([
      { $unwind: "$components" },
      {
        $group: {
          _id: { type: "$components.type", product: "$components.product" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: "$_id.type",
          topProducts: {
            $push: { productId: "$_id.product", count: "$count" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          topProducts: { $slice: ["$topProducts", 5] },
        },
      },
    ]);

    const priceStats = await this.model.aggregate([
      {
        $group: {
          _id: null,
          averagePrice: { $avg: "$totalPrice" },
          maxPrice: { $max: "$totalPrice" },
          minPrice: { $min: "$totalPrice" },
          averagePower: { $avg: "$estimatedPower" },
        },
      },
    ]);

    const statusCounts = await this.model.aggregate([
      {
        $group: {
          _id: "$compatibility.status",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalBuilds,
      componentStats,
      priceStats: priceStats[0] || null,
      statusCounts,
    };
  }

  async getCompatibilityIssues(query = {}) {
    const { page = 1, limit = 20 } = query;

    return this.model.paginate
      ? this.model.paginate(
          { "compatibility.status": "incompatible" },
          {
            page: Number(page),
            limit: Number(limit),
            sort: { updatedAt: -1 },
            populate: [
              { path: "user", select: "firstName lastName email" },
              { path: "components.product", select: "name slug" },
            ],
          }
        )
      : this.model
          .find({ "compatibility.status": "incompatible" })
          .sort({ updatedAt: -1 })
          .populate("user", "firstName lastName email")
          .populate("components.product", "name slug")
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit));
  }
}

export default new BuildRepository();