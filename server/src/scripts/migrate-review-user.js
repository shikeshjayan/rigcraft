import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

dns.setServers(["8.8.8.8"]);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  let customers = await User.find({ role: "customer" }).select("_id firstName lastName");
  const allUsers = await User.find({}).select("_id");
  const existingIds = new Set(allUsers.map((u) => u._id.toString()));

  const reviews = await Review.find({}).select("_id user item");
  const perItem = new Map();
  for (const r of reviews) {
    if (r.item) {
      const key = r.item.toString();
      perItem.set(key, (perItem.get(key) || 0) + 1);
    }
  }
  const maxPerItem = Math.max(0, ...[...perItem.values()]);

  if (customers.length < maxPerItem) {
    const needed = maxPerItem - customers.length;
    console.log(`Creating ${needed} extra customer account(s) to satisfy unique (user, item) index...`);
    const created = [];
    for (let i = 1; i <= needed; i++) {
      const n = customers.length + i;
      created.push(
        await User.create({
          firstName: `Guest${n}`,
          lastName: "Reviewer",
          email: `guestreviewer${n}@rigcraft.com`,
          password: "Customer@123",
          role: "customer",
        })
      );
    }
    customers = [...customers, ...created];
  }
  console.log(`Customer pool size: ${customers.length} (max reviews on one item: ${maxPerItem})`);

  const usedPerItem = new Map();
  const dangling = [];
  let resolved = 0;

  for (const r of reviews) {
    if (r.user && existingIds.has(r.user.toString())) {
      resolved++;
      const itemKey = r.item ? r.item.toString() : "no-item";
      if (!usedPerItem.has(itemKey)) usedPerItem.set(itemKey, new Set());
      usedPerItem.get(itemKey).add(r.user.toString());
    } else {
      dangling.push(r);
    }
  }

  console.log(`Total reviews: ${reviews.length}`);
  console.log(`Already resolved: ${resolved}`);
  console.log(`Dangling refs to re-link: ${dangling.length}`);

  let modified = 0;
  for (const r of dangling) {
    const itemKey = r.item ? r.item.toString() : "no-item";
    if (!usedPerItem.has(itemKey)) usedPerItem.set(itemKey, new Set());
    const used = usedPerItem.get(itemKey);

    const customer = customers.find((c) => !used.has(c._id.toString())) || customers[0];
    if (!customer) throw new Error("No customer available for assignment");

    await Review.updateOne({ _id: r._id }, { $set: { user: customer._id } });
    used.add(customer._id.toString());
    modified++;
  }

  console.log(`Re-linked: ${modified}`);

  const counts = await Review.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "u",
      },
    },
    {
      $group: {
        _id: { $cond: [{ $gt: [{ $size: "$u" }, 0] }, "valid", "dangling"] },
        count: { $sum: 1 },
      },
    },
  ]);
  console.log("Ref status:", counts);

  const dups = await Review.aggregate([
    { $match: { item: { $type: "objectId" } } },
    { $group: { _id: { user: "$user", item: "$item" }, n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
  ]);
  console.log("Duplicate (user, item) pairs:", dups.length);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
