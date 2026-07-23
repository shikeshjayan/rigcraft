import ApiError from '../utils/ApiError.js';

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    const doc = await this.model.findById(id);
    if (!doc) throw ApiError.notFound(`${this.model.modelName} not found`);
    return doc;
  }

  async findOne(filter) {
    return this.model.findOne(filter);
  }

  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, select, populate } = options;
    return this.model.find(filter).select(select).populate(populate).sort(sort);
  }

  async create(data) {
    const doc = new this.model(data);
    return doc.save();
  }

  async updateById(id, data, opts = { returnDocument: 'after', runValidators: true }) {
    const doc = await this.model.findByIdAndUpdate(id, data, opts);
    if (!doc) throw ApiError.notFound(`${this.model.modelName} not found`);
    return doc;
  }

  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw ApiError.notFound(`${this.model.modelName} not found`);
    return doc;
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

export default BaseRepository;
