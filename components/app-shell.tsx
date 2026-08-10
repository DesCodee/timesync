"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Clock, FolderKanban, BarChart3, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const items = [
    { href: "/", icon: Home, label: "Сегодня" },
    { href: "/tasks", icon: CheckSquare, label: "Задачи" },
    { href: "/focus", icon: Clock, label: "Фокус" },
    { href: "/projects", icon: FolderKanban, label: "Проекты" },
    { href: "/analytics", icon: BarChart3, label: "Аналитика" },
    { href: "/account", icon: Settings, label: "Настройки" },
  ];

  async function logout() { 
    await supabase.auth.signOut(); 
    router.push("/auth"); 
  }

  return (
    <div className="min-h-screen bg-ios-bg dark:bg-ios-dark">
      {/* Desktop: flex row */}
      <div className="hidden md:flex min-h-screen">
        <aside className="flex flex-col w-64 bg-white dark:bg-ios-card-dark border-r border-ios-separator/30 p-4">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <Clock size={18} className="text-white dark:text-black" />
            </div>
            <span className="font-bold text-lg">TimeSync</span>
          </div>
          <nav className="flex-1 space-y-1">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-black text-white dark:bg-white dark:text-black" : "text-ios-gray hover:bg-black/5 dark:hover:bg-white/10"}`}>
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ios-gray hover:bg-black/5 dark:hover:bg-white/10 transition-colors mt-4">
            <LogOut size={18} />
            Выйти
          </button>
        </aside>
        <main className="flex-1 p-8 max-w-5xl mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile: stack with bottom nav */}
      <div className="md:hidden min-h-screen pb-20">
        <div className="p-4">
          {children}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-ios-card-dark border-t border-ios-separator/30 flex items-center justify-around z-50">
          {items.slice(0,5).map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-2 ${active ? "text-black dark:text-white" : "text-ios-gray"}`}>
                <item.icon size={20} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
