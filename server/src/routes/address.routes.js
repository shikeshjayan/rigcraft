import express from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/address.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
