"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sun, CheckSquare, Clock, Folder, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

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
  const router = useRouter();
  const supabase = createClient();
  const { profile, loading } = useUser();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  const name = profile?.name || "User";
  const email = profile?.email || "";
  const initial = name.charAt(0).toUpperCase();

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

      <div className="p-4 border-t border-ios-separator dark:border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            {initial}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-ios-gray truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ios-gray hover:bg-ios-bg dark:hover:bg-white/5 transition-colors"
        >
          <LogOut size={20} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
