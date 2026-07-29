import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";

export const getStats = async () => {
  const [
    revenueResult,
    totalOrders,
    totalProducts,
    totalCustomers,
    prevRevenueResult,
    prevOrders,
    prevProducts,
    prevCustomers,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments(),
    Product.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            $lt: new Date(new Date().setDate(new Date().getDate() - 1)),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    }),
    Product.countDocuments({
      isDeleted: false,
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    }),
    User.countDocuments({
      role: "customer",
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    }),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const prevRevenue = prevRevenueResult[0]?.total || 0;

  const calcChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueChange: calcChange(totalRevenue, prevRevenue),
    ordersChange: calcChange(totalOrders, prevOrders),
    productsChange: calcChange(totalProducts, prevProducts),
    customersChange: calcChange(totalCustomers, prevCustomers),
    notificationCount: 0, // Horizontal for now - make dynamic later
  };
};

export const getSalesData = async (period = "yearly") => {
  const now = new Date();
  let startDate;
  let groupFormat;

  if (period === "weekly") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
  } else if (period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
  } else {
    startDate = new Date(now.getFullYear() - 1, 0, 1);
    groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
  }

  const sales = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  return sales.map((s) => {
    const date = s._id.day
      ? new Date(s._id.year, s._id.month - 1, s._id.day)
      : new Date(s._id.year, s._id.month - 1, 1);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      ...(s._id.day && { day: s._id.day }),
      revenue: s.revenue,
      orders: s.orders,
    };
  });
};

export const getLowStockProducts = async (limit = 10) => {
  const products = await Product.find(
    { isDeleted: false, $expr: { $lte: ["$stock", "$lowStockThreshold"] } },
    { name: 1, stock: 1, lowStockThreshold: 1, price: 1, "images.url": 1, "images.isPrimary": 1 }
  )
    .sort({ stock: 1 })
    .limit(Number(limit))
    .lean();

  return products.map((p) => ({
    id: p._id,
    name: p.name,
    stock: p.stock,
    threshold: p.lowStockThreshold,
    price: p.price,
    image: p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || null,
  }));
};

export const getTopProducts = async (limit = 5) => {
  const products = await Product.find(
    { isDeleted: false, status: "active" },
    { name: 1, soldCount: 1, stock: 1, price: 1, "images.url": 1, "images.isPrimary": 1 }
  )
    .sort({ soldCount: -1 })
    .limit(Number(limit))
    .lean();

  return products.map((p) => ({
    id: p._id,
    name: p.name,
    soldCount: p.soldCount,
    stock: p.stock,
    price: p.price,
    image: p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || null,
  }));
};

export const getOrderBreakdown = async () => {
  const breakdown = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  const allStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  const map = Object.fromEntries(breakdown.map((b) => [b._id, b.count]));

  return allStatuses.map((status) => ({
    status,
    count: map[status] || 0,
  }));
};

export const getRecentOrders = async (limit = 5) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate("user", "firstName lastName email")
    .lean();

  return orders.map((o) => ({
    id: o._id,
    orderNumber: o.orderNumber,
    customer: {
      name: o.user ? `${o.user.firstName} ${o.user.lastName}` : "Unknown",
      email: o.user?.email,
    },
    status: o.orderStatus,
    total: o.total,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
  }));
};
