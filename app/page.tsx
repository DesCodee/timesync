"use client";

import { useUser } from "@/hooks/use-user";
import Dashboard from "@/components/dashboard";
import Landing from "@/components/landing";

export default function HomePage() {
  const { user } = useUser();
  if (!user) return <Landing />;
  return <Dashboard />;
}
