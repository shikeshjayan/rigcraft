import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { USER_ROLES } from '../constants/constants.js';

const avatarSchema = new mongoose.Schema(
  {
    url: { type: String },
    publicId: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    permissions: {
      type: [String],
      default: undefined,
    },
    avatar: avatarSchema,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lockTimestamp: {
      type: Date,
      default: null,
    },
    otpVerifyAttempts: {
      type: Number,
      default: 0,
    },
    otpRequestCount: {
      type: Number,
      default: 0,
    },
    lastOtpRequest: {
      type: Date,
      default: null,
    },
    otpRequestWindowStart: {
      type: Date,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    resetRequestCount: {
      type: Number,
      default: 0,
    },
    lastResetRequest: {
      type: Date,
      default: null,
    },
    resetRequestWindowStart: {
      type: Date,
      default: null,
    },
    refreshToken: { type: String, select: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: { type: String, select: false },
    otpExpire: { type: Date, select: false },
    cart: { type: [mongoose.Schema.Types.Mixed], default: [] },
    wishlist: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

userSchema.pre('validate', function () {
  if (!this.password && !this.googleId) {
    this.invalidate('password', 'Password is required');
  }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // Record the change one second in the past so tokens (which carry a
  // second-granularity `iat`) are never misjudged as pre-change.
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateRefreshToken = function () {
  // Unique `jti` per issuance: guarantees rotation produces a distinct token
  // even within the same second (JWT `iat` is second-granular), so a replayed
  // old token is always detectable.
  return jwt.sign(
    { id: this._id, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

userSchema.methods.generateAccessToken = function (expiresIn) {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '1d',
  });
};

const User = mongoose.model('User', userSchema);
export default User;
