import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir =
  process.env.VERCEL_ENV === "production"
    ? path.resolve("/tmp", "uploads")
    : path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Built frontend (single-origin). The Render build copies client/dist here,
// or override with CLIENT_DIST_DIR. Skipped when absent (e.g. local dev).
const clientDistDir = process.env.CLIENT_DIST_DIR || path.resolve(__dirname, "../public");
const hasClientBuild = fs.existsSync(clientDistDir);
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import productRoutes from "./routes/product.routes.js";
import prebuiltPCRoutes from "./routes/prebuiltPC.routes.js";
import buildRoutes from "./routes/build.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes, { adminOrderRoutes } from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes, { adminReviewRoutes } from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import dealRoutes, { adminDealRoutes } from "./routes/deal.routes.js";
import supportRoutes, { adminSupportRoutes } from "./routes/support.routes.js";
import faqRoutes, { adminFaqRoutes } from "./routes/faq.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import notificationRoutes, { adminNotificationRoutes } from "./routes/notification.routes.js";
import searchRoutes, { adminSearchRoutes } from "./routes/search.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import errorHandler from "./middlewares/error.js";
import maintenanceMode from "./middlewares/maintenanceMode.js";

const { configureCloudinary } = await import("./config/cloudinary.js");
configureCloudinary();

const app = express();

app.use(helmet());
const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173'];

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(morgan("dev"));
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

app.use(maintenanceMode);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/prebuilt-pcs", prebuiltPCRoutes);
app.use("/api/v1/builds", buildRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/addresses", addressRoutes);

app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin/reviews", adminReviewRoutes);

app.use("/api/v1/wishlist", wishlistRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/settings", settingsRoutes);

app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/admin/deals", adminDealRoutes);

app.use("/api/v1/newsletter", newsletterRoutes);

app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin/notifications", adminNotificationRoutes);

app.use("/api/v1/support", supportRoutes);
app.use("/api/v1/admin/support", adminSupportRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/admin/faqs", adminFaqRoutes);

app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/admin/search", adminSearchRoutes);
app.use("/api/v1/uploads", uploadRoutes);

// Serve the built SPA from the same origin (single-origin deployment).
if (hasClientBuild) {
  app.use(express.static(clientDistDir));

  const spaIndex = path.join(clientDistDir, "index.html");
  // Fallback for client-side routes, excluding API/uploads/socket.io.
  app.get(/^(?!\/(api|uploads|socket\.io)(\/|$)).*/, (req, res) => {
    res.sendFile(spaIndex);
  });
}

app.use(errorHandler);

export default app;