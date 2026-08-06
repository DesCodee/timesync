"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, CheckSquare, Clock, Folder, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Сегодня", icon: Sun },
  { href: "/tasks", label: "Задачи", icon: CheckSquare },
  { href: "/focus", label: "Фокус", icon: Clock },
  { href: "/projects", label: "Проекты", icon: Folder },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-ios-card-dark border-r border-ios-separator dark:border-white/10 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black dark:bg-white flex items-center justify-center">
            <Clock size={18} className="text-white dark:text-black" />
          </div>
          <span className="text-xl font-bold">TimeSync</span>
        </div>
        <p className="text-xs text-ios-gray mt-1 ml-11">Продуктивность и фокус</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-ios-gray hover:bg-ios-bg dark:hover:bg-white/5"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ios-separator dark:border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            T
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">test</p>
            <p className="text-xs text-ios-gray truncate">test@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
