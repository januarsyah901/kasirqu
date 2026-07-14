"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Printer,
  X,
  Ban,
  Barcode,
  Coffee,
  Pizza,
  Cookie,
  ShoppingBag,
  Box,
  Activity,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  unit: string;
  sellPrice: number;
  stock: number;
  minStock: number;
  category: { name: string };
  imageUrl?: string | null;
}

interface CartItem {
  productId: string;
  name: string;
  unit: string;
  sellPrice: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

interface TransactionResult {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  createdAt: string;
}

const getPastelColor = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("makan")) return "bg-orange-100";
  if (name.includes("minum")) return "bg-blue-100";
  if (name.includes("snack") || name.includes("cemil")) return "bg-yellow-100";
  if (name.includes("kebutuhan") || name.includes("sembako")) return "bg-green-100";
  if (name.includes("obat") || name.includes("sehat")) return "bg-purple-100";
  // fallback based on name hash
  const hash = categoryName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "bg-blue-100",
    "bg-orange-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-purple-100",
    "bg-pink-100",
  ];
  return colors[hash % colors.length];
};

const getProductIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("minum")) return <Coffee className="h-8 w-8 text-blue-600 stroke-[2.5px]" />;
  if (name.includes("makan")) return <Pizza className="h-8 w-8 text-orange-600 stroke-[2.5px]" />;
  if (name.includes("snack") || name.includes("cemil")) return <Cookie className="h-8 w-8 text-yellow-600 stroke-[2.5px]" />;
  if (name.includes("kebutuhan") || name.includes("sembako")) return <ShoppingBag className="h-8 w-8 text-green-600 stroke-[2.5px]" />;
  if (name.includes("obat") || name.includes("sehat")) return <Activity className="h-8 w-8 text-purple-600 stroke-[2.5px]" />;
  return <Box className="h-8 w-8 text-zinc-600 stroke-[2.5px]" />;
};

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [createDebt, setCreateDebt] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=500").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || categoriesData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaymentOpen(false);
        setIsReceiptOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "F9") {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentOpen(true);
      }
      if (e.key === "F5") {
        e.preventDefault();
        toast.info("Transaksi disimpan ke draf (Simulasi)");
      }
      if (e.key === "F7") {
        e.preventDefault();
        if (transaction) handlePrint();
        else toast.error("Belum ada transaksi selesai untuk dicetak");
      }
      if (e.key === "F6") {
        e.preventDefault();
        toast.info("Transaksi ditunda (Simulasi)");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, transaction]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category.name === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          toast.error(`Stok ${product.name} tidak cukup`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.sellPrice - item.discount,
              }
            : item
        );
      }
      if (product.stock < 1) {
        toast.error(`Stok ${product.name} habis`);
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          sellPrice: Number(product.sellPrice),
          quantity: 1,
          discount: 0,
          subtotal: Number(product.sellPrice),
        },
      ];
    });
  }, []);

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && newQty > product.stock) {
      toast.error(`Stok ${product.name} tidak cukup`);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQty, subtotal: newQty * item.sellPrice - item.discount }
          : item
      )
    );
  };

  const updateDiscount = (productId: string, disc: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, discount: disc, subtotal: item.quantity * item.sellPrice - disc }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = parseFloat(discount || "0");
  const total = subtotal - totalDiscount;
  const paid = parseFloat(paidAmount || "0");
  const change = paid - total;

  const handlePayment = async () => {
    if (cart.length === 0) return;
    if (!paidAmount || paid < total) {
      toast.error("Uang diterima kurang");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            discount: item.discount,
          })),
          discount: totalDiscount,
          paidAmount: paid,
          customerName: customerName || undefined,
          createDebt: createDebt && !customerName ? false : createDebt,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      const data = await res.json();
      setTransaction(data);
      setIsPaymentOpen(false);
      setIsReceiptOpen(true);
      setCart([]);
      setPaidAmount("");
      setDiscount("");
      setCustomerName("");
      setCreateDebt(false);
      
      // Refresh products to get updated stock
      const productsRes = await fetch("/api/products?limit=500");
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);
      toast.success(`Transaksi ${data.invoiceNumber} berhasil`);
    } catch (err: any) {
      toast.error(err.message || "Transaksi gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="border-[3px] border-black bg-[#FFD400] text-black font-black uppercase px-6 py-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm tracking-widest">
          Memuat Data...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-6.5rem)] overflow-hidden text-black font-sans">
      {/* Left: Product Grid & Controls */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Top bar: Search & Scan */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[2.5px]" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Cari produk... (Ctrl+K)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-[3px] border-black bg-white font-bold text-black placeholder-zinc-500 focus:outline-none focus:bg-zinc-50 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm"
              autoFocus
            />
          </div>
          <button 
            onClick={() => toast.info("Barcode scanner siap (Simulasi)")}
            className="flex items-center gap-2 px-5 py-3 border-[3px] border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            <Barcode className="h-5 w-5 stroke-[2.5px]" />
            SCAN
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "px-4 py-2 border-2 border-black font-black uppercase text-[10px] tracking-wider rounded-none transition-all cursor-pointer whitespace-nowrap",
              categoryFilter === "all"
                ? "bg-[#22C55E] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            )}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.name)}
              className={cn(
                "px-4 py-2 border-2 border-black font-black uppercase text-[10px] tracking-wider rounded-none transition-all cursor-pointer whitespace-nowrap",
                categoryFilter === cat.name
                  ? "bg-[#22C55E] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentProducts.map((product) => {
              const pastelBg = getPastelColor(product.category?.name || "");
              const isLowStock = product.stock <= Number(product.minStock || 5);
              const isOut = product.stock <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOut}
                  className={cn(
                    "flex flex-col border-[3px] border-black bg-white text-left transition-all rounded-none overflow-hidden select-none",
                    isOut
                      ? "opacity-60 cursor-not-allowed bg-zinc-100"
                      : "cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                  )}
                >
                  {/* Category colored header with icon OR image */}
                  <div className="h-20 w-full relative border-b-2 border-black overflow-hidden flex items-center justify-center bg-zinc-100 shrink-0">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={cn("w-full h-full flex items-center justify-center", pastelBg)}>
                        {getProductIcon(product.category?.name || "")}
                      </div>
                    )}
                  </div>
                  {/* Name and Stock */}
                  <div className="p-3 flex-1 flex flex-col justify-between bg-white min-h-[4.5rem]">
                    <p className="font-bold text-xs uppercase text-black line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <p className={cn(
                      "text-[9px] font-black uppercase mt-1.5",
                      isOut ? "text-red-600" : isLowStock ? "text-amber-600" : "text-zinc-500"
                    )}>
                      Stok: {product.stock} {product.unit} {isOut && "(HABIS)"}
                    </p>
                  </div>
                  {/* Price Banner */}
                  <div className="bg-[#1E3FCF] border-t-2 border-black text-white font-black text-[11px] text-center py-2 uppercase tracking-wider">
                    {formatRupiah(product.sellPrice)}
                  </div>
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full border-[3px] border-dashed border-black bg-white p-12 text-center text-sm font-bold uppercase text-zinc-500">
                Produk tidak ditemukan
              </div>
            )}
          </div>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between border-[3px] border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-1.5 border-2 border-black bg-white text-black font-black uppercase text-[10px] rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          >
            ‹ Prev
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center border-2 border-black font-black text-xs rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer",
                    currentPage === pageNum
                      ? "bg-[#22C55E] text-white"
                      : "bg-white text-black hover:bg-zinc-100"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-1.5 border-2 border-black bg-white text-black font-black uppercase text-[10px] rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          >
            Next ›
          </button>
        </div>

      </div>

      {/* Right: Cart Panel */}
      <div className="w-full xl:w-[380px] flex flex-col border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none h-full overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-4 border-b-[3px] border-black flex items-center justify-between bg-white shrink-0">
          <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="h-4.5 w-4.5 text-black stroke-[2.5px]" />
            KERANJANG ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-black bg-[#EF4444] text-white font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-4 border-[3px] border-dashed border-zinc-300 bg-white">
              <ShoppingCart className="h-10 w-10 mb-2 stroke-[2px] text-zinc-300" />
              <p className="text-xs font-black uppercase text-zinc-400 tracking-wider">Belum ada item</p>
              <p className="text-[10px] text-zinc-400 text-center mt-1">Klik produk di katalog untuk menambahkan</p>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.productId} 
                className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-xs uppercase text-black truncate flex-1">{item.name}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 border-2 border-black bg-[#EF4444] text-white hover:bg-red-600 rounded-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    <X className="h-3 w-3 stroke-[2.5px]" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[11px] font-bold text-zinc-600">
                    {formatRupiah(item.sellPrice)}/{item.unit}
                  </span>
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6.5 w-6.5 border-2 border-black bg-white text-black font-black flex items-center justify-center hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none cursor-pointer"
                    >
                      <Minus className="h-3 w-3 stroke-[2.5px]" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6.5 w-6.5 border-2 border-black bg-white text-black font-black flex items-center justify-center hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none cursor-pointer"
                    >
                      <Plus className="h-3 w-3 stroke-[2.5px]" />
                    </button>
                  </div>
                </div>
                
                {/* Item Discount & Subtotal */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-dashed border-black/10">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase text-zinc-500">Potongan:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.discount || ""}
                      onChange={(e) => updateDiscount(item.productId, parseFloat(e.target.value) || 0)}
                      className="h-6 w-20 px-1.5 text-xs border-2 border-black bg-white font-mono font-bold focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <p className="font-black text-xs text-[#22C55E]">{formatRupiah(item.subtotal)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary */}
        <div className="border-t-[3px] border-black p-4 space-y-3 bg-white shrink-0">
          <div className="flex justify-between text-[11px] font-black uppercase text-zinc-600">
            <span>Subtotal</span>
            <span className="font-mono font-black">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-black uppercase text-zinc-600">
            <span>Diskon Global</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="h-7 w-28 px-2 text-xs text-right font-mono border-2 border-black bg-white font-black focus:outline-none"
              placeholder="0"
            />
          </div>
          
          {/* TOTAL BANNER */}
          <div className="border-[3px] border-black bg-[#22C55E] text-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none flex justify-between items-center select-none">
            <span className="font-black text-[11px] uppercase tracking-wider">TOTAL AKHIR</span>
            <span className="text-lg font-black font-mono">{formatRupiah(total)}</span>
          </div>
          
          {/* Pos Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1.5">
            <button
              onClick={() => setIsPaymentOpen(true)}
              disabled={cart.length === 0}
              className="col-span-2 flex items-center justify-center gap-2 py-3 border-[3px] border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <CreditCard className="h-4.5 w-4.5 stroke-[2.5px]" />
              BAYAR
            </button>
            <button
              onClick={() => toast.info("Draf transaksi berhasil disimpan (Simulasi)")}
              className="flex items-center justify-center gap-1 py-2 border-2 border-black bg-white text-black font-black uppercase text-[10px] rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              SIMPAN
            </button>
            <button
              onClick={() => {
                if (transaction) handlePrint();
                else toast.error("Belum ada transaksi selesai untuk dicetak");
              }}
              className="flex items-center justify-center gap-1 py-2 border-2 border-black bg-white text-black font-black uppercase text-[10px] rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              CETAK
            </button>
            <button
              onClick={() => toast.info("Transaksi ditunda (Simulasi)")}
              className="col-span-2 flex items-center justify-center gap-1 py-2 border-2 border-black bg-white text-black font-black uppercase text-[10px] rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              TUNDA TRANSAKSI
            </button>
          </div>
        </div>

      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">PEMBAYARAN</DialogTitle>
            <DialogDescription className="text-xs font-bold text-zinc-500">Rincian transaksi dan input uang kasir</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            
            {/* Totals Box */}
            <div className="border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-2.5">
              <div className="flex justify-between text-xs font-bold uppercase text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatRupiah(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-red-500">
                  <span>Diskon</span>
                  <span className="font-mono">-{formatRupiah(totalDiscount)}</span>
                </div>
              )}
              <div className="border-t border-dashed border-black/25 my-1.5" />
              <div className="flex justify-between font-black text-sm uppercase text-black">
                <span>Total Akhir</span>
                <span className="text-emerald-600 font-mono text-base">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Input Paid Amount */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-black">Uang Diterima</label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                className="w-full p-2.5 border-2 border-black bg-white text-black font-black font-mono focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                autoFocus
              />
            </div>

            {/* Change Result */}
            {paid > 0 && (
              <div className="border-2 border-black bg-white p-3 rounded-none flex justify-between items-center">
                <span className="text-xs font-black uppercase text-zinc-600">Kembalian</span>
                <span className={cn(
                  "font-black text-sm font-mono",
                  change >= 0 ? "text-emerald-600" : "text-red-500"
                )}>
                  {formatRupiah(Math.abs(change))}
                  {change < 0 && " (UANG KURANG)"}
                </span>
              </div>
            )}

            <div className="border-t border-dashed border-black/20 my-2" />

            {/* Customer Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-black">Nama Pelanggan (Opsional)</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan..."
                className="w-full p-2 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
              />
            </div>

            {/* Catat Bon/Utang Checkbox */}
            {customerName && change < 0 && (
              <label className="flex items-center gap-2 text-xs font-black uppercase text-black cursor-pointer select-none mt-2">
                <input
                  type="checkbox"
                  checked={createDebt}
                  onChange={(e) => setCreateDebt(e.target.checked)}
                  className="w-4 h-4 border-2 border-black accent-black rounded-none cursor-pointer"
                />
                Catat sebagai utang (Bon)
              </label>
            )}
          </div>
          
          <DialogFooter className="gap-2.5 pt-4">
            <button 
              onClick={() => setIsPaymentOpen(false)}
              className="flex-1 py-2 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Batal
            </button>
            <button 
              onClick={handlePayment} 
              disabled={isSubmitting || paid < total} 
              className="flex-1 py-2 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? "Memproses..." : `Proses Bayar`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-sm border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black">
          <DialogHeader>
            <DialogTitle className="text-center font-black text-base uppercase tracking-widest text-black border-b-[3px] border-black pb-3">STRUK PEMBAYARAN</DialogTitle>
          </DialogHeader>
          
          {transaction && (
            <div className="space-y-4 text-xs font-mono">
              <div className="text-center space-y-1">
                <p className="font-black text-sm uppercase">TOKO SIDOMORO</p>
                <p className="text-zinc-600">{transaction.invoiceNumber}</p>
                <p className="text-zinc-500 text-[10px]">{new Date(transaction.createdAt).toLocaleString("id-ID")}</p>
              </div>

              <div className="border-t border-dashed border-black/30 my-2" />

              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <span className="flex-1 text-black font-bold uppercase text-[11px]">{item.name} x{item.quantity}</span>
                      <span className="font-black font-mono">{formatRupiah(item.sellPrice * item.quantity)}</span>
                    </div>
                  ))
                ) : (
                  // if printing from previous success state
                  <p className="text-zinc-400 text-center py-2">Item terlampir</p>
                )}
              </div>

              <div className="border-t border-dashed border-black/30 my-2" />

              <div className="space-y-1.5 font-bold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatRupiah(transaction.subtotal)}</span>
                </div>
                {transaction.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Diskon</span>
                    <span className="font-mono">-{formatRupiah(transaction.discount)}</span>
                  </div>
                )}
                <div className="border-t border-black/10 my-1" />
                <div className="flex justify-between font-black text-sm text-black">
                  <span>Total Akhir</span>
                  <span className="font-mono">{formatRupiah(transaction.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunai</span>
                  <span className="font-mono">{formatRupiah(transaction.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Kembalian</span>
                  <span className="font-mono">{formatRupiah(transaction.changeAmount)}</span>
                </div>
              </div>

              <div className="text-center border-t-2 border-dashed border-black/30 pt-3 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                <p>Terima kasih telah berbelanja</p>
                <p>Layanan Pelanggan KasirQu</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2.5 pt-3">
            <button 
              onClick={handlePrint} 
              className="flex-1 py-2 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" />
              Cetak
            </button>
            <button 
              onClick={() => setIsReceiptOpen(false)} 
              className="flex-1 py-2 border-2 border-black bg-[#22C55E] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Selesai
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}