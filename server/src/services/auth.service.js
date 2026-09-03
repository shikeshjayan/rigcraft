import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import getGoogleClient from '../config/google.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import * as uploadService from './upload.service.js';
import { sendResetPasswordEmail, sendEmail } from './email.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const cookieAttributes = {
  httpOnly: true,
  secure: isProduction,
  // Frontend and API are served from the same origin (single-origin deployment).
  // SameSite=Lax keeps the cookie out of cross-site subrequests and restores
  // CSRF protection, while still being sent on same-site XHR/fetch.
  sameSite: 'lax',
};

const createTokenResponse = async (user, statusCode, res, rememberMe = false) => {
  const accessTokenExpiry = rememberMe ? '7d' : process.env.JWT_EXPIRES_IN || '1d';
  const cookieMaxAge = rememberMe
    ? 7 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  const accessToken = user.generateAccessToken(accessTokenExpiry);

  res.cookie('token', accessToken, {
    ...cookieAttributes,
    expires: new Date(Date.now() + cookieMaxAge),
  });

  if (rememberMe) {
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      ...cookieAttributes,
      expires: new Date(Date.now() + cookieMaxAge),
      path: '/api/v1/auth',
    });
  } else {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.clearCookie('refreshToken', { ...cookieAttributes, path: '/api/v1/auth' });
  }

  user.password = undefined;
  user.refreshToken = undefined;

  return res.status(statusCode).json({
    success: true,
    data: {
      user,
      rememberMe,
      accessToken,
      ...(user.refreshToken ? { refreshToken: user.refreshToken } : {}),
    },
  });
};

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return `${name[0]}***@${domain}`;
};

export const refreshToken = async (token, res) => {
  if (!token) throw ApiError.unauthorized('No refresh token');

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await userRepository.findByIdWithRefreshToken(decoded.id);
  if (!user || user.refreshToken !== token)
    throw ApiError.unauthorized('Invalid or expired refresh token');
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked');
  if (user.deactivatedAt)
    throw ApiError.forbidden('This account has been deactivated');

  return createTokenResponse(user, 200, res, true);
};

export const checkAccount = async (identifier) => {
  let user;
  let googleOnly = false;
  if (identifier.includes('@')) {
    user = await userRepository.findByEmailWithPassword(identifier);
    googleOnly = Boolean(user && user.googleId && !user.password);
  } else {
    user = await userRepository.findByPhone(identifier);
  }
  if (!user) throw ApiError.notFound('No account found with this identifier');
  return { googleOnly };
};

export const updateUserRole = async (userId, role) => {
  const user = await userRepository.findById(userId);
  if (user.role === role) throw ApiError.conflict('User already has this role');
  return userRepository.updateById(userId, { role });
};

export const logout = (res) => {
  res.cookie('token', 'none', {
    ...cookieAttributes,
    expires: new Date(Date.now() + 5 * 1000),
  });
  res.cookie('refreshToken', 'none', {
    ...cookieAttributes,
    expires: new Date(Date.now() + 5 * 1000),
    path: '/api/v1/auth',
  });
};

export const register = async (userData, res) => {
  const existing = await userRepository.findByEmail(userData.email);
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await userRepository.create(userData);
  return createTokenResponse(user, 201, res);
};

