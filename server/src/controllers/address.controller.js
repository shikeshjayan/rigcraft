import Address from '../models/address.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.status(200).json({ success: true, data: addresses });
});

export const addAddress = asyncHandler(async (req, res) => {
  const { isDefault } = req.body;
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: address });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let address = await Address.findOne({ _id: id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');

  if (req.body.isDefault && !address.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  address = await Address.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: address });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');
  res.status(200).json({ success: true, data: {} });
});
