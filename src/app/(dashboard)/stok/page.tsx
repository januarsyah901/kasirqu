"use client";

import { useState, useEffect } from "react";
import { Plus, Package2, ArrowDown, ArrowUp, Settings2 } from "lucide-react";
import { formatRupiah, formatDateTime, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
}

interface StockLog {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  product: { name: string; unit: string };
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    type: "IN",
    quantity: "",
    note: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, logsRes] = await Promise.all([
        fetch("/api/products?limit=200"),
        fetch("/api/stock?limit=50"),
      ]);
      const productsData = await productsRes.json();
      const logsData = await logsRes.json();
      setProducts(productsData.products || []);
      setStockLogs(logsData.stockLogs || logsData || []);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!formData.productId || !formData.quantity) {
      toast.error("Lengkapi form");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          note: formData.note || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      toast.success("Stok berhasil dicatat");
      setIsDialogOpen(false);
      setFormData({ productId: "", type: "IN", quantity: "", note: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mencatat stok");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeBadge = (type: string) => {
    switch (type) {
      case "IN": 
        return (
          <span className="inline-flex items-center gap-1 border border-black bg-[#22C55E] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <ArrowDown className="h-3 w-3 stroke-[2.5px]" />
            Masuk
          </span>
        );
      case "OUT": 
        return (
          <span className="inline-flex items-center gap-1 border border-black bg-[#EF4444] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <ArrowUp className="h-3 w-3 stroke-[2.5px]" />
            Keluar
          </span>
        );
      case "ADJUSTMENT": 
        return (
          <span className="inline-flex items-center gap-1 border border-black bg-[#1E3FCF] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <Settings2 className="h-3 w-3 stroke-[2.5px]" />
            Adjust
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center border border-black bg-zinc-500 text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-black font-sans">
      
      {/* Header and Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Stok</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Catat transaksi stok masuk/keluar produk</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5 stroke-[2.5px]" />
              Catat Stok
            </button>
          </DialogTrigger>
          <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">CATAT STOK BARANG</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              
              {/* Product Select */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Pilih Produk</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs cursor-pointer"
                >
                  <option value="">Pilih produk...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Tipe Pencatatan</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs cursor-pointer"
                >
                  <option value="IN">Stok Masuk</option>
                  <option value="OUT">Stok Keluar</option>
                  <option value="ADJUSTMENT">Penyesuaian (Adjustment)</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Jumlah Barang</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                />
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Catatan (Opsional)</label>
                <input
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Contoh: restock supplier, void barang rusak..."
                  className="w-full p-2 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                />
              </div>

            </div>
            <DialogFooter className="gap-2.5 pt-4">
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Stock Logs Table */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        
        {/* Table Header */}
        <div className="p-4 border-b-[3px] border-black flex items-center justify-between bg-white">
          <h2 className="font-black text-sm uppercase tracking-wider text-black">RIWAYAT MUTASI STOK</h2>
        </div>

        {/* Table Content */}
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-10 bg-zinc-200 rounded-none border border-black/10" />
              ))}
            </div>
          ) : stockLogs.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 p-6">
              <Package2 className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
              <p className="text-xs font-black uppercase text-zinc-500 tracking-wider">Belum ada riwayat stok</p>
              <p className="text-[10px] text-zinc-400 mt-1">Klik "+ Catat Stok" untuk menginput mutasi barang</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[3px] border-black bg-zinc-50">
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Nama Produk</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Tipe</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Jumlah</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Catatan</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black text-right">Tanggal & Waktu</th>
                </tr>
              </thead>
              <tbody>
                {stockLogs.map((log) => (
                  <tr key={log.id} className="border-b-2 border-black/10 hover:bg-zinc-50/50">
                    <td className="p-3 text-xs font-bold uppercase text-black border-r border-black/10">{log.product.name}</td>
                    <td className="p-3 text-xs border-r border-black/10">{typeBadge(log.type)}</td>
                    <td className="p-3 text-xs font-mono font-black text-right text-black border-r border-black/10">{log.quantity} {log.product.unit}</td>
                    <td className="p-3 text-xs font-medium text-zinc-600 border-r border-black/10">{log.note || "-"}</td>
                    <td className="p-3 text-xs font-mono font-bold text-right text-zinc-500">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}