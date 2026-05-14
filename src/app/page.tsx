"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "../lib/supabase";
import {
  Search, ShoppingBag, Heart, ShoppingCart, Zap,
  ChevronRight, ChevronLeft, Globe, X, Plus, Minus,
  Trash2, Rocket, ShieldCheck, CreditCard, RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "../lib/cartStore";

export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  name_ru: string;
  price: number;
  category: string;
  images: string[] | null;
  stock_quantity: number;
}

type LangType = "ar" | "en" | "ru";

// ==================== قاموس الترجمات ====================
const translations = {
  ar: {
    storeName: "GSTORE",
    search: "ابحث عن بروتين، كرياتين...",
    cart: "السلة",
    heroBadge: "أقوى عروض الموسم",
    heroTitle1: "فورمتك الصح",
    heroTitle2: "بتبدأ من هنا.",
    heroDesc: "مكملات أصلية 100%، أسرع توصيل، وتقدر تستلم طلبك وأنت جاي تتمرن في الجيم!",
    shopNow: "تسوق الآن",
    features: [
      { title: "توصيل سريع", sub: "خلال 24-48 ساعة" },
      { title: "منتجات أصلية 100%", sub: "مضمونة ومعتمدة" },
      { title: "دفع آمن", sub: "كاش أو أونلاين" },
      { title: "إرجاع مجاني", sub: "خلال 1 يوم" },
    ],
    featureIcons: ["🚀", "🛡️", "💳", "🔄"],
    categories: ["الكل", "البروتين", "الكرياتين", "الطاقة", "ملابس"],
    newArrivals: "وصل حديثاً",
    viewAll: "عرض الكل",
    outOfStock: "نفدت الكمية",
    emptyState: "لا توجد منتجات متاحة حالياً.",
    currency: "ج.م",
    emptyCart: "السلة فارغة حالياً",
    checkout: "إتمام الطلب",
    total: "الإجمالي",
    loading: "جاري تحميل المنتجات...",
    footerRights: "جميع الحقوق محفوظة",
    footerContact: "للتواصل: ",
    by: "by",
  },
  en: {
    storeName: "GSTORE",
    search: "Search protein, creatine...",
    cart: "Cart",
    heroBadge: "Season's Best Deals",
    heroTitle1: "Your Perfect Shape",
    heroTitle2: "Starts Here.",
    heroDesc: "100% authentic supplements, fast delivery, and gym pickup available!",
    shopNow: "Shop Now",
    features: [
      { title: "Fast Delivery", sub: "Within 24-48 hrs" },
      { title: "100% Authentic", sub: "Certified Products" },
      { title: "Secure Payment", sub: "Cash or Online" },
      { title: "Free Returns", sub: "Within 1 day" },
    ],
    featureIcons: ["🚀", "🛡️", "💳", "🔄"],
    categories: ["All", "Protein", "Creatine", "Energy", "Clothes"],
    newArrivals: "New Arrivals",
    viewAll: "View All",
    outOfStock: "Out of Stock",
    emptyState: "No products available.",
    currency: "EGP",
    emptyCart: "Your cart is empty",
    checkout: "Checkout",
    total: "Total",
    loading: "Loading products...",
    footerRights: "All Rights Reserved",
    footerContact: "Contact: ",
    by: "by",
  },
  ru: {
    storeName: "GSTORE",
    search: "Поиск протеина...",
    cart: "Корзина",
    heroBadge: "Лучшие предложения",
    heroTitle1: "Твоя форма",
    heroTitle2: "Начинается здесь.",
    heroDesc: "Оригинальные добавки, быстрая доставка и самовывоз из зала!",
    shopNow: "В магазин",
    features: [
      { title: "Быстрая доставка", sub: "24-48 часов" },
      { title: "100% Оригинал", sub: "Сертифицировано" },
      { title: "Оплата", sub: "Наличными или онлайн" },
      { title: "Возврат", sub: "1 день" },
    ],
    featureIcons: ["🚀", "🛡️", "💳", "🔄"],
    categories: ["Все", "Протеин", "Креатин", "Энергия", "Одежда"],
    newArrivals: "Новинки",
    viewAll: "Смотреть все",
    outOfStock: "Нет в наличии",
    emptyState: "Товаров нет.",
    currency: "EGP",
    emptyCart: "Корзина пуста",
    checkout: "Оформить заказ",
    total: "Итого",
    loading: "Загрузка...",
    footerRights: "Все права защищены",
    footerContact: "Контакты: ",
    by: "от",
  },
};

