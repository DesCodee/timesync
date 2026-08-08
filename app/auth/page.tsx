"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Clock, Mail, Lock, User, ArrowRight } from "lucide-react";
import { anim } from "@/lib/anim";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError || !data.user) { setError(signUpError?.message || "Ошибка регистрации"); setLoading(false); return; }
      await supabase.from("profiles").insert({ user_id: data.user.id, name: name || email.split("@")[0], email });
      router.push("/");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ios-bg dark:bg-ios-dark flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm space-y-6 animate-scale-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
            <Clock size={32} className="text-white dark:text-black" />
          </div>
          <h1 className="text-2xl font-bold">TimeSync</h1>
          <p className="text-ios-gray text-sm">Продуктивность и фокус</p>
        </div>

        <form key={isLogin ? "login" : "register"} onSubmit={handleSubmit} className="space-y-4 animate-fade-up">
          {!isLogin && (
            <div className="relative animate-fade-up">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required minLength={6} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" />
          </div>
          {error && <p className="text-brand-red text-sm text-center animate-fade-up">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform">
            {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"} <ArrowRight size={18} />
          </button>
        </form>

        <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="w-full text-center text-sm text-ios-gray py-2 active:scale-95 transition-transform">
          {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}
