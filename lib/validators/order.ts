import { z } from "zod";

export const SelectedOptionSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
  priceModifier: z.number(),
});

export const SelectedExtraSchema = z.object({
  extraId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1).max(10),
});

export const CartItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().max(200).optional().default(""),
  selectedOptions: z.array(SelectedOptionSchema).default([]),
  selectedExtras: z.array(SelectedExtraSchema).default([]),
});

export const SubmitOrderSchema = z.object({
  tableSlug: z.string().min(1, "Table identifier is required"),
  customerName: z.string().max(50).optional(),
  items: z.array(CartItemSchema).min(1, "Cart cannot be empty"),
  submissionToken: z.string().min(1, "Submission token required"),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type SubmitOrderInput = z.infer<typeof SubmitOrderSchema>;
export type SelectedOption = z.infer<typeof SelectedOptionSchema>;
export type SelectedExtra = z.infer<typeof SelectedExtraSchema>;