const categoryKeys = ["all", "protein", "creatine", "energy", "clothes"];

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const currentLang = (resolvedParams?.lang as LangType) || "ar";
  const isRTL = currentLang === "ar";
  const t = translations[currentLang] || translations.ar;

  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  const { items, addItem, removeItem, updateQuantity, getTotal } = useCartStore();

  // الحل السحري لتجنب خطأ Hydration مع السلة
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data) setProducts(data);
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const displayedProducts = activeCategory === 0 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === categoryKeys[activeCategory]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
      style={{ fontFamily: "'Cairo', sans-serif" }}
      className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-[#E8FF00] selection:text-black w-full"
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.12; }
        }
        .glow-bg { animation: pulse-glow 4s ease-in-out infinite; }
      `}</style>

      {/* ── Ambient glow ── */}
      <div
        className="glow-bg fixed top-[-80px] w-[500px] h-[500px] bg-[#E8FF00] rounded-full blur-[160px] pointer-events-none z-0"
        style={{ [isRTL ? "right" : "left"]: "-80px" }}
      />

      {/* ════════════════════════════════════════
          CART SIDEBAR (محسنة للموبايل)
      ════════════════════════════════════════ */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <aside
        className="fixed top-0 h-full w-full sm:w-[380px] bg-[#0d0d0d] border-[#ffffff0d] z-[70] shadow-2xl flex flex-col transition-transform duration-300"
        style={{
          [isRTL ? "left" : "right"]: 0,
          borderWidth: "0 1px",
          transform: isCartOpen
            ? "translateX(0)"
            : isRTL
            ? "translateX(-100%)"
            : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#ffffff0d] bg-[#161616]">
          <h2 className="text-lg font-black flex items-center gap-2 text-[#E8FF00]">
            <ShoppingBag className="w-5 h-5" />
            {t.cart} ({isMounted ? items.length : 0})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 hide-scrollbar">
          {!isMounted ? (
             <div className="flex flex-col items-center justify-center h-full text-[#444] gap-4 mt-16">
               <RefreshCcw className="w-8 h-8 animate-spin opacity-20" />
             </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#444] gap-4 mt-16">
              <ShoppingCart className="w-14 h-14 opacity-20" />
              <p className="font-bold">{t.emptyCart}</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 items-center bg-[#161616] p-3 rounded-2xl border border-[#ffffff08]"
              >
                <div className="w-14 h-14 bg-[#050505] rounded-xl flex items-center justify-center shrink-0 border border-[#ffffff08]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-white">
                    {item.name}
                  </p>
                  <p className="text-[#E8FF00] font-black text-sm">
                    {item.price} {t.currency}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 bg-[#050505] w-fit px-2 py-1 rounded-lg border border-[#ffffff08]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-[#777] hover:text-white p-1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="text-[#777] hover:text-white disabled:opacity-30 p-1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#444] hover:text-red-500 transition-colors p-2 shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {isMounted && items.length > 0 && (
          <div className="p-5 bg-[#161616] border-t border-[#ffffff0d]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#888] font-bold">{t.total}</span>
              <span className="text-2xl font-black text-[#E8FF00]">
                {getTotal()} <span className="text-sm text-[#555]">{t.currency}</span>
              </span>
            </div>
            <Link
              href={`/checkout?lang=${currentLang}`}
              className="flex items-center justify-center gap-2 w-full bg-[#E8FF00] hover:bg-white text-black py-4 rounded-xl font-black text-lg transition-colors shadow-[0_0_20px_rgba(232,255,0,0.15)]"
            >
              {t.checkout}
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Link>
          </div>
        )}
      </aside>

      {/* ════════════════════════════════════════
          NAVBAR (متجاوب مع الموبايل)
      ════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-[#ffffff08] bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <Link href={`/?lang=${currentLang}`} className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E8FF00] rounded-xl flex items-center justify-center shrink-0 -rotate-6">
              <span className="text-black font-black text-[16px] sm:text-[18px]">G</span>
            </div>
            <span className="text-[20px] sm:text-[22px] font-black text-white tracking-[2px]">
              {t.storeName}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* اللغات */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#161616] border border-[#ffffff0d] rounded-full px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black">
              <Globe className="w-3.5 h-3.5 text-[#555] hidden sm:block" />
              {(["ar", "en", "ru"] as LangType[]).map((lang, i) => (
                <span key={lang} className="flex items-center gap-1 sm:gap-1.5">
                  {i > 0 && <span className="text-[#333]">|</span>}
                  <Link
                    href={`?lang=${lang}`}
                    className={`hover:text-white transition-colors uppercase no-underline ${currentLang === lang ? 'text-[#E8FF00]' : 'text-[#555]'}`}
                  >
                    {lang}
                  </Link>
                </span>
              ))}
            </div>

            {/* السلة */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#161616] border border-[#ffffff0d] hover:border-[#E8FF00] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-sm transition-colors group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:text-[#E8FF00] transition-colors" />
              <span className="hidden sm:inline">{t.cart}</span>
              <span
                className="absolute -top-2 bg-[#E8FF00] text-black text-[11px] font-black w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] flex items-center justify-center rounded-full border-2 border-[#050505]"
                style={{ [isRTL ? "left" : "right"]: "-8px" }}
              >
                {isMounted ? items.length : 0}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          MAIN
      ════════════════════════════════════════ */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-white/5 rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-12 mb-8 sm:mb-10 relative overflow-hidden">
          <div
            className="absolute w-[250px] sm:w-[300px] h-[250px] sm:h-[300px] bg-[#E8FF00] rounded-full blur-[100px] pointer-events-none opacity-5"
            style={{ top: "-80px", [isRTL ? "left" : "right"]: "-80px" }}
          />

          <div className={`flex items-center gap-6 sm:gap-8 flex-col md:flex-row ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <div className={`relative z-10 flex-1 w-full text-center ${isRTL ? "md:text-right" : "md:text-left"}`}>
              <div className={`inline-flex items-center gap-2 text-[#E8FF00] bg-[#E8FF00]/10 text-[12px] sm:text-[13px] font-bold px-4 py-2 rounded-full mb-4 sm:mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Zap className="w-4 h-4 fill-[#E8FF00]" />
                {t.heroBadge}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-[52px] font-black leading-[1.3] md:leading-[1.2] mb-3 sm:mb-4">
                {t.heroTitle1}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF00] to-white">
                  {t.heroTitle2}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#888] leading-[1.8] sm:leading-[1.9] mb-6 sm:mb-7 max-w-[400px] mx-auto md:mx-0">
                {t.heroDesc}
              </p>

              <a
                href="#products-grid"
                className={`inline-flex items-center justify-center gap-2 bg-[#E8FF00] text-black w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-base hover:scale-105 transition-transform no-underline ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {t.shopNow}
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </a>
            </div>

            <div className="hidden md:flex shrink-0 w-[200px] h-[200px] rounded-full items-center justify-center relative bg-[#161616] border border-white/5">
              <div className="absolute inset-[-2px] rounded-full pointer-events-none bg-gradient-to-br from-[#E8FF00]/25 to-transparent" />
              <span className="text-[80px] select-none">💪</span>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 bg-[#161616] border border-white/5 rounded-[20px] p-4 sm:p-6 mb-8 sm:mb-10">
          {t.features.map((feat, idx) => (
            <div key={idx} className={`flex items-center gap-2.5 sm:gap-3 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 text-lg sm:text-xl bg-[#E8FF00]/10">
                {t.featureIcons[idx]}
              </div>
              <div>
                <p className="text-[11px] sm:text-[13px] font-black text-white mb-0.5">{feat.title}</p>
                <p className="text-[9px] sm:text-[11px] text-[#666]">{feat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORIES FILTER */}
        <div className={`flex gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar pb-3 mb-6 sm:mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
          {t.categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-all border ${
                activeCategory === i
                  ? "bg-[#E8FF00] text-black border-[#E8FF00]"
                  : "bg-[#161616] text-[#777] border-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TITLE SECTION */}
        <div id="products-grid" className={`flex items-center justify-between mb-5 sm:mb-6 scroll-mt-24 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="text-[18px] sm:text-[22px] font-black flex items-center gap-2 sm:gap-2.5">
            {t.newArrivals}
            <span className="w-2 h-2 rounded-full bg-[#E8FF00] animate-pulse" />
          </span>
          <button className="text-[11px] sm:text-[13px] font-bold flex items-center gap-1 text-[#555] hover:text-white transition-colors">
            {t.viewAll}
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* ── PRODUCTS GRID ── */}
        {isLoading ? (
          <div className="text-center py-20 font-bold text-[#444]">{t.loading}</div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20 rounded-[24px] bg-[#0a0a0a] border border-white/5">
            <p className="text-base sm:text-lg font-bold text-[#555]">{t.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayedProducts.map((product: Product) => {
              const productName = product[`name_${currentLang}` as keyof Product] as string;
              const inCart = isMounted && items.some((i) => i.id === product.id);
              const isOOS = product.stock_quantity <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-[#0a0a0a] border border-white/5 hover:border-[#E8FF00]/30 hover:-translate-y-1 rounded-[22px] p-3 flex flex-col transition-all duration-300 group"
                >
                  <div className="bg-[#161616] rounded-2xl h-[180px] sm:h-[200px] flex items-center justify-center relative overflow-hidden mb-3">
                    <button
                      className="absolute top-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-black/50 border border-white/5 text-white hover:text-red-500 transition-colors z-10"
                      style={{ [isRTL ? "right" : "left"]: "10px" }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>

                    <span
                      className="absolute top-2.5 bg-black/50 border border-white/5 text-[#aaa] text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full z-10"
                      style={{ [isRTL ? "left" : "right"]: "10px" }}
                    >
                      {product.category}
                    </span>

                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png"}
                      alt={productName}
                      className="w-full h-full object-contain p-4 sm:p-5 transition-transform duration-500 group-hover:scale-110"
                    />

                    {isOOS && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/75 backdrop-blur-[2px]">
                        <span className="bg-red-600 border-2 border-red-900 font-black text-white text-[11px] sm:text-[13px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl -rotate-12">
                          {t.outOfStock}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`px-1.5 pb-1 flex-1 flex flex-col justify-between ${isRTL ? "text-right" : "text-left"}`}>
                    <h3 className="font-bold text-[14px] sm:text-[15px] text-white mb-3 truncate" title={productName}>
                      {productName}
                    </h3>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] sm:text-[11px] text-[#444] line-through mb-0.5">
                          {(product.price * 1.2).toFixed(0)} {t.currency}
                        </div>
                        <div className="text-[20px] sm:text-[22px] font-black text-[#E8FF00] leading-none">
                          {product.price} <span className="text-[10px] sm:text-[11px] font-normal text-[#555]">{t.currency}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addItem({
                          id: product.id,
                          name: productName,
                          price: product.price,
                          image: product.images?.[0] || "",
                          quantity: 1,
                          stock: product.stock_quantity,
                        })}
                        disabled={isOOS || inCart}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                          inCart 
                            ? "bg-green-600 border-green-600 text-white cursor-not-allowed" 
                            : isOOS 
                            ? "bg-[#161616] border-white/5 text-white opacity-40 cursor-not-allowed" 
                            : "bg-[#161616] border-white/5 text-white hover:bg-[#E8FF00] hover:text-black hover:border-[#E8FF00]"
                        }`}
                      >
                        {inCart ? <span className="text-xs sm:text-sm font-black">✔</span> : <ShoppingCart className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════
          FOOTER (متوافق مع الـ 3 لغات والموبايل)
      ════════════════════════════════════════ */}
      <footer className="mt-12 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        {/* إضاءة خفيفة في الخلفية */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[50px] bg-[#E8FF00] blur-[80px] opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 relative z-10">
          
          {/* حقوق المتجر */}
          <div className="text-[#555] text-xs sm:text-sm font-bold order-2 md:order-1 text-center">
            © {new Date().getFullYear()} {t.storeName} — {t.footerRights}
          </div>

          {/* كبسولة شركة البرمجيات */}
          <div className="flex items-center bg-[#161616] border border-white/5 rounded-full p-1.5 shadow-lg hover:border-white/10 transition-colors order-1 md:order-2 w-full sm:w-auto justify-center">
            
            {/* رابط الواتساب */}
            <a 
              href="https://wa.me/201117013603" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 no-underline"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors mt-0.5">
                <span className="hidden sm:inline">{t.footerContact}</span><span className="text-[#E8FF00] font-mono tracking-wider">01117013603</span>
              </span>
            </a>

            {/* خط فاصل */}
            <div className="w-px h-5 bg-white/10 mx-1 sm:mx-2"></div>

            {/* اسم الشركة واللوجو (صورة) */}
            <div className="flex items-center gap-2 sm:gap-2.5 px-1 sm:px-2">
              <p className="text-white font-black tracking-widest text-[9px] sm:text-[10px] uppercase m-0 leading-none mt-0.5">
                {t.by} <span className="text-[#E8FF00]">ELFIQEY</span>
              </p>
              
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-black border border-white/10 shrink-0">
                <img 
                  src="/flogo.png"
                  alt="Elfiqey Softwares" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/100x100/111/E8FF00?text=E";
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}