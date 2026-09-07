import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { hasPermission } from '../middlewares/permission.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { USER_ROLES } from '../constants/constants.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

router.get('/public', settingsController.getPublic);

router.get(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.settings.read),
  settingsController.get
);

router.put(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.settings.update),
  settingsController.update
);

router.post(
  '/logo',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.settings.update),
  uploadSingleImage('logo'),
  settingsController.uploadLogo
);

router.delete(
  '/logo',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.settings.update),
  settingsController.deleteLogo
);

export default router;