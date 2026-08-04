import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import crypto from "crypto";
import { faker } from "@faker-js/faker";
import slugify from "slugify";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import User from "../src/models/user.model.js";
import Category from "../src/models/category.model.js";
import Brand from "../src/models/brand.model.js";
import Product from "../src/models/product.model.js";
import PrebuiltPC from "../src/models/prebuiltPC.model.js";
import Coupon from "../src/models/coupon.model.js";
import Order from "../src/models/order.model.js";
import Review from "../src/models/review.model.js";
import Address from "../src/models/address.model.js";
import Wishlist from "../src/models/wishlist.model.js";
import Cart from "../src/models/cart.model.js";
import SavedBuild from "../src/models/saved-build.model.js";
import Settings from "../src/models/settings.model.js";
import BuildSetting from "../src/models/build-setting.model.js";
import FAQ from "../src/models/faq.model.js";
import Deal from "../src/models/deal.model.js";
import Newsletter from "../src/models/newsletter.model.js";
import SupportTicket from "../src/models/support-ticket.model.js";
import SupportMessage from "../src/models/support-message.model.js";
import Notification from "../src/models/notification.model.js";

import categories from "./data/categories.js";
import brands from "./data/brands.js";
import productsData from "./data/products.js";
import prebuiltPcsData from "./data/prebuilt-pcs.js";
import couponsData from "./data/coupons.js";
import faqsData from "./data/faqs.js";
import dealsData from "./data/deals.js";
import newslettersData from "./data/newsletter.js";

// ───────────────────────────────────────────
//   Helpers
// ───────────────────────────────────────────

const STATUS_WEIGHTS = [
  { status: "delivered", weight: 40 },
  { status: "shipped", weight: 20 },
  { status: "processing", weight: 15 },
  { status: "pending", weight: 10 },
  { status: "cancelled", weight: 10 },
  { status: "confirmed", weight: 5 },
];

