"use client";

import { useState, useEffect } from "react";
import { formatRupiah, formatDateTime, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Receipt, TrendingUp, BarChart3, FileDown, Eye, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Transaction {
  id: string;
  invoiceNumber: string;
  total: number;
  subtotal: number;
  discount: number;
  paidAmount: number;
  changeAmount: number;
  status: string;
  voidReason: string | null;
  voidedAt: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    subtotal: number;
    product: { name: string; unit: string };
  }>;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
}

interface DailyBreakdown {
  date: string;
  total: number;
}

interface SummaryData {
  revenue: number;
  transactionCount: number;
  totalProfit: number;
  topProducts: TopProduct[];
  dailyBreakdown: DailyBreakdown[];
  recentTransactions: Transaction[];
  range: string;
}

interface Debt {
  id: string;
  customerName: string;
  amount: number;
  paidAmount: number;
  status: string;
  note: string | null;
  createdAt: string;
  transaction?: { invoiceNumber: string };
}

export default function LaporanPage() {
  const [range, setRange] = useState("daily");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/reports/summary?range=${range}`).then((r) => r.json()),
      fetch("/api/debts").then((r) => r.json()),
    ])
      .then(([summaryData, debtData]) => {
        setSummary(summaryData);
        setDebts(debtData.debts || []);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const handleVoid = async () => {
    if (!selectedTx || !voidReason) return;
    setIsVoiding(true);
    try {
      const res = await fetch(`/api/transactions/${selectedTx.id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voidReason }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal void");
      toast.success("Transaksi berhasil di-void");
      setIsVoidOpen(false);
      setVoidReason("");
      setSelectedTx(null);
      
      // Refresh summary
      const txRes = await fetch(`/api/reports/summary?range=${range}`);
      setSummary(await txRes.json());
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses void");
    } finally {
      setIsVoiding(false);
    }
  };

  const handlePayDebt = async () => {
    if (!payingDebtId || !paymentAmount) return;
    setIsPaying(true);
    try {
      const res = await fetch(`/api/debts/${payingDebtId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(paymentAmount) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal bayar");
      toast.success("Pembayaran utang berhasil dicatat");
      setIsPaymentOpen(false);
      setPaymentAmount("");
      setPayingDebtId(null);
      
      // Refresh debts
      const debtRes = await fetch("/api/debts");
      setDebts((await debtRes.json()).debts || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal mencatat pembayaran");
    } finally {
      setIsPaying(false);
    }
  };

  const statCards = [
    {
      title: range === "daily" ? "Omzet Hari Ini" : range === "weekly" ? "Omzet Minggu Ini" : "Omzet Bulan Ini",
      value: formatRupiah(summary?.revenue || 0),
      icon: TrendingUp,
      color: "bg-[#22C55E] text-white",
    },
    {
      title: range === "daily" ? "Transaksi Hari Ini" : range === "weekly" ? "Transaksi Minggu Ini" : "Transaksi Bulan Ini",
      value: (summary?.transactionCount || 0).toString(),
      icon: Receipt,
      color: "bg-[#1E3FCF] text-white",
    },
    {
      title: "Keuntungan Kotor",
      value: formatRupiah(summary?.totalProfit || 0),
      icon: BarChart3,
      color: "bg-[#FFD400] text-black",
    },
  ];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="border-[3px] border-black bg-[#FFD400] text-black font-black uppercase px-6 py-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm tracking-widest">
          Memuat Data Laporan...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black font-sans">
      
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Laporan</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Analisis performa penjualan toko</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => window.open("/api/reports/export?type=transactions", "_blank")}
            className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white text-black font-black uppercase text-[10px] tracking-wider rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <FileDown className="h-4 w-4 stroke-[2.5px]" />
            Export Transaksi
          </button>
          <button 
            onClick={() => window.open("/api/reports/export?type=debts", "_blank")}
            className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white text-black font-black uppercase text-[10px] tracking-wider rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <FileDown className="h-4 w-4 stroke-[2.5px]" />
            Export Utang
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div 
            key={card.title}
            className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center justify-between select-none"
          >
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{card.title}</p>
              <p className="text-xl font-black mt-1 font-mono">{card.value}</p>
            </div>
            <div className={cn("p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none", card.color)}>
              <card.icon className="h-5 w-5 stroke-[2.5px]" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Filter Range */}
      <div className="flex border-2 border-black bg-white rounded-none p-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-w-sm select-none">
        <button
          onClick={() => setRange("daily")}
          className={cn(
            "flex-1 text-center py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-none transition-all cursor-pointer",
            range === "daily" ? "bg-[#FFD400] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" : "text-zinc-500 hover:text-black"
          )}
        >
          Harian
        </button>
        <button
          onClick={() => setRange("weekly")}
          className={cn(
            "flex-1 text-center py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-none transition-all cursor-pointer",
            range === "weekly" ? "bg-[#FFD400] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" : "text-zinc-500 hover:text-black"
          )}
        >
          Mingguan
        </button>
        <button
          onClick={() => setRange("monthly")}
          className={cn(
            "flex-1 text-center py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-none transition-all cursor-pointer",
            range === "monthly" ? "bg-[#FFD400] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" : "text-zinc-500 hover:text-black"
          )}
        >
          Bulanan
        </button>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="space-y-6">
        
        {/* Sales Chart */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <div className="border-b-[3px] border-black p-4 bg-zinc-50 font-black text-xs uppercase tracking-wider text-black">
            GRAFIK PENJUALAN
          </div>
          <div className="p-6">
            {!summary?.dailyBreakdown || summary.dailyBreakdown.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 text-zinc-300 stroke-[2px]" />
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Belum ada data penjualan</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fontWeight: "bold" }}
                      tickFormatter={(v) => {
                        const d = new Date(v + "T00:00:00");
                        return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                      }}
                    />
                    <YAxis tick={{ fontSize: 10, fontWeight: "bold" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ border: "2px solid black", fontWeight: "bold" }} />
                    <Bar dataKey="total" fill="#22C55E" stroke="#000" strokeWidth={2} radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Top Products and Recent Transactions Row */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Top Products */}
          <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col">
            <div className="border-b-[3px] border-black p-4 bg-zinc-50 font-black text-xs uppercase tracking-wider text-black">
              PRODUK TERLARIS
            </div>
            <div className="p-0 overflow-x-auto flex-1 max-h-[300px]">
              {!summary?.topProducts || summary.topProducts.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 p-6">
                  <p className="text-xs font-black uppercase text-zinc-500">Belum ada data penjualan produk</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-zinc-100">
                      <th className="p-3 text-xs font-black uppercase text-black border-r border-black/10">Produk</th>
                      <th className="p-3 text-xs font-black uppercase text-black border-r border-black/10 text-right">Terjual</th>
                      <th className="p-3 text-xs font-black uppercase text-black border-r border-black/10 text-right">Omzet</th>
                      <th className="p-3 text-xs font-black uppercase text-black text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topProducts.map((p, i) => (
                      <tr key={i} className="border-b border-black/10 hover:bg-zinc-50">
                        <td className="p-2.5 text-xs font-bold uppercase text-black border-r border-black/10">{p.name}</td>
                        <td className="p-2.5 text-xs font-mono font-black text-right text-black border-r border-black/10">{p.quantity}</td>
                        <td className="p-2.5 text-xs font-mono font-bold text-right text-zinc-700 border-r border-black/10">{formatRupiah(p.revenue)}</td>
                        <td className="p-2.5 text-xs font-mono font-black text-right text-[#22C55E]">{formatRupiah(p.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Transactons List */}
          <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col">
            <div className="border-b-[3px] border-black p-4 bg-zinc-50 font-black text-xs uppercase tracking-wider text-black">
              TRANSAKSI TERBARU
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-2.5">
              {!summary?.recentTransactions || summary.recentTransactions.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <p className="text-xs font-black uppercase text-zinc-500">Belum ada transaksi</p>
                </div>
              ) : (
                summary.recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 border-2 border-black bg-zinc-50 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] rounded-none text-xs"
                  >
                    <div>
                      <p className="font-black text-black uppercase">{tx.invoiceNumber}</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-0.5">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <span className="font-black font-mono text-[#1E3FCF]">{formatRupiah(tx.total)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Transactions & Debts Full Histories */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        
        {/* Table header */}
        <div className="p-4 border-b-[3px] border-black bg-zinc-50 flex items-center justify-between">
          <h2 className="font-black text-xs uppercase tracking-wider text-black">RIWAYAT TRANSAKSI KASIR</h2>
        </div>

        {/* Table list */}
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-10 bg-zinc-200 rounded-none border border-black/10" />
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[3px] border-black bg-zinc-100">
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">No. Invoice</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Daftar Barang</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Total Belanja</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-center">Status</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Waktu Transaksi</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.recentTransactions || []).map((tx) => (
                  <tr key={tx.id} className="border-b-2 border-black/10 hover:bg-zinc-50/50">
                    <td className="p-3 text-xs font-mono font-black text-black border-r border-black/10">{tx.invoiceNumber}</td>
                    <td className="p-3 text-xs font-bold text-zinc-600 border-r border-black/10">
                      {tx.items?.slice(0, 3).map((i) => i.product?.name || "?").join(", ")}
                      {tx.items?.length > 3 && ` (+${tx.items.length - 3} item)`}
                    </td>
                    <td className="p-3 text-xs font-mono font-black text-right text-black border-r border-black/10">{formatRupiah(tx.total)}</td>
                    <td className="p-3 text-center border-r border-black/10">
                      {tx.status === "COMPLETED" ? (
                        <span className="inline-flex items-center border border-black bg-[#22C55E] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center border border-black bg-[#EF4444] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          Void
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs font-mono font-bold text-right text-zinc-500 border-r border-black/10">{formatDateTime(tx.createdAt)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Transaction Detail Trigger */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button 
                              onClick={() => setSelectedTx(tx)}
                              className="p-1 border border-black bg-[#FFD400] text-black hover:bg-yellow-400 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </button>
                          </DialogTrigger>
                          <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-black text-base uppercase tracking-wider text-black border-b-[3px] border-black pb-3 text-center">
                                DETAIL TRANSAKSI {tx.invoiceNumber}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 pt-2 font-mono text-xs">
                              {tx.items?.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                  <span className="font-bold text-black uppercase">{item.product?.name || "?"} x{item.quantity}</span>
                                  <span className="font-black">{formatRupiah(item.subtotal)}</span>
                                </div>
                              ))}
                              
                              <div className="border-t border-dashed border-black/30 my-2" />
                              
                              <div className="flex justify-between font-bold">
                                <span>Subtotal</span>
                                <span>{formatRupiah(tx.subtotal)}</span>
                              </div>
                              {tx.discount > 0 && (
                                <div className="flex justify-between text-red-500 font-bold">
                                  <span>Diskon</span>
                                  <span>-{formatRupiah(tx.discount)}</span>
                                </div>
                              )}
                              <div className="border-t border-black/10 my-1" />
                              <div className="flex justify-between font-black text-sm text-black">
                                <span>Total Akhir</span>
                                <span>{formatRupiah(tx.total)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tunai</span>
                                <span>{formatRupiah(tx.paidAmount)}</span>
                              </div>
                              <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Kembalian</span>
                                <span>{formatRupiah(tx.changeAmount)}</span>
                              </div>
                              {tx.status === "VOID" && (
                                <div className="border-2 border-black bg-red-100 p-2.5 text-xs text-red-700 font-bold uppercase mt-2">
                                  Alasan Void: {tx.voidReason}
                                </div>
                              )}
                            </div>
                            <DialogFooter className="pt-2">
                              <DialogTrigger asChild>
                                <button className="w-full py-2 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
                                  Tutup
                                </button>
                              </DialogTrigger>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Transaction Void Trigger */}
                        {tx.status === "COMPLETED" && (
                          <button
                            onClick={() => {
                              setSelectedTx(tx);
                              setIsVoidOpen(true);
                            }}
                            className="p-1 border border-black bg-[#EF4444] text-white hover:bg-red-600 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Void Dialog Box */}
      <Dialog open={isVoidOpen} onOpenChange={setIsVoidOpen}>
        <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">VOID TRANSAKSI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Yakin ingin mem-void transaksi <span className="font-black text-black">{selectedTx?.invoiceNumber}</span>? 
              Stok produk terkait akan dikembalikan secara otomatis.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black block">Alasan Pembatalan (Void)</label>
              <input 
                value={voidReason} 
                onChange={(e) => setVoidReason(e.target.value)} 
                placeholder="Contoh: salah input item, pembatalan pelanggan..." 
                className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2.5 pt-4">
            <button 
              onClick={() => setIsVoidOpen(false)}
              className="flex-1 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Batal
            </button>
            <button 
              onClick={handleVoid} 
              disabled={isVoiding || !voidReason} 
              className="flex-1 py-2.5 border-2 border-black bg-[#EF4444] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isVoiding ? "Memproses..." : "Batalkan Transaksi"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}