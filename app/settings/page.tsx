"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Moon, Volume2, Smartphone, Bell, Eye, Info, Shield, FileText, RotateCcw, ChevronRight } from "lucide-react";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";

export default function SettingsPage() {
  const { profile, user, loading } = useUser();
  const [theme, setTheme] = useState("system");
  const [timerPreset, setTimerPreset] = useState("25/5");
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [timerNotif, setTimerNotif] = useState(true);
  const [morningDigest, setMorningDigest] = useState(false);
  const [habitRemind, setHabitRemind] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setTheme(localStorage.getItem("timesync-theme") || "system");
    setTimerPreset(localStorage.getItem("timesync-timer-preset") || "25/5");
    setSound(localStorage.getItem("timesync-sound") !== "false");
    setVibration(localStorage.getItem("timesync-vibration") !== "false");
    setTimerNotif(localStorage.getItem("timesync-timer-notif") !== "false");
    setMorningDigest(localStorage.getItem("timesync-morning") === "true");
    setHabitRemind(localStorage.getItem("timesync-habit-remind") === "true");
    setShowCompleted(localStorage.getItem("timesync-show-completed") !== "false");
  }, []);

  const updateStorage = (key: string, value: boolean | string) => localStorage.setItem(key, String(value));
  const handleTheme = (t: string) => {
    setTheme(t);
    localStorage.setItem("timesync-theme", t);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (t === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
    } else root.classList.add(t);
  };

  async function handleReset() {
    if (!window.confirm("Сбросить все настройки?")) return;
    localStorage.clear();
    setTheme("system");
    setTimerPreset("25/5");
    setSound(true);
    setVibration(true);
    setTimerNotif(true);
    setMorningDigest(false);
    setHabitRemind(false);
    setShowCompleted(true);
    handleTheme("system");
    showToast("Настройки сброшены", "info");
  }

  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="skeleton h-20 w-full rounded-2xl mb-6" />
      <div className="skeleton h-32 w-full rounded-2xl mb-6" />
      <div className="skeleton h-32 w-full rounded-2xl" />
    </main>
  );

  const name = profile?.name || "User";
  const email = profile?.email || user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className={anim("animate-fade-up mb-6")}>
      <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">{title}</p>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl shadow-sm divide-y divide-ios-separator/50 border border-ios-separator/30">{children}</div>
    </div>
  );

  const Row = ({ icon, label, desc, action, onClick }: any) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? "cursor-pointer" : ""}`}>
      <div className="w-8 h-8 rounded-lg bg-ios-bg dark:bg-white/10 flex items-center justify-center text-ios-gray flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-base">{label}</p>{desc && <p className="text-xs text-ios-gray">{desc}</p>}</div>
      {action && <div className="flex-shrink-0">{action}</div>}{onClick && !action && <ChevronRight size={18} className="text-ios-gray flex-shrink-0" />}
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full transition-colors relative ${value ? "bg-brand-green" : "bg-ios-separator"}`}>
      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <main className="p-4">
      <h1 className={anim("text-[28px] font-bold mb-6 animate-fade-up")}>Настройки</h1>
      <div className={anim("animate-fade-up mb-6")}>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-ios-separator/30">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">{initial}</div>
          <div className="flex-1 min-w-0"><p className="text-base font-semibold">{name}</p><p className="text-sm text-ios-gray truncate">{email}</p></div>
        </div>
      </div>
      <Section title="Внешний вид">
        <Row icon={<Moon size={18} />} label="Тема" />
        <div className="px-4 pb-3"><div className="flex bg-ios-bg dark:bg-white/10 rounded-xl p-1">
          {["Система", "Светлая", "Тёмная"].map((t) => {
            const key = t === "Система" ? "system" : t === "Светлая" ? "light" : "dark";
            return (<button key={t} onClick={() => handleTheme(key)} className={`flex-1 py-1.5 text-xs sm:text-sm rounded-lg transition-all ${theme === key ? "bg-white dark:bg-ios-card-dark shadow-sm font-medium" : "text-ios-gray"}`}>{t}</button>);
          })}
        </div></div>
      </Section>
      <Section title="Помодоро таймер">
        <Row icon={<span className="text-sm font-bold">⏱</span>} label="Режим" />
        <div className="px-4 pb-3"><div className="flex bg-ios-bg dark:bg-white/10 rounded-xl p-1">
          {["25/5", "52/17", "90/20"].map((p) => (<button key={p} onClick={() => { setTimerPreset(p); updateStorage("timesync-timer-preset", p); }} className={`flex-1 py-1.5 text-xs sm:text-sm rounded-lg transition-all ${timerPreset === p ? "bg-white dark:bg-ios-card-dark shadow-sm font-medium" : "text-ios-gray"}`}>{p}</button>))}
        </div></div>
      </Section>
      <Section title="Звук и вибрация">
        <Row icon={<Volume2 size={18} />} label="Звук таймера" desc="Звуковой сигнал по завершении" action={<Toggle value={sound} onChange={(v) => { setSound(v); updateStorage("timesync-sound", v); }} />} />
        <Row icon={<Smartphone size={18} />} label="Вибрация" desc="Вибросигнал по завершении" action={<Toggle value={vibration} onChange={(v) => { setVibration(v); updateStorage("timesync-vibration", v); }} />} />
      </Section>
      <Section title="Уведомления">
        <Row icon={<Bell size={18} />} label="Конец таймера" desc="Уведомление по завершении сессии" action={<Toggle value={timerNotif} onChange={(v) => { setTimerNotif(v); updateStorage("timesync-timer-notif", v); }} />} />
        <Row icon={<span className="text-sm">☀️</span>} label="Утренний дайджест" desc="Напоминание о задачах на день" action={<Toggle value={morningDigest} onChange={(v) => { setMorningDigest(v); updateStorage("timesync-morning", v); }} />} />
        <Row icon={<span className="text-sm">✓</span>} label="Привычки" desc="Напоминание отметить привычки" action={<Toggle value={habitRemind} onChange={(v) => { setHabitRemind(v); updateStorage("timesync-habit-remind", v); }} />} />
      </Section>
      <Section title="Задачи">
        <Row icon={<Eye size={18} />} label="Показывать выполненные" desc="Отображать завершённые задачи в списке" action={<Toggle value={showCompleted} onChange={(v) => { setShowCompleted(v); updateStorage("timesync-show-completed", v); }} />} />
      </Section>
      <Section title="О приложении">
        <Row icon={<Info size={18} />} label="Версия" action={<span className="text-ios-gray text-sm">1.0.0</span>} />
        <Row icon={<Shield size={18} />} label="Политика конфиденциальности" onClick={() => {}} />
        <Row icon={<FileText size={18} />} label="Условия использования" onClick={() => {}} />
        <Row icon={<RotateCcw size={18} />} label="Сбросить настройки" desc="Вернуть стандартные значения" onClick={handleReset} />
      </Section>
    </main>
  );
}
