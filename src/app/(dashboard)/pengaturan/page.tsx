"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Send, Store, Clock, Bell } from "lucide-react";

interface SettingsData {
  storeName: string;
  telegramBotToken: string;
  telegramChatId: string;
  lowStockThresholdDefault: number;
  dailyReportTime: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    storeName: "Sidomoro",
    telegramBotToken: "",
    telegramChatId: "",
    lowStockThresholdDefault: 5,
    dailyReportTime: "21:00",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setSettings({
            storeName: data.storeName || "Sidomoro",
            telegramBotToken: data.telegramBotToken || "",
            telegramChatId: data.telegramChatId || "",
            lowStockThresholdDefault: Number(data.lowStockThresholdDefault || 5),
            dailyReportTime: data.dailyReportTime || "21:00",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings.storeName) {
      toast.error("Nama toko wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal simpan");
      toast.success("Pengaturan berhasil disimpan");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/telegram/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      toast.success("Pesan tes terkirim! Cek Telegram Anda.");
    } catch (err: any) {
      toast.error(err.message || "Gagal kirim tes");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="border-[3px] border-black bg-[#FFD400] text-black font-black uppercase px-6 py-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm tracking-widest">
          Memuat Pengaturan...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl text-black font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest">Pengaturan</h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Konfigurasi profile toko & integrasi bot</p>
      </div>

      {/* Store Info Card */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center gap-2.5">
          <Store className="h-5 w-5 text-black stroke-[2.5px]" />
          <div>
            <h2 className="font-black text-xs uppercase tracking-wider text-black">INFORMASI TOKO</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Nama toko yang dicetak pada struk & laporan</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-black block">Nama Toko</label>
            <input
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              placeholder="Contoh: Toko Sembako Makmur..."
              className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            />
          </div>
        </div>
      </div>

      {/* Telegram Notification Card */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center gap-2.5">
          <Bell className="h-5 w-5 text-black stroke-[2.5px]" />
          <div>
            <h2 className="font-black text-xs uppercase tracking-wider text-black">NOTIFIKASI TELEGRAM</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Laporan omzet otomatis & alert stok kritis</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Bot Token */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-black block">Bot Token Telegram</label>
            <input
              type="password"
              value={settings.telegramBotToken}
              onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
              placeholder="Contoh: 123456789:ABCdef..."
              className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            />
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              Hubungi <span className="font-mono font-black text-black">@BotFather</span> di Telegram untuk membuat bot baru
            </p>
          </div>

          {/* Chat ID */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-black block">Telegram Chat ID</label>
            <input
              value={settings.telegramChatId}
              onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
              placeholder="Contoh: -100123456789"
              className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            />
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              Gunakan Chat ID group, channel, atau akun pribadi (dapatkan via <span className="font-mono font-black text-black">@userinfobot</span>)
            </p>
          </div>

          {/* Test Telegram button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2.5 border-t border-dashed border-black/10">
            <button 
              type="button"
              onClick={handleTestTelegram} 
              disabled={testing || !settings.telegramBotToken || !settings.telegramChatId}
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-white text-black font-black uppercase text-[10px] tracking-wider rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Send className="h-4 w-4 stroke-[2px]" />
              {testing ? "Mengirim..." : "Kirim Pesan Tes"}
            </button>
            <p className="text-[10px] font-bold text-zinc-400 uppercase">
              Kirim pesan uji coba untuk memastikan integrasi bot berhasil
            </p>
          </div>
        </div>
      </div>

      {/* Schedules and Thresholds Card */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-black stroke-[2.5px]" />
          <div>
            <h2 className="font-black text-xs uppercase tracking-wider text-black">JADWAL & AMBANG BATAS</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Pengaturan waktu rekapitulasi & ambang stok</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Jam Laporan Harian */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-black block">Waktu Pengiriman Rekap Harian</label>
            <input
              type="time"
              value={settings.dailyReportTime}
              onChange={(e) => setSettings({ ...settings, dailyReportTime: e.target.value })}
              className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            />
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              Sistem akan otomatis mengirim rekap penjualan harian ke Telegram setiap jam ini
            </p>
          </div>

          {/* Ambang Batas Stok Minimum */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-black block">Ambang Batas Stok Minimum Default</label>
            <input
              type="number"
              min="0"
              value={settings.lowStockThresholdDefault}
              onChange={(e) => setSettings({ ...settings, lowStockThresholdDefault: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            />
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              Ambang batas default untuk barang baru. Alert dipicu jika stok berada di bawah angka ini.
            </p>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="flex items-center gap-2 px-6 py-3.5 border-[3px] border-black bg-[#1E3FCF] text-white font-black uppercase text-sm rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          <Save className="h-5 w-5 stroke-[2.5px]" />
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>

    </div>
  );
}