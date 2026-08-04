import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import User from "../src/models/user.model.js";
import Product from "../src/models/product.model.js";
import PrebuiltPC from "../src/models/prebuiltPC.model.js";
import Review from "../src/models/review.model.js";
import Order from "../src/models/order.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runSeeder = (uri) =>
  new Promise((resolve, reject) => {
    const child = spawn("node", ["seed/seed-reviews.js"], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, MONGODB_URI: uri, GEMINI_API_KEY: "" },
      stdio: "pipe",
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (out += d.toString()));
    child.on("exit", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`seeder exited ${code}\n${out}`))
    );
  });

let failures = 0;
const check = (label, cond, extra = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}${extra ? " -- " + extra : ""}`);
  if (!cond) failures++;
};

const mongo = await MongoMemoryServer.create({ instance: { dbName: "rigcraft-verify" } });
const uri = mongo.getUri();
await mongoose.connect(uri);

const cat = new mongoose.Types.ObjectId();
const brd = new mongoose.Types.ObjectId();

const customers = [];
for (let i = 0; i < 3; i++) {
  customers.push(
    await User.create({
      firstName: `Seed${i}`,
      lastName: "Customer",
      email: `seedcustomer${i}@rigcraft.com`,
      phone: `+91-900000000${i}`,
      password: "Customer@123",
      role: "customer",
    })
  );
}

const products = [];
const defs = [
  ["CPU-AMD-7600X", "AMD CPU Test", "processor"],
  ["GPU-NVD-RTX4060", "NVIDIA GPU Test", "graphics_card"],
  ["RAM-KIN-16GD5", "Kingston RAM Test", "memory"],
  ["CASE-COR-4000D", "Corsair Case Test", "case"],
];
for (const [sku, name, categoryType] of defs) {
  products.push(
    await Product.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku,
      category: cat,
      brand: brd,
      categoryType,
      price: 10000,
      stock: 10,
      status: "active",
    })
  );
}

const prebuilts = [];
const pdefs = [
  ["PBR-START-001", "Starter Valorant Rig"],
  ["PBR-MID-001", "Mid-Tower 1440p Beast"],
];
for (const [sku, name] of pdefs) {
  prebuilts.push(
    await PrebuiltPC.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku,
      category: "budget",
      pricing: { price: 50000 },
      status: "active",
    })
  );
}

await Order.create({
  orderNumber: "RIG-VERIFY-001",
  user: customers[0]._id,
  items: [
    { itemType: "product", item: products[0]._id, itemModel: "Product", name: "CPU", sku: "CPU-AMD-7600X", quantity: 1, unitPrice: 10000, totalPrice: 10000 },
  ],
  subtotal: 10000,
  shippingCharge: 0,
  tax: 1800,
  total: 11800,
  paymentMethod: "cod",
  paymentStatus: "paid",
  orderStatus: "delivered",
});

await Review.create({
  reviewType: "product",
  user: customers[0]._id,
  itemType: "product",
  item: products[0]._id,
  itemModel: "Product",
  rating: 5,
  title: "Preexisting review",
  comment: "An existing review that must not be duplicated.",
  status: "approved",
});

console.log("\n--- Running seed-reviews.js (run 1) ---");
console.log(await runSeeder(uri));

const reviewsAfter1 = await Review.find({}).lean();
const customersAfter1 = await User.find({ role: "customer" }).lean();
const productsAfter1 = await Product.find({}).lean();
const prebuiltsAfter1 = await PrebuiltPC.find({}).lean();
const testis = reviewsAfter1.filter((r) => r.reviewType === "website");

console.log("\n--- Assertions run 1 ---");
check("customers = 50", customersAfter1.length === 50, `got ${customersAfter1.length}`);
check("total reviews > 30", reviewsAfter1.length > 30, `got ${reviewsAfter1.length}`);
const itemReviews = reviewsAfter1.filter((r) => r.item && r.itemType !== "website");
check(
  "no duplicate user+item pairs",
  new Set(itemReviews.map((r) => `${r.user}|${r.itemType}|${r.item}`)).size ===
    itemReviews.length
);
for (const p of productsAfter1) {
  const approved = reviewsAfter1.filter(
    (r) => r.itemType === "product" && r.item && r.item.toString() === p._id.toString() && r.status === "approved"
  ).length;
  check(`product ${p.sku} has >=4 approved`, approved >= 4, `${approved}`);
  check(`product ${p.sku} rating.count matches`, p.rating.count === approved, `stored=${p.rating.count} actual=${approved}`);
}
for (const p of prebuiltsAfter1) {
  const approved = reviewsAfter1.filter(
    (r) => r.itemType === "prebuilt" && r.item && r.item.toString() === p._id.toString() && r.status === "approved"
  ).length;
  check(`prebuilt ${p.sku} has >=4 approved`, approved >= 4, `${approved}`);
  check(`prebuilt ${p.sku} rating.count matches`, p.rating.count === approved, `stored=${p.rating.count} actual=${approved}`);
}
check(
  "bad reviews present (rejected/pending)",
  reviewsAfter1.some((r) => r.status === "rejected") &&
    reviewsAfter1.some((r) => r.status === "pending"),
  `rejected=${reviewsAfter1.filter((r) => r.status === "rejected").length} pending=${reviewsAfter1.filter((r) => r.status === "pending").length}`
);
check("testimonials = 10", testis.length === 10, `got ${testis.length}`);
check("featured testimonials = 8", testis.filter((t) => t.featured).length === 8);

console.log("\n--- Running seed-reviews.js (run 2, idempotency) ---");
console.log(await runSeeder(uri));

const reviewsAfter2 = await Review.find({}).lean();
const customersAfter2 = await User.find({ role: "customer" }).lean();

console.log("\n--- Assertions run 2 ---");
check("no new reviews inserted", reviewsAfter2.length === reviewsAfter1.length, `before=${reviewsAfter1.length} after=${reviewsAfter2.length}`);
check("no new customers created", customersAfter2.length === customersAfter1.length, `before=${customersAfter1.length} after=${customersAfter2.length}`);

console.log(`\n  ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
await mongoose.disconnect();
await mongo.stop();
process.exit(failures === 0 ? 0 : 1);
