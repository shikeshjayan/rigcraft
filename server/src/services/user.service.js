import User from "../models/user.model.js";
import userRepository from "../repositories/user.repository.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.model.js";
import Address from "../models/address.model.js";
import SavedBuild from "../models/saved-build.model.js";
import * as uploadService from "./upload.service.js";
import ApiError from "../utils/ApiError.js";

export const list = async (query = {}) => {
  const { page = 1, limit = 20, search, role, status, sort = "-createdAt" } = query;

  const filter = {};

  if (role) filter.role = role;
  if (status === "active") filter.isBlocked = false;
  if (status === "inactive") filter.isBlocked = true;
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
    User.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)).lean(),
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
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
    status: u.isBlocked ? "inactive" : "active",
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

export const getById = async (id) => {
  const u = await User.findById(id).lean();
  if (!u) throw ApiError.notFound("User not found");

  const orderStats = await Order.aggregate([
    { $match: { user: u._id, paymentStatus: "paid" } },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
  ]);

  return {
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.isBlocked ? "inactive" : "active",
    avatar: u.avatar?.url || null,
    isEmailVerified: u.isEmailVerified,
    orders: orderStats[0]?.orders || 0,
    totalSpent: orderStats[0]?.totalSpent || 0,
    registeredAt: u.createdAt,
    lastLogin: u.lastLogin,
  };
};
