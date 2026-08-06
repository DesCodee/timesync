"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";

export default function TodayPage() {
  const { profile } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  };

  const name = profile?.name || "друг";

  // Пока не смонтировался — показываем статичный placeholder
  if (!mounted) {
    return (
      <main className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold leading-tight">Загрузка...</h1>
            <p className="text-ios-gray text-base mt-1">—</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl px-4 py-2 text-lg font-semibold shadow-sm border border-ios-separator/50">
            --:--
          </div>
        </div>
        {/* Остальной контент без динамики */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm text-ios-gray">Выполнено</p>
            <p className="text-[32px] font-bold text-brand-green mt-1">8/8</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm text-ios-gray">Фокус</p>
            <p className="text-[32px] font-bold text-brand-green mt-1">0ч 50м</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm text-ios-gray">Streak</p>
            <p className="text-[32px] font-bold text-brand-orange mt-1">13 дн</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm text-ios-gray">В работе</p>
            <p className="text-[32px] font-bold mt-1">0</p>
          </div>
        </div>

        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-6 shadow-sm border border-ios-separator/30 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-ios-gray font-medium">MIT задача выполнена!</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Задачи <span className="text-ios-gray text-base font-normal">(0)</span></h2>
          <button className="text-base font-medium flex items-center gap-1">
            <span>+</span> Добавить
          </button>
        </div>

        <div>
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">Встречи</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-red" />
              <span className="text-base font-medium w-12">11:00</span>
              <span className="text-base flex-1">Синк команды</span>
              <span className="text-ios-gray text-sm">30м</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
              <span className="text-base font-medium w-12">15:00</span>
              <span className="text-base flex-1">Zoom Дмитрий</span>
              <span className="text-ios-gray text-sm">60м</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">Привычки</p>
          <div className="space-y-4">
            {[
              { name: "Медитация", streak: "8д" },
              { name: "Спорт", streak: "13д" },
              { name: "1.5л воды", streak: "10д" },
              { name: "Чтение", streak: "8д", done: true },
            ].map((h) => (
              <div key={h.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${h.done ? 'bg-brand-green border-brand-green' : 'border-ios-gray'}`}>
                    {h.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span className="text-base">{h.name}</span>
                </div>
                <div className="flex items-center gap-1 bg-ios-bg dark:bg-white/10 px-2 py-1 rounded-lg">
                  <span className="text-brand-orange">🔥</span>
                  <span className="text-sm font-medium text-brand-orange">{h.streak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight">{greeting()}, {name}</h1>
          <p className="text-ios-gray text-base mt-1 capitalize">{dateStr}</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl px-4 py-2 text-lg font-semibold shadow-sm border border-ios-separator/50">
          {timeStr}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
          <p className="text-sm text-ios-gray">Выполнено</p>
          <p className="text-[32px] font-bold text-brand-green mt-1">8/8</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
          <p className="text-sm text-ios-gray">Фокус</p>
          <p className="text-[32px] font-bold text-brand-green mt-1">0ч 50м</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
          <p className="text-sm text-ios-gray">Streak</p>
          <p className="text-[32px] font-bold text-brand-orange mt-1">13 дн</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
          <p className="text-sm text-ios-gray">В работе</p>
          <p className="text-[32px] font-bold mt-1">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-6 shadow-sm border border-ios-separator/30 flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-ios-gray font-medium">MIT задача выполнена!</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Задачи <span className="text-ios-gray text-base font-normal">(0)</span></h2>
        <button className="text-base font-medium flex items-center gap-1">
          <span>+</span> Добавить
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">Встречи</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-red" />
            <span className="text-base font-medium w-12">11:00</span>
            <span className="text-base flex-1">Синк команды</span>
            <span className="text-ios-gray text-sm">30м</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
            <span className="text-base font-medium w-12">15:00</span>
            <span className="text-base flex-1">Zoom Дмитрий</span>
            <span className="text-ios-gray text-sm">60м</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">Привычки</p>
        <div className="space-y-4">
          {[
            { name: "Медитация", streak: "8д" },
            { name: "Спорт", streak: "13д" },
            { name: "1.5л воды", streak: "10д" },
            { name: "Чтение", streak: "8д", done: true },
          ].map((h) => (
            <div key={h.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${h.done ? 'bg-brand-green border-brand-green' : 'border-ios-gray'}`}>
                  {h.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span className="text-base">{h.name}</span>
              </div>
              <div className="flex items-center gap-1 bg-ios-bg dark:bg-white/10 px-2 py-1 rounded-lg">
                <span className="text-brand-orange">🔥</span>
                <span className="text-sm font-medium text-brand-orange">{h.streak}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
