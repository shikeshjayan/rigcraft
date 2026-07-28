import BaseRepository from "./base.repository.js";
import FAQ from "../models/faq.model.js";

class FAQRepository extends BaseRepository {
  constructor() {
    super(FAQ);
  }

  async findActive(options = {}) {
    const { sort = { displayOrder: 1, createdAt: -1 } } = options;
    return this.model.find({ isActive: true }).sort(sort);
  }

  async findByCategory(category, options = {}) {
    const { isActive } = options;
    const filter = { category };
    if (isActive !== undefined) filter.isActive = isActive;
    return this.model.find(filter).sort({ displayOrder: 1 });
  }

  async findAllPaginated(query = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { displayOrder: 1, createdAt: -1 },
      isActive,
      category,
      search,
    } = query;

    const filter = {};
    if (isActive !== undefined && isActive !== "") filter.isActive = isActive === "true";
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [faqs, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      this.model.countDocuments(filter),
    ]);

    return {
      faqs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }
}

export default new FAQRepository();