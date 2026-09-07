import Role from '../models/role.model.js';
import BaseRepository from './base.repository.js';

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(name) {
    return this.model.findOne({ name: name.toLowerCase() });
  }

  async findAllActive() {
    return this.model.find({ isActive: true }).sort({ isSystem: -1, label: 1 });
  }

  async upsertByName(data) {
    const normalizedName = data.name.toLowerCase();
    return this.model.findOneAndUpdate(
      { name: normalizedName },
      { $set: { ...data, name: normalizedName } },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
  }

  async updateByName(name, data) {
    const role = await this.model.findOneAndUpdate(
      { name: name.toLowerCase() },
      { $set: data },
      { returnDocument: 'after', runValidators: true }
    );
    if (!role) {
      const { default: ApiError } = await import('../utils/ApiError.js');
      throw ApiError.notFound('Role not found');
    }
    return role;
  }

  async deleteByName(name) {
    const role = await this.model.findOneAndDelete({ name: name.toLowerCase() });
    if (!role) {
      const { default: ApiError } = await import('../utils/ApiError.js');
      throw ApiError.notFound('Role not found');
    }
    return role;
  }
}

const roleRepository = new RoleRepository();
export default roleRepository;
