"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Package2,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Penjualan", href: "/kasir", icon: ShoppingCart },
  { name: "Produk", href: "/produk", icon: Package },
  { name: "Stok", href: "/stok", icon: Package2 },
  { name: "Bon (Utang)", href: "/bon", icon: CreditCard },
  { name: "Laporan", href: "/laporan", icon: FileText },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "K";
  const username = session?.user?.name || "Kasir 01";

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black font-sans selection:bg-[#FFD400]">
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 border-2 border-black bg-[#FFD400] text-black font-bold active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe140] transition-all"
        onClick={() => setSidebarOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[200px] bg-white border-r-[3px] border-black transform transition-transform duration-200 md:translate-x-0 flex flex-col justify-between",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b-[3px] border-black bg-white">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-widest text-black">KASIR</span>
              </Link>
              <button
                className="md:hidden p-1.5 border-2 border-black hover:bg-zinc-100"
                onClick={() => setSidebarOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Nav */}
            <nav className="flex-1 space-y-3 px-3 py-4 overflow-y-auto">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-xs font-black uppercase border-2 border-black transition-all rounded-none",
                      isActive
                        ? "bg-[#FFD400] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                        : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-black stroke-[2.5px]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t-[3px] border-black p-3 bg-white">
            <div className="flex items-center gap-2.5 border-2 border-black p-2 bg-zinc-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#1D4ED8] text-white font-black text-sm uppercase rounded-none">
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs truncate text-black">{username}</span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-black">
                  <span className="w-2 h-2 bg-[#22C55E] border border-black rounded-full" />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-black uppercase border-2 border-black bg-[#EF4444] text-white hover:bg-red-600 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none"
            >
              <LogOut className="h-4 w-4 stroke-[2.5px]" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main className="md:ml-[200px] min-h-screen">
        <div className="p-4 md:p-6 pt-16 md:pt-6">{children}</div>
      </main>
    </div>
  );
}