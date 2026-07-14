import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { voidTransactionSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { name: true, unit: true, buyPrice: true } } },
      },
    },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = voidTransactionSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!transaction) {
        throw new Error("Transaksi tidak ditemukan");
      }

      if (transaction.status === "VOID") {
        throw new Error("Transaksi sudah di-void");
      }

      // Restore stock for each item
      for (const item of transaction.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            note: `Void transaksi ${transaction.invoiceNumber}: ${validated.voidReason}`,
          },
        });
      }

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: "VOID",
          voidReason: validated.voidReason,
          voidedAt: new Date(),
        },
        include: {
          items: {
            include: { product: { select: { name: true, unit: true } } },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(result);
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