import http from "http";
import connectDB from "./config/db.js";
import addressRoutes from "./routes/address.routes.js";
import authRoutes from "./routes/auth.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import buildRoutes from "./routes/build.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import dealRoutes, { adminDealRoutes } from "./routes/deal.routes.js";
import faqRoutes, { adminFaqRoutes } from "./routes/faq.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import notificationRoutes, { adminNotificationRoutes } from "./routes/notification.routes.js";
import orderRoutes, { adminOrderRoutes } from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import prebuiltPCRoutes from "./routes/prebuiltPC.routes.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes, { adminReviewRoutes } from "./routes/review.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import supportRoutes, { adminSupportRoutes } from "./routes/support.routes.js";
import userRoutes from "./routes/user.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import errorHandler from "./middlewares/error.js";
import dotenv from "dotenv";
import dns from "dns";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initSocket } from "./socket/index.js";

const app = express();

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("Welcome to the RigCraft E-commerce API!");
});

app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/admin/deals", adminDealRoutes);
app.use("/api/v1/admin/faqs", adminFaqRoutes);
app.use("/api/v1/admin/notifications", adminNotificationRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/reviews", adminReviewRoutes);
app.use("/api/v1/admin/support", adminSupportRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/builds", buildRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/prebuilt-pcs", prebuiltPCRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/support", supportRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/wishlists", wishlistRoutes);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
