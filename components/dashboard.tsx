import Link from "next/link";
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Check, Plus, X, Trash2 , Settings} from "lucide-react";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";
import { SkeletonWidget, SkeletonCard } from "@/components/skeletons";
import { useTranslation } from "@/hooks/use-translation";

type Task = { id: string; title: string; is_completed: boolean; is_mit: boolean; due_date: string | null; };
type Meeting = { id: string; title: string; start_time: string; end_time: string; color: string; };
type Habit = { id: string; name: string; color: string; logs: { completed_date: string }[]; };

const todayISO = () => { const d = new Date(); return d.toISOString().split("T")[0]; };
const greeting = () => { const h = new Date().getHours(); if (h < 12) return "morning"; if (h < 18) return "day"; return "evening"; };

export default function Dashboard() {
  const { user, profile } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();
  const { t, lang } = useTranslation();
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

  const locale = lang === "en" ? "en-US" : "ru-RU";
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  }, [locale]);
  const timeStr = useMemo(() => {
    const d = new Date();
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }, [locale]);

  useEffect(() => { setMounted(true); }, []);
  async function fetchData() {
    if (!user) return;
    const tday = todayISO();
    try {
      const [{ data: td }, { data: md }, { data: hd }, { data: fd }] = await Promise.all([
        supabase.from("tasks").select("id, title, is_completed, is_mit, due_date").eq("user_id", user.id),
        supabase.from("meetings").select("id, title, start_time, end_time, color").eq("user_id", user.id).gte("start_time", `${tday}T00:00:00`).lte("start_time", `${tday}T23:59:59`).order("start_time"),
        supabase.from("habits").select("id, name, color, habit_logs(completed_date)").eq("user_id", user.id),
        supabase.from("focus_sessions").select("actual_duration_min").eq("user_id", user.id).gte("started_at", `${tday}T00:00:00`).lte("started_at", `${tday}T23:59:59`),
      ]);
      setTasks(td || []);
      setMeetings(md || []);
      setHabits((hd || []).map((h: any) => ({ ...h, logs: h.habit_logs || [] })));
      setFocusMin((fd || []).reduce((sum: number, s: any) => sum + (s.actual_duration_min || 0), 0));
    } catch {
      showToast(lang === "en" ? "Network error, showing cached data" : "Ошибка сети, показаны сохранённые данные", "error");
    }
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
    showToast(!done ? t("dashboard", "markDone") : t("common", "cancel"), "success");
    fetchData();
  }
  async function setMit(id: string) {
    await supabase.from("tasks").update({ is_mit: false }).eq("user_id", user!.id);
    await supabase.from("tasks").update({ is_mit: true }).eq("id", id);
    showToast("MIT " + (lang === "en" ? "set" : "назначен"), "success");
    fetchData();
  }
  async function toggleHabit(habitId: string, date: string) {
    const habit = habits.find((h) => h.id === habitId);
    const hasLog = habit?.logs.some((l) => l.completed_date === date);
    if (hasLog) { await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("completed_date", date); showToast(t("common", "cancel"), "info"); }
    else { await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user!.id, completed_date: date }); showToast(t("dashboard", "markDone"), "success"); }
    fetchData();
  }
  async function deleteHabit(id: string) {
    if (!window.confirm(t("common", "delete") + "?")) return;
    await supabase.from("habits").delete().eq("id", id);
    showToast(t("common", "delete"), "info");
    fetchData();
  }
  async function addMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !mTitle || !mStart || !mEnd) return;
    await supabase.from("meetings").insert({ user_id: user.id, title: mTitle, start_time: new Date(mStart).toISOString(), end_time: new Date(mEnd).toISOString(), color: "#FF3B30" });
    setMTitle(""); setMStart(""); setMEnd(""); setShowMeetingModal(false);
    showToast(t("dashboard", "newMeeting") + " " + (lang === "en" ? "added" : "добавлена"), "success");
    fetchData();
  }
  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !hName) return;
    await supabase.from("habits").insert({ user_id: user.id, name: hName, color: "#34C759" });
    setHName(""); setShowHabitModal(false);
    showToast(t("dashboard", "newHabit") + " " + (lang === "en" ? "created" : "создана"), "success");
    fetchData();
  }
  function meetingDuration(m: Meeting) {
    const s = new Date(m.start_time); const e = new Date(m.end_time);
    return `${Math.round((e.getTime() - s.getTime()) / 60000)}${lang === "en" ? "m" : "м"}`;
  }
  function meetingTime(m: Meeting) {
    return new Date(m.start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }
  function habitStreak(logs: { completed_date: string }[]) {
    const dates = Array.from(new Set(logs.map((l) => l.completed_date))).sort();
    if (dates.length === 0) return 0;
    let streak = 0; const today = todayISO(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yestStr = yesterday.toISOString().split("T")[0];
    let current: string; if (dates.includes(today)) current = today; else if (dates.includes(yestStr)) current = yestStr; else return 0;
    while (dates.includes(current)) { streak++; const d = new Date(current); d.setDate(d.getDate() - 1); current = d.toISOString().split("T")[0]; }
    return streak;
  }
  const maxStreak = useMemo(() => Math.max(0, ...habits.map((h) => habitStreak(h.logs))), [habits]);

  if (!mounted) return (
    <main className="p-4 space-y-4">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="grid grid-cols-2 gap-3">{[0,1,2,3].map((i) => <SkeletonWidget key={i} />)}</div>
      <SkeletonCard lines={3} /><SkeletonCard lines={2} /><SkeletonCard lines={2} />
    </main>
  );

  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="grid grid-cols-2 gap-3">{[0,1,2,3].map((i) => <SkeletonWidget key={i} />)}</div>
      <SkeletonCard lines={3} /><SkeletonCard lines={2} /><SkeletonCard lines={2} />
    </main>
  );

  const greetKey = greeting();
  const greetText = greetKey === "morning" ? t("dashboard", "greeting_morning") : greetKey === "day" ? t("dashboard", "greeting_day") : t("dashboard", "greeting_evening");

  return (
    <main className="p-4 space-y-4">
      <div className={anim("animate-fade-up")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center justify-between"><h1 className="text-[28px] font-bold leading-tight">{greetText}, {profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || t("auth", "name")}</h1><Link href="/account" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><Settings size={20} className="text-ios-gray" /></Link></div>
            <p className="text-ios-gray text-base mt-1 capitalize">{todayStr}</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl px-4 py-2 text-lg font-semibold shadow-sm border border-ios-separator/50 animate-scale-in">{timeStr}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t("dashboard", "done"), value: `${completedToday}/${totalToday}`, color: "text-brand-green" },
          { label: t("dashboard", "focus"), value: `${Math.floor(focusMin / 60)}${lang === "en" ? "h " : "ч "}${focusMin % 60}${lang === "en" ? "m" : "м"}`, color: "text-brand-green" },
          { label: t("dashboard", "streak"), value: `${maxStreak} ${lang === "en" ? "d" : "дн"}`, color: "text-brand-orange" },
          { label: t("dashboard", "inProgress"), value: `${inProgress}`, color: "text-black dark:text-white" },
        ].map((w, i) => (
          <div key={w.label} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30 active:scale-[0.97] transition-transform">
              <p className="text-sm text-ios-gray">{w.label}</p>
              <p className={`text-[32px] font-bold ${w.color} mt-1 animate-scale-in`}>{w.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={anim("animate-fade-up", 2)}>
        {mitTask ? (
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-6 shadow-sm border border-ios-separator/30 flex flex-col items-center gap-3 animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center animate-check">
              <Check size={20} className="text-white" strokeWidth={3} />
            </div>
            <p className="text-ios-gray font-medium text-center">MIT: {mitTask.title}</p>
            <button onClick={() => toggleTask(mitTask.id, mitTask.is_completed)} className="text-sm text-brand-green font-medium">{t("dashboard", "markDone")}</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30 animate-scale-in">
            <p className="text-sm font-medium mb-2">{t("dashboard", "chooseMIT")}:</p>
            <div className="flex flex-wrap gap-2">
              {tasks.filter((t) => !t.is_completed).slice(0, 5).map((t) => (
                <button key={t.id} onClick={() => setMit(t.id)} className="px-3 py-1.5 rounded-lg bg-ios-bg dark:bg-white/5 text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors active:scale-95">{t.title}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={anim("animate-fade-up", 3)}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{t("tasks", "title")} <span className="text-ios-gray text-base font-normal">({todayTasks.length})</span></h2>
          <a href="/tasks" className="text-base font-medium flex items-center gap-1"><span>+</span> {t("common", "add")}</a>
        </div>
        <div className="space-y-2">
          {todayTasks.slice(0, 5).map((t, i) => (
            <div key={t.id} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-center gap-3 bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
                <button onClick={() => toggleTask(t.id, t.is_completed)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.is_completed ? "bg-brand-green border-brand-green" : "border-ios-gray"} active:scale-85 transition-transform`}>
                  {t.is_completed && <svg className="animate-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </button>
                <span className={`text-base flex-1 ${t.is_completed ? "line-through text-ios-gray" : ""}`}>{t.title}</span>
                {!t.is_mit && !t.is_completed && <button onClick={() => setMit(t.id)} className="text-[10px] px-2 py-1 rounded-md bg-ios-bg dark:bg-white/5 text-ios-gray hover:text-black dark:hover:text-white">MIT</button>}
                {t.is_mit && <span className="text-[10px] px-2 py-1 rounded-md bg-black text-white dark:bg-white dark:text-black">MIT</span>}
              </div>
            </div>
          ))}
          {todayTasks.length === 0 && <p className="text-ios-gray text-sm">{t("dashboard", "noTasks")}</p>}
        </div>
      </div>

      <div className={anim("animate-fade-up", 4)}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider">{t("dashboard", "meetings")}</p>
          <button onClick={() => setShowMeetingModal(true)} className="text-sm text-ios-gray hover:text-black dark:hover:text-white"><Plus size={16} /></button>
        </div>
        <div className="space-y-3">
          {meetings.map((m, i) => (
            <div key={m.id} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-center gap-3 bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-base font-medium w-12 flex-shrink-0">{meetingTime(m)}</span>
                <span className="text-base flex-1 truncate">{m.title}</span>
                <span className="text-ios-gray text-sm flex-shrink-0">{meetingDuration(m)}</span>
              </div>
            </div>
          ))}
          {meetings.length === 0 && <p className="text-ios-gray text-sm">{t("dashboard", "noMeetings")}</p>}
        </div>
      </div>

      <div className={anim("animate-fade-up", 5)}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider">{t("dashboard", "habits")}</p>
          <button onClick={() => setShowHabitModal(true)} className="text-sm text-ios-gray hover:text-black dark:hover:text-white"><Plus size={16} /></button>
        </div>
        <div className="space-y-3">
          {habits.map((h, i) => {
            const doneToday = h.logs.some((l) => l.completed_date === todayISO());
            const streak = habitStreak(h.logs);
            return (
              <div key={h.id} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="flex items-center justify-between bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleHabit(h.id, todayISO())} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center active:scale-85 transition-transform ${doneToday ? "bg-brand-green border-brand-green" : "border-ios-gray"}`}>
                      {doneToday && <svg className="animate-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </button>
                    <span className="text-base">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteHabit(h.id)} className="p-1 rounded-md hover:bg-brand-red/10 text-ios-gray hover:text-brand-red transition-colors"><Trash2 size={14} /></button>
                    <div className="flex items-center gap-1 bg-ios-bg dark:bg-white/10 px-2 py-1 rounded-lg">
                      <span className="text-brand-orange text-sm">🔥</span>
                      <span className="text-sm font-medium text-brand-orange">{streak}{lang === "en" ? "d" : "д"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {habits.length === 0 && <p className="text-ios-gray text-sm">{t("dashboard", "noHabits")}</p>}
        </div>
      </div>

      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t("dashboard", "newMeeting")}</h2>
              <button onClick={() => setShowMeetingModal(false)}><X size={20} className="text-ios-gray" /></button>
            </div>
            <form onSubmit={addMeeting} className="space-y-4">
              <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder={t("dashboard", "meetingName")} required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none placeholder:text-ios-gray/60" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-ios-gray mb-1 block">{t("dashboard", "start")}</label><input type="datetime-local" value={mStart} onChange={(e) => setMStart(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-sm outline-none" /></div>
                <div><label className="text-xs text-ios-gray mb-1 block">{t("dashboard", "end")}</label><input type="datetime-local" value={mEnd} onChange={(e) => setMEnd(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-sm outline-none" /></div>
              </div>
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium active:scale-[0.98] transition-transform">{t("common", "save")}</button>
            </form>
          </div>
        </div>
      )}

      {showHabitModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t("dashboard", "newHabit")}</h2>
              <button onClick={() => setShowHabitModal(false)}><X size={20} className="text-ios-gray" /></button>
            </div>
            <form onSubmit={addHabit} className="space-y-4">
              <input value={hName} onChange={(e) => setHName(e.target.value)} placeholder={t("dashboard", "habitName")} required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none placeholder:text-ios-gray/60" />
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium active:scale-[0.98] transition-transform">{t("common", "create")}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
