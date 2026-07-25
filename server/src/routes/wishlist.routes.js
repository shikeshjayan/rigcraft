import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { addItemSchema } from "../validators/wishlist.validation.js";

const router = Router();

router.get("/", protect, wishlistController.getWishlist);

router.post("/", protect, validate(addItemSchema), wishlistController.addToWishlist);

router.delete("/:itemId", protect, wishlistController.removeFromWishlist);

router.post("/:itemId/move-to-cart", protect, wishlistController.moveToCart);

router.delete("/", protect, wishlistController.clearWishlist);

export default router;
