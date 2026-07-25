import { Router } from "express";
import * as addressController from "../controllers/address.controller.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validation.js";

const router = Router();

router.post("/", protect, validate(createAddressSchema), addressController.createAddress);
router.get("/", protect, addressController.getAddresses);
router.get("/:id", protect, addressController.getAddress);
router.put("/:id", protect, validate(updateAddressSchema), addressController.updateAddress);
router.delete("/:id", protect, addressController.deleteAddress);
router.patch("/:id/default", protect, addressController.setDefaultAddress);

export default router;
