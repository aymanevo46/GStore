"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "../../../../lib/supabase";
import { useCartStore } from "../../../../lib/cartStore";
import { ChevronRight, ChevronLeft, ShoppingCart, Check, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LangType = "ar" | "en" | "ru";

const translations = {
  ar: {
    back: "الرجوع للمتجر",
    addToCart: "إضافة للسلة",
    added: "تمت الإضافة",
    outOfStock: "نفدت الكمية",
    description: "وصف المنتج",
    specs: "المواصفات",
    company: "الشركة:",
    origin: "بلد المنشأ:",
    weight: "الوزن:",
    servings: "الجرعات:",
    flavor: "النكهة:",
    category: "القسم:",
    currency: "ج.م",
    guarantee: "ضمان استرجاع خلال 14 يوم",
    shipping: "توصيل سريع لكل المحافظات"
  },
  en: {
    back: "Back to Store",
    addToCart: "Add to Cart",
    added: "Added",
    outOfStock: "Out of Stock",
    description: "Description",
    specs: "Specifications",
    company: "Company:",
    origin: "Origin:",
    weight: "Weight:",
    servings: "Servings:",
    flavor: "Flavor:",
    category: "Category:",
    currency: "EGP",
    guarantee: "14-Day Money-Back Guarantee",
    shipping: "Fast shipping nationwide"
  },
  ru: {
    back: "В магазин",
    addToCart: "В корзину",
    added: "Добавлено",
    outOfStock: "Нет в наличии",
    description: "Описание",
    specs: "Характеристики",
    company: "Компания:",
    origin: "Страна:",
    weight: "Вес:",
    servings: "Порции:",
    flavor: "Вкус:",
    category: "Категория:",
    currency: "EGP",
    guarantee: "Гарантия возврата 14 дней",
    shipping: "Быстрая доставка"
  }
};

export default function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lang?: string }> }) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const id = resolvedParams.id;
  const lang = (resolvedSearchParams?.lang as LangType) || "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = translations[lang] || translations.ar;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { items, addItem } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchProduct() {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (!error && data) setProduct(data);
      setIsLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#020202] flex items-center justify-center text-[#E8FF00] font-bold">جاري التحميل...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-white"><p>المنتج غير موجود</p><button onClick={() => router.push(`/?lang=${lang}`)} className="mt-4 text-[#E8FF00]">العودة للمتجر</button></div>;
  }

  const productName = product[`name_${lang}`] || product.name_ar;
  const productDesc = product[`description_${lang}`] || product.description_ar;
  const inCart = isMounted && items.some(i => i.id === product.id);
  const isOOS = product.stock_quantity <= 0;

  return (
    <div dir={dir} className="min-h-screen bg-[#020202] text-white font-sans">
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        
        {/* Navigation */}
        <Link href={`/?lang=${lang}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-bold mb-8 transition-colors">
          {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {t.back}
        </Link>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* خلفية مضيئة */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8FF00] rounded-full blur-[150px] opacity-[0.03] pointer-events-none z-0" />

          <div className="flex flex-col lg:flex-row gap-10 relative z-10">
            
            {/* معرض الصور */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="bg-[#111] border border-white/5 rounded-2xl aspect-square flex items-center justify-center p-8 relative">
                {isOOS && <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-black px-3 py-1 rounded-lg z-10">{t.outOfStock}</span>}
                <img src={product.images?.[activeImage] || "/placeholder.png"} alt={productName} className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {product.images?.filter((img: string) => img).map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${activeImage === idx ? "border-[#E8FF00] p-0.5" : "border-white/5 p-2 bg-[#111] hover:border-white/20"}`}>
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <span className="text-[#E8FF00] text-xs font-black uppercase tracking-wider bg-[#E8FF00]/10 px-3 py-1 rounded-full w-fit mb-4">
                {product.category}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{productName}</h1>
              
              <div className="flex items-end gap-3 mb-8 pb-8 border-b border-white/5">
                <span className="text-4xl font-black text-[#E8FF00] leading-none">{product.price}</span>
                <span className="text-lg text-gray-500 font-bold pb-1">{t.currency}</span>
              </div>

              {/* جدول المواصفات السريعة */}
              <div className="bg-[#111] rounded-2xl border border-white/5 p-5 mb-8">
                <h3 className="font-bold text-gray-400 mb-4">{t.specs}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  {product.company && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">{t.company}</span><span className="font-bold text-white">{product.company}</span></div>}
                  {product.origin && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">{t.origin}</span><span className="font-bold text-white">{product.origin}</span></div>}
                  {product.weight && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">{t.weight}</span><span className="font-bold text-white">{product.weight}</span></div>}
                  {product.servings && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">{t.servings}</span><span className="font-bold text-white">{product.servings}</span></div>}
                  {product.flavor && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">{t.flavor}</span><span className="font-bold text-white">{product.flavor}</span></div>}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 text-sm font-bold text-gray-400">
                <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500" /> {t.guarantee}</div>
                <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-[#E8FF00]" /> {t.shipping}</div>
              </div>

              {/* زرار السلة */}
              <button
                onClick={() => addItem({ id: product.id, name: productName, price: product.price, image: product.images?.[0] || "", quantity: 1, stock: product.stock_quantity })}
                disabled={isOOS || inCart || !isMounted}
                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  inCart ? "bg-green-600 text-white cursor-not-allowed" : 
                  isOOS ? "bg-[#111] text-gray-600 cursor-not-allowed" : 
                  "bg-[#E8FF00] hover:bg-white text-black shadow-[0_0_20px_rgba(232,255,0,0.2)] hover:scale-[1.02]"
                }`}
              >
                {inCart ? <><Check className="w-6 h-6" /> {t.added}</> : 
                 isOOS ? <>{t.outOfStock}</> : 
                 <><ShoppingCart className="w-6 h-6" /> {t.addToCart}</>}
              </button>
            </div>
          </div>

          {/* قسم الوصف */}
          {productDesc && (
            <div className="mt-12 pt-8 border-t border-white/5">
              <h2 className="text-xl font-black mb-6 text-[#E8FF00]">{t.description}</h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {productDesc}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}