import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// استخدمنا التصدير الافتراضي (default) لضمان توافقه التام مع Vercel
export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // إنشاء عميل Supabase خاص بالسيرفر للتعامل مع الكوكيز
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // جلب بيانات المستخدم الحالية من Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  const path = request.nextUrl.pathname;

  // لو بيحاول يفتح الإدارة وهو مش مسجل دخول في Supabase
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // لو هو مسجل دخول وبيحاول يفتح صفحة الدخول، رجعه للوحة التحكم
  if (path.startsWith('/admin/login') && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};