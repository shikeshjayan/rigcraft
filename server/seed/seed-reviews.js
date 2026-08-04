import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import User from "../src/models/user.model.js";
import Product from "../src/models/product.model.js";
import PrebuiltPC from "../src/models/prebuiltPC.model.js";
import Review from "../src/models/review.model.js";
import Order from "../src/models/order.model.js";
import { moderateReview } from "../src/services/moderation.service.js";

const TARGET_MIN = 5;
const TARGET_MAX = 8;
const NEW_CUSTOMER_TARGET = 150;
const TESTIMONIAL_COUNT = 10;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr, count = 1) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generatePastDate = (maxDaysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(1, maxDaysAgo));
  return d;
};

const pickRating = () => {
  const r = Math.random();
  if (r < 0.55) return 5;
  if (r < 0.8) return 4;
  if (r < 0.92) return 3;
  if (r < 0.97) return 2;
  return 1;
};

const REVIEW_POOLS = {
  cpu: {
    titles: [
      "Lightning fast for gaming",
      "Great upgrade from my old CPU",
      "Runs cool with a decent cooler",
      "Multi-core monster",
      "Best value processor",
      "Perfect for my new build",
    ],
    comments: [
      "Upgraded from my 5-year-old build and the difference is night and day. Frames are way higher and the CPU stays cool with my air cooler.",
      "Boost clocks are excellent and it handles both gaming and streaming without breaking a sweat. Genuinely impressed.",
      "Installed without any trouble on my AM5 board. Runs a little warm under full load but that is expected for this class.",
      "Snappy in everyday tasks and a joy for productivity workloads. Well worth the money for what you get.",
      "Pair it with fast DDR5 and you are set. No issues with stability so far, even under sustained load.",
      "Great single-core performance for gaming. Could not be happier with the purchase.",
    ],
  },
  gpu: {
    titles: [
      "Silky smooth at high settings",
      "Handles everything I throw at it",
      "Temps stay low",
      "Ray tracing looks stunning",
      "Great 1440p performance",
      "Massive upgrade",
    ],
    comments: [
      "Runs my favourite titles at max settings without any stutter. The cooler is quiet and temps stay well within range.",
      "Ray tracing and DLSS make a huge difference. Was skeptical about the price but the performance justifies it.",
      "Crushes 1440p and even handles 4K on older titles. Idle fan stop is a nice touch for a silent build.",
      "Frame rates jumped massively compared to my old card. Very happy with this upgrade.",
      "Card is well built and feels premium. No coil whine or artefacts during my first month of heavy use.",
      "Excellent value at this price point. Overclocks nicely and stays stable under stress tests.",
    ],
  },
  motherboard: {
    titles: [
      "Solid board, clean look",
      "Great VRM cooling",
      "BIOS is easy to navigate",
      "Loaded with features",
      "WiFi works flawlessly",
      "No issues so far",
    ],
    comments: [
      "Setup was straightforward and the BIOS is intuitive. XMP profiles enabled with a single click.",
      "VRMs stay cool even with a power-hungry CPU. The M.2 slots make storage installation effortless.",
      "Plenty of USB ports and headers. Everything connected without a hitch.",
      "Built quality feels premium and the onboard WiFi is a welcome convenience.",
      "RGB lighting looks great in my case and the software is easy to use.",
      "Solid, stable board with all the connectivity I needed. No complaints after a month of daily use.",
    ],
  },
  ram: {
    titles: [
      "Fast and stable",
      "Looks amazing with RGB",
      "XMP worked first try",
      "Plenty of headroom",
      "Great for multitasking",
      "No compatibility issues",
    ],
    comments: [
      "Hit the advertised speeds with XMP enabled on the first boot. Games and editing software run smoothly.",
      "RGB looks fantastic and the build quality is solid. Ran memtest with zero errors.",
      "Plenty fast for daily use and gaming. Multitasking with many tabs feels effortless now.",
      "Great deal for the capacity. Timings are tight and the modules run cool.",
      "Installed in seconds and was detected immediately. No stability issues over weeks of use.",
      "Perfect match for my motherboard's QVL. Would recommend to anyone building DDR5.",
    ],
  },
  storage: {
    titles: [
      "Blazing fast reads",
      "Boots in seconds",
      "Large and reliable",
      "Great for games",
      "Easy cloning from old drive",
      "No overheating issues",
    ],
    comments: [
      "Sequential reads are as advertised. Windows boots almost instantly and games load in a blink.",
      "Copied my old OS over without a problem and the drive has been rock solid since.",
      "Huge capacity and very fast. My game library finally fits on a single drive.",
      "Runs cool thanks to the heatsink. Performance stays consistent under heavy writes.",
      "Best SSD upgrade I have made. The difference versus my old drive is incredible.",
      "Reliable and quick. Great pick for a modern build.",
    ],
  },
  psu: {
    titles: [
      "Clean modular cabling",
      "Quiet under load",
      "Stable power delivery",
      "Plenty of headroom",
      "Premium build quality",
      "Fully modular is worth it",
    ],
    comments: [
      "Fully modular cables made cable management a breeze. No coil whine even under gaming load.",
      "Delivers stable power to my high-end build. The fan is silent at idle and quiet under stress.",
      "Loads of headroom for future upgrades. 80+ Gold efficiency keeps the bills in check.",
      "Feels premium with a nice braided finish on the cables. 10 year warranty gives peace of mind.",
      "Everything I needed was in the box. A quality unit that has been flawless so far.",
      "Solid PSU with clean aesthetics. Would buy again without hesitation.",
    ],
  },
  cabinet: {
    titles: [
      "Great airflow",
      "Easy to build in",
      "Stunning looks",
      "Excellent cable management",
      "Quiet with included fans",
      "Spacious interior",
    ],
    comments: [
      "Airflow is excellent and my temps dropped compared to my old case. Build process was enjoyable.",
      "Plenty of room for a large GPU and radiator. Cable management holes are well placed.",
      "The glass side panel really shows off the build. Looks premium on my desk.",
      "Included fans are quiet and move a lot of air. Very happy with the purchase.",
      "Tool-free panels and thoughtful layout made assembly quick and clean.",
      "Spacious and well ventilated. Great value for the quality.",
    ],
  },
  cooler: {
    titles: [
      "Ice cold under load",
      "Whisper quiet",
      "Easy mounting system",
      "Keeps my CPU cool",
      "Great for overclocking",
      "Premium quality",
    ],
    comments: [
      "Temps dropped dramatically compared to the stock cooler. Even under stress it stays cool and quiet.",
      "Mounting was the easiest I have tried. The pump is silent and the fans are unobtrusive.",
      "My CPU never throttles even in long sessions. Worth every rupee for a high-end build.",
      "RGB fans look great and cooling performance is excellent.",
      "Runs quiet at idle and keeps temps in check under load. Very impressed.",
      "Excellent cooling performance and premium feel. Highly recommended.",
    ],
  },
  accessory: {
    titles: [
      "Feels premium",
      "Perfect for daily use",
      "Great value",
      "Responsive and accurate",
      "Comfortable to use",
      "Quality build",
    ],
    comments: [
      "Build quality feels premium and it performs exactly as expected. Great addition to my setup.",
      "Used it daily for a month now and it has been flawless. Definitely good value.",
      "Very responsive and comfortable even during long sessions.",
      "Looks great on the desk and does the job perfectly. Happy with the purchase.",
      "Solid quality that punches above its price. Would recommend to anyone.",
      "No issues at all. Exactly what I needed for my setup.",
    ],
  },
  prebuilt: {
    titles: [
      "Arrived perfect and ready",
      "Excellent build quality",
      "Smooth and quiet",
      "No bloatware at all",
      "Great cable management",
      "Support was fantastic",
    ],
    comments: [
      "Arrived well packaged and booted first try. Cable management inside is surprisingly clean for a prebuilt.",
      "Performance is excellent and everything is configured out of the box. No bloatware, just a clean system.",
      "Runs quiet even under load and the temps are great. Exactly the PC I wanted without the assembly hassle.",
      "Support team helped me through setup questions within minutes. A truly hassle-free experience.",
      "Frames are fantastic in the games I play. The build quality and attention to detail really show.",
      "Stress tested out of the box and runs cool and stable. Worth every rupee.",
    ],
  },
  generic: {
    titles: [
      "Exactly as described",
      "Great purchase",
      "Happy with the quality",
      "Solid performance",
      "Good value for money",
      "Would buy again",
    ],
    comments: [
      "Exactly as described and works perfectly. Delivery was quick and packaging was secure.",
      "Quality is great for the price. No issues at all after a few weeks of use.",
      "Does exactly what it should and has been reliable. Very satisfied.",
      "Solid performance and good value. Would recommend to friends.",
      "Happy with this purchase. Arrived on time and works as expected.",
      "Met all my expectations. A dependable product that gets the job done.",
    ],
  },
};

