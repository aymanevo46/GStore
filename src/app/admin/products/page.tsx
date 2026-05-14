"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Package, Plus, Minus, Trash2, Edit, X, Save, Image as ImageIcon, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

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
  company?: string;
  origin?: string;
  weight?: string;
  servings?: string;
  flavor?: string;
  description_ar?: string;
  description_en?: string;
  description_ru?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // تحديث الفورم لتشمل كل البيانات الجديدة و 4 صور
  const [formData, setFormData] = useState({
    name_ar: "", name_en: "", name_ru: "",
    price: "", cost_price: "", stock_quantity: "", category: "protein",
    company: "", origin: "", weight: "", servings: "", flavor: "",
    description_ar: "", description_en: "", description_ru: "",
    images: ["", "", "", ""] 
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      name_ar: "", name_en: "", name_ru: "", price: "", cost_price: "", stock_quantity: "", category: "protein",
      company: "", origin: "", weight: "", servings: "", flavor: "",
      description_ar: "", description_en: "", description_ru: "",
      images: ["", "", "", ""] 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    // تظبيط مصفوفة الصور عشان لو المنتج القديم مفيهوش 4 صور
    const loadedImages = ["", "", "", ""];
    if (product.images) {
      product.images.forEach((img, i) => { if (i < 4) loadedImages[i] = img; });
    }

    setFormData({
      name_ar: product.name_ar || "", name_en: product.name_en || "", name_ru: product.name_ru || "",
      price: product.price.toString(), cost_price: product.cost_price.toString(), stock_quantity: product.stock_quantity.toString(),
      category: product.category || "protein",
      company: product.company || "", origin: product.origin || "", weight: product.weight || "",
      servings: product.servings || "", flavor: product.flavor || "",
      description_ar: product.description_ar || "", description_en: product.description_en || "", description_ru: product.description_ru || "",
      images: loadedImages
    });
    setIsModalOpen(true);
  };

  // دالة الرفع المحدثة لتدعم رقم الصورة (Index)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);

    if (uploadError) {
      showToast("حدث خطأ أثناء رفع الصورة", "error");
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);

    // تحديث الصورة في المكان الصحيح داخل المصفوفة
    const newImages = [...formData.images];
    newImages[index] = data.publicUrl;
    setFormData({ ...formData, images: newImages });
    
    setIsUploading(false);
    showToast("تم رفع الصورة بنجاح!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // إزالة الروابط الفارغة من مصفوفة الصور قبل الحفظ
    const validImages = formData.images.filter(img => img.trim() !== "");

    const productData = {
      name_ar: formData.name_ar, name_en: formData.name_en, name_ru: formData.name_ru,
      price: parseFloat(formData.price), cost_price: parseFloat(formData.cost_price),
      stock_quantity: parseInt(formData.stock_quantity), category: formData.category,
      company: formData.company, origin: formData.origin, weight: formData.weight,
      servings: formData.servings, flavor: formData.flavor,
      description_ar: formData.description_ar, description_en: formData.description_en, description_ru: formData.description_ru,
      images: validImages.length > 0 ? validImages : ["https://placehold.co/400x400/111/FFF?text=No+Image"],
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingId);
      if (!error) { showToast("تم تعديل المنتج بنجاح!"); setIsModalOpen(false); fetchProducts(); } 
      else { showToast("حدث خطأ أثناء التعديل", "error"); }
    } else {
      const { error } = await supabase.from("products").insert([productData]);
      if (!error) { showToast("تم إضافة المنتج للمتجر بنجاح!"); setIsModalOpen(false); fetchProducts(); } 
      else { showToast("حدث خطأ أثناء الإضافة", "error"); }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا المنتج نهائياً؟")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) { setProducts(products.filter(p => p.id !== id)); showToast("تم حذف المنتج"); } 
      else { showToast("لا يمكن حذفه لارتباطه بطلبات سابقة", "error"); }
    }
  };

  const updateStock = async (id: string, currentStock: number, addAmount: number) => {
    const newStock = currentStock + addAmount;
    if (newStock < 0) return;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: newStock } : p));
    const { error } = await supabase.from("products").update({ stock_quantity: newStock }).eq("id", id);
    if (error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: currentStock } : p));
      showToast("حدث خطأ في تحديث المخزون", "error");
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-bold">جاري تحميل المنتجات...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
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
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-[#E8FF00]" /> إدارة المنتجات
          </h1>
          <p className="text-gray-500 mt-2 font-bold">لديك {products.length} منتج معروض في المتجر</p>
        </div>
        <button onClick={openAddModal} className="bg-[#E8FF00] text-black hover:bg-white px-6 py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#E8FF00]/10">
          <Plus className="w-5 h-5" /> إضافة منتج جديد
        </button>
      </div>

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
                    <p className="text-xs font-bold text-green-500 mt-1 bg-green-500/10 w-fit px-2 py-0.5 rounded">الربح: {product.price - product.cost_price} ج.م</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3 bg-[#050505] w-fit mx-auto px-2 py-1.5 rounded-lg border border-white/5">
                      <button onClick={() => updateStock(product.id, product.stock_quantity, -1)} className="text-gray-500 hover:text-red-500 p-1"><Minus className="w-4 h-4"/></button>
                      <span className={`text-base font-black w-8 text-center ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-white'}`}>{product.stock_quantity}</span>
                      <button onClick={() => updateStock(product.id, product.stock_quantity, 1)} className="text-gray-500 hover:text-green-500 p-1"><Plus className="w-4 h-4"/></button>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-colors" title="تعديل"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors" title="حذف"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a] shrink-0">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5 text-[#E8FF00]" /> : <Plus className="w-5 h-5 text-[#E8FF00]" />} 
                {editingId ? "تعديل بيانات المنتج" : "إضافة منتج شامل"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1"><X className="w-6 h-6" /></button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 hide-scrollbar">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. الأسماء والأسعار */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-4">
                  <p className="text-sm font-bold text-[#E8FF00] flex items-center gap-2 border-b border-white/5 pb-2"><Package className="w-4 h-4"/> البيانات الأساسية</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الاسم (AR) *</label><input required type="text" value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00]" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الاسم (EN) *</label><input required type="text" dir="ltr" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00] text-left" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الاسم (RU) *</label><input required type="text" dir="ltr" value={formData.name_ru} onChange={(e) => setFormData({...formData, name_ru: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00] text-left" /></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">سعر البيع *</label><input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-[#E8FF00] font-black outline-none focus:border-[#E8FF00]" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">التكلفة *</label><input required type="number" min="0" value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00]" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">المخزون *</label><input required type="number" min="0" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#E8FF00]" /></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">القسم *</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E8FF00]">
                        <option value="protein">البروتين</option><option value="creatine">الكرياتين</option><option value="preworkout">الطاقة</option><option value="clothes">ملابس</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. المواصفات الفنية */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-4">
                  <p className="text-sm font-bold text-[#E8FF00] flex items-center gap-2 border-b border-white/5 pb-2"><Info className="w-4 h-4"/> المواصفات الفنية (اختياري)</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الشركة (Company)</label><input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#E8FF00]" placeholder="Muscle Add"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">المنشأ (Origin)</label><input type="text" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#E8FF00]" placeholder="Egypt"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الوزن (Weight)</label><input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#E8FF00]" placeholder="2160 G"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الجرعات (Servings)</label><input type="text" value={formData.servings} onChange={(e) => setFormData({...formData, servings: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#E8FF00]" placeholder="60 serving"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">النكهة (Flavor)</label><input type="text" value={formData.flavor} onChange={(e) => setFormData({...formData, flavor: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#E8FF00]" placeholder="Chocolate"/></div>
                  </div>
                </div>

                {/* 3. الوصف (Descriptions) */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-4">
                  <p className="text-sm font-bold text-[#E8FF00] flex items-center gap-2 border-b border-white/5 pb-2"><FileText className="w-4 h-4"/> وصف المنتج</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الوصف (عربي)</label><textarea value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#E8FF00] h-24 resize-none" placeholder="اكتب وصف المنتج..."/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الوصف (إنجليزي)</label><textarea dir="ltr" value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#E8FF00] h-24 resize-none text-left" placeholder="Product details..."/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2">الوصف (روسي)</label><textarea dir="ltr" value={formData.description_ru} onChange={(e) => setFormData({...formData, description_ru: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#E8FF00] h-24 resize-none text-left" placeholder="Описание товара..."/></div>
                  </div>
                </div>

                {/* 4. الصور (رفع حتى 4 صور) */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-white/5">
                  <p className="text-sm font-bold text-[#E8FF00] flex items-center gap-2 border-b border-white/5 pb-2 mb-4"><ImageIcon className="w-4 h-4"/> صور المنتج (حتى 4 صور من جهازك)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl p-2">
                        <div className="w-12 h-12 bg-black rounded-lg border border-white/5 shrink-0 flex items-center justify-center overflow-hidden relative group">
                          {formData.images[i] ? (
                            <>
                              <img src={formData.images[i]} alt="Preview" className="w-full h-full object-cover"/>
                              <button type="button" onClick={() => { const newImg = [...formData.images]; newImg[i] = ""; setFormData({...formData, images: newImg}); }} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-white"/></button>
                            </>
                          ) : <span className="text-gray-600 text-xs">{i+1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, i)}
                            disabled={isUploading}
                            className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#E8FF00] file:text-black hover:file:bg-white cursor-pointer disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#0a0a0a] shrink-0">
              <button disabled={isSubmitting || isUploading} form="productForm" type="submit" className="w-full bg-[#E8FF00] hover:bg-white text-black py-4 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? "جاري الحفظ..." : <><Save className="w-5 h-5" /> {editingId ? "تحديث البيانات" : "حفظ المنتج"}</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}