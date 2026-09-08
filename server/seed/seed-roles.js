import mongoose from 'mongoose';
import Role from '../models/role.model.js';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.js';
import { USER_ROLES } from '../constants/constants.js';

const LABEL_MAP = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  product_manager: 'Product Manager',
  order_manager: 'Order Manager',
  support_executive: 'Support Executive',
  customer: 'Customer',
};

export const seedRoles = async () => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const exists = await Role.findOne({ name: roleName.toLowerCase() }).session(session);
      if (exists) {
        exists.permissions = permissions;
        exists.label = LABEL_MAP[roleName] || roleName;
        exists.isSystem = true;
        exists.isActive = true;
        await exists.save({ session });
      } else {
        await new Role({
          name: roleName.toLowerCase(),
          label: LABEL_MAP[roleName] || roleName,
          description: `Built-in ${LABEL_MAP[roleName] || roleName} role`,
          isSystem: true,
          isActive: true,
          permissions,
        }).save({ session });
      }
    }

    await session.commitTransaction();
    console.log('[SEED] Roles seeded successfully');
  } catch (err) {
    await session.abortTransaction();
    console.error('[SEED] Role seeding failed:', err.message);
    throw err;
  } finally {
    session.endSession();
  }
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  import('../config/db.js').then(async ({ default: dbConnect }) => {
    await dbConnect();
    await seedRoles();
    process.exit(0);
  });
}
