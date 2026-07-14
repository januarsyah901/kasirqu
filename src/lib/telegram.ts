// lib/telegram.ts

import { db } from "./db";

export async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const settings = await db.settings.findFirst();
    
    if (!settings?.telegramBotToken || !settings?.telegramChatId) {
      console.warn("Telegram bot token or chat ID not configured");
      return false;
    }

    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error("Telegram API error:", data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

export function formatDailyReport(
  date: Date,
  revenue: number,
  transactionCount: number,
  topProducts: Array<{ name: string; qty: number; revenue: number }>,
  lowStockProducts: Array<{ name: string; stock: number; minStock: number }>
): string {
  const dateStr = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let message = `📊 <b>Rekap Harian - ${dateStr}</b>\n\n`;
  message += `💰 <b>Omzet:</b> Rp ${revenue.toLocaleString("id-ID")}\n`;
  message += `🧾 <b>Transaksi:</b> ${transactionCount}\n\n`;

  if (topProducts.length > 0) {
    message += `🏆 <b>Produk Terlaris:</b>\n`;
    topProducts.forEach((p, i) => {
      message += `${i + 1}. ${p.name} - ${p.qty} pcs (Rp ${p.revenue.toLocaleString("id-ID")})\n`;
    });
    message += "\n";
  }

  if (lowStockProducts.length > 0) {
    message += `⚠️ <b>Stok Menipis:</b>\n`;
    lowStockProducts.forEach((p) => {
      message += `• ${p.name} - Stok: ${p.stock} (Min: ${p.minStock})\n`;
    });
  } else {
    message += `✅ <b>Stok:</b> Semua aman\n`;
  }

  return message;
}

export function formatLowStockAlert(productName: string, stock: number, minStock: number): string {
  return `⚠️ <b>ALERT STOK MENIPIS</b>\n\n` +
    `Produk: <b>${productName}</b>\n` +
    `Stok Saat Ini: ${stock}\n` +
    `Minimum Stok: ${minStock}\n\n` +
    `Segera lakukan restock!`;
}