import { z } from 'zod';
import { PERMISSION_MODULE_MAP } from '../constants/permissions.js';

const ALL_PERMISSIONS = Object.values(PERMISSION_MODULE_MAP).flat();

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, 'Name must start with a letter and contain only lowercase letters, numbers, and underscores')
    .refine(
      (val) => !['super_admin', 'admin', 'product_manager', 'order_manager', 'support_executive', 'customer'].includes(val),
      { message: 'This role name is reserved for a system role' }
    ),
  label: z.string().min(1).max(100, 'Label cannot exceed 100 characters'),
  description: z.string().max(500).optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).min(1, 'At least one permission is required'),
});

export const updateRoleSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).min(1, 'At least one permission is required').optional(),
});
