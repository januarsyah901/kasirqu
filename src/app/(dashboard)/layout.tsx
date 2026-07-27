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
  MoreHorizontal,
  ChevronUp,
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

const mobilePrimaryNav = [
  { name: "Kasir", href: "/kasir", icon: ShoppingCart },
  { name: "Produk", href: "/produk", icon: Package },
  { name: "Stok", href: "/stok", icon: Package2 },
  { name: "Bon", href: "/bon", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { data: session } = useSession();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "K";
  const username = session?.user?.name || "Kasir 01";

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black font-sans selection:bg-[#FFD400]">
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b-[3px] border-black flex items-center justify-between px-4 md:hidden shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <button
            className="p-2 border-2 border-black bg-[#FFD400] text-black font-bold active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe140] transition-all"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka sidebar menu"
          >
            <Menu className="h-4 w-4 stroke-[2.5px]" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-wider text-black">KASIRQU</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border-2 border-black px-2 py-1 bg-zinc-50 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex h-5 w-5 items-center justify-center border border-black bg-[#1D4ED8] text-white font-black text-[10px]">
              {userInitial}
            </div>
            <span className="font-bold text-[11px] truncate max-w-[80px] text-black">{username}</span>
          </div>
        </div>
      </header>

      {/* Sidebar (Desktop Persistent & Mobile Slide-Over) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] md:w-[200px] bg-white border-r-[3px] border-black transform transition-transform duration-200 md:translate-x-0 flex flex-col justify-between shadow-[4px_0px_0px_0px_rgba(0,0,0,0.15)] md:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b-[3px] border-black bg-white">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-widest text-black">KASIRQU</span>
              </Link>
              <button
                className="md:hidden p-2 border-2 border-black hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px]"
                onClick={() => setSidebarOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="h-4 w-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Sidebar Nav */}
            <nav className="flex-1 space-y-2.5 px-3 py-4 overflow-y-auto">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 md:py-2.5 text-xs font-black uppercase border-2 border-black transition-all rounded-none",
                      isActive
                        ? "bg-[#FFD400] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                        : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 md:h-4 md:w-4 shrink-0 text-black stroke-[2.5px]" />
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
              className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-black uppercase border-2 border-black bg-[#EF4444] text-white hover:bg-red-600 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none cursor-pointer"
            >
              <LogOut className="h-4 w-4 stroke-[2.5px]" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Backdrop overlay for mobile Bottom Sheet "Lainnya" */}
      {moreMenuOpen && (
        <div
          className="fixed inset-0 z-45 bg-black/60 md:hidden"
          onClick={() => setMoreMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Bottom Sheet Menu "Lainnya" */}
      <div
        className={cn(
          "fixed bottom-16 left-0 right-0 z-50 bg-white border-t-[3px] border-x-[3px] border-black p-4 md:hidden transform transition-transform duration-200 rounded-t-xl shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]",
          moreMenuOpen ? "translate-y-0" : "translate-y-[120%]"
        )}
      >
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
          <span className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
            <ChevronUp className="h-4 w-4 stroke-[3px]" />
            Menu Lainnya
          </span>
          <button
            onClick={() => setMoreMenuOpen(false)}
            className="p-1 border-2 border-black bg-zinc-100 text-black hover:bg-zinc-200"
          >
            <X className="h-4 w-4 stroke-[2.5px]" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <Link
            href="/dashboard"
            onClick={() => setMoreMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 p-3 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0",
              pathname === "/dashboard" ? "bg-[#FFD400]" : "bg-white"
            )}
          >
            <LayoutDashboard className="h-4 w-4 stroke-[2.5px]" />
            Dashboard
          </Link>
          <Link
            href="/laporan"
            onClick={() => setMoreMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 p-3 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0",
              pathname === "/laporan" ? "bg-[#FFD400]" : "bg-white"
            )}
          >
            <FileText className="h-4 w-4 stroke-[2.5px]" />
            Laporan
          </Link>
          <Link
            href="/pengaturan"
            onClick={() => setMoreMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 p-3 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0",
              pathname === "/pengaturan" ? "bg-[#FFD400]" : "bg-white"
            )}
          >
            <Settings className="h-4 w-4 stroke-[2.5px]" />
            Pengaturan
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 p-3 text-xs font-black uppercase border-2 border-black bg-[#EF4444] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0"
          >
            <LogOut className="h-4 w-4 stroke-[2.5px]" />
            Keluar
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Persistent at bottom for HP) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t-[3px] border-black flex items-center justify-around px-1 md:hidden shadow-[0px_-2px_0px_0px_rgba(0,0,0,1)]">
        {mobilePrimaryNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMoreMenuOpen(false)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-12 border-2 transition-all rounded-none",
                isActive
                  ? "border-black bg-[#FFD400] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]"
                  : "border-transparent text-zinc-600 hover:text-black"
              )}
            >
              <item.icon className="h-5 w-5 stroke-[2.5px]" />
              <span className="text-[10px] font-black uppercase mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-12 border-2 transition-all rounded-none",
            moreMenuOpen
              ? "border-black bg-[#FFD400] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]"
              : "border-transparent text-zinc-600 hover:text-black"
          )}
        >
          <MoreHorizontal className="h-5 w-5 stroke-[2.5px]" />
          <span className="text-[10px] font-black uppercase mt-0.5 tracking-tight">Lainnya</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-[200px] min-h-screen pb-20 md:pb-6">
        <div className="p-3 sm:p-4 md:p-6 pt-16 md:pt-6">{children}</div>
      </main>
    </div>
  );
}