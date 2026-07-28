import { Router } from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
} from "../validators/payment.validation.js";

const router = Router();

router.post(
  "/create-razorpay-order",
  protect,
  validate(createRazorpayOrderSchema),
  paymentController.createRazorpayOrder
);

router.post(
  "/verify",
  protect,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.post("/webhook", paymentController.webhook);

export default router;
