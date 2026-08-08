"use client";

import { useUser } from "@/hooks/use-user";
import Dashboard from "@/components/dashboard";
import Landing from "@/components/landing";
import { SkeletonWidget } from "@/components/skeletons";

export default function HomePage() {
  const { user, loading } = useUser();
  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="grid grid-cols-2 gap-3">
        {[0,1,2,3].map((i) => <SkeletonWidget key={i} />)}
      </div>
    </main>
  );
  if (!user) return <Landing />;
  return <Dashboard />;
}
