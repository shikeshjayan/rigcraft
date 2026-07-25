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
