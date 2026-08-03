import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";
import mongoose from "mongoose";
import Review from "../models/review.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

dns.setServers(["8.8.8.8"]);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const missing = await Review.countDocuments({ reviewType: { $exists: false } });
  const res = await Review.updateMany(
    { reviewType: { $exists: false } },
    { $set: { reviewType: "product" } }
  );

  console.log(`Missing reviewType: ${missing}`);
  console.log(`Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`);

  const counts = await Review.aggregate([
    { $group: { _id: "$reviewType", count: { $sum: 1 } } },
  ]);
  console.log("Distribution:", counts);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
