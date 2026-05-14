"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Package, Plus, Minus, Trash2, Edit, X, Save, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

// تعريف الواجهة (Interface) لضمان أمان البيانات (TypeScript)
interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  category: string;
  images: string[];
}

export default function AdminProducts() {
  // الحالات (States) الأساسية
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // حالات النافذة المنبثقة (Modal) والإشعارات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // حالة رفع الصور
  const [isUploading, setIsUploading] = useState(false);

  // بيانات الفورم (Form Data)
  const [formData, setFormData] = useState({
    name_ar: "", name_en: "", name_ru: "",
    price: "", cost_price: "", stock_quantity: "",
    category: "protein", imageUrl: ""
  });

  // دالة عرض الإشعارات
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // دالة جلب المنتجات من قاعدة البيانات
  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // فتح نافذة الإضافة (تفريغ البيانات)
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name_ar: "", name_en: "", name_ru: "", price: "", cost_price: "", stock_quantity: "", category: "protein", imageUrl: "" });
    setIsModalOpen(true);
  };

  // فتح نافذة التعديل (تعبئة البيانات)
  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name_ar: product.name_ar,
      name_en: product.name_en,
      name_ru: product.name_ru,
      price: product.price.toString(),
      cost_price: product.cost_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category,
      imageUrl: product.images[0] || ""
    });
    setIsModalOpen(true);
  };

  // دالة رفع الصورة من الجهاز إلى Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // إنشاء اسم فريد للصورة لمنع التضارب
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    // رفع الصورة للـ Bucket اللي اسمه 'products'
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      showToast("حدث خطأ أثناء رفع الصورة، تأكد من إعدادات الـ Storage", "error");
      setIsUploading(false);
      return;
    }

    // جلب الرابط العام (Public URL) للصورة بعد الرفع
    const { data } = supabase.storage.from('products').getPublicUrl(filePath);

    // حفظ الرابط في الـ State عشان يتبعت للـ Database مع باقي البيانات
    setFormData({ ...formData, imageUrl: data.publicUrl });
    setIsUploading(false);
    showToast("تم رفع الصورة بنجاح!");
  };

  // دالة الحفظ (تستخدم في الإضافة والتعديل)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      name_ar: formData.name_ar,
      name_en: formData.name_en,
      name_ru: formData.name_ru,
      price: parseFloat(formData.price),
      cost_price: parseFloat(formData.cost_price),
      stock_quantity: parseInt(formData.stock_quantity),
      category: formData.category,
      images: [formData.imageUrl || "https://placehold.co/400x400/111/FFF?text=No+Image"],
    };

    if (editingId) {
      // تعديل منتج موجود
      const { error } = await supabase.from("products").update(productData).eq("id", editingId);
      if (!error) {
        showToast("تم تعديل المنتج بنجاح!");
        setIsModalOpen(false);
        fetchProducts(); // جلب البيانات المحدثة
      } else {
        showToast("حدث خطأ أثناء التعديل", "error");
      }
    } else {
      // إضافة منتج جديد
      const { error } = await supabase.from("products").insert([productData]);
      if (!error) {
        showToast("تم إضافة المنتج للمتجر بنجاح!");
        setIsModalOpen(false);
        fetchProducts(); // جلب البيانات المحدثة
      } else {
        showToast("حدث خطأ أثناء الإضافة", "error");
      }
    }
    setIsSubmitting(false);
  };

  // دالة حذف منتج
  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا المنتج نهائياً؟")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
        showToast("تم حذف المنتج");
      } else {
        showToast("لا يمكن حذفه لارتباطه بطلبات سابقة في النظام", "error");
      }
    }
  };

  // دالة تحديث المخزون السريع (Optimistic UI)
  const updateStock = async (id: string, currentStock: number, addAmount: number) => {
    const newStock = currentStock + addAmount;
    if (newStock < 0) return; // منع المخزون من أن يكون بالسالب
    
    // تحديث الواجهة فوراً (Optimistic Update) لعدم إشعار المستخدم بالبطء
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: newStock } : p));

    // إرسال التحديث للقاعدة في الخلفية
    const { error } = await supabase.from("products").update({ stock_quantity: newStock }).eq("id", id);
    
    // إذا فشل التحديث في السيرفر، يتم التراجع عن التحديث الوهمي
    if (error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: currentStock } : p));
      showToast("حدث خطأ في تحديث السيرفر، يرجى إعادة المحاولة", "error");
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-bold">جاري تحميل المنتجات...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* ==================== الإشعارات (Toasts) ==================== */}
      <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        {toast && (
          <div className={`px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#E8FF00] text-black' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        )}
      </div>

      {/* ==================== رأس الصفحة (Header) ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-[#E8FF00]" />
            إدارة المنتجات
          </h1>
          <p className="text-gray-500 mt-2 font-bold">لديك {products.length} منتج معروض في المتجر</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#E8FF00] text-black hover:bg-white px-6 py-3 rounded-xl font-black transition-colors flex items-center gap-2 shadow-lg shadow-[#E8FF00]/10"
        >
          <Plus className="w-5 h-5" /> إضافة منتج جديد
        </button>
      </div>

      {/* ==================== جدول عرض المنتجات ==================== */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#0a0a0a] border-b border-white/5">
              <tr>
                <th className="p-5 text-sm text-gray-400 font-bold">المنتج</th>
                <th className="p-5 text-sm text-gray-400 font-bold">القسم</th>
                <th className="p-5 text-sm text-gray-400 font-bold">الأسعار (بيع / تكلفة)</th>
                <th className="p-5 text-sm text-gray-400 font-bold text-center">المخزون السريع</th>
                <th className="p-5 text-sm text-gray-400 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  
                  <td className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#050505] rounded-xl border border-white/5 p-1 shrink-0">
                      <img src={product.images[0]} alt={product.name_ar} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{product.name_ar}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.name_en}</p>
                    </div>
                  </td>

                  <td className="p-5 text-gray-400 text-sm font-bold uppercase">{product.category}</td>

                  <td className="p-5">
                    <p className="font-black text-[#E8FF00]">{product.price} ج.م <span className="text-xs text-gray-500 font-normal">بيع</span></p>
                    <p className="font-bold text-gray-500 text-sm mt-1">{product.cost_price} ج.م <span className="text-xs text-gray-600 font-normal">تكلفة</span></p>
                    <p className="text-xs font-bold text-green-500 mt-1 bg-green-500/10 w-fit px-2 py-0.5 rounded">
                      الربح: {product.price - product.cost_price} ج.م
                    </p>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3 bg-[#050505] w-fit mx-auto px-2 py-1.5 rounded-lg border border-white/5">
                      <button onClick={() => updateStock(product.id, product.stock_quantity, -1)} className="text-gray-500 hover:text-red-500 p-1"><Minus className="w-4 h-4"/></button>
                      <span className={`text-base font-black w-8 text-center ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-white'}`}>
                        {product.stock_quantity}
                      </span>
                      <button onClick={() => updateStock(product.id, product.stock_quantity, 1)} className="text-gray-500 hover:text-green-500 p-1"><Plus className="w-4 h-4"/></button>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-colors" title="تعديل">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors" title="حذف">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== نافذة إضافة/تعديل منتج (Modal) ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto hide-scrollbar">
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a] sticky top-0 z-10">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5 text-[#E8FF00]" /> : <Plus className="w-5 h-5 text-[#E8FF00]" />} 
                {editingId ? "تعديل بيانات المنتج" : "إضافة منتج للمتجر"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* قسم اللغات */}
              <div className="bg-[#050505] p-5 rounded-2xl border border-white/5">
                <p className="text-sm font-bold text-gray-400 mb-4">🌐 أسماء المنتج باللغات</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">العربية (AR) *</label>
                    <input required type="text" value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">الإنجليزية (EN) *</label>
                    <input required type="text" dir="ltr" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00] text-left" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">الروسية (RU) *</label>
                    <input required type="text" dir="ltr" value={formData.name_ru} onChange={(e) => setFormData({...formData, name_ru: e.target.value})} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00] text-left" />
                  </div>
                </div>
              </div>

              {/* قسم الأسعار والمخزون */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">سعر البيع (ج.م) *</label>
                  <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-[#E8FF00] font-black outline-none focus:border-[#E8FF00]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">سعر التكلفة (ج.م) *</label>
                  <input required type="number" min="0" value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">المخزون *</label>
                  <input required type="number" min="0" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00]" />
                </div>
              </div>

              {/* قسم التصنيف ورفع الصورة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">القسم *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E8FF00]">
                    <option value="protein">البروتين</option>
                    <option value="creatine">الكرياتين</option>
                    <option value="preworkout">الطاقة (Pre-workout)</option>
                    <option value="clothes">ملابس رياضية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">صورة المنتج (من الجهاز)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#E8FF00] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#E8FF00] file:text-black hover:file:bg-white cursor-pointer disabled:opacity-50" 
                    />
                    {isUploading && (
                      <span className="absolute left-4 top-3 text-xs text-[#E8FF00] animate-pulse font-bold">جاري الرفع...</span>
                    )}
                  </div>
                  {/* عرض معاينة للصورة المرفوعة */}
                  {formData.imageUrl && (
                    <div className="mt-3 w-16 h-16 rounded-xl border border-white/10 bg-[#050505] p-1 shadow-lg">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* زر الإرسال (Submit) */}
              <div className="pt-4 border-t border-white/5">
                <button disabled={isSubmitting || isUploading} type="submit" className="w-full bg-[#E8FF00] hover:bg-white text-black py-4 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? "جاري الحفظ..." : <><Save className="w-5 h-5" /> {editingId ? "تحديث البيانات" : "حفظ المنتج"}</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}