"use client";

import { useState, useEffect } from "react";
import { formatRupiah, formatDateTime, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Wallet, Search } from "lucide-react";

interface Debt {
  id: string;
  customerName: string;
  customerPhone: string | null;
  amount: number;
  paidAmount: number;
  status: string;
  note: string | null;
  createdAt: string;
  transaction: { invoiceNumber: string } | null;
}

export default function BonPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    amount: "",
    note: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/debts");
      const data = await res.json();
      setDebts(data.debts || []);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDebts(); }, []);

  const filteredDebts = debts.filter((d) => {
    const matchSearch = d.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOutstanding = debts
    .filter((d) => d.status !== "PAID")
    .reduce((sum, d) => sum + (Number(d.amount) - Number(d.paidAmount || 0)), 0);

  const handleAdd = async () => {
    if (!formData.customerName || !formData.amount) {
      toast.error("Nama pelanggan dan jumlah wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone || undefined,
          amount: parseFloat(formData.amount),
          note: formData.note || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      toast.success("Bon berhasil dicatat");
      setIsAddOpen(false);
      setFormData({ customerName: "", customerPhone: "", amount: "", note: "" });
      fetchDebts();
    } catch (err: any) {
      toast.error(err.message || "Gagal mencatat bon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!payingDebt || !paymentAmount) return;
    setIsPaying(true);
    try {
      const res = await fetch(`/api/debts/${payingDebt.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(paymentAmount) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal bayar");
      toast.success("Pembayaran berhasil");
      setIsPayOpen(false);
      setPaymentAmount("");
      setPayingDebt(null);
      fetchDebts();
    } catch (err: any) {
      toast.error(err.message || "Gagal");
    } finally {
      setIsPaying(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "UNPAID": 
        return (
          <span className="inline-flex items-center border border-black bg-[#EF4444] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            Belum Dibayar
          </span>
        );
      case "PARTIAL": 
        return (
          <span className="inline-flex items-center border border-black bg-[#FFD400] text-black px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            Angsuran
          </span>
        );
      case "PAID": 
        return (
          <span className="inline-flex items-center border border-black bg-[#22C55E] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            Lunas
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center border border-black bg-zinc-500 text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-black font-sans">
      
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Bon & Utang</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Kelola bon/utang belanja pelanggan</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5 stroke-[2.5px]" />
              Catat Bon Baru
            </button>
          </DialogTrigger>
          <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">CATAT UTANG BARU</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Nama Pelanggan *</label>
                <input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Nama pelanggan..."
                  className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">No. HP (Opsional)</label>
                <input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Jumlah Utang *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  placeholder="Contoh: bon beras 5kg, belanja mingguan..."
                  className="w-full p-2 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                />
              </div>
            </div>
            <DialogFooter className="gap-2.5 pt-4">
              <button 
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleAdd} 
                disabled={isSubmitting}
                className="flex-1 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Piutang */}
        <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Total Piutang</p>
          <p className="text-xl font-black mt-1 font-mono text-[#1E3FCF]">
            {formatRupiah(debts.reduce((s, d) => s + Number(d.amount), 0))}
          </p>
        </div>

        {/* Sudah Dibayar */}
        <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Sudah Dibayar</p>
          <p className="text-xl font-black mt-1 font-mono text-[#22C55E]">
            {formatRupiah(debts.reduce((s, d) => s + Number(d.paidAmount || 0), 0))}
          </p>
        </div>

        {/* Sisa Piutang */}
        <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Sisa Belum Dibayar</p>
          <p className="text-xl font-black mt-1 font-mono text-[#EF4444]">
            {formatRupiah(totalOutstanding)}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        
        {/* Card Header & Filters */}
        <div className="p-4 border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-black text-sm uppercase tracking-wider text-black">DAFTAR BON PELANGGAN</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5px]" />
              <input
                placeholder="Cari pelanggan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border-2 border-black bg-white font-bold text-black focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs w-full sm:w-60"
              />
            </div>
            
            {/* Status Select Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs cursor-pointer w-full sm:w-48"
            >
              <option value="all">Semua Status</option>
              <option value="UNPAID">Belum Dibayar</option>
              <option value="PARTIAL">Angsuran</option>
              <option value="PAID">Lunas</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-10 bg-zinc-200 rounded-none border border-black/10" />
              ))}
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 p-6">
              <Wallet className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
              <p className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                {debts.length === 0 ? "Belum ada catatan bon" : "Tidak ada bon yang cocok"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[3px] border-black bg-zinc-50">
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Pelanggan</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Kontak</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Total Utang</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Dibayar</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Sisa</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Status</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Invoice</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Tanggal</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredDebts.map((debt) => {
                  const remaining = Number(debt.amount) - Number(debt.paidAmount || 0);
                  return (
                    <tr key={debt.id} className="border-b-2 border-black/10 hover:bg-zinc-50/50">
                      <td className="p-3 text-xs font-bold uppercase text-black border-r border-black/10">{debt.customerName}</td>
                      <td className="p-3 text-xs font-bold text-zinc-500 border-r border-black/10">{debt.customerPhone || "-"}</td>
                      <td className="p-3 text-xs font-mono font-bold text-right text-zinc-700 border-r border-black/10">{formatRupiah(Number(debt.amount))}</td>
                      <td className="p-3 text-xs font-mono font-bold text-right text-zinc-700 border-r border-black/10">{formatRupiah(Number(debt.paidAmount || 0))}</td>
                      <td className="p-3 text-xs font-mono font-black text-right border-r border-black/10">
                        <span className={remaining > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}>
                          {formatRupiah(remaining)}
                        </span>
                      </td>
                      <td className="p-3 text-xs border-r border-black/10">{statusBadge(debt.status)}</td>
                      <td className="p-3 text-xs font-mono text-zinc-500 border-r border-black/10">
                        {debt.transaction?.invoiceNumber || "-"}
                      </td>
                      <td className="p-3 text-xs font-mono font-bold text-right text-zinc-500 border-r border-black/10">{formatDateTime(debt.createdAt)}</td>
                      <td className="p-3 text-right">
                        {debt.status !== "PAID" && (
                          <button
                            onClick={() => {
                              setPayingDebt(debt);
                              setPaymentAmount("");
                              setIsPayOpen(true);
                            }}
                            className="px-3 py-1.5 border-2 border-black bg-[#FFD400] text-black font-black uppercase text-[10px] rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe140] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
                          >
                            Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">BAYAR ANGSURAN UTANG</DialogTitle>
          </DialogHeader>
          {payingDebt && (
            <div className="space-y-4 pt-2">
              <div className="border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-zinc-600">
                  <span>Nama Pelanggan</span>
                  <span className="font-black">{payingDebt.customerName}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase text-black">
                  <span>Sisa Tagihan</span>
                  <span className="font-black text-[#EF4444] font-mono">
                    {formatRupiah(Number(payingDebt.amount) - Number(payingDebt.paidAmount || 0))}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black block">Jumlah Pembayaran</label>
                <input
                  type="number"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                  autoFocus
                />
              </div>

              {paymentAmount && (
                <div className="flex justify-between text-xs font-black uppercase text-black border-t border-dashed border-black/20 pt-2">
                  <span>Sisa Setelah Bayar</span>
                  <span className="font-mono text-[#1E3FCF]">
                    {formatRupiah(
                      Math.max(0, Number(payingDebt.amount) - Number(payingDebt.paidAmount || 0) - parseFloat(paymentAmount))
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2.5 pt-4">
            <button 
              onClick={() => setIsPayOpen(false)}
              className="flex-1 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Batal
            </button>
            <button 
              onClick={handlePay} 
              disabled={isPaying || !paymentAmount}
              className="flex-1 py-2.5 border-2 border-black bg-[#22C55E] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPaying ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}