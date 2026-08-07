import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import userRepository from "../repositories/user.repository.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.model.js";
import Address from "../models/address.model.js";
import SavedBuild from "../models/saved-build.model.js";
import buildRepository from "../repositories/build.repository.js";
import wishlistRepository from "../repositories/wishlist.repository.js";
import * as uploadService from "./upload.service.js";
import ApiError from "../utils/ApiError.js";

const getStatus = (u) =>
  u.deactivatedAt ? "deactivated" : u.isBlocked ? "blocked" : "active";

export const createUser = async (data) => {
  const { firstName, lastName, email, password, phone, role } = data;

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("A user with this email already exists");

  const hashed = await bcrypt.hash(password, 12);
  const user = await userRepository.create({
    firstName,
    lastName,
    email,
    password: hashed,
    phone: phone || "",
    role: role || "customer",
  });

  return { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role };
};

export const list = async (query = {}) => {
  const { page = 1, limit = 20, search, role, status, sort = "-createdAt" } = query;

  const filter = {};

  if (role) filter.role = role;
  if (status === "active") {
    filter.isBlocked = false;
    filter.deactivatedAt = null;
  }
  if (status === "blocked") filter.isBlocked = true;
  if (status === "deactivated") filter.deactivatedAt = { $ne: null };
  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  const sortOptions = {};
  if (sort.startsWith("-")) {
    sortOptions[sort.slice(1)] = -1;
  } else {
    sortOptions[sort] = 1;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.aggregate([
      { $match: filter },
      {
        $addFields: {
          rolePriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$role", "admin"] }, then: 1 },
                { case: { $eq: ["$role", "manager"] }, then: 2 },
              ],
              default: 3,
            },
          },
        },
      },
      { $sort: { rolePriority: 1, ...sortOptions } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]),
    User.countDocuments(filter),
  ]);

  const userIds = users.map((u) => u._id);
  const orderStats = await Order.aggregate([
    { $match: { user: { $in: userIds }, paymentStatus: "paid" } },
    {
      $group: {
        _id: "$user",
        orders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
  ]);
  const statsMap = {};
  for (const s of orderStats) {
    statsMap[s._id.toString()] = { orders: s.orders, totalSpent: s.totalSpent };
  }

  const data = users.map((u) => ({
    _id: u._id,
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
    isBlocked: u.isBlocked,
    deactivatedAt: u.deactivatedAt || null,
    status: getStatus(u),
    avatar: u.avatar?.url || null,
    orders: statsMap[u._id.toString()]?.orders || 0,
    totalSpent: statsMap[u._id.toString()]?.totalSpent || 0,
    registeredAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));

  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateById = async (id, data, file) => {
  await userRepository.findById(id);

  const updateData = {};
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;

  if (file) {
    const avatar = await uploadService.uploadImage(file, 'avatars');
    updateData.avatar = avatar;
  }

  return userRepository.updateById(id, updateData);
};

export const deleteById = async (id) => {
  await userRepository.findById(id);

  await Promise.all([
    Order.deleteMany({ user: id }),
    Review.deleteMany({ user: id }),
    Cart.deleteOne({ user: id }),
    Wishlist.deleteOne({ user: id }),
    Address.deleteMany({ user: id }),
    SavedBuild.deleteMany({ user: id }),
  ]);

  return userRepository.deleteById(id);
};

export const blockUser = async (id) => {
  const user = await userRepository.findById(id);
  return userRepository.updateById(id, { isBlocked: !user.isBlocked });
};

export const toggleDeactivate = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  if (user.deactivatedAt) {
    return userRepository.updateById(id, { deactivatedAt: null });
  }
  return userRepository.updateById(id, { deactivatedAt: new Date() });
};

export const getById = async (id) => {
  const u = await User.findById(id).lean();
  if (!u) throw ApiError.notFound("User not found");

  const [orderStats, reviewCount, wishlistCount, buildCount] = await Promise.all([
    Order.aggregate([
      { $match: { user: u._id, paymentStatus: "paid" } },
      { $group: { _id: null, orders: { $sum: 1 }, totalSpent: { $sum: "$total" } } },
    ]),
    Review.countDocuments({ user: u._id }),
    Wishlist.findOne({ user: u._id }).then((w) => w?.items?.length || 0),
    SavedBuild.countDocuments({ user: u._id }),
  ]);

  const stats = orderStats[0] || { orders: 0, totalSpent: 0 };
  const totalSpent = stats.totalSpent || 0;
  const orders = stats.orders || 0;

  return {
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isBlocked: u.isBlocked,
    deactivatedAt: u.deactivatedAt || null,
    status: getStatus(u),
    avatar: u.avatar?.url || null,
    isEmailVerified: u.isEmailVerified,
    registeredAt: u.createdAt,
    lastLogin: u.lastLogin,
    stats: {
      orders,
      totalSpent,
      avgOrderValue: orders > 0 ? Math.round(totalSpent / orders) : 0,
      reviews: reviewCount,
      wishlist: wishlistCount,
      savedBuilds: buildCount,
    },
  };
};
