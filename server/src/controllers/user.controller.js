import * as userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const list = asyncHandler(async (req, res) => {
  const result = await userService.list(req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  ApiResponse.ok(user).send(res);
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateById(req.params.id, req.body, req.file);
  ApiResponse.ok(user, "User updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteById(req.params.id);
  ApiResponse.ok(null, "User deleted").send(res);
});

export const block = asyncHandler(async (req, res) => {
  const user = await userService.blockUser(req.params.id);
  const msg = user.isBlocked ? "User blocked" : "User unblocked";
  ApiResponse.ok(user, msg).send(res);
});
