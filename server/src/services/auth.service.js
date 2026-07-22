import crypto from 'crypto';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { sendResetPasswordEmail } from './email.service.js';
import { sendOtpSms } from './sms.service.js';

const createTokenResponse = async (user, statusCode, res, rememberMe = false) => {
  const accessTokenExpiry = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '1d';
  const cookieMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  const accessToken = user.generateAccessToken(accessTokenExpiry);

  res.cookie('token', accessToken, {
    expires: new Date(Date.now() + cookieMaxAge),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  if (rememberMe) {
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + cookieMaxAge),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  } else {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  }

  user.password = undefined;
  user.refreshToken = undefined;

  return res.status(statusCode).json({
    success: true,
    data: { user, rememberMe, accessToken  },
  });
};

export const logout = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    path: '/api/v1/auth',
  });
};

export const register = async (userData, res) => {
  const existing = await userRepository.findByEmail(userData.email);
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await userRepository.create(userData);
  return createTokenResponse(user, 201, res);
};

export const login = async ({ email, phone, password, rememberMe }, res) => {
  let user;
  if (email) {
    user = await userRepository.findByEmailWithPassword(email);
  } else if (phone) {
    user = await userRepository.findByPhoneWithPassword(phone);
  }
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return createTokenResponse(user, 200, res, rememberMe);
};

export const getProfile = async (userId) => {
  return userRepository.findById(userId);
};

export const updateProfile = async (userId, data) => {
  return userRepository.updateById(userId, data);
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();
  return user;
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendResetPasswordEmail(email, resetUrl);
};

export const resetPassword = async (token, password) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await userRepository.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw ApiError.badRequest('Invalid or expired token');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

export const sendOtp = async (phone) => {
  const user = await userRepository.findByPhone(phone);
  if (!user) throw ApiError.notFound('No account found with this phone number');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendOtpSms(phone, otp);
};

export const loginWithOtp = async ({ phone, otp }, res) => {
  const user = await userRepository.findByPhoneWithOtp(phone);
  if (!user) throw ApiError.notFound('No account found with this phone number');

  if (!user.otp || user.otp !== otp) throw ApiError.badRequest('Invalid OTP');
  if (user.otpExpire < Date.now()) throw ApiError.badRequest('OTP has expired');

  user.otp = undefined;
  user.otpExpire = undefined;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return createTokenResponse(user, 200, res);
};
