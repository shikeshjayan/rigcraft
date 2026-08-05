import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import slugify from "slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import Category from "../src/models/category.model.js";
import Brand from "../src/models/brand.model.js";
import Product from "../src/models/product.model.js";
import PrebuiltPC from "../src/models/prebuiltPC.model.js";
import Deal from "../src/models/deal.model.js";
import Coupon from "../src/models/coupon.model.js";
import Newsletter from "../src/models/newsletter.model.js";

import productsData from "./data/products.js";
import prebuiltPcsData from "./data/prebuilt-pcs.js";
import productsExtra from "./data/products-extra.js";
import prebuiltPcsExtra from "./data/prebuilt-pcs-extra.js";
import dealsExtra from "./data/deals-extra.js";
import couponsExtra from "./data/coupons-extra.js";
import newslettersExtra from "./data/newsletter-extra.js";
import newBrands from "./data/brands-extra.js";
import {
  buildProductImages,
  buildCategoryImage,
  buildDealBanner,
} from "./data/images.js";

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
  software: "software",
};

const CATEGORY_TYPE_TO_COMPONENT_TYPE = {
  processor: "cpu",
  graphics_card: "gpu",
  motherboard: "motherboard",
  memory: "ram",
  storage: "storage",
  power_supply: "psu",
  case: "cabinet",
  cooling: "cooler",
  accessories: "accessory",
  software: "software",
};

const DIMENSIONS_BY_TYPE = {
  cpu: { length: 7.5, width: 7.5, height: 0.9 },
  gpu: { length: 30.0, width: 12.0, height: 6.0 },
  motherboard: { length: 30.5, width: 24.4, height: 0.6 },
  ram: { length: 13.3, width: 0.7, height: 3.6 },
  storage: { length: 8.0, width: 2.2, height: 0.3 },
  psu: { length: 16.0, width: 15.0, height: 8.6 },
  cabinet: { length: 46.0, width: 21.0, height: 47.0 },
  cooler: { length: 14.0, width: 12.0, height: 16.0 },
  accessory: { length: 30.0, width: 12.0, height: 4.0 },
  software: { length: 14.0, width: 10.0, height: 1.0 },
};

const WEIGHT_BY_TYPE = {
  cpu: 0.12,
  gpu: 1.3,
  motherboard: 1.2,
  ram: 0.08,
  storage: 0.06,
  psu: 1.9,
  cabinet: 8.4,
  cooler: 1.1,
  accessory: 0.9,
  software: 0.1,
};

const DESC_TEMPLATES = {
  processor:
    "{name} is a high-performance processor built for demanding gaming, streaming, and productivity workloads. It pairs perfectly with the latest platforms and fast DDR5 memory, giving you a responsive, future-ready system.",
  graphics_card:
    "{name} delivers silky-smooth frame rates across modern titles with hardware-accelerated ray tracing and AI upscaling. Its robust cooling solution keeps thermals in check even during extended gaming sessions.",
  motherboard:
    "{name} offers a well-rounded feature set including high-speed connectivity, robust power delivery, and flexible expansion options. It is an excellent foundation for a reliable, upgrade-ready build.",
  memory:
    "{name} combines high frequencies with tight timings for responsive multitasking and gaming. The sleek heat spreader keeps the modules cool even under sustained load.",
  storage:
    "{name} provides blazing-fast read and write speeds, dramatically cutting boot times and game loading. It is a dependable upgrade for both new builds and existing systems.",
  power_supply:
    "{name} delivers clean, stable power with premium components and quiet operation. Modular cabling makes installation and cable management effortless.",
  case:
    "{name} offers excellent airflow, a spacious interior, and thoughtful cable management. Tool-free panels and generous component clearance make building straightforward.",
  cooling:
    "{name} keeps your CPU cool under load with efficient heat dissipation and quiet fans. Easy mounting hardware makes installation quick and hassle-free.",
  accessories:
    "{name} is built for comfort and precision, with a premium finish that complements any setup. It is a dependable daily driver for work and play.",
  software:
    "{name} is a genuine digital license delivered to your email right after purchase. Activation is simple and comes with full vendor support, keeping your software legitimate and up to date.",
};

