import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Brand from "../models/brand.model.js";
import PrebuiltPC from "../models/prebuiltPC.model.js";
import Deal from "../models/deal.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import Coupon from "../models/coupon.model.js";
import SupportTicket from "../models/support-ticket.model.js";
import Newsletter from "../models/newsletter.model.js";
import Notification from "../models/notification.model.js";

const MIN_QUERY_LENGTH = 3;
const DEFAULT_LIMIT = 5;

const MODULE_ROLES = {
  products: ["admin", "manager"],
  categories: ["admin", "manager"],
  brands: ["admin", "manager"],
  prebuiltPCs: ["admin", "manager"],
  deals: ["admin", "manager"],
  orders: ["admin", "manager"],
  customers: ["admin"],
  reviews: ["admin", "manager"],
  coupons: ["admin"],
  supportTickets: ["admin", "manager"],
  newsletter: ["admin", "manager"],
  notifications: ["admin", "manager"],
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeQuery = (q) => (typeof q === "string" ? q.trim() : "");

const getImageUrl = (images = []) =>
  images.find((img) => img.isPrimary)?.url || images?.[0]?.url || null;

const buildRegexFilter = (regex, fields) => ({
  $or: fields.map((field) => ({ [field]: regex })),
});

const searchProducts = async (regex, limit, { publicOnly = false } = {}) => {
  const filter = {
    isDeleted: false,
    ...(publicOnly ? { status: "active" } : {}),
    ...buildRegexFilter(regex, ["name", "sku", "slug"]),
  };

  const docs = await Product.find(filter)
    .select("name slug sku price salePrice images")
    .limit(limit)
    .lean();

  return docs.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    salePrice: p.salePrice,
    image: getImageUrl(p.images),
  }));
};

const searchCategories = async (regex, limit) => {
  const docs = await Category.find({ name: regex, isActive: true })
    .select("name slug")
    .limit(limit)
    .lean();

  return docs.map((c) => ({ id: c._id, name: c.name, slug: c.slug }));
};

const searchBrands = async (regex, limit) => {
  const docs = await Brand.find({ name: regex })
    .select("name slug")
    .limit(limit)
    .lean();

  return docs.map((b) => ({ id: b._id, name: b.name, slug: b.slug }));
};

const searchPrebuiltPCs = async (regex, limit, { publicOnly = false } = {}) => {
  const filter = {
    isDeleted: false,
    ...(publicOnly ? { status: "active" } : {}),
    ...buildRegexFilter(regex, ["name", "sku", "slug"]),
  };

  const docs = await PrebuiltPC.find(filter)
    .select("name slug sku pricing images")
    .limit(limit)
    .lean();

  return docs.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    pricing: p.pricing,
    image: getImageUrl(p.images),
  }));
};

const searchDeals = async (regex, limit, { publicOnly = false } = {}) => {
  const now = new Date();
  const filter = {
    ...buildRegexFilter(regex, ["title", "description"]),
    ...(publicOnly
      ? {
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        }
      : {}),
  };

  const docs = await Deal.find(filter)
    .select("title slug")
    .limit(limit)
    .lean();

  return docs.map((d) => ({ id: d._id, title: d.title, slug: d.slug }));
};

const searchOrders = async (regex, limit) => {
  const matchedUsers = await User.find({
    role: "customer",
    ...buildRegexFilter(regex, ["firstName", "lastName", "email"]),
  })
    .select("_id")
    .limit(20)
    .lean();

  const userIds = matchedUsers.map((u) => u._id);
  const filter = userIds.length
    ? { $or: [{ orderNumber: regex }, { user: { $in: userIds } }] }
    : { orderNumber: regex };

  const docs = await Order.find(filter)
    .select("orderNumber user")
    .populate("user", "firstName lastName email")
    .limit(limit)
    .lean();

  return docs.map((o) => ({
    id: o._id,
    orderNumber: o.orderNumber,
    customer: {
      name: o.user ? `${o.user.firstName} ${o.user.lastName}` : null,
      email: o.user?.email || null,
    },
  }));
};

