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

import categories from "./data/categories.js";
import brands from "./data/brands.js";
import productsData from "./data/products.js";
import prebuiltPcsData from "./data/prebuilt-pcs.js";
import couponsData from "./data/coupons.js";

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
    shipping: { standardRate: 100, freeShippingThreshold: 500, expressRate: 200 },
    tax: { rate: 0.18, name: "GST" },
    currency: { code: "INR", symbol: "₹" },
    storeName: "RigCraft",
    storeEmail: "support@rigcraft.com",
    storePhone: "+91-1800-123-4567",
    address: "42, Tech Park Boulevard, Koramangala, Bengaluru, Karnataka 560034",
    maintenanceMode: false,
  });
  summary.push(["Settings", 1]);

  // ── 2. BuildSetting ──
  console.log("  Seeding BuildSetting...");
  await BuildSetting.create({ enabled: true });
  summary.push(["Build Settings", 1]);

  // ── 3. Categories ──
  console.log("  Seeding Categories...");
  const catDocs = await Category.create(categories);
  catDocs.forEach((d, i) => { categories[i]._id = d._id; });
  const catMap = new Map(catDocs.map((d) => [d.name, d._id]));
  summary.push(["Categories", catDocs.length]);

  // ── 4. Brands ──
  console.log("  Seeding Brands...");
  const brandDocs = await Brand.create(brands);
  const brandMap = new Map(brandDocs.map((d) => [d.name, d._id]));
  summary.push(["Brands", brandDocs.length]);

  // ── 5. Users ──
  console.log("  Seeding Users...");

  const customerData = [];
  for (let i = 0; i < 6; i++) {
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

  const allUsers = await User.create(customerData);
  const customers = allUsers;
  summary.push(["Users", allUsers.length]);

  // ── 6. Products ──
  console.log("  Seeding Products...");
  const productPayloads = productsData.map((p) => ({
    name: p.name,
    slug: slugify(p.name, { lower: true, strict: true }),
    sku: p.sku,
    productType: "component",
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
    componentType: p.componentType,
  }));
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
    return {
      name: pc.name,
      slug: slugify(pc.name, { lower: true, strict: true }),
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

  // ── 9. Orders ──
  console.log("  Seeding Orders...");
  const orders = [];
  const productValues = [...productMap.values()];
  for (let i = 0; i < 25; i++) {
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

  // ── 10. Reviews ──
  console.log("  Seeding Reviews...");
  const reviews = [];
  const deliveredOrders = orderDocs.filter((o) => o.orderStatus === "delivered");
  const reviewedProducts = new Set();
  for (let i = 0; i < 40; i++) {
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
      isVisible: true,
      createdAt: generatePastDate(4),
    });
  }
  const reviewDocs = await Review.create(reviews);
  summary.push(["Reviews", reviewDocs.length]);

  // ── 11. Addresses ──
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

  // ── 12. Wishlists ──
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

  // ── 13. Carts ──
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

  // ── 14. Saved Builds ──
  console.log("  Seeding Saved Builds...");
  const savedBuilds = [];
  const buildUsers = pickRandom(customers, 4);
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
