// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/kasir_sembako?schema=public",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default user
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });

  console.log("Default user created: admin / admin123");

  // Create default settings
  const existingSettings = await prisma.settings.findFirst();
  if (existingSettings) {
    await prisma.settings.update({
      where: { id: existingSettings.id },
      data: { storeName: "Sidomoro" },
    });
  } else {
    await prisma.settings.create({
      data: {
        storeName: "Sidomoro",
        lowStockThresholdDefault: 5,
        dailyReportTime: "21:00",
      },
    });
  }
  console.log("Settings created/updated with store name: Sidomoro");

  // Create default categories
  const categories = [
    "Sembako",
    "Minuman",
    "Snack",
    "Rokok",
    "Lainnya",
  ];

  const dbCategories: Record<string, any> = {};

  for (const name of categories) {
    const createdCat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    dbCategories[name] = createdCat;
  }

  console.log("Default categories created");

  // Create mock products (with/without image URLs)
  const mockProducts = [
    {
      name: "Beras Sentra Ramos 5kg",
      categoryName: "Sembako",
      unit: "pcs",
      buyPrice: 65000,
      sellPrice: 72000,
      stock: 25,
      minStock: 5,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Minyak Goreng Bimoli 2L",
      categoryName: "Sembako",
      unit: "pcs",
      buyPrice: 32000,
      sellPrice: 36500,
      stock: 18,
      minStock: 4,
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Gula Pasir Gulaku 1kg",
      categoryName: "Sembako",
      unit: "pcs",
      buyPrice: 14500,
      sellPrice: 16000,
      stock: 30,
      minStock: 6,
      imageUrl: null, // Tanpa gambar
    },
    {
      name: "Coca Cola 390ml",
      categoryName: "Minuman",
      unit: "pcs",
      buyPrice: 4200,
      sellPrice: 5000,
      stock: 45,
      minStock: 10,
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Teh Botol Sosro 450ml",
      categoryName: "Minuman",
      unit: "pcs",
      buyPrice: 3100,
      sellPrice: 4000,
      stock: 12,
      minStock: 8,
      imageUrl: null, // Tanpa gambar
    },
    {
      name: "Chitato Sapi Panggang 68g",
      categoryName: "Snack",
      unit: "pcs",
      buyPrice: 9500,
      sellPrice: 11500,
      stock: 22,
      minStock: 5,
      imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Indomie Goreng Spesial",
      categoryName: "Snack",
      unit: "pcs",
      buyPrice: 2800,
      sellPrice: 3500,
      stock: 120,
      minStock: 20,
      imageUrl: null, // Tanpa gambar
    },
    {
      name: "Susu UHT Ultra Milk 1L",
      categoryName: "Minuman",
      unit: "pcs",
      buyPrice: 16500,
      sellPrice: 19000,
      stock: 3, // stok menipis
      minStock: 5,
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80",
    },
  ];

  for (const prod of mockProducts) {
    const category = dbCategories[prod.categoryName];
    if (!category) continue;

    const existingProduct = await prisma.product.findFirst({
      where: { name: prod.name },
    });

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          categoryId: category.id,
          unit: prod.unit,
          buyPrice: prod.buyPrice,
          sellPrice: prod.sellPrice,
          stock: prod.stock,
          minStock: prod.minStock,
          imageUrl: prod.imageUrl,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          categoryId: category.id,
          unit: prod.unit,
          buyPrice: prod.buyPrice,
          sellPrice: prod.sellPrice,
          stock: prod.stock,
          minStock: prod.minStock,
          imageUrl: prod.imageUrl,
        },
      });
    }
  }

  console.log("Mock products seeded/updated successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });