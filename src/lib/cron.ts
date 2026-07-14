// lib/cron.ts

import cron from "node-cron";
import { sendTelegramMessage, formatDailyReport } from "./telegram";
import { db } from "./db";
import { Prisma } from "@prisma/client";

let scheduledJob: ReturnType<typeof cron.schedule> | null = null;

export async function generateDailyReport(date: Date = new Date()): Promise<string> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [transactions, topProductsRaw, lowStockProductsRaw] = await Promise.all([
    db.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { items: true },
    }),
    db.$queryRaw<{ name: string; qty: number; revenue: number }[]>`
      SELECT p.name, SUM(ti.quantity) as qty, SUM(ti.subtotal) as revenue
      FROM "TransactionItem" ti
      JOIN "Transaction" t ON ti."transactionId" = t.id
      JOIN "Product" p ON ti."productId" = p.id
      WHERE t.status = 'COMPLETED' AND t."createdAt" >= ${startOfDay} AND t."createdAt" <= ${endOfDay}
      GROUP BY p.name
      ORDER BY qty DESC
      LIMIT 5
    `,
    db.product.findMany({
      where: { stock: { lt: db.product.fields.minStock } },
      select: { name: true, stock: true, minStock: true },
    }),
  ]);

  const revenue = transactions.reduce((sum, t) => sum + Number(t.total), 0);
  const transactionCount = transactions.length;

  const topProducts = topProductsRaw.map((p) => ({
    name: p.name,
    qty: Number(p.qty),
    revenue: Number(p.revenue),
  }));

  const lowStockProducts = lowStockProductsRaw.map((p) => ({
    name: p.name,
    stock: Number(p.stock),
    minStock: Number(p.minStock),
  }));

  return formatDailyReport(date, revenue, transactionCount, topProducts, lowStockProducts);
}

export async function checkAndSendLowStockAlert(productId: string): Promise<void> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { name: true, stock: true, minStock: true },
  });

  if (product && product.stock < product.minStock) {
    const message = `⚠️ <b>ALERT STOK MENIPIS</b>\n\n` +
      `Produk: <b>${product.name}</b>\n` +
      `Stok Saat Ini: ${product.stock}\n` +
      `Minimum Stok: ${product.minStock}\n\n` +
      `Segera lakukan restock!`;
    
    await sendTelegramMessage(message);
  }
}

export function scheduleJobs(): void {
  if (scheduledJob) {
    scheduledJob.stop();
  }

  const runDailyReport = async () => {
    try {
      const settings = await db.settings.findFirst();
      if (settings?.telegramBotToken && settings?.telegramChatId) {
        const report = await generateDailyReport();
        await sendTelegramMessage(report);
        console.log("Daily report sent to Telegram");
      }
    } catch (error) {
      console.error("Failed to send daily report:", error);
    }
  };

  // Run daily report job
  // We'll use a cron job that runs every minute to check if it's time
  scheduledJob = cron.schedule("* * * * *", async () => {
    try {
      const settings = await db.settings.findFirst();
      if (!settings?.dailyReportTime) return;

      const now = new Date();
      const [targetHour, targetMinute] = settings.dailyReportTime.split(":").map(Number);
      
      if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
        await runDailyReport();
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  scheduledJob.start();
  console.log("Cron jobs scheduled");
}

export function stopJobs(): void {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
  }
}