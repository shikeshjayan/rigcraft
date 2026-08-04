import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

import Category from "../src/models/category.model.js";
import Brand from "../src/models/brand.model.js";
import Product from "../src/models/product.model.js";
import PrebuiltPC from "../src/models/prebuiltPC.model.js";
import Deal from "../src/models/deal.model.js";
import Coupon from "../src/models/coupon.model.js";
import Newsletter from "../src/models/newsletter.model.js";
import Review from "../src/models/review.model.js";
import User from "../src/models/user.model.js";

import categoriesData from "./data/categories.js";
import brandsData from "./data/brands.js";
import productsData from "./data/products.js";
import prebuiltPcsData from "./data/prebuilt-pcs.js";
import dealsData from "./data/deals.js";
import couponsData from "./data/coupons.js";
import newslettersData from "./data/newsletter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const IMGBASE = "https://picsum.photos/seed";

const runSeeder = (script) =>
  new Promise((resolve, reject) => {
    const child = spawn("node", [`seed/${script}.js`], {
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

const mongo = await MongoMemoryServer.create({ instance: { dbName: "rigcraft-more-verify" } });
const uri = mongo.getUri();
await mongoose.connect(uri);

// ── 1. Seed the pre-existing catalog exactly like seed.js does ──
const catDocs = await Category.create(
  categoriesData.map((c) => ({
    ...c,
    image: { url: `${IMGBASE}/${slugify(c.name, { lower: true, strict: true })}/200/200`, publicId: null, alt: c.name },
  }))
);
const catMap = new Map(catDocs.map((d) => [d.name, d._id]));

const brandDocs = await Brand.create(
  brandsData.map((b) => ({
    ...b,
    logo: { url: `${IMGBASE}/${slugify(b.name, { lower: true, strict: true })}/200/200`, publicId: null, alt: b.name },
  }))
);
const brandMap = new Map(brandDocs.map((d) => [d.name, d._id]));

const productPayloads = productsData.map((p) => ({
  name: p.name,
  slug: slugify(p.name, { lower: true, strict: true }),
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
  images: [{ url: `${IMGBASE}/${slugify(p.name, { lower: true, strict: true })}/400/400`, publicId: null, alt: p.name, isPrimary: true }],
}));
const productDocs = await Product.create(productPayloads);
for (const p of productsData) {
  const doc = productDocs.find((d) => d.sku === p.sku);
  if (doc && p.specifications) {
    await Product.updateOne({ _id: doc._id }, { $set: { specifications: p.specifications } });
  }
}
const productMap = new Map(productDocs.map((d) => [d.sku, d]));

const prebuiltPayloads = prebuiltPcsData.map((pc) => ({
  name: pc.name,
  slug: slugify(pc.name, { lower: true, strict: true }),
  sku: pc.sku,
  shortDescription: pc.shortDescription,
  description: pc.description,
  tags: pc.tags,
  components: pc.componentSkus.map((cs) => ({ type: cs.type, product: productMap.get(cs.sku)._id, quantity: cs.quantity || 1 })),
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
  images: [{ url: `${IMGBASE}/${slugify(pc.name, { lower: true, strict: true })}/400/400`, publicId: null, alt: pc.name, isPrimary: true }],
}));
await PrebuiltPC.create(prebuiltPayloads);

await Coupon.create(couponsData);
await Deal.create(
  dealsData.map((d) => ({
    ...d,
    desktopBanner: { url: `${IMGBASE}/deal-${slugify(d.title, { lower: true, strict: true })}-desktop/1920/600`, publicId: null, alt: d.title },
    mobileBanner: { url: `${IMGBASE}/deal-${slugify(d.title, { lower: true, strict: true })}-mobile/640/640`, publicId: null, alt: d.title },
    promotion: {
      ...d.promotion,
      homeOffer: (d.promotion.homeOffer || []).map((o) =>
        o.enabled ? { ...o, banner: { url: `${IMGBASE}/deal-${slugify(d.title, { lower: true, strict: true })}-offer/800/400`, publicId: null, alt: o.title } } : o
      ),
    },
  }))
);
await Newsletter.create(newslettersData);

// Simulate the user's live DB: WD brand stored under a different name than the canonical one
const wdRename = await Brand.updateOne({ name: "WD (Western Digital)" }, { $set: { name: "WD" } });
console.log(`Simulated live-DB WD rename (${wdRename.modifiedCount} modified)`);

console.log(`Seeded baseline: ${(await Product.countDocuments({}))} products, ${(await PrebuiltPC.countDocuments({}))} prebuilts, ${(await Coupon.countDocuments({}))} coupons, ${(await Deal.countDocuments({}))} deals, ${(await Newsletter.countDocuments({}))} newsletters`);

// ── 2. Run seed-more (run 1) ──
console.log("\n--- Running seed-more.js (run 1) ---");
console.log(await runSeeder("seed-more"));

const products1 = await Product.find({}).lean();
const prebuilts1 = await PrebuiltPC.find({}).lean();
const coupons1 = await Coupon.find({}).lean();
const deals1 = await Deal.find({}).lean();
const newsletters1 = await Newsletter.find({}).lean();

const brandNameById = new Map((await Brand.find({}).lean()).map((b) => [b._id.toString(), b.name]));

console.log("\n--- Assertions run 1 ---");
check("products = 100", products1.length === 100, `got ${products1.length}`);
check("prebuilts = 50", prebuilts1.length === 50, `got ${prebuilts1.length}`);
check("brands = 31", (await Brand.countDocuments({})) === 31);
check("coupons = 12", coupons1.length === 12, `got ${coupons1.length}`);
check("deals = 9", deals1.length === 9, `got ${deals1.length}`);
check("newsletters = 45", newsletters1.length === 45, `got ${newsletters1.length}`);

const fixSkus = {
  "ACC-LOG-GPX2": "Logitech",
  "COOL-NOC-NHD15": "Noctua",
  "STO-CRU-P3P1T": "Crucial",
  "CASE-LL-O11RGB": "Lian Li",
  "PSU-EVG-G71000": "EVGA",
  "ACC-STL-APEXPRO": "SteelSeries",
};
for (const [sku, expectedBrand] of Object.entries(fixSkus)) {
  const p = products1.find((x) => x.sku === sku);
  const actual = p ? brandNameById.get(p.brand.toString()) : "NOT FOUND";
  check(`brand fix ${sku} -> ${expectedBrand}`, actual === expectedBrand, `got ${actual}`);
}

const wdBlue = products1.find((x) => x.sku === "STO-WD-BLUE2T");
check(
  "new WD product brand resolves via renamed live-DB brand",
  !!wdBlue && brandNameById.get(wdBlue.brand.toString()) === "WD",
  `got ${wdBlue ? brandNameById.get(wdBlue.brand.toString()) : "NOT FOUND"}`
);

let badProduct = 0;
for (const p of products1) {
  if (!p.dimensions || !p.weight) badProduct++;
  if (!p.viewCount || p.viewCount <= 0) badProduct++;
  if (!p.images || !p.images[0] || !p.images[0].url.includes("images.unsplash.com")) badProduct++;
  if (!p.metaTitle || !p.metaDescription) badProduct++;
}
check("every product has dims/weight/views/real image/meta", badProduct === 0, `${badProduct} bad`);

let badPrebuilt = 0;
for (const p of prebuilts1) {
  if (!p.viewCount || p.viewCount <= 0) badPrebuilt++;
  if (!p.images || !p.images[0] || !p.images[0].url.includes("images.unsplash.com")) badPrebuilt++;
  if (!p.metaTitle || !p.metaDescription) badPrebuilt++;
  if (!p.components || p.components.length === 0) badPrebuilt++;
}
check("every prebuilt has views/real image/meta/components", badPrebuilt === 0, `${badPrebuilt} bad`);

check("deals have real banners", deals1.every((d) => d.desktopBanner?.url?.includes("images.unsplash.com")));
check("category images real", (await Category.countDocuments({ "image.url": { $regex: "images.unsplash.com" } })) === 10);

const couponsWithCategory = coupons1.filter((c) => c.applicableTo === "category");
check(
  "category coupons have category refs",
  couponsWithCategory.every((c) => c.categories && c.categories.length > 0)
);

// ── 3. Run seed-more (run 2, idempotency) ──
console.log("\n--- Running seed-more.js (run 2, idempotency) ---");
console.log(await runSeeder("seed-more"));

console.log("\n--- Assertions run 2 ---");
check("products unchanged", (await Product.countDocuments({})) === products1.length);
check("prebuilts unchanged", (await PrebuiltPC.countDocuments({})) === prebuilts1.length);
check("coupons unchanged", (await Coupon.countDocuments({})) === coupons1.length);
check("deals unchanged", (await Deal.countDocuments({})) === deals1.length);
check("newsletters unchanged", (await Newsletter.countDocuments({})) === newsletters1.length);
check("brands unchanged", (await Brand.countDocuments({})) === 31);
const prods2 = await Product.find({}).lean();
const pre2 = await PrebuiltPC.find({}).lean();
check("views stable on rerun", prods2.every((p, i) => p.viewCount === products1[i].viewCount));
check("soldCount stable on rerun", pre2.every((p, i) => p.soldCount === prebuilts1[i].soldCount));

// ── 4. Integration: run seed-reviews on the full 100/50 catalog ──
console.log("\n--- Running seed-reviews.js (full catalog integration) ---");
console.log(await runSeeder("seed-reviews"));

const reviews = await Review.find({}).lean();
const customers = await User.countDocuments({ role: "customer" });
const prods3 = await Product.find({}).lean();
const pre3 = await PrebuiltPC.find({}).lean();

console.log("\n--- Assertions integration ---");
check("customers = 150", customers === 150, `got ${customers}`);
let lowCoverage = 0;
let ratingMismatch = 0;
for (const p of [...prods3, ...pre3]) {
  const isPrebuilt = p.sku && p.sku.startsWith("PBR");
  const itemType = isPrebuilt ? "prebuilt" : "product";
  const approved = reviews.filter(
    (r) => r.itemType === itemType && r.item && r.item.toString() === p._id.toString() && r.status === "approved"
  ).length;
  if (approved < 5) lowCoverage++;
  if (p.rating.count !== approved) ratingMismatch++;
}
check("every item has >=5 approved reviews", lowCoverage === 0, `${lowCoverage} low`);
check("every item rating.count matches approved", ratingMismatch === 0, `${ratingMismatch} mismatched`);
check("testimonials = 10", reviews.filter((r) => r.reviewType === "website").length === 10);
check(
  "bad reviews flagged (rejected/pending)",
  reviews.some((r) => r.status === "rejected") && reviews.some((r) => r.status === "pending")
);

console.log(`\n  ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
await mongoose.disconnect();
await mongo.stop();
process.exit(failures === 0 ? 0 : 1);