function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.status;
  }
  return items[items.length - 1].status;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateOrderNumber(index) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RIG-${yy}${mm}${dd}-${hex}`;
}

function generatePastDate(monthsAgo) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(1, monthsAgo * 30));
  return d;
}

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Chandigarh", "Indore", "Bhopal", "Surat", "Thane",
];

const INDIAN_STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu",
  "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh",
  "Punjab", "Haryana", "Kerala", "Odisha", "Bihar",
];

const REVIEW_COMMENTS = [
  "Excellent product! Works exactly as described. Highly recommended.",
  "Great value for money. Performance is solid for the price.",
  "Good quality build. Installed without any issues.",
  "Decent product but expected better performance for the price.",
  "Works fine. Nothing groundbreaking but gets the job done.",
  "Amazing performance! Blown away by the speed and reliability.",
  "Had some issues initially but seller support was helpful.",
  "Perfect condition, well packaged. Would buy again.",
  "Not bad for the price, but there are better options available.",
  "Top-notch quality. Exceeded my expectations.",
  "Arrived on time and works perfectly. Five stars.",
  "Good product but the packaging could be better.",
  "Very happy with this purchase. Great addition to my build.",
  "Average product. Does what it says but nothing special.",
  "Outstanding quality and performance. Worth every rupee.",
  "Fast delivery and genuine product. Very satisfied.",
  "Could be better. Had some minor compatibility issues.",
  "Superb build quality. Looks premium and performs well.",
  "Budget-friendly option that doesn't compromise on quality.",
  "Exactly what I needed for my upgrade. Fits perfectly.",
];

const IMGBASE = "https://picsum.photos/seed";

// ───────────────────────────────────────────
//   Seeder
// ───────────────────────────────────────────

async function seed() {
  console.log("\n  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`  Connected: ${mongoose.connection.host}\n`);

  // Drop existing data
  console.log("  Dropping existing data...");
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
  console.log("  Done.\n");

  const summary = [];

  // ── 1. Settings ──
  console.log("  Seeding Settings...");
  await Settings.create({
    storeName: "RigCraft",
    storeEmail: "support@rigcraft.com",
    storePhone: "+91-1800-123-4567",
    description: "India's premier PC building destination — custom rigs, premium components, and expert support.",
    address: "42, Tech Park Boulevard, Koramangala, Bengaluru, Karnataka 560034",
    whatsapp: "+91-98765-43210",
    logo: { url: `${IMGBASE}/rigcraft-logo/200/60`, publicId: null, alt: "RigCraft" },
    favicon: { url: `${IMGBASE}/rigcraft-favicon/32/32`, publicId: null, alt: "RigCraft" },
    shipping: {
      standardRate: 100,
      freeShippingThreshold: 500,
      expressRate: 200,
      estimatedDelivery: "3-5 Business Days",
      codAvailable: true,
    },
    tax: { rate: 0.18, name: "GST", pricesIncludeTax: false },
    payment: { enableRazorpay: true, enableCod: true, minOrderAmount: 0, maxOrderAmount: 0 },
    currency: { code: "INR", symbol: "₹" },
    social: {
      facebook: "https://facebook.com/rigcraft",
      instagram: "https://instagram.com/rigcraft",
      youtube: "https://youtube.com/@rigcraft",
      linkedin: "https://linkedin.com/company/rigcraft",
      twitter: "https://twitter.com/rigcraft",
    },
    seo: {
      defaultTitle: "RigCraft — Build Your Dream PC",
      defaultDescription: "India's premier PC building destination. Custom gaming rigs, workstation PCs, and premium components from top brands.",
      defaultOgImage: { url: `${IMGBASE}/rigcraft-og/1200/630`, publicId: null, alt: "RigCraft" },
      metaKeywords: "PC builder, gaming PC, custom PC, computer components, India,rigcraft",
    },
    order: { prefix: "RC-", allowCancellation: true, cancellationTimeLimit: 24, cancelPendingAfter: 24 },
    inventory: { lowStockThreshold: 10, allowBackorders: false, hideOutOfStock: false, autoUpdateInventory: true },
    review: { allowReviews: true, verifiedPurchaseOnly: true, autoApprove: false, allowImages: true, maxImages: 5 },
    maintenanceMode: false,
    maintenanceMessage: "We'll be back soon!",
    notification: {
      orderConfirmation: true,
      shippingUpdate: true,
      paymentConfirmation: true,
      lowStockAlerts: true,
      newOrderAlerts: true,
    },
  });
  summary.push(["Settings", 1]);

  // ── 2. BuildSetting ──
  console.log("  Seeding BuildSetting...");
  await BuildSetting.create({ enabled: true });
  summary.push(["Build Settings", 1]);

    // ── 2a. FAQs ──
  console.log("  Seeding FAQs...");
  const faqDocs = await FAQ.create(faqsData);
  summary.push(["FAQs", faqDocs.length]);

  // ── 3. Categories ──
  console.log("  Seeding Categories...");
  const categoriesWithImages = categories.map((c) => ({
    ...c,
    image: {
      url: `${IMGBASE}/${slugify(c.name, { lower: true, strict: true })}/200/200`,
      publicId: null,
      alt: c.name,
    },
  }));
  const catDocs = await Category.create(categoriesWithImages);
  catDocs.forEach((d, i) => { categories[i]._id = d._id; });
  const catMap = new Map(catDocs.map((d) => [d.name, d._id]));
  summary.push(["Categories", catDocs.length]);

  // ── 4. Brands ──
  console.log("  Seeding Brands...");
  const brandsWithLogos = brands.map((b) => ({
    ...b,
    logo: {
      url: `${IMGBASE}/${slugify(b.name, { lower: true, strict: true })}/200/200`,
      publicId: null,
      alt: b.name,
    },
  }));
  const brandDocs = await Brand.create(brandsWithLogos);
  const brandMap = new Map(brandDocs.map((d) => [d.name, d._id]));
  summary.push(["Brands", brandDocs.length]);

  // ── 5. Users ──
  console.log("  Seeding Users...");

  const staffData = [
    { firstName: "Admin", lastName: "User", email: "admin@rigcraft.com", phone: "+91-1800-000-0001", password: "Admin@123", role: "admin", isEmailVerified: true },
    { firstName: "Manager", lastName: "User", email: "manager@rigcraft.com", phone: "+91-1800-000-0002", password: "Manager@123", role: "manager", isEmailVerified: true },
  ];
  const staffDocs = await User.create(staffData);
  const adminUser = staffDocs[0];
  const managerUser = staffDocs[1];

  const customerData = [];
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    customerData.push({
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `+91-${String(9000000000 + i * 100 + randomInt(1, 99)).slice(0, 10)}`,
      password: "Customer@123",
      role: "customer",
    });
  }

  const customerDocs = await User.create(customerData);
  const allUsers = [...staffDocs, ...customerDocs];
  const customers = customerDocs;
  summary.push(["Users", allUsers.length]);

  // ── 6. Products ──
  console.log("  Seeding Products...");
  const COMPONENT_TYPE_TO_CATEGORY_TYPE = {
    cpu: "processor",
    gpu: "graphics_card",
    motherboard: "motherboard",
    ram: "memory",
    storage: "storage",
    psu: "power_supply",
    cabinet: "case",
    cooler: "cooling",
    accessory: "accessories",
  };
  const productPayloads = productsData.map((p) => {
    const slug = slugify(p.name, { lower: true, strict: true });
    return {
      name: p.name,
      slug,
      sku: p.sku,
      productType: "component",
      categoryType: COMPONENT_TYPE_TO_CATEGORY_TYPE[p.componentType] || "",
      category: catMap.get(p.categoryName),
      brand: brandMap.get(p.brandName),
      shortDescription: p.shortDescription,
      tags: p.tags,
      price: p.price,
      salePrice: p.salePrice || undefined,
      stock: p.stock,
      warranty: p.warranty,
      isFeatured: p.isFeatured ?? false,
      featuredOrder: p.featuredOrder || 0,
      status: p.status,
      images: [{
        url: `${IMGBASE}/${slug}/400/400`,
        publicId: null,
        alt: p.name,
        isPrimary: true,
      }],
    };
  });
  const productDocs = await Product.create(productPayloads);
  // Inject specifications separately (Mongoose v9 Map type workaround)
  for (const p of productsData) {
    if (p.specifications) {
      const doc = productDocs.find((d) => d.sku === p.sku);
      if (doc) {
        await Product.updateOne(
          { _id: doc._id },
          { $set: { specifications: p.specifications } }
        );
      }
    }
  }
  const productMap = new Map(productDocs.map((d) => [d.sku, d]));
  summary.push(["Products", productDocs.length]);

  // ── 7. Prebuilt PCs ──
  console.log("  Seeding Prebuilt PCs...");
  const prebuiltPayloads = prebuiltPcsData.map((pc) => {
    const components = pc.componentSkus.map((cs) => {
      const prod = productMap.get(cs.sku);
      if (!prod) throw new Error(`Product SKU not found: ${cs.sku}`);
      return { type: cs.type, product: prod._id, quantity: cs.quantity || 1 };
    });
    const slug = slugify(pc.name, { lower: true, strict: true });
    return {
      name: pc.name,
      slug,
      sku: pc.sku,
      shortDescription: pc.shortDescription,
      description: pc.description,
      tags: pc.tags,
      components,
      pricing: pc.pricing,
      stock: pc.stock,
      category: pc.category,
      assemblyIncluded: pc.assemblyIncluded,
      stressTested: pc.stressTested,
      readyToShip: pc.readyToShip,
      warranty: pc.warranty,
      isFeatured: pc.isFeatured ?? false,
      featuredOrder: pc.featuredOrder || 0,
      status: pc.status,
      images: [{
        url: `${IMGBASE}/${slug}/400/400`,
        publicId: null,
        alt: pc.name,
        isPrimary: true,
      }],
    };
  });
  const prebuiltDocs = await PrebuiltPC.create(prebuiltPayloads);
  summary.push(["Prebuilt PCs", prebuiltDocs.length]);

  // ── 8. Coupons ──
  console.log("  Seeding Coupons...");
  const couponPayloads = couponsData.map((c) => ({
    name: c.name,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    maximumDiscount: c.maximumDiscount || undefined,
    minimumPurchase: c.minimumPurchase,
    applicableTo: c.applicableTo,
    usageLimit: c.usageLimit || undefined,
    usageLimitPerUser: c.usageLimitPerUser,
    validFrom: c.validFrom,
    validUntil: c.validUntil,
    isFirstOrderOnly: c.isFirstOrderOnly,
    isActive: c.isActive,
  }));
  const couponDocs = await Coupon.create(couponPayloads);
  summary.push(["Coupons", couponDocs.length]);

  // ── 9. Deals ──
  console.log("  Seeding Deals...");
  const dealPayloads = dealsData.map((d) => ({
    ...d,
    desktopBanner: { url: `${IMGBASE}/deal-${slugify(d.title, { lower: true, strict: true })}-desktop/1920/600`, publicId: null, alt: d.title },
    mobileBanner: { url: `${IMGBASE}/deal-${slugify(d.title, { lower: true, strict: true })}-mobile/640/640`, publicId: null, alt: d.title },
    isFeatured: d.isFeatured ?? false,
    promotion: {
      ...d.promotion,
      homeOffer: (d.promotion.homeOffer || []).map((offer) =>
        offer.enabled
          ? {
              ...offer,
              banner: { url: `${IMGBASE}/deal-${slugify(d.title, { lower: true, strict: true })}-offer/800/400`, publicId: null, alt: offer.title },
            }
          : offer,
      ),
    },
  }));
  const dealDocs = await Deal.create(dealPayloads);
  summary.push(["Deals", dealDocs.length]);

  // ── 10. Newsletter ──
  console.log("  Seeding Newsletter...");
  const newsletterDocs = await Newsletter.create(newslettersData);
  summary.push(["Newsletter Subscribers", newsletterDocs.length]);

  // ── 11. Orders ──
  console.log("  Seeding Orders...");
  const orders = [];
  const productValues = [...productMap.values()];
  for (let i = 0; i < 60; i++) {
    const user = customers[randomInt(0, customers.length - 1)];
    const numItems = randomInt(1, 3);
    const chosen = pickRandom(productValues, numItems);
    const items = chosen.map((p) => {
      const qty = randomInt(1, 2);
      const unitPrice = p.salePrice || p.price;
      return {
        itemType: "product",
        item: p._id,
        itemModel: "Product",
        name: p.name,
        sku: p.sku,
        quantity: qty,
        unitPrice,
        totalPrice: unitPrice * qty,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
    const shippingCharge = subtotal >= 500 ? 0 : 100;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shippingCharge + tax;

    const createdDate = generatePastDate(6);
    const orderStatus = weightedRandom(STATUS_WEIGHTS);
    const paymentStatus =
      orderStatus === "cancelled" ? "failed"
      : orderStatus === "delivered" ? "paid"
      : "paid";

    const city = faker.helpers.arrayElement(INDIAN_CITIES);
    const state = faker.helpers.arrayElement(INDIAN_STATES);

    orders.push({
      orderNumber: generateOrderNumber(i),
      user: user._id,
      items,
      shippingAddress: {
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        addressLine1: faker.location.streetAddress(),
        city,
        state,
        country: "India",
        postalCode: faker.location.zipCode("######"),
      },
      subtotal,
      discount: 0,
      shippingCharge,
      tax,
      total,
      paymentMethod: Math.random() > 0.7 ? "razorpay" : "cod",
      paymentStatus,
      orderStatus,
      createdAt: createdDate,
      updatedAt: createdDate,
    });
  }
  const orderDocs = await Order.create(orders);
  summary.push(["Orders", orderDocs.length]);

  // ── 12. Reviews ──
  console.log("  Seeding Reviews...");
  const reviews = [];
  const deliveredOrders = orderDocs.filter((o) => o.orderStatus === "delivered");
  const reviewedProducts = new Set();
  for (let i = 0; i < 100; i++) {
    const product = productValues[randomInt(0, productValues.length - 1)];
    const user = customers[randomInt(0, customers.length - 1)];
    const isVerified = deliveredOrders.length > 0 && Math.random() > 0.4;
    const relatedOrder = isVerified
      ? deliveredOrders[randomInt(0, deliveredOrders.length - 1)]
      : null;

    if (reviewedProducts.has(`${user._id}-${product._id}`)) continue;
    reviewedProducts.add(`${user._id}-${product._id}`);

    reviews.push({
      user: user._id,
      itemType: "product",
      item: product._id,
      itemModel: "Product",
      rating: randomInt(3, 5),
      title: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length].slice(0, 60),
      comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
      isVerifiedPurchase: !!relatedOrder,
      status: "approved",
      createdAt: generatePastDate(4),
    });
  }
  const reviewDocs = await Review.create(reviews);
  summary.push(["Reviews", reviewDocs.length]);

  console.log("  Recalculating rating aggregates...");
  const recalcItems = [
    ...productDocs.map((d) => ({ id: d._id, model: Product, itemType: "product" })),
    ...prebuiltDocs.map((d) => ({ id: d._id, model: PrebuiltPC, itemType: "prebuilt" })),
  ];
  for (const item of recalcItems) {
    const stats = await Review.aggregate([
      { $match: { item: item.id, itemType: item.itemType, status: "approved" } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const average = stats.length ? Math.round(stats[0].average * 10) / 10 : 0;
    const count = stats.length ? stats[0].count : 0;
    await item.model.updateOne({ _id: item.id }, { rating: { average, count } });
  }
  summary.push(["Ratings Recalculated", recalcItems.length]);

  // ── 13. Support Tickets & Messages ──
  console.log("  Seeding Support Tickets...");
  const ticketSubjects = [
    "Order not delivered yet", "Wrong item received", "Refund not processed",
    "Shipping address change request", "Product warranty inquiry",
    "Payment deduction but order failed", "Damaged product received",
    "Cancel order request", "Wrong configuration shipped",
    "Delivery delayed beyond estimate", "Replacement needed for GPU",
    "Invoice not received",
  ];
  const issueTypes = ["order", "shipping", "refund", "shipping", "warranty", "payment", "product", "order", "shipping", "shipping", "replacement", "other"];
  const ticketStatuses = ["open", "in_progress", "resolved", "closed", "open", "in_progress", "open", "waiting_customer", "resolved", "in_progress", "open", "closed"];
  const ticketPriorities = ["high", "medium", "medium", "low", "low", "urgent", "high", "medium", "medium", "low", "high", "low"];
  const ticketDocs = [];
  for (let i = 0; i < 12; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const ticket = await SupportTicket.create({
      ticketNumber: `TKT-${String(i + 1).padStart(5, "0")}`,
      user: customer._id,
      order: orderDocs[i % orderDocs.length]._id,
      issueType: issueTypes[i],
      subject: ticketSubjects[i],
      description: `Customer reported: ${ticketSubjects[i].toLowerCase()}. Please look into this at the earliest.`,
      status: ticketStatuses[i],
      priority: ticketPriorities[i],
      lastMessageAt: generatePastDate(randomInt(1, 14)),
    });
    ticketDocs.push(ticket);
  }
  summary.push(["Support Tickets", ticketDocs.length]);

  console.log("  Seeding Support Messages...");
  const messageDocs = [];
  for (const ticket of ticketDocs) {
    const customer = await User.findById(ticket.user);
    const customerMsg = await SupportMessage.create({
      ticket: ticket._id,
      sender: ticket.user,
      senderRole: "customer",
      message: `I need help with my ${ticket.issueType} issue. ${ticket.subject}`,
      isRead: ticket.status === "closed" || ticket.status === "resolved",
    });
    messageDocs.push(customerMsg);

    if (ticket.status !== "open") {
      const adminMsg = await SupportMessage.create({
        ticket: ticket._id,
        sender: adminUser._id,
        senderRole: "admin",
        message: `Thank you for reaching out. We are looking into your ${ticket.issueType} issue and will get back to you shortly.`,
        isRead: ticket.status === "closed",
      });
      messageDocs.push(adminMsg);
    }
  }
  summary.push(["Support Messages", messageDocs.length]);

  // ── 14. Notifications ──
  console.log("  Seeding Notifications...");
  const notificationTypes = [
    { type: "order", title: "New order placed", message: "A new order #RIG-2501-ABC has been placed.", module: "Order", priority: "normal" },
    { type: "review", title: "New review submitted", message: "A customer submitted a 4-star review on RTX 4060.", module: "Review", priority: "low" },
    { type: "inventory", title: "Low stock alert", message: "AMD Ryzen 5 7600X is running low on stock (3 units left).", module: "Inventory", priority: "high" },
    { type: "payment", title: "Payment failed", message: "A payment of ₹45,000 for order RIG-2502-DEF has failed.", module: "Payment", priority: "critical" },
    { type: "system", title: "System update", message: "Scheduled maintenance is planned for tonight at 2 AM.", module: "System", priority: "normal" },
    { type: "coupon", title: "Coupon expiring soon", message: "Coupon SUMMER10 expires in 3 days.", module: "Coupon", priority: "low" },
    { type: "order", title: "Order delivered", message: "Order RIG-2503-GHI has been marked as delivered.", module: "Order", priority: "normal" },
    { type: "support", title: "New support ticket", message: "A new support ticket TKT-00003 has been created.", module: "Support", priority: "normal" },
    { type: "inventory", title: "Stock replenished", message: "Corsair Vengeance 32GB DDR5 has been restocked (50 units).", module: "Inventory", priority: "low" },
    { type: "order", title: "Order cancelled", message: "Order RIG-2504-JKL has been cancelled by the customer.", module: "Order", priority: "normal" },
    { type: "marketing", title: "Newsletter campaign sent", message: "Flash sale newsletter sent to 5,420 subscribers.", module: "System", priority: "low" },
    { type: "review", title: "1-star review flagged", message: "A 1-star review on Product XYZ has been flagged for review.", module: "Review", priority: "high" },
    { type: "system", title: "Backup completed", message: "Daily database backup completed successfully.", module: "System", priority: "low" },
    { type: "order", title: "Refund processed", message: "Refund of ₹12,500 for order RIG-2505-MNO has been processed.", module: "Payment", priority: "normal" },
    { type: "support", title: "Ticket escalated", message: "Support ticket TKT-00008 has been escalated to high priority.", module: "Support", priority: "high" },
  ];
  const notificationDocs = [];
  for (let i = 0; i < notificationTypes.length; i++) {
    const n = notificationTypes[i];
    notificationDocs.push(await Notification.create({
      recipient: adminUser._id,
      recipientRole: "admin",
      type: n.type,
      title: n.title,
      message: n.message,
      module: n.module,
      priority: n.priority,
      isRead: i < 5,
    }));
  }
  summary.push(["Notifications", notificationDocs.length]);

  // ── 15. Addresses ──
  console.log("  Seeding Addresses...");
  const addresses = [];
  for (const user of customers) {
    const city = faker.helpers.arrayElement(INDIAN_CITIES);
    const state = faker.helpers.arrayElement(INDIAN_STATES);
    addresses.push({
      user: user._id,
      label: "Home",
      fullName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      addressLine1: faker.location.streetAddress(),
      city,
      state,
      country: "India",
      postalCode: faker.location.zipCode("######"),
      isDefault: true,
    });
    addresses.push({
      user: user._id,
      label: "Work",
      fullName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      addressLine1: faker.location.streetAddress(),
      addressLine2: faker.location.secondaryAddress(),
      city: faker.helpers.arrayElement(INDIAN_CITIES),
      state: faker.helpers.arrayElement(INDIAN_STATES),
      country: "India",
      postalCode: faker.location.zipCode("######"),
      isDefault: false,
    });
  }
  const addressDocs = await Address.create(addresses);
  summary.push(["Addresses", addressDocs.length]);

  // ── 15. Wishlists ──
  console.log("  Seeding Wishlists...");
  const wishlists = [];
  for (const user of customers) {
    const wishlistItems = pickRandom(productValues, randomInt(2, 5)).map((p) => ({
      itemType: "product",
      item: p._id,
      itemModel: "Product",
    }));
    wishlists.push({ user: user._id, items: wishlistItems });
  }
  const wishlistDocs = await Wishlist.create(wishlists);
  summary.push(["Wishlists", wishlistDocs.length]);

  // ── 16. Carts ──
  console.log("  Seeding Carts...");
  const carts = [];
  for (const user of customers) {
    const cartItems = pickRandom(productValues, randomInt(1, 3)).map((p) => {
      const qty = randomInt(1, 2);
      const unitPrice = p.salePrice || p.price;
      return {
        itemType: "product",
        item: p._id,
        itemTypeModel: "Product",
        quantity: qty,
        price: unitPrice,
        totalPrice: unitPrice * qty,
      };
    });
    const subtotal = cartItems.reduce((s, i) => s + i.totalPrice, 0);
    carts.push({
      user: user._id,
      items: cartItems,
      subtotal,
      shippingCharge: subtotal >= 500 ? 0 : 100,
      tax: Math.round(subtotal * 0.18),
      total: subtotal + (subtotal >= 500 ? 0 : 100) + Math.round(subtotal * 0.18),
    });
  }
  const cartDocs = await Cart.create(carts);
  summary.push(["Carts", cartDocs.length]);

  // ── 17. Saved Builds ──
  console.log("  Seeding Saved Builds...");
  const savedBuilds = [];
  const buildUsers = pickRandom(customers, 10);
  for (const user of buildUsers) {
    const cpu = productMap.get("CPU-AMD-7600X");
    const gpu = productMap.get("GPU-NVD-RTX4060");
    const mobo = productMap.get("MOBO-ASR-B650MP");
    const ram = productMap.get("RAM-KIN-16GD5");
    const storage = productMap.get("STO-CRU-P3P1T");
    const psu = productMap.get("PSU-SEA-FGX750");

    const components = [
      { type: "cpu", product: cpu._id, quantity: 1 },
      { type: "gpu", product: gpu._id, quantity: 1 },
      { type: "motherboard", product: mobo._id, quantity: 1 },
      { type: "ram", product: ram._id, quantity: 2 },
      { type: "storage", product: storage._id, quantity: 1 },
      { type: "psu", product: psu._id, quantity: 1 },
    ];

    const totalPrice = components.reduce((s, c) => {
      const p = productMap.get(
        [...productMap.keys()].find((k) => productMap.get(k)._id.equals(c.product))
      );
      return s + (p ? p.price : 0) * c.quantity;
    }, 0);

    savedBuilds.push({
      user: user._id,
      name: faker.helpers.arrayElement([
        "My Dream Build", "Budget Gaming PC", "Workstation Pro", "Casual Rig",
      ]),
      components,
      totalPrice,
      totalSalePrice: Math.round(totalPrice * 0.92),
      compatibility: { status: "compatible", issues: [] },
      isPublic: Math.random() > 0.5,
    });
  }
  const savedBuildDocs = await SavedBuild.create(savedBuilds);
  summary.push(["Saved Builds", savedBuildDocs.length]);

  // ───────────────────────────────────────────
  //   Summary
  // ───────────────────────────────────────────
  const totalRecords = summary.reduce((s, [, count]) => s + count, 0);
  const nameWidth = Math.max(...summary.map(([n]) => n.length));
  console.log("\n  \u2713 Seeding complete\n");
  console.log("  " + "\u2500".repeat(nameWidth + 14));
  for (const [name, count] of summary) {
    console.log(`   ${name.padEnd(nameWidth)} \u2502 ${String(count).padStart(4)}`);
  }
  console.log("  " + "\u2500".repeat(nameWidth + 14));
  console.log(`   ${"Total".padEnd(nameWidth)} \u2502 ${String(totalRecords).padStart(4)}`);
  console.log();

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n  Seed failed:", err.message);
  process.exit(1);
});
