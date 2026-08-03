import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId");

const imageObject = z
  .object({
    url: z.string().min(1),
    publicId: z.string().nullish(),
    alt: z.string().optional(),
  })
  .optional()
  .nullable();

const topBarItem = z.object({
  enabled: z.boolean().optional().default(false),
  text: z.string().max(200).trim().optional().default(""),
});

const homeOfferItem = z.object({
  enabled: z.boolean().optional().default(false),
  title: z.string().max(200).trim().optional().default(""),
  description: z.string().max(500).trim().optional().default(""),
  banner: imageObject,
});

export const createDealSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200).trim(),
    description: z.string().max(1000).trim().optional(),
    desktopBanner: imageObject,
    mobileBanner: imageObject,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    products: z.array(objectId).optional().default([]),
    prebuiltPCs: z.array(objectId).optional().default([]),
    promotion: z
      .object({
        topBar: z.array(topBarItem).optional().default([]),
        homeOffer: z.array(homeOfferItem).optional().default([]),
      })
      .optional()
      .default({}),
    buttonText: z.string().max(100).trim().optional(),
    buttonLink: z.string().max(500).trim().optional(),
    displayOrder: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

export const updateDealSchema = z
  .object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    desktopBanner: imageObject,
    mobileBanner: imageObject,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    products: z.array(objectId).optional(),
    prebuiltPCs: z.array(objectId).optional(),
    promotion: z
      .object({
        topBar: z.array(topBarItem).optional(),
        homeOffer: z.array(homeOfferItem).optional(),
      })
      .optional(),
    buttonText: z.string().max(100).trim().optional(),
    buttonLink: z.string().max(500).trim().optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine((data) => {
    if (data.startDate === undefined || data.endDate === undefined) return true;
    return data.startDate < data.endDate;
  }, {
    message: "Start date must be before end date",
    path: ["endDate"],
  });
