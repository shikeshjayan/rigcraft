import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { hasPermission } from '../middlewares/permission.js';
import { USER_ROLES } from '../constants/constants.js';
import { PERMISSIONS } from '../constants/permissions.js';
import validate from '../middlewares/validate.js';
import { createRoleSchema, updateRoleSchema } from '../validators/role.validator.js';

const router = Router();

router.get('/', protect, authorize(USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.roles.manage), roleController.list);
router.get('/:name', protect, authorize(USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.roles.manage), roleController.getByName);
router.post('/', protect, authorize(USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.roles.manage), validate(createRoleSchema), roleController.create);
router.put('/:name', protect, authorize(USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.roles.manage), validate(updateRoleSchema), roleController.update);
router.delete('/:name', protect, authorize(USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.roles.manage), roleController.remove);

export default router;
