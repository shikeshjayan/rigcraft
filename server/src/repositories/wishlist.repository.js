import BaseRepository from "./base.repository.js";
import Wishlist from "../models/wishlist.model.js";

class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
  }

  async findByUser(userId) {
    return this.model.findOne({ user: userId });
  }

  async addItem(userId, itemData) {
    const wishlist = await this.model.findOne({ user: userId });
    if (!wishlist) {
      const doc = await this.model.create({ user: userId, items: [itemData] });
      return doc;
    }
    wishlist.items.push(itemData);
    const doc = await wishlist.save();
    await doc.populate("items.item");
    return doc;
  }

  async removeItem(userId, itemId) {
    const wishlist = await this.model.findOne({ user: userId });
    if (!wishlist) return null;
    const item = wishlist.items.find((i) => i.item.toString() === itemId);
    if (!item) return null;
    item.deleteOne();
    await wishlist.save();
    return wishlist;
  }

  async clearWishlist(userId) {
    const wishlist = await this.model.findOne({ user: userId });
    if (!wishlist) return null;
    wishlist.items = [];
    await wishlist.save();
    return wishlist;
  }
}

export default new WishlistRepository();
