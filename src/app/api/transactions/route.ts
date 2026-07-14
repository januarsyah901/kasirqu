import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { transactionSchema } from "@/lib/validations";
import { checkAndSendLowStockAlert } from "@/lib/cron";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const page = parseInt(searchParams.get("page") || "1");
  const skip = (page - 1) * limit;
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { name: true, unit: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.transaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = transactionSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      let subtotal = 0;
      const itemsData: Array<{
        productId: string;
        quantity: number;
        priceAtSale: number;
        discount: number;
        subtotal: number;
      }> = [];

      for (const item of validated.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produk ${item.productId} tidak ditemukan`);
        }

        const currentStock = Number(product.stock);
        if (currentStock < Number(item.quantity)) {
          throw new Error(`Stok ${product.name} tidak cukup (tersedia: ${currentStock})`);
        }

        const itemSubtotal = Number(product.sellPrice) * Number(item.quantity) - Number(item.discount);
        subtotal += itemSubtotal;

        itemsData.push({
          productId: item.productId,
          quantity: Number(item.quantity),
          priceAtSale: Number(product.sellPrice),
          discount: Number(item.discount),
          subtotal: itemSubtotal,
        });
      }

      const total = subtotal - Number(validated.discount);
      const changeAmount = Number(validated.paidAmount) - total;

      // Generate invoice number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const lastTx = await tx.transaction.findFirst({
        where: { invoiceNumber: { startsWith: `INV-${dateStr}` } },
        orderBy: { createdAt: "desc" },
      });
      let seq = 1;
      if (lastTx) {
        const lastSeq = parseInt(lastTx.invoiceNumber.slice(-4));
        seq = lastSeq + 1;
      }
      const invoiceNumber = `INV-${dateStr}-${String(seq).padStart(4, "0")}`;

      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          subtotal,
          discount: Number(validated.discount),
          total,
          paidAmount: Number(validated.paidAmount),
          changeAmount: Math.max(0, changeAmount),
          status: "COMPLETED",
          items: {
            create: itemsData,
          },
        },
      });

      // Update stock for each item
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: Number(item.quantity),
            note: `Transaksi ${invoiceNumber}`,
          },
        });

        // Check low stock
        checkAndSendLowStockAlert(item.productId).catch(console.error);
      }

      // Create debt if underpaid
      if (validated.createDebt && validated.customerName && changeAmount < 0) {
        await tx.debt.create({
          data: {
            customerName: validated.customerName,
            amount: Math.abs(changeAmount),
            paidAmount: 0,
            status: "UNPAID",
            transactionId: transaction.id,
            note: `Sisa pembayaran transaksi ${invoiceNumber}`,
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}