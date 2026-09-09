import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import getGoogleClient from '../config/google.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import * as uploadService from './upload.service.js';
import { sendResetPasswordEmail, sendEmail } from './email.service.js';
import { getPermissions } from './role.service.js';

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

  let permissions;
  if (user.permissions !== undefined) {
    permissions = Array.isArray(user.permissions) ? user.permissions : [];
  } else {
    permissions = await getPermissions(user.role);
  }

  return res.status(statusCode).json({
    success: true,
    data: {
      user,
      rememberMe,
      accessToken,
      permissions: permissions || [],
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
  if (!user) throw ApiError.unauthorized('Invalid or expired refresh token');

  // Reuse detection: the presented token must be the current stored one.
  // A mismatch means the token was rotated or an attacker replayed it, so
  // revoke the whole session.
  if (user.refreshToken !== token) {
    await userRepository.clearRefreshToken(user._id);
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked');
  if (user.deactivatedAt)
    throw ApiError.forbidden('This account has been deactivated');

  // Rotate: createTokenResponse(..., rememberMe = true) issues a new refresh
  // token, persists it, and rotates the cookie.
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

export const logout = async (userId, res) => {
  // Revoke the stored refresh token so a leaked token cannot be replayed
  // after the user explicitly logs out.
  if (userId) await userRepository.clearRefreshToken(userId);

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
    if (user.isBlocked) throw ApiError.forbidden('Account is blocked');

    // Check if account is temporarily locked; clear the lock once it expires
    if (user.lockTimestamp && user.lockTimestamp <= Date.now()) {
      user.failedAttempts = 0;
      user.lockTimestamp = null;
    }
    if (user.lockTimestamp && user.lockTimestamp > Date.now()) {
      throw ApiError.forbidden('Account temporarily locked due to too many failed attempts');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await userRepository.incrementFailedAttempts(user._id);
      throw ApiError.unauthorized('Invalid credentials');
    }
    if (user.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');

    user.lastLogin = new Date();
    user.failedAttempts = 0;
    user.lockTimestamp = null;
    await user.save({ validateBeforeSave: false });

    return createTokenResponse(user, 200, res, rememberMe);
  }

  // ── Phone + Password ─────────────────────────────────────────
  if (phone && password && !otp) {
    const user = await userRepository.findByPhoneWithPassword(phone);
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (user.isBlocked) throw ApiError.forbidden('Account is blocked');

    // Check if account is temporarily locked; clear the lock once it expires
    if (user.lockTimestamp && user.lockTimestamp <= Date.now()) {
      user.failedAttempts = 0;
      user.lockTimestamp = null;
    }
    if (user.lockTimestamp && user.lockTimestamp > Date.now()) {
      throw ApiError.forbidden('Account temporarily locked due to too many failed attempts');
    }

const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await userRepository.incrementFailedAttempts(user._id);
      throw ApiError.unauthorized('Invalid credentials');
    }
    if (user.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');

    user.lastLogin = new Date();
    user.failedAttempts = 0;
    user.lockTimestamp = null;
    await user.save({ validateBeforeSave: false });

    return createTokenResponse(user, 200, res, rememberMe);
  }

// ── Phone only — send OTP ────────────────────────────────────
  if (phone && !password && !otp) {
    const normalizedPhone = phone.replace(/\s+/g, ''); // Remove spaces from query
    const user = await userRepository.findByPhone(normalizedPhone);

    // Generic response: never reveal whether the phone is registered. Delivery
    // only happens for a known, active account; cooldown and hourly limits are
    // enforced silently with the same 200 shape (mirrors forgotPassword).
    if (user?.isBlocked) throw ApiError.forbidden('Account is blocked');
    if (user?.deactivatedAt)
      throw ApiError.forbidden('This account has been deactivated');

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent to your registered email',
        data: { email: null },
      });
    }

    // Check resend cooldown (60 seconds) — silent to prevent enumeration
    if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 60 * 1000) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent to your registered email',
        data: { email: maskEmail(user.email) },
      });
    }

    // Hourly limit (5 requests/hour); counter resets at the start of each window
    const otpWindowMs = 60 * 60 * 1000;
    if (user.otpRequestWindowStart && Date.now() - user.otpRequestWindowStart < otpWindowMs) {
      if (user.otpRequestCount >= 5) {
        return res.status(200).json({
          success: true,
          message: 'OTP sent to your registered email',
          data: { email: maskEmail(user.email) },
        });
      }
    } else {
      user.otpRequestCount = 0;
      user.otpRequestWindowStart = Date.now();
    }

    // Generate secure OTP and hash it before storage
    const otpCode = crypto.randomInt(100000, 1000000).toString().padStart(6, '0');
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    user.otp = hashedOtp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // Reduced to 5 minutes

    // Invalidate previous OTP verification attempts
    user.otpVerifyAttempts = 0;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your RigCraft Login OTP',
      html: `<p>Your OTP for login is: <strong>${otpCode}</strong></p><p>This OTP expires in 5 minutes.</p>`,
    });

    // Only count the request after the email was actually sent, so a failed
    // send does not consume the user's quota.
    user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    user.lastOtpRequest = Date.now();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your registered email',
      data: { email: maskEmail(user.email) },
    });
  }

