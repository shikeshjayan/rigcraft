import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { USER_ROLES } from '../constants/constants.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  updateRoleSchema,
} from '../validators/auth.validator.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many attempts, try again later' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again later' },
});

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests, try again later' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many OTP verification attempts, try again later' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reset requests, try again later' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many reset attempts, try again later' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, validate(googleLoginSchema), authController.googleLogin);
router.post('/check', authLimiter, authController.checkAccount);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', authLimiter, authController.refresh);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, uploadSingleImage("avatar"), validate(updateProfileSchema), authController.updateProfile);
router.put('/cart', protect, authController.updateCart);
router.put('/wishlist', protect, authController.updateWishlist);
router.put('/password', protect, validate(updatePasswordSchema), authController.updatePassword);
router.post('/logout', protect, authController.logout);
router.post('/deactivate', protect, authController.deactivate);

router.patch('/users/:id/role', protect, authorize(USER_ROLES.ADMIN), validate(updateRoleSchema), authController.updateUserRole);

export default router;
