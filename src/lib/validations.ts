// lib/validations.ts

import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  buyPrice: z.coerce.number().min(0, "Harga beli tidak boleh negatif"),
  sellPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif").default(0),
  minStock: z.coerce.number().min(0, "Min stok tidak boleh negatif").default(5),
  imageUrl: z.string().optional().nullable(),
});

export const stockSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().min(0.01, "Jumlah harus lebih dari 0"),
  note: z.string().optional(),
});

export const transactionItemSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  quantity: z.coerce.number().min(0.01, "Jumlah harus lebih dari 0"),
  discount: z.coerce.number().min(0, "Diskon tidak boleh negatif").default(0),
});

export const transactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, "Minimal 1 item"),
  discount: z.coerce.number().min(0, "Diskon tidak boleh negatif").default(0),
  paidAmount: z.coerce.number().min(0, "Uang diterima tidak boleh negatif"),
  customerName: z.string().optional(),
  createDebt: z.boolean().default(false),
});

export const debtSchema = z.object({
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  customerPhone: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Jumlah utang harus lebih dari 0"),
  note: z.string().optional(),
});

export const debtPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Jumlah pembayaran harus lebih dari 0"),
});

export const voidTransactionSchema = z.object({
  voidReason: z.string().min(1, "Alasan void wajib diisi"),
});

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Nama toko wajib diisi"),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  dailyReportTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam HH:MM"),
  lowStockThresholdDefault: z.coerce.number().min(0).default(5),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});