const BAD_REVIEWS = [
  {
    title: "AMAZING OFFER!!!",
    comment:
      "Buy now!!! Limited time offer, click here for a free gift, win a cash prize lottery. Sign up today and make money fast with this incredible deal!!",
    expected: "rejected",
  },
  {
    title: "Absolute garbage",
    comment:
      "This product is complete crap. What a f*cking waste of money. The build quality is utter sh*t and I am never buying from this store again.",
    expected: "rejected",
  },
  {
    title: "asd",
    comment:
      "asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf",
    expected: "rejected",
  },
  {
    title: "BEST CASINO DEAL",
    comment:
      "Join our casino and gamble today. Win prizes, bet on games and get cash rewards. Lottery jackpot gambling offer for everyone.",
    expected: "rejected",
  },
  {
    title: "Check this deal first",
    comment:
      "I found a much better price on www.fakepricedrops.in, make sure you compare before buying from this store.",
    expected: "pending",
  },
  {
    title: "WORST PRODUCT EVER",
    comment:
      "THE PRODUCT STOPPED WORKING IN TWO DAYS AND THE SUPPORT TEAM NEVER RESPONDED TO MY EMAILS. I TRIED CALLING THEM FIFTEEN TIMES AND NOBODY PICKED UP. ABSOLUTELY TERRIBLE EXPERIENCE AND A COMPLETE WASTE OF MY MONEY.",
    expected: "pending",
  },
  {
    title: "Casino offer, click here",
    comment:
      "Click here to claim your casino bonus and start gambling now. Limited offer, win prizes, sign up for free gift and cash rewards.",
    expected: "rejected",
  },
];

