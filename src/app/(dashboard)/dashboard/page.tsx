"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, AlertTriangle, Receipt, ArrowRight } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";

interface SummaryData {
  todayRevenue: number;
  todayTransactions: number;
  lowStockCount: number;
  lowStockProducts: Array<{ name: string; stock: number; minStock: number }>;
  recentTransactions: Array<{ invoiceNumber: string; total: number; createdAt: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Omzet Hari Ini",
      value: data ? formatRupiah(data.todayRevenue) : "Rp 0",
      icon: Receipt,
      color: "bg-[#22C55E] text-white",
    },
    {
      title: "Transaksi Hari Ini",
      value: data ? data.todayTransactions.toString() : "0",
      icon: ShoppingCart,
      color: "bg-[#1E3FCF] text-white",
    },
    {
      title: "Produk Stok Menipis",
      value: data ? data.lowStockCount.toString() : "0",
      icon: AlertTriangle,
      color: "bg-[#EF4444] text-white",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 text-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">Dashboard</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Memuat data ringkasan...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none animate-pulse">
              <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-zinc-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Dashboard</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Ringkasan transaksi & stok toko</p>
        </div>
        <Link href="/kasir">
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 border-[3px] border-black bg-[#FFD400] text-black font-black uppercase text-sm rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
            <ShoppingCart className="h-5 w-5 stroke-[2.5px]" />
            + Tambah Transaksi
          </button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Details layout */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Low Stock Warning Card */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col">
          <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center justify-between">
            <h2 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-[#EF4444] stroke-[2.5px]" />
              PRODUK STOK MENIPIS
            </h2>
            <Link href="/stok" className="text-[10px] font-black uppercase text-[#1E3FCF] hover:underline flex items-center gap-1">
              Kelola Stok <ArrowRight className="h-3.5 w-3.5 stroke-[2.5px]" />
            </Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[320px]">
            {data?.lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200">
                <Package className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs font-black uppercase tracking-wider">Semua stok aman</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.lowStockProducts.map((product, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-zinc-400">{i + 1}.</span>
                      <div>
                        <p className="font-bold text-xs uppercase">{product.name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 mt-0.5">
                          Stok: <span className="font-black text-red-600">{product.stock}</span> (Batas: {product.minStock})
                        </p>
                      </div>
                    </div>
                    <div className="border border-black bg-[#EF4444] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none">
                      Menipis
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col">
          <div className="border-b-[3px] border-black p-4 bg-zinc-50 flex items-center justify-between">
            <h2 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-2">
              <Receipt className="h-4.5 w-4.5 text-[#1E3FCF] stroke-[2.5px]" />
              5 TRANSAKSI TERAKHIR
            </h2>
            <Link href="/laporan" className="text-[10px] font-black uppercase text-[#1E3FCF] hover:underline flex items-center gap-1">
              Lihat Laporan <ArrowRight className="h-3.5 w-3.5 stroke-[2.5px]" />
            </Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[320px]">
            {data?.recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200">
                <Receipt className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs font-black uppercase tracking-wider">Belum ada transaksi hari ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.recentTransactions.map((tx, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none"
                  >
                    <div>
                      <p className="font-bold text-xs uppercase">{tx.invoiceNumber}</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                        {new Date(tx.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="font-black font-mono text-xs text-[#22C55E]">{formatRupiah(tx.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}