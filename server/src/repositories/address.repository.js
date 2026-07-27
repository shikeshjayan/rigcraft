import BaseRepository from "./base.repository.js";
import Address from "../models/address.model.js";

class AddressRepository extends BaseRepository {
  constructor() {
    super(Address);
  }

  async findByUser(userId) {
    return this.model.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async clearDefault(userId) {
    return this.model.updateMany(
      { user: userId, isDefault: true },
      { $set: { isDefault: false } }
    );
  }

  async setDefault(addressId, userId) {
    return this.model.findOneAndUpdate(
      { _id: addressId, user: userId },
      { $set: { isDefault: true } },
      { new: true, runValidators: true }
    );
  }
}

export default new AddressRepository();
