import { Router } from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { protect } from "../middlewares/auth.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/image", protect, uploadSingleImage("image"), uploadController.uploadImage);

export default router;