export const login = async (body, res) => {
  const { email, phone, password, otp, rememberMe } = body;

  // ── Email + Password ─────────────────────────────────────────
  if (email && password) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (!user.password)
      throw ApiError.unauthorized('This account uses Google sign-in. Please sign in with Google');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid credentials');
    if (user.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return createTokenResponse(user, 200, res, rememberMe);
  }

  // ── Phone + Password ─────────────────────────────────────────
  if (phone && password && !otp) {
    const user = await userRepository.findByPhoneWithPassword(phone);
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid credentials');
    if (user.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return createTokenResponse(user, 200, res, rememberMe);
  }

  // ── Phone only — send OTP ────────────────────────────────────
  if (phone && !password && !otp) {
    const user = await userRepository.findByPhone(phone);
    if (!user) throw ApiError.notFound('No account found with this phone number');
    if (user.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otpCode;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your RigCraft Login OTP',
      html: `<p>Your OTP for login is: <strong>${otpCode}</strong></p><p>This OTP expires in 10 minutes.</p>`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your registered email',
      data: { email: maskEmail(user.email) },
    });
  }

  // ── Phone + OTP — verify and log in ──────────────────────────
  if (phone && otp) {
    const user = await userRepository.findByPhoneWithOtp(phone);
    if (!user) throw ApiError.notFound('No account found with this phone number');

    if (user.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');
    if (!user.otp || user.otp !== otp) throw ApiError.badRequest('Invalid OTP');
    if (user.otpExpire < Date.now()) throw ApiError.badRequest('OTP has expired');

    user.otp = undefined;
    user.otpExpire = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return createTokenResponse(user, 200, res, rememberMe);
  }

  throw ApiError.badRequest('Invalid login request');
};

export const googleLogin = async (idToken, res) => {
  const client = getGoogleClient();
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw ApiError.unauthorized('Invalid Google credential');
  }

  const {
    sub: googleId,
    email,
    email_verified: emailVerified,
    name,
    picture,
  } = payload;
  if (!email) throw ApiError.unauthorized('Google account has no email');

  let user = await userRepository.findByEmail(email);
  if (user?.googleId && user.googleId !== googleId) {
    throw ApiError.conflict('This email is linked to a different Google account');
  }
  if (user?.isBlocked) throw ApiError.forbidden('Account is blocked');
  if (user?.deactivatedAt)
    throw ApiError.forbidden('This account has been deactivated');

  if (user) {
    if (!user.googleId) user.googleId = googleId;
    if (!user.firstName && name) {
      const [firstName, ...rest] = name.split(' ');
      user.firstName = firstName;
      user.lastName = rest.join(' ') || user.lastName;
    }
    if (emailVerified) user.isEmailVerified = true;
    if (picture && !user.avatar?.url) user.avatar = { url: picture };
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    return createTokenResponse(user, 200, res);
  }

  const nameParts = (name || '').split(' ');
  const firstName = nameParts[0] || email.split('@')[0];
  const lastName = nameParts.slice(1).join(' ');

  user = await userRepository.create({
    googleId,
    firstName,
    lastName,
    email,
    isEmailVerified: !!emailVerified,
    avatar: picture ? { url: picture } : undefined,
    lastLogin: new Date(),
  });
  return createTokenResponse(user, 201, res);
};

export const getProfile = async (userId) => {
  return userRepository.findById(userId);
};

export const updateProfile = async (userId, data, file) => {
  const user = await userRepository.findByIdWithPassword(userId);

  const changingContact =
    data.email !== undefined || data.phone !== undefined;
  if (changingContact) {
    if (!user.password)
      throw ApiError.badRequest(
        "This account uses Google sign-in and cannot change email or phone here"
      );
    const isMatch = await user.comparePassword(data.currentPassword || "");
    if (!isMatch) throw ApiError.badRequest("Current password is incorrect");
  }

  const updateData = { ...data };
  delete updateData.currentPassword;

  if (file) {
    const avatar = await uploadService.uploadImage(file, 'avatars');
    updateData.avatar = avatar;
  }
  return userRepository.updateById(userId, updateData);
};

export const updateCart = async (userId, cart) => {
  return userRepository.updateById(userId, { cart });
};

export const updateWishlist = async (userId, wishlist) => {
  return userRepository.updateById(userId, { wishlist });
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
  console.log(`\n========== PASSWORD RESET ==========`);
  console.log(`Email: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Token: ${resetToken}`);
  console.log(`====================================\n`);
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

export const deactivateAccount = async (userId) => {
  const user = await userRepository.findByIdWithRefreshToken(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.deactivatedAt)
    throw ApiError.conflict('Account is already deactivated');

  user.deactivatedAt = new Date();
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  return user;
};
