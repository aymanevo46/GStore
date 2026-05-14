"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { LayoutDashboard, ShoppingCart, Package, LogOut, Menu, X } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🔴 لو إحنا في صفحة تسجيل الدخول، اعرض المحتوى بس من غير القائمة الجانبية
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const menuItems = [
    { name: "نظرة عامة", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "الطلبات", href: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "المنتجات", href: "/admin/products", icon: <Package className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#050505] text-white font-cairo flex">
      {/* الشريط العلوي للموبايل */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#161616] border-b border-white/5 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E8FF00] rounded-lg flex items-center justify-center shrink-0 -rotate-6">
            <span className="text-black font-black text-lg">G</span>
          </div>
          <span className="text-xl font-black text-white tracking-widest">ADMIN</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg text-white hover:bg-[#E8FF00] hover:text-black transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* خلفية الموبايل */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* القائمة الجانبية */}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-[#161616] border-l border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E8FF00] rounded-lg flex items-center justify-center shrink-0 -rotate-6">
              <span className="text-black font-black text-lg">G</span>
            </div>
            <span className="text-xl font-black text-white tracking-widest">ADMIN</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname === item.href ? "bg-[#E8FF00] text-black shadow-lg shadow-[#E8FF00]/10" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-h-screen bg-[#0a0a0a] transition-all duration-300 w-full lg:mr-64 pt-20 lg:pt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}