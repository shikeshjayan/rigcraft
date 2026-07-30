import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { USER_ROLES } from '../constants/constants.js';

const router = Router();

router.get('/public', settingsController.getPublic);

router.get(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN),
  settingsController.get
);

router.put(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN),
  settingsController.update
);

router.post(
  '/logo',
  protect,
  authorize(USER_ROLES.ADMIN),
  uploadSingleImage('logo'),
  settingsController.uploadLogo
);

router.delete(
  '/logo',
  protect,
  authorize(USER_ROLES.ADMIN),
  settingsController.deleteLogo
);

export default router;
