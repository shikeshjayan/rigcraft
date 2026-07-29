import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const CATEGORY_NAME_TO_TYPE = {
  "CPU / Processors": "processor",
  "Graphics Cards": "graphics_card",
  "Motherboards": "motherboard",
  "Memory (RAM)": "memory",
  "Storage (SSD / HDD)": "storage",
  "Power Supplies": "power_supply",
  "PC Cases": "case",
  "Cooling": "cooling",
  "Accessories": "accessories",
  "Software & OS": "software",
};

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const categories = await Category.find({});
  const catMap = {};
  for (const cat of categories) {
    const type = CATEGORY_NAME_TO_TYPE[cat.name];
    if (type) catMap[cat._id.toString()] = type;
  }

  const products = await Product.find({
    $or: [
      { categoryType: { $exists: false } },
      { categoryType: "" },
      { categoryType: null },
    ],
    isDeleted: false,
  });

  let updated = 0;
  for (const product of products) {
    const catId = product.category?.toString();
    const type = catId ? catMap[catId] : null;
    if (type) {
      await Product.updateOne({ _id: product._id }, { $set: { categoryType: type } });
      updated++;
    }
  }

  console.log(`Updated ${updated} / ${products.length} products with missing categoryType`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
