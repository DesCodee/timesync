"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Clock, FolderKanban, BarChart3, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function Sidebar() {
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
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-ios-card-dark border-r border-ios-separator/30 flex-col p-4 z-40">
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
      <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ios-gray hover:bg-black/5 dark:hover:bg-white/10 transition-colors mt-auto">
        <LogOut size={18} />
        Выйти
      </button>
    </aside>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const nav = [
    { href: "/", icon: Home },
    { href: "/tasks", icon: CheckSquare },
    { href: "/focus", icon: Clock },
    { href: "/projects", icon: FolderKanban },
    { href: "/account", icon: Settings },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-ios-card-dark border-t border-ios-separator/30 flex items-center justify-around z-50">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-2 ${active ? "text-black dark:text-white" : "text-ios-gray"}`}>
            <item.icon size={20} />
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="md:hidden w-full min-h-screen relative pb-20">
          {children}
          <BottomNav />
        </div>
        <div className="hidden md:block max-w-5xl mx-auto px-8 py-6 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