const LOW_STAR_REVIEWS = [
  {
    rating: 1,
    title: "Dead on arrival",
    comment:
      "Arrived dead. Installed it and the system did not post at all. Support was slow to respond and took a week to process the return. Disappointed with the whole experience.",
  },
  {
    rating: 2,
    title: "Terrible coil whine",
    comment:
      "Performance is fine but the coil whine under load is extremely annoying, especially at night. If you are sensitive to noise, this is a dealbreaker.",
  },
  {
    rating: 2,
    title: "Runs hotter than expected",
    comment:
      "Temps hit 95C under load even with stock settings. I ended up needing a better cooler than I budgeted for at this price.",
  },
  {
    rating: 1,
    title: "Not as advertised",
    comment:
      "Benchmark scores are far lower than the marketing promises. It feels like I received an older revision of the product.",
  },
  {
    rating: 2,
    title: "Fans are too loud",
    comment:
      "The included fans are surprisingly loud even at idle. I had to replace them within the first week.",
  },
];

const TESTIMONIALS = [
  {
    title: "Built my first PC in 30 minutes",
    comment:
      "The compatibility engine saved me so much time. I picked parts, confirmed everything was compatible, and built my first PC in under 30 minutes. It worked perfectly out of the box.",
    rating: 5,
  },
  {
    title: "Best prebuilt experience",
    comment:
      "My rig arrived in 4 days, perfectly packaged with immaculate cable management. RGB looks stunning and the performance is incredible.",
    rating: 5,
  },
  {
    title: "Support is phenomenal",
    comment:
      "Customer support resolved my compatibility question within minutes. The team genuinely knows their stuff. 10/10 experience.",
    rating: 5,
  },
  {
    title: "Exceeded all expectations",
    comment:
      "I was hesitant to buy a PC online, but RigCraft exceeded every expectation. No bloatware, instant boot, premium build quality.",
    rating: 5,
  },
  {
    title: "Zero hassle",
    comment:
      "Ordered, paid, received. Everything was smooth and the system was stress tested before shipping. Highly recommend.",
    rating: 5,
  },
  {
    title: "Great value builds",
    comment:
      "The pricing is transparent and the build recommendations actually make sense for my budget. Very happy customer.",
    rating: 5,
  },
  {
    title: "Smooth upgrade advice",
    comment:
      "Their expert team helped me pick the right GPU for my existing rig without overspending. Superb service.",
    rating: 5,
  },
  {
    title: "Solid warranty process",
    comment:
      "Had a minor GPU issue and the replacement was processed quickly and painlessly. This is how after-sales should work.",
    rating: 4,
  },
  {
    title: "Quiet and powerful",
    comment:
      "My build is completely silent even under heavy gaming load. Quality components throughout. Very pleased.",
    rating: 5,
  },
  {
    title: "AVOID THIS WEBSITE AT ALL COSTS!!",
    comment:
      "TERRIBLE EXPERIENCE AND THE WORST CUSTOMER SERVICE I HAVE EVER SEEN IN MY LIFE. MY ORDER WAS DELAYED FOR WEEKS AND NOBODY RESPONDED. DO NOT WASTE YOUR MONEY HERE.",
    rating: 1,
    bad: true,
  },
];

