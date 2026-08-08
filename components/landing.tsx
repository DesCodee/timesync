"use client";

import { Clock, CheckCircle, Flame, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function Landing() {
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
          Войти
        </Link>
      </header>

      <section className="px-4 pt-8 pb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Продуктивность<br />без хаоса
        </h1>
        <p className="text-ios-gray text-lg sm:text-xl mb-8 max-w-xl mx-auto">
          Задачи, фокус-сессии и привычки — всё в одном приложении. Без лишних кнопок.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-medium text-base active:scale-[0.98] transition-transform">
            Начать бесплатно <ArrowRight size={18} />
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
            <h3 className="font-bold text-lg">Задачи</h3>
            <p className="text-sm text-ios-gray">Создавайте, фильтруйте и отслеживайте прогресс. MIT — главная задача дня.</p>
          </div>
          <div className="p-6 rounded-2xl bg-ios-bg dark:bg-ios-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center"><Clock size={20} className="text-brand-green"/></div>
            <h3 className="font-bold text-lg">Фокус</h3>
            <p className="text-sm text-ios-gray">Pomodoro-таймер с тремя режимами. Сессии сохраняются в аналитику.</p>
          </div>
          <div className="p-6 rounded-2xl bg-ios-bg dark:bg-ios-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center"><Flame size={20} className="text-brand-orange"/></div>
            <h3 className="font-bold text-lg">Привычки</h3>
            <p className="text-sm text-ios-gray">Ежедневные привычки со стриками. Не прерывайте серию.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Тарифы</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-ios-card-dark border border-ios-separator/30 shadow-sm">
            <h3 className="font-bold text-lg mb-1">Free</h3>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="space-y-2 text-sm text-ios-gray mb-6">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> До 3 проектов</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> До 5 привычек</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> Базовый таймер</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-green"/> Аналитика 7 дней</li>
            </ul>
            <Link href="/auth" className="block w-full text-center py-3 rounded-xl bg-ios-bg dark:bg-white/10 font-medium active:scale-[0.98] transition-transform">Начать</Link>
          </div>
          <div className="p-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black relative overflow-hidden">
            <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-brand-green text-white">СКОРО</div>
            <h3 className="font-bold text-lg mb-1">Pro</h3>
            <p className="text-3xl font-bold mb-4">$4<span className="text-base font-normal opacity-60">/мес</span></p>
            <ul className="space-y-2 text-sm opacity-80 mb-6">
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> Неограниченные проекты</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> Неограниченные привычки</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> AI-планирование дня</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-orange fill-current"/> Экспорт CSV</li>
            </ul>
            <button disabled className="w-full py-3 rounded-xl bg-white/20 font-medium opacity-60 cursor-not-allowed">Скоро</button>
          </div>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm text-ios-gray border-t border-ios-separator/30">
        <p>© 2026 TimeSync. Сделано с фокусом.</p>
      </footer>
    </div>
  );
}
