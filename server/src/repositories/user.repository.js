import BaseRepository from './base.repository.js';
import User from '../models/user.model.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password +failedAttempts +lockTimestamp');
  }

  async findByPhone(phone) {
    return this.findOne({ phone });
  }

  async findByPhoneWithPassword(phone) {
    return User.findOne({ phone }).select('+password +failedAttempts +lockTimestamp');
  }

  async findByPhoneWithOtp(phone) {
    return User.findOne({ phone }).select('+otp +otpExpire +otpVerifyAttempts +otpRequestCount +lastOtpRequest');
  }

  async findByIdWithPassword(id) {
    return User.findById(id).select('+password');
  }

  async findByIdWithRefreshToken(id) {
    return User.findById(id).select('+refreshToken');
  }

  async clearRefreshToken(userId) {
    return User.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
  }

  // Atomic failed-attempt tracking; locks the account when the threshold is crossed.
  async incrementFailedAttempts(userId) {
    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { failedAttempts: 1 } },
      { new: true, projection: { failedAttempts: 1 } }
    );
    if (updated && updated.failedAttempts >= 5) {
      await User.updateOne(
        { _id: userId },
        { $set: { lockTimestamp: Date.now() + 15 * 60 * 1000 } }
      );
      return { locked: true };
    }
    return { locked: false };
  }
}

export default new UserRepository();
