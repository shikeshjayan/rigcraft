import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/constants.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
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

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', authLimiter, authController.refresh);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', protect, validate(updatePasswordSchema), authController.updatePassword);
router.post('/logout', protect, authController.logout);

router.patch('/users/:id/role', protect, authorize(USER_ROLES.ADMIN), validate(updateRoleSchema), authController.updateUserRole);

export default router;
