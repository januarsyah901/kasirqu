import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

function getDateRange(range: string): { gte: Date; lt: Date } {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "weekly": {
      const day = start.getDay();
      start.setDate(start.getDate() - ((day + 6) % 7));
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    default: {
      start.setHours(0, 0, 0, 0);
      break;
    }
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { gte: start, lt: end };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "daily";
  const dateRange = getDateRange(range);

  const [transactions, lowStockProducts, todayTransactions, topProductsRaw] = await Promise.all([
    db.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: dateRange.gte, lt: dateRange.lt },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        createdAt: true,
        status: true,
      },
    }),
    db.product.findMany({
      where: {
        stock: { lt: db.product.fields.minStock },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
      },
    }),
    (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return db.transaction.count({
        where: {
          status: "COMPLETED",
          createdAt: { gte: today, lt: new Date(today.getTime() + 86400000) },
        },
      });
    })(),
    db.transactionItem.findMany({
      where: {
        transaction: {
          status: "COMPLETED",
          createdAt: { gte: dateRange.gte, lt: dateRange.lt },
        },
      },
      include: {
        product: { select: { name: true, buyPrice: true } },
      },
    }),
  ]);

  const revenue = transactions.reduce((sum, t) => sum + Number(t.total), 0);

  // Aggregate top products
  const productMap = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>();
  for (const item of topProductsRaw) {
    const id = item.productId;
    const existing = productMap.get(id);
    const qty = Number(item.quantity);
    const itemRevenue = Number(item.subtotal);
    const profit = (Number(item.priceAtSale) - Number(item.product.buyPrice)) * qty;

    if (existing) {
      existing.quantity += qty;
      existing.revenue += itemRevenue;
      existing.profit += profit;
    } else {
      productMap.set(id, {
        name: item.product.name,
        quantity: qty,
        revenue: itemRevenue,
        profit,
      });
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const totalProfit = topProductsRaw.reduce(
    (sum, item) => sum + (Number(item.priceAtSale) - Number(item.product.buyPrice)) * Number(item.quantity),
    0
  );

  // Daily breakdown for chart
  const dailyBreakdown = await getDailyBreakdown(range);

  return NextResponse.json({
    revenue,
    todayRevenue: revenue,
    todayTransactions,
    transactionCount: transactions.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    recentTransactions: transactions,
    topProducts,
    totalProfit,
    dailyBreakdown,
    range,
  });
}

async function getDailyBreakdown(range: string) {
  const now = new Date();
  const { gte } = getDateRange(range);

  const transactions = await db.transaction.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte, lt: now },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap = new Map<string, number>();
  for (const tx of transactions) {
    const day = tx.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + Number(tx.total));
  }

  return Array.from(dailyMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));
}