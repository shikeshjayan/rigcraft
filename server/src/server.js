import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
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
import errorHandler from "./middlewares/error.js";

dotenv.config();

const { configureCloudinary } = await import("./config/cloudinary.js");
configureCloudinary();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the RigCraft E-commerce API!");
});

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

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
