import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { stockSchema } from "@/lib/validations";
import { checkAndSendLowStockAlert } from "@/lib/cron";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const productId = searchParams.get("productId");

  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;

  const stockLogs = await db.stockLog.findMany({
    where,
    include: { product: { select: { name: true, unit: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(stockLogs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = stockSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: validated.productId },
      });

      if (!product) {
        throw new Error("Produk tidak ditemukan");
      }

      let newStock: number;
      switch (validated.type) {
        case "IN":
          newStock = Number(product.stock) + Number(validated.quantity);
          break;
        case "OUT":
          newStock = Number(product.stock) - Number(validated.quantity);
          if (newStock < 0) {
            throw new Error("Stok tidak boleh minus");
          }
          break;
        case "ADJUSTMENT":
          newStock = Number(validated.quantity);
          break;
        default:
          throw new Error("Tipe stok tidak valid");
      }

      const updatedProduct = await tx.product.update({
        where: { id: validated.productId },
        data: { stock: newStock },
      });

      const stockLog = await tx.stockLog.create({
        data: {
          productId: validated.productId,
          type: validated.type,
          quantity: validated.quantity,
          note: validated.note || null,
        },
      });

      return { product: updatedProduct, stockLog };
    });

    // Check low stock alert
    checkAndSendLowStockAlert(validated.productId).catch(console.error);

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