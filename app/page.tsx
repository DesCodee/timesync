"use client";

import { AnimatePresence, MotionButton, MotionDiv, MotionMain, MotionP, MotionSvg } from "@/components/motion";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Check, Plus, X, Trash2 } from "lucide-react";
type Task = {
  id: string;
  title: string;
  is_completed: boolean;
  is_mit: boolean;
  due_date: string | null;
};

type Meeting = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color: string;
};

type Habit = {
  id: string;
  name: string;
  color: string;
  logs: { completed_date: string }[];
};

const todayISO = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
};

const timeStr = () => {
  const d = new Date();
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
};

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.05 } } };

export default function TodayPage() {
  const { user, profile } = useUser();
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [focusMin, setFocusMin] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);

  const [mTitle, setMTitle] = useState("");
  const [mStart, setMStart] = useState("");
  const [mEnd, setMEnd] = useState("");
  const [hName, setHName] = useState("");

  useEffect(() => { setMounted(true); }, []);

  async function fetchData() {
    if (!user) return;
    const t = todayISO();
    const [{ data: td }, { data: md }, { data: hd }, { data: fd }] = await Promise.all([
      supabase.from("tasks").select("id, title, is_completed, is_mit, due_date").eq("user_id", user.id),
      supabase.from("meetings").select("id, title, start_time, end_time, color").eq("user_id", user.id).gte("start_time", `${t}T00:00:00`).lte("start_time", `${t}T23:59:59`).order("start_time"),
      supabase.from("habits").select("id, name, color, habit_logs(completed_date)").eq("user_id", user.id),
      supabase.from("focus_sessions").select("actual_duration_min").eq("user_id", user.id).gte("started_at", `${t}T00:00:00`).lte("started_at", `${t}T23:59:59`),
    ]);
    setTasks(td || []);
    setMeetings(md || []);
    setHabits((hd || []).map((h: { id: string; name: string; color: string; habit_logs?: { completed_date: string }[] }) => ({ ...h, logs: h.habit_logs || [] })));
    setFocusMin((fd || []).reduce((sum: number, s: { actual_duration_min?: number }) => sum + (s.actual_duration_min || 0), 0));
    setLoading(false);
  }

  useEffect(() => { if (user) fetchData(); }, [user]);

  const todayTasks = tasks.filter((t) => t.due_date === todayISO());
  const completedToday = todayTasks.filter((t) => t.is_completed).length;
  const totalToday = todayTasks.length;
  const inProgress = todayTasks.filter((t) => !t.is_completed).length;
  const mitTask = tasks.find((t) => t.is_mit && !t.is_completed);

  async function toggleTask(id: string, done: boolean) {
    await supabase.from("tasks").update({ is_completed: !done, completed_at: !done ? new Date().toISOString() : null }).eq("id", id);
    fetchData();
  }

  async function setMit(id: string) {
    await supabase.from("tasks").update({ is_mit: false }).eq("user_id", user!.id);
    await supabase.from("tasks").update({ is_mit: true }).eq("id", id);
    fetchData();
  }

  async function toggleHabit(habitId: string, date: string) {
    const habit = habits.find((h) => h.id === habitId);
    const hasLog = habit?.logs.some((l) => l.completed_date === date);
    if (hasLog) {
      await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("completed_date", date);
    } else {
      await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user!.id, completed_date: date });
    }
    fetchData();
  }

  async function addMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !mTitle || !mStart || !mEnd) return;
    await supabase.from("meetings").insert({ user_id: user.id, title: mTitle, start_time: new Date(mStart).toISOString(), end_time: new Date(mEnd).toISOString(), color: "#FF3B30" });
    setMTitle(""); setMStart(""); setMEnd(""); setShowMeetingModal(false);
    fetchData();
  }

  async function deleteHabit(id: string) {
    if (!confirm("Удалить привычку?")) return;
    await supabase.from("habits").delete().eq("id", id);
    fetchData();
  }
  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !hName) return;
    await supabase.from("habits").insert({ user_id: user.id, name: hName, color: "#34C759" });
    setHName(""); setShowHabitModal(false);
    fetchData();
  }

  function meetingDuration(m: Meeting) {
    const s = new Date(m.start_time);
    const e = new Date(m.end_time);
    const min = Math.round((e.getTime() - s.getTime()) / 60000);
    return `${min}м`;
  }

  function meetingTime(m: Meeting) {
    return new Date(m.start_time).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }

  function habitStreak(logs: { completed_date: string }[]) {
    const dates = Array.from(new Set(logs.map((l) => l.completed_date))).sort();
    if (dates.length === 0) return 0;
    let streak = 0;
    const today = todayISO();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().split("T")[0];
    let current: string;
    if (dates.includes(today)) { current = today; } else if (dates.includes(yestStr)) { current = yestStr; } else { return 0; }
    while (dates.includes(current)) { streak++; const d = new Date(current); d.setDate(d.getDate() - 1); current = d.toISOString().split("T")[0]; }
    return streak;
  }

  const maxStreak = useMemo(() => Math.max(0, ...habits.map((h) => habitStreak(h.logs))), [habits]);

  if (!mounted) return <div className="p-4">Загрузка...</div>;
  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <MotionMain className="p-4 space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      {/* Приветствие */}
      <MotionDiv variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight">{greeting()}, {profile?.name || "друг"}</h1>
          <p className="text-ios-gray text-base mt-1 capitalize">{todayStr()}</p>
        </div>
        <MotionDiv key={timeStr()} initial={{ scale: 0.95, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-ios-card-dark rounded-2xl px-4 py-2 text-lg font-semibold shadow-sm border border-ios-separator/50">
          {timeStr()}
        </MotionDiv>
      </MotionDiv>

      {/* Виджеты */}
      <MotionDiv variants={fadeUp} className="grid grid-cols-2 gap-3">
        {[
          { label: "Выполнено", value: `${completedToday}/${totalToday}`, color: "text-brand-green" },
          { label: "Фокус", value: `${Math.floor(focusMin / 60)}ч ${focusMin % 60}м`, color: "text-brand-green" },
          { label: "Streak", value: `${maxStreak} дн`, color: "text-brand-orange" },
          { label: "В работе", value: `${inProgress}`, color: "text-black dark:text-white" },
        ].map((w) => (
          <MotionDiv key={w.label} variants={fadeUp} whileTap={{ scale: 0.97 }} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm text-ios-gray">{w.label}</p>
            <MotionP key={w.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`text-[32px] font-bold ${w.color} mt-1`}>{w.value}</MotionP>
          </MotionDiv>
        ))}
      </MotionDiv>

      {/* MIT */}
      <AnimatePresence mode="wait">
        {mitTask ? (
          <MotionDiv key="mit-done" variants={fadeUp} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-ios-card-dark rounded-2xl p-6 shadow-sm border border-ios-separator/30 flex flex-col items-center gap-3">
            <MotionDiv initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
              <Check size={20} className="text-white" strokeWidth={3} />
            </MotionDiv>
            <p className="text-ios-gray font-medium text-center">MIT: {mitTask.title}</p>
            <button onClick={() => toggleTask(mitTask.id, mitTask.is_completed)} className="text-sm text-brand-green font-medium">Отметить выполненной</button>
          </MotionDiv>
        ) : (
          <MotionDiv key="mit-select" variants={fadeUp} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm font-medium mb-2">Выберите MIT (главную задачу дня):</p>
            <div className="flex flex-wrap gap-2">
              {tasks.filter((t) => !t.is_completed).slice(0, 5).map((t) => (
                <MotionButton key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setMit(t.id)} className="px-3 py-1.5 rounded-lg bg-ios-bg dark:bg-white/5 text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  {t.title}
                </MotionButton>
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Задачи на сегодня */}
      <MotionDiv variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Задачи <span className="text-ios-gray text-base font-normal">({todayTasks.length})</span></h2>
          <a href="/tasks" className="text-base font-medium flex items-center gap-1"><span>+</span> Добавить</a>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {todayTasks.slice(0, 5).map((t) => (
              <MotionDiv key={t.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-3 bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
                <MotionButton whileTap={{ scale: 0.85 }} onClick={() => toggleTask(t.id, t.is_completed)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.is_completed ? 'bg-brand-green border-brand-green' : 'border-ios-gray'}`}>
                  <AnimatePresence>
                    {t.is_completed && (
                      <MotionSvg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </MotionSvg>
                    )}
                  </AnimatePresence>
                </MotionButton>
                <span className={`text-base flex-1 ${t.is_completed ? 'line-through text-ios-gray' : ''}`}>{t.title}</span>
                {!t.is_mit && !t.is_completed && <button onClick={() => setMit(t.id)} className="text-[10px] px-2 py-1 rounded-md bg-ios-bg dark:bg-white/5 text-ios-gray hover:text-black dark:hover:text-white">MIT</button>}
                {t.is_mit && <span className="text-[10px] px-2 py-1 rounded-md bg-black text-white dark:bg-white dark:text-black">MIT</span>}
              </MotionDiv>
            ))}
          </AnimatePresence>
          {todayTasks.length === 0 && <p className="text-ios-gray text-sm">Нет задач на сегодня</p>}
        </div>
      </MotionDiv>

      {/* Встречи */}
      <MotionDiv variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider">Встречи</p>
          <button onClick={() => setShowMeetingModal(true)} className="text-sm text-ios-gray hover:text-black dark:hover:text-white"><Plus size={16} /></button>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {meetings.map((m) => (
              <MotionDiv key={m.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex items-center gap-3 bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-base font-medium w-12 flex-shrink-0">{meetingTime(m)}</span>
                <span className="text-base flex-1 truncate">{m.title}</span>
                <span className="text-ios-gray text-sm flex-shrink-0">{meetingDuration(m)}</span>
              </MotionDiv>
            ))}
          </AnimatePresence>
          {meetings.length === 0 && <p className="text-ios-gray text-sm">Нет встреч на сегодня</p>}
        </div>
      </MotionDiv>

      {/* Привычки */}
      <MotionDiv variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider">Привычки</p>
          <button onClick={() => setShowHabitModal(true)} className="text-sm text-ios-gray hover:text-black dark:hover:text-white"><Plus size={16} /></button>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {habits.map((h) => {
              const doneToday = h.logs.some((l) => l.completed_date === todayISO());
              const streak = habitStreak(h.logs);
              return (
                <MotionDiv key={h.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex items-center justify-between bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
                  <div className="flex items-center gap-3">
                    <MotionButton whileTap={{ scale: 0.85 }} onClick={() => toggleHabit(h.id, todayISO())} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${doneToday ? 'bg-brand-green border-brand-green' : 'border-ios-gray'}`}>
                      <AnimatePresence>
                        {doneToday && (
                          <MotionSvg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </MotionSvg>
                        )}
                      </AnimatePresence>
                    </MotionButton>
                    <span className="text-base">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-2"><button onClick={() => deleteHabit(h.id)} className="p-1 rounded-md hover:bg-brand-red/10 text-ios-gray hover:text-brand-red"><Trash2 size={14} /></button><div className="flex items-center gap-1 bg-ios-bg dark:bg-white/10 px-2 py-1 rounded-lg">
                    <span className="text-brand-orange text-sm">🔥</span>
                    <span className="text-sm font-medium text-brand-orange">{streak}д</span>
                  </div>
                </MotionDiv>
              );
            })}
          </AnimatePresence>
          {habits.length === 0 && <p className="text-ios-gray text-sm">Нет привычек. Добавьте первую!</p>}
        </div>
      </MotionDiv>

      {/* Модал встречи */}
      <AnimatePresence>
        {showMeetingModal && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
            <MotionDiv initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Новая встреча</h2>
                <button onClick={() => setShowMeetingModal(false)}><X size={20} className="text-ios-gray" /></button>
              </div>
              <form onSubmit={addMeeting} className="space-y-4">
                <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Название" required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none placeholder:text-ios-gray/60" />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-ios-gray mb-1 block">Начало</label><input type="datetime-local" value={mStart} onChange={(e) => setMStart(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-sm outline-none" /></div>
                  <div><label className="text-xs text-ios-gray mb-1 block">Конец</label><input type="datetime-local" value={mEnd} onChange={(e) => setMEnd(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-sm outline-none" /></div>
                </div>
                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium">Добавить</button>
              </form>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Модал привычки */}
      <AnimatePresence>
        {showHabitModal && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
            <MotionDiv initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Новая привычка</h2>
                <button onClick={() => setShowHabitModal(false)}><X size={20} className="text-ios-gray" /></button>
              </div>
              <form onSubmit={addHabit} className="space-y-4">
                <input value={hName} onChange={(e) => setHName(e.target.value)} placeholder="Название привычки" required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none placeholder:text-ios-gray/60" />
                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium">Создать</button>
              </form>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionMain>
  );
}