// ── Phone + OTP — verify and log in ──────────────────────────
    if (phone && otp) {
      const normalizedPhone = phone.replace(/\s+/g, '');
      const user = await userRepository.findByPhoneWithOtp(normalizedPhone);
if (!user) throw ApiError.badRequest('Invalid OTP');

      if (user.isBlocked) throw ApiError.forbidden('Account is blocked');

      if (user.deactivatedAt)
       throw ApiError.forbidden('This account has been deactivated');
     
     // Check verification attempt limit (5 attempts)
     if (user.otpVerifyAttempts >= 5) {
       throw ApiError.forbidden('Too many OTP verification attempts. Please request a new OTP.');
     }
     
     if (!user.otp) throw ApiError.badRequest('Invalid OTP');
     
     // Hash submitted OTP for comparison
     const hashedSubmittedOtp = crypto.createHash('sha256').update(otp).digest('hex');
     if (user.otp !== hashedSubmittedOtp) {
       // Increment verification attempts on failure
       user.otpVerifyAttempts = (user.otpVerifyAttempts || 0) + 1;
       await user.save({ validateBeforeSave: false });
       throw ApiError.badRequest('Invalid OTP');
     }
     if (user.otpExpire < Date.now()) throw ApiError.badRequest('OTP has expired');

     // Clear OTP data after successful verification
     user.otp = undefined;
     user.otpExpire = undefined;
     user.otpVerifyAttempts = 0; // Reset verification attempts
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
  user.passwordChangedAt = new Date(); // Explicit setting
  user.refreshToken = undefined; // Invalidate refresh session
  await user.save();
  return user;
};

export const forgotPassword = async (emailOrPhone) => {
  const normalized = (emailOrPhone || '').replace(/\s+/g, '');
  let user;
  if (normalized.includes('@')) {
    user = await userRepository.findByEmail(normalized);
  } else {
    user = await userRepository.findByPhone(normalized);
  }
  if (!user) return;

  // Silently enforce the 60-second cooldown to prevent enumeration
  if (user.lastResetRequest && (Date.now() - user.lastResetRequest < 60 * 1000)) {
    return;
  }

  // Hourly limit (5 requests/hour), silently enforced; counter resets per window
  const resetWindowMs = 60 * 60 * 1000;
  if (user.resetRequestWindowStart && Date.now() - user.resetRequestWindowStart < resetWindowMs) {
    if (user.resetRequestCount >= 5) {
      return;
    }
  } else {
    user.resetRequestCount = 0;
    user.resetRequestWindowStart = Date.now();
  }

  // Invalidate previous token when new one is requested
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.resetTokenExpiry = null; // Mark token as not used (in case it was used before)

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Increased to 15 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendResetPasswordEmail(user.email, resetUrl);

  // Only count the request after the email was actually sent, so a failed
  // send does not consume the user's quota.
  user.resetRequestCount = (user.resetRequestCount || 0) + 1;
  user.lastResetRequest = Date.now();
  await user.save({ validateBeforeSave: false });
};

export const resetPassword = async (token, password) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await userRepository.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw ApiError.badRequest('Invalid or expired token');

  // Check if token has already been used
  if (user.resetTokenExpiry && user.resetTokenExpiry <= Date.now()) {
    throw ApiError.badRequest('Token has already been used or expired');
  }

  user.password = password;
  user.passwordChangedAt = new Date(); // Track password change time
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.resetTokenExpiry = Date.now(); // Mark token as used/expired
  user.refreshToken = undefined; // Invalidate refresh session
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
