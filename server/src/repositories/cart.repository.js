import BaseRepository from "./base.repository.js";
import Cart from "../models/cart.model.js";

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findCartByUser(userId) {
    return this.model
      .findOne({ user: userId })
      .populate("items.item")
      .populate("coupon");
  }

  async addItem(cartId, itemData) {
    return this.model
      .findByIdAndUpdate(
        cartId,
        { $push: { items: itemData } },
        { new: true, runValidators: true }
      );
  }

  async removeItem(cartId, itemId) {
    return this.model
      .findByIdAndUpdate(
        cartId,
        { $pull: { items: { _id: itemId } } },
        { new: true, runValidators: true }
      );
  }

  async clearItems(cartId) {
    return this.model
      .findByIdAndUpdate(
        cartId,
        { $set: { items: [], coupon: null, discount: 0 } },
        { new: true }
      );
  }
}

export default new CartRepository();