const searchCustomers = async (regex, limit) => {
  const docs = await User.find({
    role: "customer",
    ...buildRegexFilter(regex, ["firstName", "lastName", "email", "phone"]),
  })
    .select("firstName lastName email phone")
    .limit(limit)
    .lean();

  return docs.map((u) => ({
    id: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
  }));
};

const searchReviews = async (regex, limit) => {
  const docs = await Review.find(
    buildRegexFilter(regex, ["title", "comment"])
  )
    .select("title comment")
    .populate("user", "firstName lastName")
    .limit(limit)
    .lean();

  return docs.map((r) => ({
    id: r._id,
    title: r.title,
    text: r.comment,
    author: r.user ? `${r.user.firstName} ${r.user.lastName}` : null,
  }));
};

const searchCoupons = async (regex, limit) => {
  const docs = await Coupon.find({ code: regex })
    .select("code name")
    .limit(limit)
    .lean();

  return docs.map((c) => ({ id: c._id, code: c.code, name: c.name }));
};

const searchSupportTickets = async (regex, limit) => {
  const docs = await SupportTicket.find(
    buildRegexFilter(regex, ["ticketNumber", "subject"])
  )
    .select("ticketNumber subject")
    .limit(limit)
    .lean();

  return docs.map((t) => ({
    id: t._id,
    ticketNumber: t.ticketNumber,
    subject: t.subject,
  }));
};

const searchNewsletter = async (regex, limit) => {
  const docs = await Newsletter.find({ email: regex })
    .select("email status")
    .limit(limit)
    .lean();

  return docs.map((n) => ({
    id: n._id,
    email: n.email,
    status: n.status,
  }));
};

const searchNotifications = async (regex, limit) => {
  const docs = await Notification.find({
    recipientRole: { $in: ["admin", "manager"] },
    ...buildRegexFilter(regex, ["title", "message"]),
  })
    .select("title message")
    .limit(limit)
    .lean();

  return docs.map((n) => ({ id: n._id, title: n.title, message: n.message }));
};

const MODULE_SEARCHERS = {
  products: searchProducts,
  categories: searchCategories,
  brands: searchBrands,
  prebuiltPCs: searchPrebuiltPCs,
  deals: searchDeals,
  orders: searchOrders,
  customers: searchCustomers,
  reviews: searchReviews,
  coupons: searchCoupons,
  supportTickets: searchSupportTickets,
  newsletter: searchNewsletter,
  notifications: searchNotifications,
};

export const publicSearch = async (q, limit = DEFAULT_LIMIT) => {
  const query = normalizeQuery(q);
  const empty = { products: [], categories: [], brands: [], prebuiltPCs: [], deals: [] };
  if (query.length < MIN_QUERY_LENGTH) return empty;

  const regex = { $regex: escapeRegex(query), $options: "i" };
  const numLimit = Math.max(1, Math.min(Number(limit) || DEFAULT_LIMIT, 20));

  const [products, categories, brands, prebuiltPCs, deals] = await Promise.all([
    searchProducts(regex, numLimit, { publicOnly: true }),
    searchCategories(regex, numLimit),
    searchBrands(regex, numLimit),
    searchPrebuiltPCs(regex, numLimit, { publicOnly: true }),
    searchDeals(regex, numLimit, { publicOnly: true }),
  ]);

  return { products, categories, brands, prebuiltPCs, deals };
};

export const adminSearch = async (q, role, limit = DEFAULT_LIMIT) => {
  const query = normalizeQuery(q);
  const result = {};
  if (query.length < MIN_QUERY_LENGTH) return result;

  const regex = { $regex: escapeRegex(query), $options: "i" };
  const numLimit = Math.max(1, Math.min(Number(limit) || DEFAULT_LIMIT, 20));

  const modules = Object.entries(MODULE_SEARCHERS)
    .filter(([name]) => MODULE_ROLES[name]?.includes(role))
    .map(([name, searcher]) => [name, searcher(regex, numLimit)]);

  const settled = await Promise.all(modules.map(([, promise]) => promise));
  modules.forEach(([name], index) => {
    result[name] = settled[index];
  });

  return result;
};
