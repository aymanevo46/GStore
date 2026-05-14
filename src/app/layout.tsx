import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

// تحميل الخط بأوزان مختلفة
const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: "GSTORE | المتجر الرياضي",
  description: "أفضل مكملات غذائية في مصر",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-[#020202] text-white`}>
        {children}
      </body>
    </html>
  );
}