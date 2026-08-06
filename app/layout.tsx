"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth";

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-ios-bg dark:bg-ios-dark`}>
        {isAuth ? (
          <div className="min-h-screen">{children}</div>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-64">
              <div className="md:hidden mx-auto max-w-md min-h-screen relative pb-20">
                {children}
                <BottomNav />
              </div>
              <div className="hidden md:block max-w-5xl mx-auto px-8 py-6 min-h-screen">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
