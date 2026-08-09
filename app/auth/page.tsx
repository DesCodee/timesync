"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Clock, Mail, Lock, User, ArrowRight, KeyRound } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useTranslation } from "@/hooks/use-translation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { t } = useTranslation();

  useEffect(() => { if (!userLoading && user) router.push("/"); }, [user, userLoading, router]);
  if (userLoading) return <main className="min-h-screen flex items-center justify-center bg-ios-bg dark:bg-ios-dark"><div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" /></main>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    } else if (mode === "register") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError || !data.user) { setError(signUpError?.message || t("auth", "error")); setLoading(false); return; }
      const displayName = name || email.split("@")[0];
      await supabase.auth.updateUser({ data: { name: displayName } });
      await supabase.from("profiles").insert({ user_id: data.user.id, name: displayName, email });
      router.push("/");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/auth" : undefined
      });
      if (error) setError(error.message);
      else setMessage("Check your email for reset link");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-ios-bg dark:bg-ios-dark">
      <div className="w-full max-w-sm space-y-6 animate-scale-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center"><Clock size={32} className="text-white dark:text-black" /></div>
          <h1 className="text-2xl font-bold">TimeSync</h1>
          <p className="text-ios-gray text-sm">{t("auth", "tagline")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up">
          {mode === "register" && <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth", "name")} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" /></div>}
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth", "email")} required className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" /></div>
          {mode !== "forgot" && <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth", "password")} required className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" /></div>}
          {error && <p className="text-sm text-brand-red px-1">{error}</p>}
          {message && <p className="text-sm text-brand-green px-1">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-2xl text-base font-medium active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? t("auth", "loading") : mode === "login" ? t("auth", "submitLogin") : mode === "register" ? t("auth", "submitRegister") : "Send reset link"} {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        <div className="space-y-2 text-center">
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="block w-full text-sm text-ios-gray hover:text-black dark:hover:text-white transition-colors">Forgot password?</button>
              <button onClick={() => { setMode("register"); setError(""); setMessage(""); }} className="block w-full text-sm text-ios-gray hover:text-black dark:hover:text-white transition-colors">{t("auth", "noAccount")}</button>
            </>
          )}
          {mode === "register" && <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="block w-full text-sm text-ios-gray hover:text-black dark:hover:text-white transition-colors">{t("auth", "haveAccount")}</button>}
          {mode === "forgot" && <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="block w-full text-sm text-ios-gray hover:text-black dark:hover:text-white transition-colors">Back to login</button>}
        </div>
      </div>
    </main>
  );
}
