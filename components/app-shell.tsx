"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="md:hidden w-full min-h-screen relative pb-24">
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
