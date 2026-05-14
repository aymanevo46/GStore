"use client";

import { useState, useEffect, Suspense } from "react";
import { useCartStore, CartItem } from "../../lib/cartStore";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Truck, Wallet, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

// ==================== قاموس الترجمات ====================
type LangType = "ar" | "en" | "ru";

const translations = {
  ar: {
    backToStore: "الرجوع للمتجر",
    checkoutSecurely: "إتمام الطلب بأمان",
    contactInfo: "بيانات التواصل",
    fullName: "الاسم بالكامل *",
    namePlaceholder: "محمد أحمد",
    whatsappNumber: "رقم الهاتف (واتساب) *",
    phonePlaceholder: "01000000000",
    deliveryMethod: "طريقة الاستلام",
    homeDelivery: "توصيل للمنزل",
    shippingFeeLabel: "مصاريف شحن",
    gymPickup: "استلام من الجيم",
    freeShipping: "مجاناً بدون مصاريف",
    fullAddress: "العنوان بالتفصيل *",
    addressPlaceholder: "المحافظة، المنطقة، الشارع، رقم العمارة والدور...",
    paymentMethodTitle: "طريقة الدفع",
    cod: "الدفع عند الاستلام",
    cashToCourier: "ادفع كاش للمندوب",
    instapay: "تحويل إنستاباي",
    fastAndSecure: "سريع وآمن",
    instapayInstruction: "الرجاء التحويل على رقم إنستاباي الآتي:",
    refNumber: "رقم العملية (Reference Number) *",
    refPlaceholder: "مثال: 123456789",
    submitOrder: "تأكيد الطلب الآن",
    sendingOrder: "جاري الإرسال...",
    orderSummary: "ملخص الطلب",
    currency: "ج.م",
    subtotal: "المجموع الفرعي",
    shippingCost: "مصاريف الشحن",
    free: "مجاناً",
    finalTotal: "الإجمالي النهائي",
    termsAgreed: "بالضغط على 'تأكيد الطلب' أنت توافق على شروط وسياسات المتجر.",
    successTitle: "تم استلام طلبك بنجاح! 🎉",
    successDesc1: "يا بطل، طلبك دلوقتي قيد المراجعة في سيستم ",
    successDesc2: ". هنتواصل معاك في أقرب وقت لتأكيد الشحن وتفاصيل الاستلام.",
    backToShopping: "العودة للتسوق",
    errorMsg: "حدث خطأ! قد تكون الكمية نفدت أثناء إتمام الطلب، أو هناك مشكلة في الاتصال.",
    footerRights: "جميع الحقوق محفوظة",
    footerContact: "للتواصل: ",
    by: "by",
  },
  en: {
    backToStore: "Back to Store",
    checkoutSecurely: "Secure Checkout",
    contactInfo: "Contact Information",
    fullName: "Full Name *",
    namePlaceholder: "John Doe",
    whatsappNumber: "Phone Number (WhatsApp) *",
    phonePlaceholder: "01000000000",
    deliveryMethod: "Delivery Method",
    homeDelivery: "Home Delivery",
    shippingFeeLabel: "Shipping fee ",
    gymPickup: "Gym Pickup",
    freeShipping: "Free, no extra fees",
    fullAddress: "Full Address *",
    addressPlaceholder: "City, Region, Street, Building, Floor...",
    paymentMethodTitle: "Payment Method",
    cod: "Cash on Delivery",
    cashToCourier: "Pay cash to the courier",
    instapay: "InstaPay Transfer",
    fastAndSecure: "Fast and secure",
    instapayInstruction: "Please transfer to the following InstaPay number:",
    refNumber: "Reference Number *",
    refPlaceholder: "Example: 123456789",
    submitOrder: "Confirm Order Now",
    sendingOrder: "Sending...",
    orderSummary: "Order Summary",
    currency: "EGP",
    subtotal: "Subtotal",
    shippingCost: "Shipping",
    free: "Free",
    finalTotal: "Total",
    termsAgreed: "By clicking 'Confirm Order', you agree to our terms and policies.",
    successTitle: "Order Received Successfully! 🎉",
    successDesc1: "Champion, your order is now under review in the ",
    successDesc2: " system. We will contact you soon to confirm shipping and delivery details.",
    backToShopping: "Back to Shopping",
    errorMsg: "Error! Items might be out of stock, or there's a connection issue.",
    footerRights: "All Rights Reserved",
    footerContact: "Contact: ",
    by: "by",
  },
  ru: {
    backToStore: "Вернуться в магазин",
    checkoutSecurely: "Оформление заказа",
    contactInfo: "Контактная информация",
    fullName: "Полное имя *",
    namePlaceholder: "Иван Иванов",
    whatsappNumber: "Номер телефона (WhatsApp) *",
    phonePlaceholder: "01000000000",
    deliveryMethod: "Способ доставки",
    homeDelivery: "Доставка на дом",
    shippingFeeLabel: "Доставка",
    gymPickup: "Самовывоз из зала",
    freeShipping: "Бесплатно",
    fullAddress: "Полный адрес *",
    addressPlaceholder: "Город, Район, Улица, Дом, Этаж...",
    paymentMethodTitle: "Способ оплаты",
    cod: "Наличными при доставке",
    cashToCourier: "Оплата курьеру",
    instapay: "Перевод InstaPay",
    fastAndSecure: "Быстро и безопасно",
    instapayInstruction: "Пожалуйста, переведите на следующий номер InstaPay:",
    refNumber: "Номер перевода (Reference) *",
    refPlaceholder: "Пример: 123456789",
    submitOrder: "Подтвердить заказ",
    sendingOrder: "Отправка...",
    orderSummary: "Сумма заказа",
    currency: "EGP",
    subtotal: "Подытог",
    shippingCost: "Доставка",
    free: "Бесплатно",
    finalTotal: "Итого",
    termsAgreed: "Нажимая 'Подтвердить заказ', вы соглашаетесь с нашими условиями.",
    successTitle: "Заказ успешно принят! 🎉",
    successDesc1: "Чемпион, ваш заказ сейчас на рассмотрении в системе ",
    successDesc2: ". Мы скоро свяжемся с вами для подтверждения доставки.",
    backToShopping: "Вернуться к покупкам",
    errorMsg: "Ошибка! Возможно, товар закончился или проблема с сетью.",
    footerRights: "Все права защищены",
    footerContact: "Контакты: ",
    by: "от",
  }
};

