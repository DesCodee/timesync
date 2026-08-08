"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type Profile = { name: string; email: string };
type UserContextType = { user: User | null; profile: Profile | null; loading: boolean };

const UserContext = createContext<UserContextType>({ user: null, profile: null, loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from("profiles").select("name, email").eq("user_id", u.id).single();
        if (mounted) setProfile(data);
      }
      if (mounted) setLoading(false);
    }
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
