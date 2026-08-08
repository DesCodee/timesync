"use client";
import { Clock, CheckCircle, Flame, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function Landing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-ios-bg dark:bg-ios-dark text-black dark:text-white overflow-x-hidden">
      <header className="px-4 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <Clock size={18} className="text-white dark:text-black" />
          </div>
          <span className="font-bold text-lg">TimeSync</span>
        </div>
        <Link href="/auth" className="text-sm font-medium px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black active:scale-95 transition-transform">
          {t("nav", "logout") === "Выйти" ? "Войти" : "Log in"}
        </Link>
      </header>

      <section className="px-4 pt-8 pb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 whitespace-pre-line">{t("landing", "title")}</h1>
        <p className="text-ios-gray text-lg sm:text-xl mb-8 max-w-xl mx-auto">{t("landing", "subtitle")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-medium text-base active:scale-[0.98] transition-transform">
            {t("landing", "cta")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="px-4 pb-16 flex justify-center">
        <div className="relative w-[320px] h-[580px] bg-black dark:bg-[#1C1C1E] rounded-[40px] p-3 shadow-2xl border border-white/10">
          <div className="w-full h-full bg-ios-bg dark:bg-ios-dark rounded-[32px] overflow-hidden flex flex-col">
            <div className="p-4 space-y-3">
              <div className="skeleton h-6 w-32" />
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm"><div className="skeleton h-3 w-12 mb-1"/><div className="skeleton h-6 w-8"/></div>
                <div className="bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm"><div className="skeleton h-3 w-12 mb-1"/><div className="skeleton h-6 w-8"/></div>
                <div className="bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm"><div className="skeleton h-3 w-12 mb-1"/><div className="skeleton h-6 w-8"/></div>
                <div className="bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm"><div className="skeleton h-3 w-12 mb-1"/><div className="skeleton h-6 w-8"/></div>
              </div>
              <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-brand-green"/><div className="skeleton h-4 flex-1"/></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border-2 border-ios-gray"/><div className="skeleton h-4 flex-1"/></div>
              </div>
            </div>
            <div className="mt-auto h-16 bg-white dark:bg-ios-card-dark border-t border-ios-separator/30 flex items-center justify-around px-4">
              <div className="w-6 h-6 rounded-full bg-black dark:bg-white"/>
              <div className="w-6 h-6 rounded-full bg-ios-gray"/>
              <div className="w-6 h-6 rounded-full bg-ios-gray"/>
              <div className="w-6 h-6 rounded-full bg-ios-gray"/>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-white dark:bg-ios-card-dark">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-ios-bg dark:bg-ios-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center"><CheckCircle size={20} className="text-brand-blue"/></div>
            <h3 className="font-bold text-lg">{t("landing", "tasksTitle")}</h3>
            <p className="text-sm text-ios-gray">{t("landing", "tasksDesc")}</p>
          </div>
          <div className="p-6 rounded-2xl bg-ios-bg dark:bg-ios-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center"><Clock size={20} className="text-brand-green"/></div>
            <h3 className="font-bold text-lg">{t("landing", "focusTitle")}</h3>
            <p className="text-sm text-ios-gray">{t("landing", "focusDesc")}</p>
          </div>
          <div className="p-6 rounded-2xl bg-ios-bg dark:bg-ios-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center"><Flame size={20} className="text-brand-orange"/></div>
            <h3 className="font-bold text-lg">{t("landing", "habitsTitle")}</h3>
            <p className="text-sm text-ios-gray">{t("landing", "habitsDesc")}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Pricing</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-ios-card-dark border border-ios-separator/30 shadow-sm">
            <h3 className="font-bold text-lg mb-1">{t("landing", "freeTitle")}</h3>
            <p className="text-3xl font-bold mb-4">{t("landing", "priceFree")}</p>
            <ul className="space-y-2 text-sm text-ios-gray mb-6">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> {t("landing", "freeProjects")}</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> {t("landing", "freeHabits")}</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> {t("landing", "freeTimer")}</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> {t("landing", "freeAnalytics")}</li>
            </ul>
            <Link href="/auth" className="block w-full text-center py-3 rounded-xl bg-ios-bg dark:bg-white/10 font-medium active:scale-[0.98] transition-transform">{t("landing", "cta")}</Link>
          </div>
          <div className="p-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black relative overflow-hidden">
            <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-brand-green text-white">{t("landing", "soon")}</div>
            <h3 className="font-bold text-lg mb-1">{t("landing", "proTitle")}</h3>
            <p className="text-3xl font-bold mb-4">{t("landing", "pricePro")}<span className="text-base font-normal opacity-60">{t("landing", "month")}</span></p>
            <ul className="space-y-2 text-sm opacity-80 mb-6">
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> {t("landing", "proProjects")}</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> {t("landing", "proHabits")}</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> {t("landing", "proAi")}</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> {t("landing", "proExport")}</li>
            </ul>
            <button disabled className="w-full py-3 rounded-xl bg-white/20 font-medium opacity-60 cursor-not-allowed">{t("landing", "soon")}</button>
          </div>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm text-ios-gray border-t border-ios-separator/30">
        <p>{t("landing", "footer")}</p>
      </footer>
    </div>
  );
}
