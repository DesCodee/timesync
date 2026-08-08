"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, CheckSquare, Clock, FolderKanban, BarChart3, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();
  const items = [
    { href: "/", icon: Home, label: t("nav", "today") },
    { href: "/tasks", icon: CheckSquare, label: t("nav", "tasks") },
    { href: "/focus", icon: Clock, label: t("nav", "focus") },
    { href: "/projects", icon: FolderKanban, label: t("nav", "projects") },
    { href: "/analytics", icon: BarChart3, label: t("nav", "analytics") },
    { href: "/settings", icon: Settings, label: t("nav", "settings") },
  ];
  async function logout() { await supabase.auth.signOut(); router.push("/auth"); router.refresh(); }
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
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-ios-bg dark:bg-white/10 text-black dark:text-white" : "text-ios-gray hover:text-black dark:hover:text-white"}`}>
              <item.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ios-gray hover:text-brand-red transition-colors mt-auto">
        <LogOut size={18} />
        {t("nav", "logout")}
      </button>
    </aside>
  );
}
