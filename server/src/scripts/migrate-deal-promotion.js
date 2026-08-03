import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";
import mongoose from "mongoose";
import Deal from "../models/deal.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

dns.setServers(["8.8.8.8"]);

const toArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const deals = await Deal.find({}).lean();
  let topBarConverted = 0;
  let homeOfferConverted = 0;

  for (const deal of deals) {
    const updates = {};
    const promotion = deal.promotion || {};

    if (promotion.topBar && !Array.isArray(promotion.topBar)) {
      updates["promotion.topBar"] = toArray(promotion.topBar);
      topBarConverted += 1;
    }

    if (promotion.homeOffer && !Array.isArray(promotion.homeOffer)) {
      updates["promotion.homeOffer"] = toArray(promotion.homeOffer);
      homeOfferConverted += 1;
    }

    if (Object.keys(updates).length > 0) {
      await Deal.updateOne({ _id: deal._id }, { $set: updates });
    }
  }

  const now = new Date();
  const featured = await Deal.findOne({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ displayOrder: 1, createdAt: -1 });

  if (featured) {
    await Deal.updateMany(
      { _id: { $ne: featured._id } },
      { $set: { isFeatured: false } }
    );
    await Deal.updateOne({ _id: featured._id }, { $set: { isFeatured: true } });
    console.log(`Featured deal set: ${featured.title} (${featured._id})`);
  } else {
    console.log("No active deal found — isFeatured left as-is");
  }

  console.log(`topBar converted: ${topBarConverted}`);
  console.log(`homeOffer converted: ${homeOfferConverted}`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
