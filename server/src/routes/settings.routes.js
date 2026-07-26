import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { USER_ROLES } from '../constants/constants.js';

const router = Router();

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

export default router;