async function seed() {
  console.log("\n  Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`  Connected: ${mongoose.connection.host}\n`);

  const existingProducts = await Product.find({ status: "active" }).lean();
  const existingPrebuilts = await PrebuiltPC.find({ status: "active" }).lean();
  const existingCustomers = await User.find({ role: "customer" }).lean();
  const existingReviews = await Review.find({}).lean();
  const orders = await Order.find({
    paymentStatus: "paid",
    orderStatus: { $ne: "cancelled" },
  }).lean();

  const verifiedPairs = new Set();
  for (const o of orders) {
    for (const item of o.items || []) {
      verifiedPairs.add(`${o.user.toString()}|${item.itemType}|${item.item.toString()}`);
    }
  }

  const existingPairs = new Set(
    existingReviews.map(
      (r) => `${r.user.toString()}|${r.itemType || ""}|${(r.item || "").toString()}`
    )
  );

  const existingEmails = new Set(existingCustomers.map((u) => u.email));
  const existingPhones = new Set(existingCustomers.map((u) => u.phone).filter(Boolean));

  let customers = [...existingCustomers];
  const createdCustomers = [];
  const customerTarget = Math.max(NEW_CUSTOMER_TARGET, existingCustomers.length);
  let attempts = 0;
  while (customers.length < customerTarget && attempts < 500) {
    attempts++;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phone = `+91-${String(9000000000 + randomInt(0, 99999999))}`;
    if (existingEmails.has(email) || existingPhones.has(phone)) continue;
    existingEmails.add(email);
    existingPhones.add(phone);
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: "Customer@123",
      role: "customer",
      isEmailVerified: true,
    });
    customers.push(user.toObject());
    createdCustomers.push(user);
  }

  const COMPONENT_POOL_MAP = {
    processor: "cpu",
    graphics_card: "gpu",
    motherboard: "motherboard",
    memory: "ram",
    storage: "storage",
    power_supply: "psu",
    case: "cabinet",
    cooling: "cooler",
    accessories: "accessory",
  };

  const allItems = [
    ...existingProducts.map((p) => ({
      _id: p._id,
      name: p.name,
      itemType: "product",
      itemModel: "Product",
      pool: COMPONENT_POOL_MAP[p.categoryType] || "generic",
    })),
    ...existingPrebuilts.map((p) => ({
      _id: p._id,
      name: p.name,
      itemType: "prebuilt",
      itemModel: "PrebuiltPC",
      pool: "prebuilt",
    })),
  ];

  const sortedProducts = [...existingProducts].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedPrebuilts = [...existingPrebuilts].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const badItems = sortedProducts.slice(0, BAD_REVIEWS.length);
  const badSlots = [
    ...badItems.map((p) => ({
      item: p,
      itemType: "product",
      itemModel: "Product",
    })),
    ...sortedPrebuilts.slice(0, 1).map((p) => ({
      item: p,
      itemType: "prebuilt",
      itemModel: "PrebuiltPC",
    })),
  ];

  const lowStarItems = sortedProducts.slice(
    badItems.length,
    badItems.length + LOW_STAR_REVIEWS.length
  );
  const lowStarSlots = (
    lowStarItems.length > 0 ? lowStarItems : sortedProducts.slice(-LOW_STAR_REVIEWS.length)
  ).map((p) => ({
    item: p,
    itemType: "product",
    itemModel: "Product",
  }));

  const existingFlaggedByItem = new Set(
    existingReviews
      .filter((r) => r.item && (r.status === "rejected" || r.status === "pending"))
      .map((r) => `${r.itemType}|${r.item.toString()}`)
  );
  const titlesByItem = new Map();
  for (const r of existingReviews) {
    if (!r.item || !r.title) continue;
    const key = `${r.itemType}|${r.item.toString()}`;
    if (!titlesByItem.has(key)) titlesByItem.set(key, new Set());
    titlesByItem.get(key).add(r.title);
  }
  const hasExistingFlaggedTestimonial = existingReviews.some(
    (r) => r.reviewType === "website" && r.status !== "approved"
  );

  const reviewsToInsert = [];
  const moderationLog = [];

  const assignUser = (item, itemType) => {
    const shuffled = [...customers].sort(() => Math.random() - 0.5);
    for (const u of shuffled) {
      const key = `${u._id.toString()}|${itemType}|${item._id.toString()}`;
      if (!existingPairs.has(key)) {
        existingPairs.add(key);
        return u;
      }
    }
    return null;
  };

  for (let i = 0; i < badSlots.length; i++) {
    const slot = badSlots[i];
    if (existingFlaggedByItem.has(`${slot.itemType}|${slot.item._id}`)) continue;
    const user = assignUser(slot.item, slot.itemType);
    if (!user) continue;
    const content = BAD_REVIEWS[i % BAD_REVIEWS.length];
    const verdict = await moderateReview(content);
    moderationLog.push({
      item: slot.item.name,
      title: content.title,
      score: verdict.spamScore,
      status: verdict.status || "pending",
      method: verdict.method,
      reason: verdict.spamReason,
    });
    reviewsToInsert.push({
      reviewType: "product",
      user: user._id,
      itemType: slot.itemType,
      item: slot.item._id,
      itemModel: slot.itemModel,
      rating: 1,
      title: content.title.slice(0, 100),
      comment: content.comment.slice(0, 1000),
      isVerifiedPurchase: false,
      spamFlagged: verdict.spamFlagged,
      spamScore: verdict.spamScore,
      spamReason: verdict.spamReason,
      status: verdict.status === "rejected" ? "rejected" : "pending",
      createdAt: generatePastDate(60),
      updatedAt: new Date(),
    });
    existingFlaggedByItem.add(`${slot.itemType}|${slot.item._id}`);
  }

  for (let i = 0; i < lowStarSlots.length; i++) {
    const slot = lowStarSlots[i];
    const content = LOW_STAR_REVIEWS[i % LOW_STAR_REVIEWS.length];
    const key = `${slot.itemType}|${slot.item._id}`;
    if (titlesByItem.get(key)?.has(content.title)) continue;
    const user = assignUser(slot.item, slot.itemType);
    if (!user) continue;
    reviewsToInsert.push({
      reviewType: "product",
      user: user._id,
      itemType: slot.itemType,
      item: slot.item._id,
      itemModel: slot.itemModel,
      rating: content.rating,
      title: content.title,
      comment: content.comment,
      isVerifiedPurchase: verifiedPairs.has(
        `${user._id.toString()}|${slot.itemType}|${slot.item._id.toString()}`
      ),
      status: "approved",
      createdAt: generatePastDate(90),
      updatedAt: new Date(),
    });
  }

  for (const item of allItems) {
    const isSameItem = (r) =>
      r.item && r.item.toString() === item._id.toString() && r.itemType === item.itemType;
    const existingApproved = existingReviews.filter((r) => isSameItem(r) && r.status === "approved").length;
    const pendingApproved = reviewsToInsert.filter((r) => isSameItem(r) && r.status === "approved").length;
    const target =
      TARGET_MIN + (allItems.indexOf(item) % (TARGET_MAX - TARGET_MIN + 1));
    let need = target - existingApproved - pendingApproved;
    let guard = 0;
    while (need > 0 && guard < 50) {
      guard++;
      const user = assignUser(item, item.itemType);
      if (!user) break;
      const pool = REVIEW_POOLS[item.pool] || REVIEW_POOLS.generic;
      const title = pool.titles[randomInt(0, pool.titles.length - 1)];
      const comment = pool.comments[randomInt(0, pool.comments.length - 1)];
      const rating = pickRating();
      const helpful = Math.random() > 0.6 ? randomInt(0, 8) : 0;
      const votes = helpful > 0 ? pickRandom(customers, randomInt(1, Math.min(helpful, 5))).map((u) => u._id) : [];
      reviewsToInsert.push({
        reviewType: "product",
        user: user._id,
        itemType: item.itemType,
        item: item._id,
        itemModel: item.itemModel,
        rating,
        title,
        comment,
        isVerifiedPurchase: verifiedPairs.has(
          `${user._id.toString()}|${item.itemType}|${item._id.toString()}`
        ),
        helpfulCount: helpful,
        helpfulVotes: votes,
        status: "approved",
        createdAt: generatePastDate(180),
        updatedAt: new Date(),
      });
      need--;
    }
  }

  const existingTestimonials = existingReviews.filter((r) => r.reviewType === "website");
  const testimonialNeed = Math.max(0, TESTIMONIAL_COUNT - existingTestimonials.length);
  const toSeedTestimonials = TESTIMONIALS.slice(0, testimonialNeed);
  const featuredCount = existingTestimonials.filter((r) => r.featured).length;
  for (let i = 0; i < toSeedTestimonials.length; i++) {
    const user = customers[randomInt(0, customers.length - 1)];
    const t = toSeedTestimonials[i];
    const base = {
      reviewType: "website",
      user: user._id,
      rating: t.rating,
      title: t.title.slice(0, 100),
      comment: t.comment.slice(0, 1000),
      status: "approved",
      createdAt: generatePastDate(150),
      updatedAt: new Date(),
    };
    if (t.bad && hasExistingFlaggedTestimonial) {
      base.featured = featuredCount + i < 8;
      base.displayOrder = i + 1;
    } else if (t.bad) {
      const verdict = await moderateReview({ title: t.title, comment: t.comment });
      moderationLog.push({
        item: "website testimonial",
        title: t.title,
        score: verdict.spamScore,
        status: verdict.status || "pending",
        method: verdict.method,
        reason: verdict.spamReason,
      });
      base.spamFlagged = verdict.spamFlagged;
      base.spamScore = verdict.spamScore;
      base.spamReason = verdict.spamReason;
      base.status = verdict.status === "rejected" ? "rejected" : "pending";
    } else if (featuredCount + i < 8) {
      base.featured = true;
      base.displayOrder = i + 1;
    }
    reviewsToInsert.push(base);
  }

  let inserted = 0;
  if (reviewsToInsert.length > 0) {
    const batches = [];
    for (let i = 0; i < reviewsToInsert.length; i += 500) {
      batches.push(reviewsToInsert.slice(i, i + 500));
    }
    for (const batch of batches) {
      try {
        const docs = await Review.insertMany(batch, { ordered: false });
        inserted += docs.length;
      } catch (err) {
        if (err.writeErrors && err.writeErrors.length) {
          const ok = batch.length - err.writeErrors.length;
          inserted += ok > 0 ? ok : 0;
        } else {
          throw err;
        }
      }
    }
  }

  let productRecalc = 0;
  let prebuiltRecalc = 0;
  const allItemDocs = [...existingProducts, ...existingPrebuilts];
  for (const item of allItemDocs) {
    const isPrebuilt = item.componentType === undefined && item.sku && item.sku.startsWith("PBR");
    const itemType = isPrebuilt ? "prebuilt" : "product";
    const model = isPrebuilt ? PrebuiltPC : Product;
    const stats = await Review.aggregate([
      { $match: { item: item._id, itemType, status: "approved" } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    const average = stats.length ? Math.round(stats[0].average * 10) / 10 : 0;
    const count = stats.length ? stats[0].count : 0;
    await model.updateOne({ _id: item._id }, { rating: { average, count } });
    if (isPrebuilt) prebuiltRecalc++;
    else productRecalc++;
  }

  const finalProducts = await Product.find({ status: "active" }).lean();
  const finalPrebuilts = await PrebuiltPC.find({ status: "active" }).lean();
  const finalReviews = await Review.find({}).lean();
  const approved = finalReviews.filter((r) => r.status === "approved");

  const coverage = [];
  let uncovered = 0;
  const withZeroRating = [];
  for (const item of [...finalProducts, ...finalPrebuilts]) {
    const isPrebuilt = item.sku && item.sku.startsWith("PBR");
    const itemType = isPrebuilt ? "prebuilt" : "product";
    const itemReviews = approved.filter(
      (r) => r.item && r.item.toString() === item._id.toString() && r.itemType === itemType
    );
    coverage.push({ name: item.name, count: itemReviews.length });
    if (itemReviews.length === 0) uncovered++;
    if (!item.rating || item.rating.count === 0) withZeroRating.push(item.name);
  }

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of approved) dist[r.rating]++;

  const nameWidth = Math.max(...coverage.map((c) => c.name.length), 8);
  console.log("\n  \u2713 Supplement seeding complete\n");
  console.log("  " + "\u2500".repeat(nameWidth + 12));
  for (const c of coverage) {
    console.log(`   ${c.name.padEnd(nameWidth)} \u2502 ${String(c.count).padStart(4)}`);
  }
  console.log("  " + "\u2500".repeat(nameWidth + 12));

  console.log("\n  Moderation results (bad reviews):");
  if (moderationLog.length === 0) {
    console.log("    (none)");
  }
  for (const m of moderationLog) {
    console.log(
      `    [${String(m.status).padEnd(8)}] score=${String(m.score).padEnd(4)} method=${m.method.padEnd(8)} ${m.title.slice(0, 40)}`
    );
  }
  const geminiCount = moderationLog.filter((m) => m.method === "gemini").length;
  console.log(
    `\n    Gemini calls: ${geminiCount}/${moderationLog.length}` +
      (geminiCount === 0
        ? " (heuristic fallback used - GEMINI_API_KEY missing in server/.env or Gemini calls failed; check warnings above)"
        : "")
  );

  console.log("\n  Summary:");
  console.log(`    Synthetic customers created : ${createdCustomers.length}`);
  console.log(`    Reviews inserted            : ${inserted}`);
  console.log(`    Rating recalculated         : ${productRecalc} products, ${prebuiltRecalc} prebuilts`);
  console.log(`    Products with 0 reviews     : ${uncovered}`);
  console.log(`    Products with rating 0      : ${withZeroRating.length}`);
  console.log(`    Star distribution (approved): 1*=${dist[1]} 2*=${dist[2]} 3*=${dist[3]} 4*=${dist[4]} 5*=${dist[5]}`);

  if (withZeroRating.length > 0) {
    console.log("\n  WARNING - items still show 0 rating:");
    for (const name of withZeroRating) console.log(`    - ${name}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n  Seed failed:", err.message);
  process.exit(1);
});
