import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { debtSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debts = await db.debt.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Fetch transaction invoice numbers
  const debtsWithTx = await Promise.all(
    debts.map(async (debt) => {
      if (debt.transactionId) {
        const tx = await db.transaction.findUnique({
          where: { id: debt.transactionId },
          select: { invoiceNumber: true },
        });
        return { ...debt, transaction: tx };
      }
      return { ...debt, transaction: null };
    })
  );

  return NextResponse.json({ debts: debtsWithTx });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = debtSchema.parse(body);

    const debt = await db.debt.create({
      data: {
        customerName: validated.customerName,
        customerPhone: validated.customerPhone || null,
        amount: validated.amount,
        note: validated.note || null,
      },
    });

    return NextResponse.json(debt, { status: 201 });
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