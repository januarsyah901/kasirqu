import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { debtPaymentSchema } from "@/lib/validations";

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
    const validated = debtPaymentSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const debt = await tx.debt.findUnique({ where: { id } });

      if (!debt) {
        throw new Error("Utang tidak ditemukan");
      }

      if (debt.status === "PAID") {
        throw new Error("Utang sudah lunas");
      }

      const newPaidAmount = Number(debt.paidAmount) + Number(validated.amount);
      const newStatus = newPaidAmount >= Number(debt.amount) ? "PAID" : "PARTIAL";

      return tx.debt.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });
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