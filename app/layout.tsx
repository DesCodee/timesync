"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/lib/toast";
import { UserProvider } from "@/lib/user-context";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth";
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const saved = localStorage.getItem("timesync-theme") || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.register('/sw.js').catch(()=>{});
    const head = document.head;
    const addMeta = (name: string, content: string) => {
      if (!head.querySelector(`meta[name="${name}"]`)) {
        const m = document.createElement('meta');
        m.name = name; m.content = content;
        head.appendChild(m);
      }
    };
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'TimeSync');
    addMeta('theme-color', '#000000');
    if (!head.querySelector('link[rel="manifest"]')) {
      const l = document.createElement('link');
      l.rel = 'manifest'; l.href = '/manifest.json';
      head.appendChild(l);
    }
  }, []);

  function applyTheme(t: string) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (t === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
    } else root.classList.add(t);
  }

  useEffect(() => { applyTheme(theme); localStorage.setItem("timesync-theme", theme); }, [theme]);
  useEffect(() => {
    const listener = () => { if (theme === "system") applyTheme("system"); };
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);
    return () => window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
  }, [theme]);

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-ios-bg dark:bg-ios-dark overflow-x-hidden`}>
        <UserProvider>
          <ToastProvider>
            {isAuth ? <div className="min-h-screen">{children}</div> : (
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 md:ml-64">
                  <div className="md:hidden w-full min-h-screen relative pb-24">{children}<BottomNav /></div>
                  <div className="hidden md:block max-w-5xl mx-auto px-8 py-6 min-h-screen">{children}</div>
                </main>
              </div>
            )}
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
