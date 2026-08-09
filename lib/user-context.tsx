"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type UserCtx = {
  user: any;
  profile: any;
  loading: boolean;
};

const UserContext = createContext<UserCtx>({ user: null, profile: null, loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", u.id).single();
        const fallbackName = u.user_metadata?.name || u.email?.split("@")[0] || "User";
        setProfile(data ? { ...data, name: data.name || fallbackName } : { name: fallbackName, email: u.email });
      }
      setLoading(false);
    }
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user, profile, loading }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
