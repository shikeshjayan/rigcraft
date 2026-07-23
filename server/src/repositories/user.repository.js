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
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByPhone(phone) {
    return this.findOne({ phone });
  }

  async findByPhoneWithPassword(phone) {
    return User.findOne({ phone }).select('+password');
  }

  async findByPhoneWithOtp(phone) {
    return User.findOne({ phone }).select('+otp +otpExpire');
  }

  async findByIdWithPassword(id) {
    return User.findById(id).select('+password');
  }

  async findByIdWithRefreshToken(id) {
    return User.findById(id).select('+refreshToken');
  }
}

export default new UserRepository();
