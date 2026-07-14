const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/kasir_sembako?schema=public",
    },
  },
});

const bcrypt = require("bcryptjs");

async function main() {
  // Create default user
  const passwordHash = await bcrypt.hash("admin123", 12);
  
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });

  console.log("Default user created: admin / admin123");

  // Create default categories
  const categories = [
    "Sembako",
    "Minuman",
    "Snack",
    "Rokok",
    "Lainnya",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Default categories created");

  // Create default settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Toko Sembako",
      dailyReportTime: "21:00",
      lowStockThresholdDefault: 5,
    },
  });

  console.log("Default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });