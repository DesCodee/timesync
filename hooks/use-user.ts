"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type Profile = { name: string; email: string };

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
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
    return () => { mounted = false; };
  }, []);

  return { user, profile, loading };
}
