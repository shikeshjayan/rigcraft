import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  await authService.register(req.body, res);
});

export const login = asyncHandler(async (req, res) => {
  await authService.login(req.body, res);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ApiResponse.ok(user).send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  ApiResponse.ok(user, 'Profile updated').send(res);
});

export const updatePassword = asyncHandler(async (req, res) => {
  await authService.updatePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  ApiResponse.ok(null, 'Password updated').send(res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.ok(null, 'If the email exists, a reset link has been sent').send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ApiResponse.ok(null, 'Password reset successful').send(res);
});

export const sendOtp = asyncHandler(async (req, res) => {
  await authService.sendOtp(req.body.phone);
  ApiResponse.ok(null, 'OTP sent successfully').send(res);
});

export const loginWithOtp = asyncHandler(async (req, res) => {
  await authService.loginWithOtp(req.body, res);
});

export const logout = asyncHandler(async (req, res) => {
  authService.logout(res);
  ApiResponse.ok(null, 'Logged out successfully').send(res);
});
