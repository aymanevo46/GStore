"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

// 1. تعريف واجهات TypeScript بدلاً من any
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  productsCount: number;
}

interface LowStockProduct {
  id: string;
  name_ar: string;
  category: string;
  stock_quantity: number;
  images: string[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalRevenue: 0, productsCount: 0 });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);

      // 1. جلب الإحصائيات (رقم واحد فقط) عبر الـ RPC بدلاً من سحب كل الطلبات
      const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats');
      
      if (!statsError && statsData) {
        setStats({
          totalRevenue: statsData.totalRevenue,
          totalOrders: statsData.totalOrders,
          productsCount: statsData.productsCount,
        });
      } else {
        console.error("Error fetching stats:", statsError);
      }

      // 2. جلب المنتجات التي قاربت على النفاد فقط (stock_quantity <= 5) لتخفيف الحمل
      const { data: lowStockData, error: lowStockError } = await supabase
        .from("products")
        .select("id, name_ar, category, stock_quantity, images") // جلب الحقول المطلوبة فقط
        .lte("stock_quantity", 5)
        .order("stock_quantity", { ascending: true }); // ترتيب من الأقل للأكثر

      if (!lowStockError && lowStockData) {
        setLowStockProducts(lowStockData as LowStockProduct[]);
      }

      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-bold">جاري تحميل البيانات...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <h1 className="text-3xl font-black text-white">نظرة عامة</h1>

      {/* كروت الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-14 h-14 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-bold mb-1">إجمالي المبيعات الفعالة</p>
            <p className="text-2xl font-black text-white">{stats.totalRevenue.toLocaleString()} <span className="text-sm text-gray-500">ج.م</span></p>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-bold mb-1">إجمالي الطلبات</p>
            <p className="text-2xl font-black text-white">{stats.totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-14 h-14 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-bold mb-1">المنتجات المعروضة</p>
            <p className="text-2xl font-black text-white">{stats.productsCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* قائمة النواقص */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            نواقص المخزن (مطلوب شراءها)
          </h2>
          <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold">
            {lowStockProducts.length} منتجات
          </span>
        </div>
        
        {lowStockProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-bold">المخزن ممتلئ، لا توجد نواقص حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#050505]">
                <tr>
                  <th className="p-4 text-sm text-gray-400 font-bold">اسم المنتج</th>
                  <th className="p-4 text-sm text-gray-400 font-bold">القسم</th>
                  <th className="p-4 text-sm text-gray-400 font-bold">الكمية المتبقية</th>
                  <th className="p-4 text-sm text-gray-400 font-bold">حالة المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lowStockProducts.map(product => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name_ar} className="w-10 h-10 rounded bg-[#050505] border border-white/5 object-contain p-1" />
                      {product.name_ar}
                    </td>
                    <td className="p-4 text-gray-400 text-sm uppercase">{product.category}</td>
                    <td className="p-4 font-black text-white text-lg">{product.stock_quantity}</td>
                    <td className="p-4">
                      {product.stock_quantity === 0 ? (
                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">نفدت الكمية</span>
                      ) : (
                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">قارب على النفاذ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}