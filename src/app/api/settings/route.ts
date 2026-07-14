import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.settings.findFirst();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = settingsSchema.parse(body);

    const existing = await db.settings.findFirst();

    let settings;
    if (existing) {
      settings = await db.settings.update({
        where: { id: existing.id },
        data: {
          storeName: validated.storeName,
          telegramBotToken: validated.telegramBotToken || null,
          telegramChatId: validated.telegramChatId || null,
          lowStockThresholdDefault: validated.lowStockThresholdDefault,
          dailyReportTime: validated.dailyReportTime,
        },
      });
    } else {
      settings = await db.settings.create({
        data: {
          storeName: validated.storeName,
          telegramBotToken: validated.telegramBotToken || null,
          telegramChatId: validated.telegramChatId || null,
          lowStockThresholdDefault: validated.lowStockThresholdDefault,
          dailyReportTime: validated.dailyReportTime,
        },
      });
    }

    return NextResponse.json(settings);
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