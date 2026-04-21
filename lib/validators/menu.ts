import { z } from "zod";

// ── Table validators ─────────────────────────────────────────────────
export const CreateTableSchema = z.object({
  number: z.string().min(1, "Table number is required").max(20),
  notes: z.string().max(200).optional(),
  isActive: z.boolean().default(true),
});

export const UpdateTableSchema = z.object({
  number: z.string().min(1).max(20).optional(),
  notes: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type UpdateTableInput = z.infer<typeof UpdateTableSchema>;

// ── Category validators ──────────────────────────────────────────────
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  description: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ── Menu item validators ─────────────────────────────────────────────
export const OptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50),
  priceModifier: z.number().min(0).max(1000),
  sortOrder: z.number().int().min(0).default(0),
});

export const OptionGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50),
  required: z.boolean().default(false),
  minSelect: z.number().int().min(0).default(0),
  maxSelect: z.number().int().min(1).default(1),
  sortOrder: z.number().int().min(0).default(0),
  options: z.array(OptionSchema).min(1),
});

export const ExtraSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50),
  price: z.number().min(0).max(1000),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const CreateMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100),
  description: z.string().max(500).optional(),
  basePrice: z.number().min(0, "Price must be positive").max(10000),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  isAvailable: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  prepNote: z.string().max(200).optional(),
  optionGroups: z.array(OptionGroupSchema).default([]),
  extras: z.array(ExtraSchema).default([]),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof UpdateMenuItemSchema>;

// ── Settings validators ──────────────────────────────────────────────
export const UpdateSettingsSchema = z.object({
  restaurantName: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")).optional(),
  currency: z.string().min(1).max(10).optional(),
  currencySymbol: z.string().min(1).max(5).optional(),
  isOpen: z.boolean().optional(),
  closedMessage: z.string().max(300).optional(),
  welcomeMessage: z.string().max(300).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  serviceCharge: z.number().min(0).max(100).optional(),
  wifiSsid: z.string().max(100).optional(),
  wifiPassword: z.string().max(100).optional(),
  showWifi: z.boolean().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
