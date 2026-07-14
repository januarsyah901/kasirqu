import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.settings.findFirst();
  if (!settings?.telegramBotToken || !settings?.telegramChatId) {
    return NextResponse.json({ error: "Telegram belum dikonfigurasi" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: "✅ *Kasir Sembako*\nPercobaan pesan dari aplikasi.\nKonfigurasi Telegram berhasil! 🎉",
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.description || "Gagal kirim pesan");
    }

    return NextResponse.json({ success: true, message: "Pesan berhasil dikirim" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal kirim pesan Telegram" },
      { status: 500 }
    );
  }
}