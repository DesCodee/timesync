"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Home, CheckSquare, Clock, FolderKanban, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const items = [
  { href: "/", icon: Home, label: "Сегодня" },
  { href: "/tasks", icon: CheckSquare, label: "Задачи" },
  { href: "/focus", icon: Clock, label: "Фокус" },
  { href: "/projects", icon: FolderKanban, label: "Проекты" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-ios-card-dark/80 backdrop-blur-lg border-t border-ios-separator/50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 px-2 py-1 ${active ? "text-black dark:text-white" : "text-ios-gray"}`}>
              <item.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={logout} className="flex flex-col items-center gap-0.5 px-2 py-1 text-ios-gray active:text-brand-red transition-colors">
          <LogOut size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Выйти</span>
        </button>
      </div>
    </nav>
  );
}
