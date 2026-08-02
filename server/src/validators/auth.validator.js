import { z } from "zod";
import { USER_ROLES } from "../constants/constants.js";

const phoneRegex = /^\+?[\d\s-]{7,15}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

const passwordErrorMessage =
  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50).trim(),
    lastName: z.string().min(1, "Last name is required").max(50).trim(),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Invalid phone number")
      .or(z.literal(""))
      .optional(),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, passwordErrorMessage),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  email: z
    .string()
    .email("Invalid email address")
    .trim()
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid phone number")
    .or(z.literal(""))
    .optional(),
});

export const loginSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .trim()
      .toLowerCase()
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Invalid phone number")
      .optional(),
    password: z.string().optional(),
    otp: z.string().length(6, "OTP must be 6 digits").optional(),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
    path: ["email"],
  })
  .refine((data) => !(data.email && data.phone), {
    message: "Provide either email or phone, not both",
    path: ["email"],
  })
  .refine((data) => {
    if (data.email) return !!data.password;
    return true;
  }, {
    message: "Password is required with email",
    path: ["password"],
  })
  .refine((data) => {
    if (data.phone) return !(data.password && data.otp);
    return true;
  }, {
    message: "Use password or OTP, not both",
    path: ["otp"],
  });

export const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, passwordErrorMessage),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateRoleSchema = z.object({
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MANAGER], {
    errorMap: () => ({ message: 'Role must be admin or manager' }),
  }),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, passwordErrorMessage),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
