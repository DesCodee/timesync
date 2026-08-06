"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Clock } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (tab === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) setError(error.message);
      else router.push("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ios-bg dark:bg-ios-dark">
      <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-4">
        <Clock size={32} className="text-white dark:text-black" />
      </div>
      <h1 className="text-3xl font-bold mb-1">TimeSync</h1>
      <p className="text-ios-gray mb-8">Продуктивность и фокус</p>

      <div className="w-full max-w-sm bg-white dark:bg-ios-card-dark rounded-3xl p-6 shadow-sm border border-ios-separator/30">
        {/* Табы */}
        <div className="flex bg-ios-bg dark:bg-white/5 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "login"
                ? "bg-white dark:bg-ios-card-dark shadow-sm text-black dark:text-white"
                : "text-ios-gray"
            }`}
          >
            Вход
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "register"
                ? "bg-white dark:bg-ios-card-dark shadow-sm text-black dark:text-white"
                : "text-ios-gray"
            }`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <div>
              <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60"
            />
          </div>

          {error && <p className="text-brand-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium disabled:opacity-50"
          >
            {loading
              ? "Загрузка..."
              : tab === "register"
              ? "Создать аккаунт"
              : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
