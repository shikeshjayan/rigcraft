import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) throw ApiError.unauthorized('Not authorized, no token');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  if (!req.user) throw ApiError.unauthorized('User no longer exists');
  if (req.user.isBlocked) throw ApiError.forbidden('Account is blocked');
  next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (error) {
    // If token is invalid, just proceed as guest
  }
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    throw ApiError.forbidden('Insufficient permissions');
  next();
};
