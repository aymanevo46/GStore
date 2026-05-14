"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr'; // نستخدم عميل المتصفح

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // إنشاء العميل
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // تسجيل الدخول باستخدام Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
      setIsLoading(false);
    } else {
      router.push("/admin"); 
      router.refresh(); // ضروري لتحديث حالة الـ Middleware
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#050505] flex items-center justify-center font-cairo px-4 relative overflow-hidden w-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E8FF00] rounded-full blur-[150px] opacity-[0.05] pointer-events-none z-0"></div>

      <div className="bg-[#161616] border border-white/5 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#E8FF00] rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-6">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">تسجيل دخول الإدارة</h1>
          <p className="text-gray-500 mt-2 text-sm">من فضلك أدخل بيانات الاعتماد للوصول للوحة التحكم</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-center font-bold text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-3.5 w-5 h-5 text-gray-600" />
              <input 
                type="email" 
                required
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white outline-none focus:border-[#E8FF00] transition-colors"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-3.5 w-5 h-5 text-gray-600" />
              <input 
                type="password" 
                required
                suppressHydrationWarning
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white outline-none focus:border-[#E8FF00] transition-colors text-left"
                dir="ltr"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button disabled={isLoading} type="submit" className="w-full bg-[#E8FF00] hover:bg-white text-black py-3.5 rounded-xl font-black text-lg transition-colors mt-4 disabled:opacity-50">
            {isLoading ? "جاري التحقق..." : "دخول للوحة التحكم"}
          </button>
        </form>
      </div>
    </div>
  );
}