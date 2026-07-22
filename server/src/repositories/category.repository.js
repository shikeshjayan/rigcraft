import BaseRepository from "./base.repository.js";
import Category from "../models/category.model.js";

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findAllActive() {
    return this.model
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .populate("parent", "name slug");
  }

  async findRootCategories() {
    return this.model
      .find({ parent: null })
      .sort({ order: 1, name: 1 });
  }

  async findChildren(parentId) {
    return this.model.find({ parent: parentId }).sort({ order: 1, name: 1 });
  }

  async countByParent(parentId) {
    return this.model.countDocuments({ parent: parentId });
  }
}

export default new CategoryRepository();
