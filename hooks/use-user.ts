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
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("name, email").eq("user_id", user.id).single();
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

  return { user, profile, loading };
}