// ==================== المكون الداخلي (يحتوي على اللوجيك والـ useSearchParams) ====================
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = (searchParams?.get("lang") as LangType) || "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const storeName = "GSTORE";
  
  const t = translations[lang] || translations.ar;

  const { items, getTotal, clearCart } = useCartStore();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [deliveryType, setDeliveryType] = useState<"home_delivery" | "gym_pickup">("home_delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "instapay">("cod");
  const [instapayRef, setInstapayRef] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ---------- الحل لمنع الـ Hydration Error ----------
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // ----------------------------------------------------

  const shippingFee = deliveryType === "home_delivery" ? 50 : 0;
  const finalTotal = getTotal() + shippingFee;

  useEffect(() => {
    // التأكد من أن المكون تم تحميله وأن السلة فارغة
    if (isMounted && items.length === 0 && !isSuccess) {
      router.push(`/?lang=${lang}`);
    }
  }, [items, router, isSuccess, lang, isMounted]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedItems = items.map((item: CartItem) => ({
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { data, error } = await supabase.rpc('place_new_order', {
        p_customer_name: name,
        p_customer_phone: phone,
        p_customer_address: deliveryType === "home_delivery" ? address : "استلام من الجيم",
        p_total_amount: finalTotal,
        p_delivery_type: deliveryType,
        p_payment_method: paymentMethod,
        p_instapay_receipt: instapayRef || null,
        p_items: formattedItems
      });

      if (error) {
        console.error("RPC Error:", error);
        throw new Error(error.message);
      }

      clearCart();
      setIsSuccess(true);
      window.scrollTo(0, 0);

    } catch (error: any) {
      console.error("Error placing order:", error);
      alert(t.errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div dir={dir} className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden w-full">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E8FF00] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>

        <div className="bg-[#0A0A0A] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center relative z-10">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">{t.successTitle}</h1>
          <p className="text-gray-400 mb-8 leading-relaxed text-sm">
            {t.successDesc1} <span className="text-[#E8FF00] font-bold">{storeName}</span>{t.successDesc2}
          </p>
          <Link href={`/?lang=${lang}`} className="bg-[#E8FF00] hover:bg-white text-black px-10 py-4 rounded-full font-black transition-colors inline-block shadow-[0_0_30px_rgba(232,255,0,0.2)] hover:scale-105 transform duration-300">
            {t.backToShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-[#020202] text-white font-sans flex flex-col relative w-full">
      <div className="fixed top-0 start-0 w-[500px] h-[500px] bg-[#E8FF00]/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />

      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href={`/?lang=${lang}`} className="flex items-center gap-2 text-gray-400 hover:text-white font-bold transition-colors w-fit">
            {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {t.backToStore}
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E8FF00] rounded-lg flex items-center justify-center shrink-0 -rotate-6">
              <span className="text-black font-black text-sm">G</span>
            </div>
            <span className="text-lg font-black tracking-widest hidden sm:block">{storeName}</span>
          </div>
        </div>
      </header>

      <div className="container max-w-[1200px] mx-auto px-4 md:px-6 pt-10 pb-20 flex-1 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="w-8 h-8 text-[#E8FF00]" />
          <h1 className="text-3xl font-black text-white">{t.checkoutSecurely}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <form onSubmit={handlePlaceOrder} className="w-full lg:w-2/3 space-y-6">
            <div className="bg-[#0A0A0A] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 end-0 w-32 h-32 bg-[#E8FF00]/5 blur-3xl pointer-events-none rounded-full"></div>
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-full bg-[#E8FF00]/10 border border-[#E8FF00]/20 flex items-center justify-center text-[#E8FF00] text-sm">1</span>
                {t.contactInfo}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">{t.fullName}</label>
                  <input required suppressHydrationWarning type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#E8FF00] focus:bg-white/5 transition-all" placeholder={t.namePlaceholder} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">{t.whatsappNumber}</label>
                  <input required suppressHydrationWarning type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#E8FF00] focus:bg-white/5 transition-all text-start" dir="ltr" placeholder={t.phonePlaceholder} />
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-full bg-[#E8FF00]/10 border border-[#E8FF00]/20 flex items-center justify-center text-[#E8FF00] text-sm">2</span>
                {t.deliveryMethod}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <label className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all ${deliveryType === 'home_delivery' ? 'border-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/5 bg-[#111] hover:border-white/20'}`}>
                  <input type="radio" name="delivery" checked={deliveryType === 'home_delivery'} onChange={() => setDeliveryType('home_delivery')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${deliveryType === 'home_delivery' ? 'bg-[#E8FF00] text-black' : 'bg-white/5 text-gray-400'}`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black ${deliveryType === 'home_delivery' ? 'text-[#E8FF00]' : 'text-white'}`}>{t.homeDelivery}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.shippingFeeLabel}</p>
                  </div>
                </label>

                <label className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all ${deliveryType === 'gym_pickup' ? 'border-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/5 bg-[#111] hover:border-white/20'}`}>
                  <input type="radio" name="delivery" checked={deliveryType === 'gym_pickup'} onChange={() => setDeliveryType('gym_pickup')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${deliveryType === 'gym_pickup' ? 'bg-[#E8FF00] text-black' : 'bg-white/5 text-gray-400'}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black ${deliveryType === 'gym_pickup' ? 'text-[#E8FF00]' : 'text-white'}`}>{t.gymPickup}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.freeShipping}</p>
                  </div>
                </label>
              </div>

              {deliveryType === "home_delivery" && (
                <div className="mt-5 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-xs font-bold text-gray-400 mb-2">{t.fullAddress}</label>
                  <textarea required suppressHydrationWarning value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#E8FF00] focus:bg-white/5 transition-all h-28 resize-none" placeholder={t.addressPlaceholder} />
                </div>
              )}
            </div>

            <div className="bg-[#0A0A0A] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-full bg-[#E8FF00]/10 border border-[#E8FF00]/20 flex items-center justify-center text-[#E8FF00] text-sm">3</span>
                {t.paymentMethodTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 relative z-10">
                <label className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all ${paymentMethod === 'cod' ? 'border-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/5 bg-[#111] hover:border-white/20'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'bg-[#E8FF00] text-black' : 'bg-white/5 text-gray-400'}`}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black ${paymentMethod === 'cod' ? 'text-[#E8FF00]' : 'text-white'}`}>{t.cod}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.cashToCourier}</p>
                  </div>
                </label>

                <label className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all ${paymentMethod === 'instapay' ? 'border-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/5 bg-[#111] hover:border-white/20'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'instapay'} onChange={() => setPaymentMethod('instapay')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'instapay' ? 'bg-[#E8FF00] text-black' : 'bg-[#1e102f] border border-purple-500/20 text-purple-400'}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black ${paymentMethod === 'instapay' ? 'text-[#E8FF00]' : 'text-white'}`}>{t.instapay}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.fastAndSecure}</p>
                  </div>
                </label>
              </div>

              {paymentMethod === "instapay" && (
                <div className="bg-[#150d22] border border-purple-500/30 rounded-2xl p-5 md:p-6 mt-5 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded">IP</span>
                     <p className="text-sm text-purple-300 font-bold m-0">{t.instapayInstruction}</p>
                  </div>
                  <div className="bg-black/50 border border-purple-500/20 rounded-xl p-4 mb-5 text-center">
                     <p className="text-2xl font-black text-white tracking-[0.2em]">01013216092</p>
                  </div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">{t.refNumber}</label>
                  <input required suppressHydrationWarning type="text" dir="ltr" value={instapayRef} onChange={(e) => setInstapayRef(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-purple-500 focus:bg-white/5 transition-all text-start" placeholder={t.refPlaceholder} />
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading || !isMounted} className="w-full lg:hidden bg-[#E8FF00] hover:bg-white text-black py-4 rounded-2xl font-black text-lg transition-colors shadow-[0_0_20px_rgba(232,255,0,0.2)] disabled:opacity-50 mt-8">
              {isLoading ? t.sendingOrder : t.submitOrder}
            </button>
          </form>

          {/* ── ORDER SUMMARY ── */}
          <div className="w-full lg:w-1/3 bg-[#0A0A0A] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl sticky top-28">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-white/5 pb-4">{t.orderSummary}</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
              {isMounted && items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between items-center bg-[#111] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="w-7 h-7 rounded-lg bg-[#222] flex items-center justify-center font-bold text-xs text-white shrink-0">{item.quantity}</span>
                    <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-[180px]" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-black text-[#E8FF00] text-sm shrink-0">{item.price * item.quantity} {t.currency}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#111] rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex justify-between text-gray-400 text-sm font-bold">
                <span>{t.subtotal}</span>
                <span className="text-white">{isMounted ? getTotal() : 0} {t.currency}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm font-bold">
                <span>{t.shippingCost}</span>
                <span className="text-white">{!isMounted ? "..." : shippingFee === 0 ? t.free : `${shippingFee} ${t.currency}`}</span>
              </div>
              <div className="w-full h-px bg-white/10 my-2"></div>
              <div className="flex justify-between text-lg font-black text-white pt-2">
                <span>{t.finalTotal}</span>
                <span className="text-[#E8FF00]">{isMounted ? finalTotal : 0} {t.currency}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={isLoading || !isMounted} className="hidden lg:block w-full mt-6 bg-[#E8FF00] hover:bg-white text-black py-4 rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(232,255,0,0.2)] hover:shadow-[0_0_30px_rgba(232,255,0,0.4)] disabled:opacity-50 hover:-translate-y-1">
              {isLoading ? t.sendingOrder : t.submitOrder}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-4 font-bold">
              {t.termsAgreed}
            </p>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="mt-auto border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[50px] bg-[#E8FF00] blur-[80px] opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="text-[#555] text-sm font-bold order-2 md:order-1">
            © {new Date().getFullYear()} {storeName} — {t.footerRights}
          </div>

          <div className="flex items-center bg-[#161616] border border-white/5 rounded-full p-1.5 shadow-lg hover:border-white/10 transition-colors order-1 md:order-2">
            <a 
              href="https://wa.me/201117013603" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 no-underline"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors mt-0.5">
                <span className="hidden sm:inline">{t.footerContact}</span><span className="text-[#E8FF00] font-mono tracking-wider">01117013603</span>
              </span>
            </a>

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <div className="flex items-center gap-2.5 px-2">
              <p className="text-white font-black tracking-widest text-[10px] uppercase m-0 leading-none mt-0.5">
                {t.by} <span className="text-[#E8FF00]">ELFIQEY</span>
              </p>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-black border border-white/10 shrink-0">
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

// ==================== المكون الرئيسي المجمع ====================
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020202] flex items-center justify-center text-[#E8FF00] font-bold">جاري التحميل...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}