const BRAND_FIXES = {
  "ACC-LOG-GPX2": "Logitech",
  "COOL-NOC-NHD15": "Noctua",
  "STO-CRU-P3P1T": "Crucial",
  "CASE-LL-O11RGB": "Lian Li",
  "PSU-EVG-G71000": "EVGA",
  "ACC-STL-APEXPRO": "SteelSeries",
};

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

const viewFor = (sku) => 200 + (hashString(sku) % 4801);
const soldFor = (sku) => 10 + (hashString(`${sku}sold`) % 191);

const cleanUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const normalizeName = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function resolveId(list, name, kind) {
  const n = normalizeName(name);
  if (!n) return null;
  const exact = list.find((e) => e.name === name);
  if (exact) return exact._id;
  const normMatch = list.find((e) => normalizeName(e.name) === n);
  if (normMatch) return normMatch._id;
  const containMatch = list.find((e) => {
    const en = normalizeName(e.name);
    return en.includes(n) || n.includes(en);
  });
  if (containMatch) {
    console.log(`    [note] ${kind} "${name}" matched existing "${containMatch.name}"`);
    return containMatch._id;
  }
  return null;
}

async function seed() {
  console.log("\n  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`  Connected: ${mongoose.connection.host}\n`);

  const summary = [];

  const categoryDocs = await Category.find({}).lean();
  const catList = categoryDocs.map((c) => ({ name: c.name, _id: c._id }));
  const brandDocs = await Brand.find({}).lean();
  const brandList = brandDocs.map((b) => ({ name: b.name, _id: b._id }));

  // ── 1. New brands ──
  console.log("  Creating missing brands...");
  let createdBrands = 0;
  for (const b of newBrands) {
    if (resolveId(brandList, b.name, "brand")) continue;
    const doc = new Brand({
      ...b,
      logo: {
        url: `https://picsum.photos/seed/${slugify(b.name, { lower: true, strict: true })}/200/200`,
        publicId: null,
        alt: b.name,
      },
    });
    await doc.save();
    brandList.push({ name: doc.name, _id: doc._id });
    createdBrands++;
  }
  summary.push(["Brands created", createdBrands]);

  // ── 2. Fix wrong brand refs on existing products ──
  console.log("  Fixing brand references...");
  let brandFixes = 0;
  for (const [sku, brandName] of Object.entries(BRAND_FIXES)) {
    const brandId = resolveId(brandList, brandName, "brand");
    if (!brandId) throw new Error(`Brand not found for fix: ${brandName}`);
    const res = await Product.updateOne({ sku }, { $set: { brand: brandId } });
    if (res.modifiedCount) brandFixes++;
  }
  summary.push(["Brand refs fixed", brandFixes]);

  // ── 3. Upsert 65 new products ──
  console.log("  Upserting products...");
  let productMap = new Map((await Product.find({}).lean()).map((p) => [p.sku, p]));
  let productsCreated = 0;
  let productsUpdated = 0;
  for (let i = 0; i < productsExtra.length; i++) {
    const p = productsExtra[i];
    const exists = productMap.has(p.sku);
    const categoryId = resolveId(catList, p.categoryName, "category");
    if (!categoryId) throw new Error(`Category not found: ${p.categoryName}`);
    const brandId = resolveId(brandList, p.brandName, "brand");
    if (!brandId) throw new Error(`Brand not found: ${p.brandName}`);
    const pool = CATEGORY_TYPE_TO_COMPONENT_TYPE[
      COMPONENT_TYPE_TO_CATEGORY_TYPE[p.componentType]
    ];
    const payload = {
      name: p.name,
      slug: slugify(p.name, { lower: true, strict: true }),
      sku: p.sku,
      productType: "component",
      categoryType: COMPONENT_TYPE_TO_CATEGORY_TYPE[p.componentType] || "",
      category: categoryId,
      brand: brandId,
      shortDescription: p.shortDescription,
      description: p.description,
      tags: p.tags,
      price: p.price,
      salePrice: p.salePrice || undefined,
      saleStart: p.salePrice ? new Date(Date.now() - 30 * 24 * 3600 * 1000) : undefined,
      saleEnd: p.salePrice ? new Date(Date.now() + 90 * 24 * 3600 * 1000) : undefined,
      stock: p.stock,
      images: buildProductImages(pool, p.name, i),
      weight: WEIGHT_BY_TYPE[p.componentType],
      dimensions: DIMENSIONS_BY_TYPE[p.componentType],
      warranty: p.warranty,
      metaTitle: `${p.name} — RigCraft`,
      metaDescription: (p.shortDescription || "").slice(0, 160),
      viewCount: p.viewCount ?? viewFor(p.sku),
      soldCount: p.soldCount ?? soldFor(p.sku),
      isFeatured: p.isFeatured ?? false,
      featuredOrder: p.featuredOrder || 0,
      status: p.status,
    };
    if (exists) {
      await Product.updateOne({ sku: p.sku }, { $set: cleanUndefined(payload) });
      productsUpdated++;
    } else {
      const doc = new Product(payload);
      await doc.save();
      productsCreated++;
    }
    await Product.updateOne(
      { sku: p.sku },
      { $set: { specifications: p.specifications || {} } }
    );
  }
  summary.push(["Products created", productsCreated]);
  summary.push(["Products updated", productsUpdated]);

  // ── 4. Enrich the 35 existing products ──
  console.log("  Enriching existing products...");
  let enrichedProducts = 0;
  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const doc = productMap.get(p.sku);
    if (!doc) continue;
    const componentType = CATEGORY_TYPE_TO_COMPONENT_TYPE[doc.categoryType] || "accessory";
    const set = {
      images: buildProductImages(componentType, p.name, i),
      viewCount: doc.viewCount || viewFor(p.sku),
      soldCount: doc.soldCount || soldFor(p.sku),
      weight: doc.weight || WEIGHT_BY_TYPE[componentType],
      dimensions: doc.dimensions || DIMENSIONS_BY_TYPE[componentType],
      metaTitle: doc.metaTitle || `${p.name} — RigCraft`,
      metaDescription: doc.metaDescription || (p.shortDescription || "").slice(0, 160),
    };
    if (!doc.description) {
      const template = DESC_TEMPLATES[doc.categoryType];
      set.description = template
        ? template.replaceAll("{name}", p.name)
        : `${p.name} — ${p.shortDescription || "Premium PC component from RigCraft."}`;
    }
    const res = await Product.updateOne({ sku: p.sku }, { $set: set });
    if (res.modifiedCount) enrichedProducts++;
  }
  summary.push(["Products enriched", enrichedProducts]);

  // ── 5. Upsert 44 new prebuilt PCs ──
  console.log("  Upserting prebuilt PCs...");
  productMap = new Map((await Product.find({}).lean()).map((p) => [p.sku, p]));
  let prebuiltMap = new Map(
    (await PrebuiltPC.find({}).lean()).map((p) => [p.sku, p])
  );
  let prebuiltsCreated = 0;
  let prebuiltsUpdated = 0;
  const missingSkus = new Set();
  for (let i = 0; i < prebuiltPcsExtra.length; i++) {
    const pc = prebuiltPcsExtra[i];
    const exists = prebuiltMap.has(pc.sku);
    const components = pc.componentSkus
      .map((cs) => {
        const prod = productMap.get(cs.sku);
        if (!prod) {
          missingSkus.add(cs.sku);
          return null;
        }
        return { type: cs.type, product: prod._id, quantity: cs.quantity || 1 };
      })
      .filter(Boolean);
    const payload = {
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
      images: buildProductImages("prebuilt", pc.name, i),
      viewCount: pc.viewCount ?? viewFor(pc.sku),
      soldCount: pc.soldCount ?? soldFor(pc.sku),
      metaTitle: `${pc.name} — RigCraft`,
      metaDescription: (pc.shortDescription || "").slice(0, 160),
      isFeatured: pc.isFeatured ?? false,
      featuredOrder: pc.featuredOrder || 0,
      status: pc.status,
    };
    if (exists) {
      await PrebuiltPC.updateOne({ sku: pc.sku }, { $set: payload });
      prebuiltMap.set(pc.sku, { ...prebuiltMap.get(pc.sku), ...payload });
      prebuiltsUpdated++;
    } else {
      const doc = new PrebuiltPC(payload);
      await doc.save();
      prebuiltMap.set(pc.sku, doc.toObject());
      prebuiltsCreated++;
    }
  }
  if (missingSkus.size > 0) {
    throw new Error(`Prebuilt component SKUs not found: ${[...missingSkus].join(", ")}`);
  }
  summary.push(["Prebuilts created", prebuiltsCreated]);
  summary.push(["Prebuilts updated", prebuiltsUpdated]);

  // ── 6. Enrich the 6 existing prebuilt PCs ──
  console.log("  Enriching existing prebuilt PCs...");
  let enrichedPrebuilts = 0;
  for (let i = 0; i < prebuiltPcsData.length; i++) {
    const pc = prebuiltPcsData[i];
    const doc = prebuiltMap.get(pc.sku);
    if (!doc) continue;
    const set = {
      images: buildProductImages("prebuilt", pc.name, i),
      viewCount: doc.viewCount || viewFor(pc.sku),
      soldCount: doc.soldCount || soldFor(pc.sku),
      metaTitle: doc.metaTitle || `${pc.name} — RigCraft`,
      metaDescription: doc.metaDescription || (pc.shortDescription || "").slice(0, 160),
    };
    if (!doc.description) {
      set.description = `${pc.name} is a factory-assembled, stress-tested system ready to go straight out of the box. ${pc.shortDescription}`;
    }
    const res = await PrebuiltPC.updateOne({ sku: pc.sku }, { $set: set });
    if (res.modifiedCount) enrichedPrebuilts++;
  }
  summary.push(["Prebuilts enriched", enrichedPrebuilts]);

  // ── 7. Upsert 6 new deals ──
  console.log("  Upserting deals...");
  let dealsCreated = 0;
  let dealsUpdated = 0;
  for (const d of dealsExtra) {
    const slug = slugify(d.title, { lower: true, strict: true });
    const exists = await Deal.findOne({ slug }).lean();
    const products = (d.productSkus || []).map((s) => {
      const prod = productMap.get(s);
      if (!prod) throw new Error(`Deal product SKU not found: ${s}`);
      return prod._id;
    });
    const prebuiltPCs = (d.prebuiltSkus || []).map((s) => {
      const pc = prebuiltMap.get(s);
      if (!pc) throw new Error(`Deal prebuilt SKU not found: ${s}`);
      return pc._id;
    });
    const { desktop, mobile } = buildDealBanner(d.displayOrder - 1);
    const payload = {
      title: d.title,
      slug,
      description: d.description,
      desktopBanner: { url: desktop, publicId: null, alt: d.title },
      mobileBanner: { url: mobile, publicId: null, alt: d.title },
      startDate: d.startDate,
      endDate: d.endDate,
      products,
      prebuiltPCs,
      promotion: d.promotion,
      buttonText: d.buttonText,
      buttonLink: d.buttonLink,
      displayOrder: d.displayOrder,
      isActive: d.isActive,
      isFeatured: d.isFeatured ?? false,
    };
    if (exists) {
      await Deal.updateOne({ slug }, { $set: payload });
      dealsUpdated++;
    } else {
      await Deal.create(payload);
      dealsCreated++;
    }
  }
  summary.push(["Deals created", dealsCreated]);
  summary.push(["Deals updated", dealsUpdated]);

  // ── 8. Refresh banners on all deals ──
  console.log("  Refreshing deal banners...");
  let dealBannersUpdated = 0;
  const allDeals = await Deal.find({}).lean();
  for (const d of allDeals) {
    const { desktop, mobile } = buildDealBanner((d.displayOrder || 1) - 1);
    const res = await Deal.updateOne(
      { _id: d._id },
      {
        $set: {
          desktopBanner: { url: desktop, publicId: null, alt: d.title },
          mobileBanner: { url: mobile, publicId: null, alt: d.title },
        },
      }
    );
    if (res.modifiedCount) dealBannersUpdated++;
  }
  summary.push(["Deal banners refreshed", dealBannersUpdated]);

  // ── 9. Upsert 8 new coupons ──
  console.log("  Upserting coupons...");
  let couponsCreated = 0;
  let couponsUpdated = 0;
  for (const c of couponsExtra) {
    const code = c.code.toUpperCase();
    const exists = await Coupon.findOne({ code }).lean();
    const categories = (c.categories || []).map((n) => {
      const id = resolveId(catList, n, "category");
      if (!id) throw new Error(`Coupon category not found: ${n}`);
      return id;
    });
    const payload = {
      name: c.name,
      code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minimumPurchase: c.minimumPurchase,
      maximumDiscount: c.maximumDiscount || undefined,
      applicableTo: c.applicableTo,
      categories,
      usageLimit: c.usageLimit || undefined,
      usageLimitPerUser: c.usageLimitPerUser,
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      isFirstOrderOnly: c.isFirstOrderOnly ?? false,
      isActive: c.isActive ?? true,
    };
    if (exists) {
      await Coupon.updateOne({ code }, { $set: cleanUndefined(payload) });
      couponsUpdated++;
    } else {
      await Coupon.create(payload);
      couponsCreated++;
    }
  }
  summary.push(["Coupons created", couponsCreated]);
  summary.push(["Coupons updated", couponsUpdated]);

  // ── 10. Insert new newsletter subscribers ──
  console.log("  Adding newsletter subscribers...");
  let newslettersCreated = 0;
  for (const n of newslettersExtra) {
    const email = n.email.toLowerCase();
    const exists = await Newsletter.findOne({ email }).lean();
    if (exists) continue;
    await Newsletter.create({ ...n, email });
    newslettersCreated++;
  }
  summary.push(["Newsletter added", newslettersCreated]);

  // ── 11. Real category images ──
  console.log("  Updating category images...");
  let catImagesUpdated = 0;
  for (const c of categoryDocs) {
    const url = buildCategoryImage(c.name);
    const res = await Category.updateOne(
      { _id: c._id },
      { $set: { image: { url, publicId: null, alt: c.name } } }
    );
    if (res.modifiedCount) catImagesUpdated++;
  }
  summary.push(["Category images updated", catImagesUpdated]);

  // ── 12. Final counts ──
  const finalProducts = await Product.countDocuments({});
  const finalPrebuilts = await PrebuiltPC.countDocuments({});
  const finalCoupons = await Coupon.countDocuments({});
  const finalDeals = await Deal.countDocuments({});
  const finalNewsletters = await Newsletter.countDocuments({});

  const nameWidth = Math.max(...summary.map(([n]) => n.length));
  console.log("\n  \u2713 Catalog expansion complete\n");
  console.log("  " + "\u2500".repeat(nameWidth + 14));
  for (const [name, count] of summary) {
    console.log(`   ${name.padEnd(nameWidth)} \u2502 ${String(count).padStart(4)}`);
  }
  console.log("  " + "\u2500".repeat(nameWidth + 14));

  console.log("\n  Final counts:");
  console.log(`    Products    : ${finalProducts}`);
  console.log(`    Prebuilt PCs: ${finalPrebuilts}`);
  console.log(`    Coupons     : ${finalCoupons}`);
  console.log(`    Deals       : ${finalDeals}`);
  console.log(`    Newsletters : ${finalNewsletters}`);

  console.log("\n  Next step: run `npm run seed:reviews` to fill 5-8 reviews + ratings on every item.\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n  Seed failed:", err.message);
  process.exit(1);
});
