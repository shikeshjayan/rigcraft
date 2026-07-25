import asyncHandler from "../utils/asyncHandler.js";
import * as addressService from "../services/address.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user._id, req.body);
  ApiResponse.created(address, "Address created").send(res);
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user._id);
  ApiResponse.ok(addresses).send(res);
});

export const getAddress = asyncHandler(async (req, res) => {
  const address = await addressService.getAddress(req.params.id, req.user._id);
  ApiResponse.ok(address).send(res);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.params.id, req.user._id, req.body);
  ApiResponse.ok(address, "Address updated").send(res);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.params.id, req.user._id);
  ApiResponse.ok(null, "Address deleted").send(res);
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.params.id, req.user._id);
  ApiResponse.ok(address, "Default address updated").send(res);
});
