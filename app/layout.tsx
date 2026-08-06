import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TimeSync",
  description: "Продуктивность и фокус",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-ios-bg dark:bg-ios-dark`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64">
            {/* Мобильный контейнер */}
            <div className="md:hidden mx-auto max-w-md min-h-screen relative pb-20">
              {children}
              <BottomNav />
            </div>
            {/* Десктоп контейнер */}
            <div className="hidden md:block max-w-5xl mx-auto px-8 py-6 min-h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
