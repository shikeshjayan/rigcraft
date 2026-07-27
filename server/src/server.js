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
import addressRoutes from "./routes/address.routes.js";
import errorHandler from "./middlewares/error.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
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
app.use("/api/v1/addresses", addressRoutes);

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
