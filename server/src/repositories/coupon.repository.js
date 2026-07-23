import BaseRepository from "./base.repository.js";
import Coupon from "../models/coupon.model.js";

class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }

  async findByCode(code) {
    return this.model.findOne({ code: code.toUpperCase() });
  }

  async incrementUsage(couponId) {
    return this.model.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } },
      { new: true, runValidators: true }
    );
  }
}

export default new CouponRepository();
