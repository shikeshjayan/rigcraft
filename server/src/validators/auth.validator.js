import { z } from "zod";

// Reusable regex patterns
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
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
    path: ["email"],
  });

export const sendOtpSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
});

export const loginWithOtpSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
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
