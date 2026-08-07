"use client";

import { MotionDiv, MotionH1, MotionMain } from "@/components/motion";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
type Task = { is_completed: boolean; completed_at: string | null; created_at: string; priority: string };
type FocusSession = { actual_duration_min: number | null; started_at: string };
type Habit = { id: string; name: string; logs: { completed_date: string }[] };

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split("T")[0], label: d.toLocaleDateString("ru-RU", { weekday: "short" }) });
  }
  return days;
}

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

export default function AnalyticsPage() {
  const { user } = useUser();
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focus, setFocus] = useState<FocusSession[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const days7 = useMemo(() => getLast7Days(), []);

  async function fetchData() {
    if (!user) return;
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const [{ data: td }, { data: fd }, { data: hd }] = await Promise.all([
      supabase.from("tasks").select("is_completed, completed_at, created_at, priority").eq("user_id", user.id),
      supabase.from("focus_sessions").select("actual_duration_min, started_at").eq("user_id", user.id).gte("started_at", weekAgo.toISOString()),
      supabase.from("habits").select("id, name, habit_logs(completed_date)").eq("user_id", user.id),
    ]);
    setTasks(td || []); setFocus(fd || []); setHabits((hd || []).map((h: any) => ({ ...h, logs: h.habit_logs || [] }))); setLoading(false);
  }

  useEffect(() => { if (user) fetchData(); }, [user]);

  const taskChart = days7.map((d) => ({ name: d.label, done: tasks.filter((t) => t.is_completed && t.completed_at?.startsWith(d.date)).length }));
  const focusChart = days7.map((d) => ({ name: d.label, min: focus.filter((f) => f.started_at?.startsWith(d.date)).reduce((s, f) => s + (f.actual_duration_min || 0), 0) }));
  const totalTasks = tasks.length; const doneTasks = tasks.filter((t) => t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const totalFocusMin = focus.reduce((s, f) => s + (f.actual_duration_min || 0), 0);
  const today = new Date().toISOString().split("T")[0];
  const habitsDoneToday = habits.filter((h) => h.logs.some((l) => l.completed_date === today)).length;

  function maxStreak(logs: { completed_date: string }[]) {
    const dates = [...new Set(logs.map((l) => l.completed_date))].sort();
    if (dates.length === 0) return 0;
    let streak = 0; let check = dates.includes(today) ? today : new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (!dates.includes(check)) return 0;
    while (dates.includes(check)) { streak++; const d = new Date(check); d.setDate(d.getDate() - 1); check = d.toISOString().split("T")[0]; }
    return streak;
  }
  const overallMaxStreak = Math.max(0, ...habits.map((h) => maxStreak(h.logs)));
  const activeByPriority = { Critical: tasks.filter((t) => !t.is_completed && t.priority === "critical").length, High: tasks.filter((t) => !t.is_completed && t.priority === "high").length, Medium: tasks.filter((t) => !t.is_completed && t.priority === "medium").length, Low: tasks.filter((t) => !t.is_completed && t.priority === "low").length };
  const days14 = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split("T")[0]; });

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <MotionMain className="p-4 space-y-4" variants={stagger} initial="initial" animate="animate">
      <MotionH1 variants={fadeUp} className="text-[28px] font-bold mb-2">Аналитика</MotionH1>
      <MotionDiv variants={fadeUp} className="grid grid-cols-2 gap-3">
        {[
          { label: "Выполнение", value: `${completionRate}%`, sub: `${doneTasks} из ${totalTasks}`, color: "text-brand-green" },
          { label: "Фокус (всего)", value: `${Math.floor(totalFocusMin / 60)}ч ${totalFocusMin % 60}м`, sub: `${focus.length} сессий`, color: "text-brand-blue" },
          { label: "Привычки", value: `${habitsDoneToday}/${habits.length}`, sub: "выполнено сегодня", color: "text-brand-orange" },
          { label: "Стрик", value: `${overallMaxStreak}д`, sub: "макс. серия", color: "text-brand-purple" },
        ].map((w) => (
          <MotionDiv key={w.label} whileTap={{ scale: 0.97 }} variants={fadeUp} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <p className="text-sm text-ios-gray">{w.label}</p>
            <p className={`text-[32px] font-bold ${w.color} mt-1`}>{w.value}</p>
            <p className="text-xs text-ios-gray">{w.sub}</p>
          </MotionDiv>
        ))}
      </MotionDiv>

      <MotionDiv variants={fadeUp} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
        <div className="flex items-center justify-between mb-4"><h3 className="text-base font-bold">Выполнение задач</h3><span className="text-xs text-ios-gray">7 дней</span></div>
        <ResponsiveContainer width="100%" height={120}><BarChart data={taskChart}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8E8E93" }} /><Bar dataKey="done" radius={[4, 4, 0, 0]}>{taskChart.map((_, i) => <Cell key={i} fill={i === 6 ? "#000000" : "#E5E5EA"} />)}</Bar></BarChart></ResponsiveContainer>
      </MotionDiv>

      <MotionDiv variants={fadeUp} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
        <div className="flex items-center justify-between mb-4"><h3 className="text-base font-bold">Часы фокуса</h3><span className="text-xs text-ios-gray">7 дней</span></div>
        <ResponsiveContainer width="100%" height={120}><BarChart data={focusChart}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8E8E93" }} /><Bar dataKey="min" radius={[4, 4, 0, 0]}>{focusChart.map((_, i) => <Cell key={i} fill={i === 6 ? "#AF52DE" : "#E5E5EA"} />)}</Bar></BarChart></ResponsiveContainer>
      </MotionDiv>

      <MotionDiv variants={fadeUp} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
        <h3 className="text-base font-bold mb-4">Приоритеты (активные)</h3>
        <div className="space-y-3">
          {Object.entries(activeByPriority).map(([label, count]) => (
            <div key={label} className="flex items-center gap-3"><span className="text-sm w-16">{label}</span><div className="flex-1 h-2 bg-ios-bg dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-ios-separator dark:bg-white/20 rounded-full" style={{ width: `${Math.min(100, count * 10)}%` }} /></div><span className="text-sm text-ios-gray w-6 text-right">{count}</span></div>
          ))}
        </div>
      </MotionDiv>

      <MotionDiv variants={fadeUp} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center"><span className="text-2xl font-bold text-brand-orange">{overallMaxStreak}</span></div>
        <div><h3 className="text-base font-bold">Дней подряд</h3><p className="text-sm text-ios-gray">Продолжайте в том же духе!</p></div>
        <span className="ml-auto text-2xl">🔥</span>
      </MotionDiv>

      <MotionDiv variants={fadeUp} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
        <h3 className="text-base font-bold mb-4">Трекер привычек (14 дней)</h3>
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.id} className="flex items-center gap-2"><span className="text-sm w-24 truncate flex-shrink-0">{h.name}</span><div className="flex gap-1 flex-1">{days14.map((d) => { const done = h.logs.some((l) => l.completed_date === d); return <div key={d} className={`flex-1 h-6 rounded-sm ${done ? "bg-brand-green" : "bg-ios-bg dark:bg-white/10"}`} />; })}</div><div className="flex items-center gap-1 flex-shrink-0"><span className="text-brand-orange text-xs">🔥</span><span className="text-xs font-medium text-brand-orange">{maxStreak(h.logs)}д</span></div></div>
          ))}
          {habits.length === 0 && <p className="text-ios-gray text-sm">Нет привычек</p>}
        </div>
      </MotionDiv>
    </MotionMain>
  );
}
