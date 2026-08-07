import { Router } from "express";
import * as stockAlertController from "../controllers/stockAlert.controller.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { subscribeSchema } from "../validators/stockAlert.validation.js";

const router = Router();

router.post(
  "/",
  protect,
  validate(subscribeSchema),
  stockAlertController.subscribe
);

router.get("/my", protect, stockAlertController.getMyAlerts);

router.delete("/:id", protect, stockAlertController.cancel);

export default router;
