"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, Tags, FileDown, X } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  buyPrice: z.coerce.number().min(0, "Harga beli tidak boleh negatif"),
  sellPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif"),
  minStock: z.coerce.number().min(0, "Min stok tidak boleh negatif"),
  imageUrl: z.string().optional().nullable(),
});

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  category: { id: string; name: string };
  imageUrl?: string | null;
}

interface Category {
  id: string;
  name: string;
}

const getPastelColor = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("makan")) return "bg-orange-100";
  if (name.includes("minum")) return "bg-blue-100";
  if (name.includes("snack") || name.includes("cemil")) return "bg-yellow-100";
  if (name.includes("kebutuhan") || name.includes("sembako")) return "bg-green-100";
  if (name.includes("obat") || name.includes("sehat")) return "bg-purple-100";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      categoryId: "",
      unit: "pcs",
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 5,
      imageUrl: "",
    },
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      toast.error("Gagal memuat kategori");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, categoryFilter]);

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success(editingProduct ? "Produk diperbarui" : "Produk ditambahkan");
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset({ name: "", categoryId: "", unit: "pcs", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 5, imageUrl: "" });
      fetchProducts();
    } catch (error) {
      toast.error(editingProduct ? "Gagal memperbarui produk" : "Gagal menambah produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setValue("name", product.name);
    form.setValue("categoryId", product.category.id);
    form.setValue("unit", product.unit);
    form.setValue("buyPrice", product.buyPrice);
    form.setValue("sellPrice", product.sellPrice);
    form.setValue("stock", product.stock);
    form.setValue("minStock", product.minStock);
    form.setValue("imageUrl", product.imageUrl || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Produk dihapus");
      setDeleteId(null);
      fetchProducts();
    } catch (error) {
      toast.error("Gagal menghapus produk");
    }
  };

  const openDeleteDialog = (id: string) => setDeleteId(id);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error("Gagal");
      toast.success("Kategori ditambahkan");
      setNewCategoryName("");
      fetchCategories();
    } catch {
      toast.error("Gagal menambah kategori");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error("Gagal");
      toast.success("Kategori diperbarui");
      setNewCategoryName("");
      setEditingCategory(null);
      fetchCategories();
    } catch {
      toast.error("Gagal memperbarui kategori");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      const res = await fetch(`/api/categories/${deleteCategoryId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal");
      }
      toast.success("Kategori dihapus");
      setDeleteCategoryId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus kategori");
    }
  };

  return (
    <div className="space-y-6 text-black font-sans">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Produk</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Kelola stok, harga, dan kategori</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => window.open("/api/reports/export?type=products", "_blank")}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <FileDown className="h-4.5 w-4.5 stroke-[2.5px]" />
            Export Excel
          </button>
          
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-[#FFD400] text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe140] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
                <Tags className="h-4.5 w-4.5 stroke-[2.5px]" />
                Kelola Kategori
              </button>
            </DialogTrigger>
            <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-md">
              <DialogHeader>
                <DialogTitle className="font-black text-base uppercase tracking-wider text-black">
                  {editingCategory ? "EDIT KATEGORI" : "KELOLA KATEGORI"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <input
                    placeholder={editingCategory ? "Nama kategori baru..." : "Nama kategori..."}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        editingCategory ? handleUpdateCategory() : handleAddCategory();
                      }
                    }}
                    className="flex-1 p-2 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                  />
                  <button 
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    className="px-4 py-2 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    {editingCategory ? "Simpan" : "Tambah"}
                  </button>
                  {editingCategory && (
                    <button 
                      onClick={() => { setEditingCategory(null); setNewCategoryName(""); }}
                      className="px-3 py-2 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-2.5 border-2 border-black bg-zinc-50 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <span className="font-bold text-xs uppercase text-black">{cat.name}</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name); }}
                          className="p-1 border border-black bg-[#FFD400] text-black hover:bg-yellow-400 rounded-none cursor-pointer"
                          aria-label="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleteCategoryId(cat.id)}
                          className="p-1 border border-black bg-[#EF4444] text-white hover:bg-red-600 rounded-none cursor-pointer"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-2">
                <button 
                  onClick={() => setIsCategoryDialogOpen(false)}
                  className="w-full py-2 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              form.reset({ name: "", categoryId: "", unit: "pcs", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 5 });
            }
          }}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
                <Plus className="h-4.5 w-4.5 stroke-[2.5px]" />
                Tambah Produk
              </button>
            </DialogTrigger>
            <DialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-black text-lg uppercase tracking-wider text-black">
                  {editingProduct ? "EDIT PRODUK" : "TAMBAH PRODUK"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black block">Nama Produk</label>
                  <input
                    {...form.register("name")}
                    placeholder="Nama produk..."
                    className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                  />
                  {form.formState.errors.name && (
                    <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.name.message as string}</p>
                  )}
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black block">Kategori</label>
                  <select
                    {...form.register("categoryId")}
                    className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                  >
                    <option value="">Pilih kategori...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.categoryId && (
                    <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.categoryId.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-black block">Satuan</label>
                    <input
                      {...form.register("unit")}
                      placeholder="pcs, kg, dus..."
                      className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                    />
                    {form.formState.errors.unit && (
                      <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.unit.message as string}</p>
                    )}
                  </div>

                  {/* Min Stock */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-black block">Min. Batas Stok</label>
                    <input
                      type="number"
                      min="0"
                      {...form.register("minStock")}
                      className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                    />
                    {form.formState.errors.minStock && (
                      <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.minStock.message as string}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Buy Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-black block">Harga Beli (Modal)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register("buyPrice")}
                      className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                    />
                    {form.formState.errors.buyPrice && (
                      <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.buyPrice.message as string}</p>
                    )}
                  </div>

                  {/* Sell Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-black block">Harga Jual</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register("sellPrice")}
                      className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                    />
                    {form.formState.errors.sellPrice && (
                      <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.sellPrice.message as string}</p>
                    )}
                  </div>
                </div>

                {/* Stock Initial */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black block">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    {...form.register("stock")}
                    className="w-full p-2.5 border-2 border-black bg-white text-black font-mono font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                  />
                  {form.formState.errors.stock && (
                    <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.stock.message as string}</p>
                  )}
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-black block">URL Gambar Produk (Opsional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/gambar.jpg"
                    {...form.register("imageUrl")}
                    className="w-full p-2.5 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                  />
                  {form.formState.errors.imageUrl && (
                    <p className="text-[10px] font-black uppercase text-red-600 mt-1">{form.formState.errors.imageUrl.message as string}</p>
                  )}
                </div>

                <DialogFooter className="gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 border-2 border-black bg-[#1E3FCF] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main product card list */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        
        {/* Card Header & Filters */}
        <div className="p-4 border-b-[3px] border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-black text-sm uppercase tracking-wider text-black">DAFTAR PRODUK</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5px]" />
              <input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border-2 border-black bg-white font-bold text-black focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs w-full sm:w-60"
              />
            </div>
            {/* Category Select Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs cursor-pointer w-full sm:w-48"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Content (Product Table) */}
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-10 w-10 bg-zinc-200 rounded-none border border-black/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-1/4" />
                    <div className="h-3 bg-zinc-200 rounded w-1/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 p-6">
              <Package className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
              <p className="text-xs font-black uppercase text-zinc-500 tracking-wider">Belum ada produk</p>
              <p className="text-[10px] text-zinc-400 mt-1">Klik "+ Tambah Produk" untuk mulai menginput</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[3px] border-black bg-zinc-50">
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Nama Produk</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10">Kategori</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Harga Beli</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-right">Harga Jual</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-center">Stok</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-center">Min.</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black border-r border-black/10 text-center">Status</th>
                  <th className="p-3.5 text-xs font-black uppercase tracking-wider text-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLow = product.stock < product.minStock;
                  const pastelBg = getPastelColor(product.category?.name || "Lainnya");
                  return (
                    <tr key={product.id} className="border-b-2 border-black/10 hover:bg-zinc-50/50">
                      <td className="p-3 text-xs font-bold uppercase text-black border-r border-black/10">
                        <div className="flex items-center gap-2">
                          {product.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-8 h-8 object-cover border border-black rounded-none shrink-0"
                            />
                          )}
                          <span className="truncate">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-bold uppercase text-zinc-600 border-r border-black/10">{product.category.name}</td>
                      <td className="p-3 text-xs font-mono font-bold text-right text-zinc-700 border-r border-black/10">{formatRupiah(product.buyPrice)}</td>
                      <td className="p-3 text-xs font-mono font-bold text-right text-[#1E3FCF] border-r border-black/10">{formatRupiah(product.sellPrice)}</td>
                      <td className="p-3 text-xs font-mono font-black text-center text-black border-r border-black/10">{product.stock} {product.unit}</td>
                      <td className="p-3 text-xs font-mono font-bold text-center text-zinc-500 border-r border-black/10">{product.minStock}</td>
                      <td className="p-3 text-center border-r border-black/10">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 border border-black bg-[#EF4444] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            <AlertTriangle className="h-3 w-3 stroke-[2.5px]" />
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center border border-black bg-[#22C55E] text-white px-2 py-0.5 font-black uppercase text-[9px] rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-1.5 border border-black bg-[#FFD400] text-black hover:bg-yellow-400 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                            aria-label="Edit"
                          >
                            <Edit className="h-3.5 w-3.5 stroke-[2px]" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog(product.id)}
                            className="p-1.5 border border-black bg-[#EF4444] text-white hover:bg-red-600 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5 stroke-[2px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Product Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-base uppercase tracking-wider text-black">HAPUS PRODUK?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-zinc-500">
              Tindakan ini tidak bisa dibatalkan. Data produk akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2.5">
            <AlertDialogCancel className="py-2 px-4 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="py-2 px-4 border-2 border-black bg-[#EF4444] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none text-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-base uppercase tracking-wider text-black">HAPUS KATEGORI?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-zinc-500">
              Kategori yang masih memiliki produk tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2.5">
            <AlertDialogCancel className="py-2 px-4 border-2 border-black bg-white text-black font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory} 
              className="py-2 px-4 border-2 border-black bg-[#EF4444] text-white font-black uppercase text-xs rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}