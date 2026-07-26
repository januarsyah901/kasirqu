"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Package2, ArrowDown, ArrowUp, Settings2, Search, ChevronDown, Check } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  const [productOpen, setProductOpen] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const productBoxRef = useRef<HTMLDivElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    productId: "",
    type: "IN",
    quantity: "",
    note: "",
  });

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productQuery]);

  useEffect(() => {
    if (!productOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (productBoxRef.current && !productBoxRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [productOpen]);

  useEffect(() => {
    if (productOpen) {
      requestAnimationFrame(() => productSearchRef.current?.focus());
    }
  }, [productOpen]);

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
      setProductOpen(false);
      setProductQuery("");
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
        
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setProductOpen(false);
              setProductQuery("");
            }
          }}
        >
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5 stroke-[2.5px]" />
              Catat Stok
            </button>
          </DialogTrigger>
          <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md overflow-visible">
            <DialogHeader>
              <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">CATAT STOK BARANG</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              
              {/* Product Select — live search */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Pilih Produk</label>
                <div className="relative" ref={productBoxRef}>
                  <button
                    type="button"
                    onClick={() => setProductOpen((v) => !v)}
                    className="flex h-10 w-full items-center justify-between border-2 border-black bg-white px-3 text-left text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 focus:outline-none focus:bg-zinc-50 rounded-none cursor-pointer"
                  >
                    <span className={cn("truncate", !selectedProduct && "text-zinc-500")}>
                      {selectedProduct
                        ? `${selectedProduct.name} (Stok: ${selectedProduct.stock} ${selectedProduct.unit})`
                        : "Pilih produk..."}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", productOpen && "rotate-180")} />
                  </button>

                  {productOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
                      <div className="relative border-b-2 border-black p-2">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black stroke-[2.5px]" />
                        <input
                          ref={productSearchRef}
                          value={productQuery}
                          onChange={(e) => setProductQuery(e.target.value)}
                          placeholder="Cari nama produk..."
                          className="h-9 w-full border-2 border-black bg-white pl-8 pr-2 text-xs font-bold text-black focus:outline-none focus:bg-zinc-50 rounded-none"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <p className="px-3 py-4 text-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
                            Produk tidak ditemukan
                          </p>
                        ) : (
                          filteredProducts.map((p) => {
                            const active = formData.productId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, productId: p.id });
                                  setProductOpen(false);
                                  setProductQuery("");
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-bold hover:bg-zinc-100 cursor-pointer",
                                  active && "bg-zinc-100"
                                )}
                              >
                                <span className="truncate">
                                  {p.name}{" "}
                                  <span className="text-zinc-500 font-medium">
                                    (Stok: {p.stock} {p.unit})
                                  </span>
                                </span>
                                {active && <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5px]" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Tipe Pencatatan</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="w-full h-auto p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                    <SelectValue placeholder="Pilih tipe..." />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white text-black font-bold rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <SelectItem value="IN" className="text-xs font-bold rounded-none">Stok Masuk</SelectItem>
                    <SelectItem value="OUT" className="text-xs font-bold rounded-none">Stok Keluar</SelectItem>
                    <SelectItem value="ADJUSTMENT" className="text-xs font-bold rounded-none">Penyesuaian (Adjustment)</SelectItem>
                  </SelectContent>
                </Select>
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