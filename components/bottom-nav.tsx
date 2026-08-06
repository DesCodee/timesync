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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-ios-dark/90 backdrop-blur-md border-t border-ios-separator dark:border-white/10 z-50">
      <div className="mx-auto max-w-md flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1"
            >
              <item.icon
                size={24}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "transition-colors",
                  isActive ? "text-black dark:text-white" : "text-ios-gray"
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  isActive ? "text-black dark:text-white font-medium" : "text-ios-gray"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-black dark:bg-white rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
