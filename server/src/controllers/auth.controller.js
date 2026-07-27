import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  await authService.register(req.body, res);
});

export const login = asyncHandler(async (req, res) => {
  await authService.login(req.body, res);
});

export const checkAccount = asyncHandler(async (req, res) => {
  await authService.checkAccount(req.body.identifier);
  ApiResponse.ok(null, 'Account exists').send(res);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ApiResponse.ok(user).send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body, req.file);
  ApiResponse.ok(user, 'Profile updated').send(res);
});

export const updateCart = asyncHandler(async (req, res) => {
  const user = await authService.updateCart(req.user.id, req.body.cart);
  ApiResponse.ok(user, 'Cart updated').send(res);
});

export const updateWishlist = asyncHandler(async (req, res) => {
  const user = await authService.updateWishlist(req.user.id, req.body.wishlist);
  ApiResponse.ok(user, 'Wishlist updated').send(res);
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

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await authService.updateUserRole(req.params.id, req.body.role);
  ApiResponse.ok(user, 'User role updated').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  await authService.refreshToken(req.cookies.refreshToken, res);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(res);
  ApiResponse.ok(null, 'Logged out successfully').send(res);
});
