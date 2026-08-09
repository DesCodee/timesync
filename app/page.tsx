"use client";
import { useUser } from "@/lib/user-context";
import Landing from "@/components/landing";
import Dashboard from "@/components/dashboard";

export default function HomePage() {
  const { user, loading } = useUser();
  if (loading) return <main className="min-h-screen flex items-center justify-center bg-ios-bg dark:bg-ios-dark"><div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" /></main>;
  if (!user) return <Landing />;
  return <Dashboard />;
}
