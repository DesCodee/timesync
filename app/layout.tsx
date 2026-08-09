"use client";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/lib/toast";
import { UserProvider } from "@/lib/user-context";
import { I18nProvider } from "@/lib/i18n/context";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth";
  const [theme, setTheme] = useState("system");
  const [lang, setLang] = useState("ru");

  useEffect(() => {
    const savedTheme = localStorage.getItem("timesync-theme") || "system";
    const savedLang = (localStorage.getItem("timesync-lang") as "ru" | "en") || "ru";
    setTheme(savedTheme);
    setLang(savedLang);
    applyTheme(savedTheme);
    document.documentElement.lang = savedLang;
    document.title = "TimeSync — Tasks, Focus & Habits";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Minimal productivity app for tasks, Pomodoro focus sessions, and daily habits. Dark mode, PWA, offline-first.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Minimal productivity app for tasks, Pomodoro focus sessions, and daily habits. Dark mode, PWA, offline-first.";
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }, []);

  function applyTheme(t: string) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (t === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)).matches) root.classList.add("dark");
    } else root.classList.add(t);
  }

  useEffect(() => { applyTheme(theme); localStorage.setItem("timesync-theme", theme); }, [theme]);
  useEffect(() => {
    const listener = () => { if (theme === "system") applyTheme("system"); };
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);
    return () => window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
  }, [theme]);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-ios-bg dark:bg-ios-dark overflow-x-hidden`}>
        <I18nProvider>
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
        </I18nProvider>
      </body>
    </html>
  );
}
