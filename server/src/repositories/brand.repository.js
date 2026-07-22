import BaseRepository from "./base.repository.js";
import Brand from "../models/brand.model.js";

class BrandRepository extends BaseRepository {
  constructor() {
    super(Brand);
  }

  async findAllActive() {
    return this.model.find({ isActive: true }).sort({ name: 1 });
  }
}

export default new BrandRepository();
