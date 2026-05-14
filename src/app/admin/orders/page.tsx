"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Truck, MapPin, MessageCircle, Wallet, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

// 1. واجهة الطلب (TypeScript)
interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  delivery_type: string;
  payment_method: string;
  instapay_receipt: string | null;
  status: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10; // عدد الطلبات في الصفحة الواحدة

// قائمة الفلاتر لتسهيل البحث
const STATUS_FILTERS = [
  { id: 'all', label: 'جميع الطلبات' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'confirmed', label: 'تم التأكيد' },
  { id: 'out_for_delivery', label: 'جاري التوصيل' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // حالات الـ Pagination والفلترة
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  // حالة الإشعارات
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 2. دالة جلب الطلبات (بالصفحات والفلترة)
  const fetchOrders = async () => {
    setIsLoading(true);

    // بناء الاستعلام (Query)
    let query = supabase.from("orders").select("*", { count: "exact" });

    // تطبيق الفلتر لو الموظف اختار حالة معينة
    if (activeFilter !== 'all') {
      query = query.eq('status', activeFilter);
    }

    // ترتيب وتطبيق الـ Pagination
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setOrders(data as Order[]);
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } else {
      showToast("حدث خطأ في جلب الطلبات", "error");
    }
    
    setIsLoading(false);
  };

  // إعادة جلب البيانات عند تغيير الصفحة أو الفلتر
  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeFilter]);

  // تغيير الحالة والعودة للصفحة الأولى
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1); // لما نغير الفلتر نرجع لأول صفحة
  };

  // 3. تحديث حالة الطلب
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) {
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      showToast("تم تحديث حالة الطلب بنجاح");
    } else {
      showToast("حدث خطأ أثناء تحديث الحالة", "error");
    }
  };

  // 4. دالة الواتساب الذكية
  const openWhatsApp = (order: Order) => {
    let phone = order.customer_phone;
    if (phone.startsWith("0")) phone = "20" + phone.substring(1);

    let message = `أهلاً يا كابتن ${order.customer_name}، معاكم متجر GSTORE 💪\n`;
    message += `طلبك بقيمة ${order.total_amount} ج.م وصلنا بنجاح.\n`;
    
    if (order.payment_method === "instapay") {
      message += `\nعشان نأكد الطلب ونشحنه، برجاء إرسال سكرين شوت لإيصال تحويل إنستاباي 💜`;
    } else if (order.delivery_type === "gym_pickup") {
      message += `\nطلبك هيتجهز وتقدر تستلمه من ريسبشن الجيم وتدفع كاش وقت الاستلام 🏋️‍♂️`;
    } else {
      message += `\nبنتواصل معاك لتأكيد بيانات الشحن، هيوصلك في أسرع وقت 🚀`;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* الإشعارات (Toast) */}
      <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        {toast && (
          <div className={`px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#E8FF00] text-black' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">إدارة الطلبات</h1>
          <p className="text-gray-500 mt-2 font-bold">إجمالي الطلبات: <span className="text-[#E8FF00]">{totalCount}</span> طلب</p>
        </div>

        {/* فلاتر الحالات (Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar bg-[#161616] p-1.5 rounded-xl border border-white/5 w-fit">
          <Filter className="w-4 h-4 text-gray-500 mx-2 shrink-0" />
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeFilter === filter.id 
                  ? 'bg-[#E8FF00] text-black shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[500px]">
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-bold animate-pulse">جاري تحميل الطلبات...</div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <span className="text-4xl mb-4">📭</span>
            <p className="font-bold text-lg">لا توجد طلبات تطابق بحثك حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right">
              <thead className="bg-[#0a0a0a] border-b border-white/5">
                <tr>
                  <th className="p-5 text-sm text-gray-400 font-bold whitespace-nowrap">العميل والتاريخ</th>
                  <th className="p-5 text-sm text-gray-400 font-bold whitespace-nowrap">طريقة التسليم</th>
                  <th className="p-5 text-sm text-gray-400 font-bold whitespace-nowrap">الدفع</th>
                  <th className="p-5 text-sm text-gray-400 font-bold whitespace-nowrap">الإجمالي</th>
                  <th className="p-5 text-sm text-gray-400 font-bold whitespace-nowrap">حالة الطلب</th>
                  <th className="p-5 text-sm text-gray-400 font-bold text-center whitespace-nowrap">تواصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(order => {
                  const date = new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                  
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-white text-base truncate max-w-[150px]" title={order.customer_name}>{order.customer_name}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{order.customer_phone}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{date}</p>
                      </td>

                      <td className="p-5">
                        {order.delivery_type === "home_delivery" ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
                              <Truck className="w-3 h-3" /> شحن
                            </span>
                            <span className="text-[11px] text-gray-500 max-w-[160px] truncate" title={order.customer_address}>
                              {order.customer_address}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
                            <MapPin className="w-3 h-3" /> استلام من الجيم
                          </span>
                        )}
                      </td>

                      <td className="p-5">
                        {order.payment_method === "instapay" ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
                              إنستاباي
                            </span>
                            <span className="text-[11px] text-gray-500 max-w-[120px] truncate" title={order.instapay_receipt || ""}>
                              Ref: {order.instapay_receipt || "N/A"}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-md text-xs font-bold w-fit">
                            <Wallet className="w-3 h-3" /> كاش
                          </span>
                        )}
                      </td>

                      <td className="p-5">
                        <p className="font-black text-[#E8FF00] text-lg leading-none">{order.total_amount}</p>
                        <p className="text-[10px] text-gray-500 mt-1">ج.م</p>
                      </td>

                      <td className="p-5">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`bg-[#050505] border rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer transition-colors ${
                            order.status === 'pending' ? 'text-yellow-500 border-yellow-500/30 focus:border-yellow-500' :
                            order.status === 'confirmed' ? 'text-blue-500 border-blue-500/30 focus:border-blue-500' :
                            order.status === 'ready_for_pickup' ? 'text-orange-500 border-orange-500/30 focus:border-orange-500' :
                            order.status === 'out_for_delivery' ? 'text-indigo-500 border-indigo-500/30 focus:border-indigo-500' :
                            order.status === 'completed' ? 'text-green-500 border-green-500/30 focus:border-green-500' :
                            'text-red-500 border-red-500/30 focus:border-red-500'
                          }`}
                        >
                          <option value="pending">⏳ قيد المراجعة</option>
                          <option value="confirmed">✅ تم التأكيد</option>
                          <option value="ready_for_pickup">🏋️‍♂️ جاهز للاستلام</option>
                          <option value="out_for_delivery">🚚 جاري التوصيل</option>
                          <option value="completed">🎉 مكتمل</option>
                          <option value="cancelled">❌ ملغي</option>
                        </select>
                      </td>

                      <td className="p-5 text-center">
                        <button
                          onClick={() => openWhatsApp(order)}
                          className="inline-flex items-center justify-center w-10 h-10 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 rounded-xl transition-all shadow-[0_0_10px_rgba(37,211,102,0.1)] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]"
                          title="تواصل عبر واتساب"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. شريط الـ Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-[#161616] border border-white/5 rounded-lg text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>

            <span className="text-sm font-bold text-gray-400">
              صفحة <span className="text-[#E8FF00]">{currentPage}</span> من {totalPages}
            </span>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-[#161616] border border-white/5 rounded-lg text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              التالي <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}