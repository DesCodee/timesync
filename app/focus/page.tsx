"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Play, Pause, Square, RotateCcw, ChevronDown } from "lucide-react";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";
import { useBeforeUnload } from "@/hooks/use-before-unload";
import { useBeforeUnload } from "@/hooks/use-before-unload";
import { SkeletonCircle } from "@/components/skeletons";

type Task = { id: string; title: string };

const PRESETS = { "25/5": { work: 25, break: 5, longBreak: 15 }, "52/17": { work: 52, break: 17, longBreak: 30 }, "90/20": { work: 90, break: 20, longBreak: 45 } };
type Mode = "work" | "break" | "longBreak";
type PresetKey = keyof typeof PRESETS;
const STORAGE_KEY = "timesync-timer";

function playSound() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("timesync-sound") === "false") return;
  const a = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE");
  a.play().catch(() => {});
}
function vibrate() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("timesync-vibration") === "false") return;
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

export default function FocusPage() {
  const [preset, setPreset] = useState<PresetKey>("25/5");
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(PRESETS["25/5"].work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskSelect, setShowTaskSelect] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();
  useBeforeUnload(isRunning);
  useBeforeUnload(isRunning);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const currentPreset = PRESETS[preset];
  const totalTime = mode === "work" ? currentPreset.work : mode === "break" ? currentPreset.break : currentPreset.longBreak;
  const progress = ((totalTime * 60 - timeLeft) / (totalTime * 60)) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!user) return;
    supabase.from("tasks").select("id, title").eq("user_id", user.id).eq("is_completed", false).order("created_at", { ascending: false }).then(({ data }) => {
      setTasks(data || []);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        const now = Date.now();
        if (state.isRunning && state.endTime > now) {
          setPreset(state.preset);
          setMode(state.mode);
          setSessionsDone(state.sessionsDone);
          setSelectedTask(state.selectedTask);
          setSessionId(state.sessionId);
          setIsRunning(true);
          endTimeRef.current = state.endTime;
          startTimeRef.current = state.startTime;
        }
      } catch {}
    }
  }, []);

  const saveState = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset, mode, timeLeft, isRunning, sessionsDone, selectedTask, sessionId, endTime: endTimeRef.current, startTime: startTimeRef.current }));
  }, [preset, mode, timeLeft, isRunning, sessionsDone, selectedTask, sessionId]);

  useEffect(() => { saveState(); }, [saveState]);

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.ceil((endTimeRef.current - now) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        handleComplete();
      } else {
        setTimeLeft(remaining);
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 250);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, preset, mode, sessionsDone]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && isRunning) {
        const now = Date.now();
        const remaining = Math.ceil((endTimeRef.current - now) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          handleComplete();
        } else {
          setTimeLeft(remaining);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    playSound();
    vibrate();
    showToast(mode === "work" ? "Сессия завершена! Отдыхайте." : "Перерыв окончен! За работу.", "success");
    if (sessionId) {
      supabase.from("focus_sessions").update({ ended_at: new Date().toISOString(), actual_duration_min: totalTime }).eq("id", sessionId);
      setSessionId(null);
    }
    if (mode === "work") {
      const newSessions = sessionsDone + 1;
      setSessionsDone(newSessions);
      if (newSessions >= 4) {
        setMode("longBreak");
        setTimeLeft(currentPreset.longBreak * 60);
        setSessionsDone(0);
      } else {
        setMode("break");
        setTimeLeft(currentPreset.break * 60);
      }
    } else {
      setMode("work");
      setTimeLeft(currentPreset.work * 60);
    }
    localStorage.removeItem(STORAGE_KEY);
  }, [mode, sessionsDone, sessionId, totalTime, currentPreset]);

  async function toggleTimer() {
    if (!isRunning) {
      const now = Date.now();
      endTimeRef.current = now + timeLeft * 1000;
      startTimeRef.current = now;
      setIsRunning(true);
      showToast("Таймер запущен", "info");
      if (mode === "work" && user) {
        const { data } = await supabase.from("focus_sessions").insert({ user_id: user.id, task_id: selectedTask, duration_min: totalTime, session_type: "work", started_at: new Date().toISOString() }).select().single();
        if (data) setSessionId(data.id);
      }
    } else {
      setIsRunning(false);
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000);
      if (sessionId) {
        supabase.from("focus_sessions").update({ actual_duration_min: elapsed || 1 }).eq("id", sessionId);
      }
      showToast("Таймер на паузе", "info");
      setTimeLeft(Math.ceil((endTimeRef.current - Date.now()) / 1000));
    }
  }

  function stopTimer() {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionId) {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000);
      supabase.from("focus_sessions").update({ ended_at: new Date().toISOString(), actual_duration_min: elapsed || 1 }).eq("id", sessionId);
      setSessionId(null);
    }
    setMode("work");
    setTimeLeft(currentPreset.work * 60);
    setSessionsDone(0);
    localStorage.removeItem(STORAGE_KEY);
    showToast("Таймер сброшен", "info");
  }

  function resetTimer() {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode("work");
    setTimeLeft(currentPreset.work * 60);
    setSessionsDone(0);
    if (sessionId) {
      supabase.from("focus_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
      setSessionId(null);
    }
    localStorage.removeItem(STORAGE_KEY);
    showToast("Таймер сброшен", "info");
  }

  function switchPreset(p: PresetKey) {
    setPreset(p);
    setIsRunning(false);
    setMode("work");
    setTimeLeft(PRESETS[p].work * 60);
    setSessionsDone(0);
    if (sessionId) {
      supabase.from("focus_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
      setSessionId(null);
    }
    localStorage.removeItem(STORAGE_KEY);
    showToast(`Режим ${p}`, "info");
  }

  const modeLabel = mode === "work" ? "РАБОТА" : mode === "break" ? "ПЕРЕРЫВ" : "ДЛИННЫЙ ПЕРЕРЫВ";

  if (loading) return (
    <main className="p-4 flex flex-col items-center">
      <div className="skeleton h-10 w-64 rounded-full mb-8 mt-4" />
      <SkeletonCircle size={288} />
      <div className="skeleton h-4 w-32 mt-8 mb-10" />
      <div className="flex gap-6 mb-10">
        <div className="skeleton w-14 h-14 rounded-full" />
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="skeleton w-14 h-14 rounded-full" />
      </div>
      <div className="w-full max-w-sm skeleton h-12 rounded-2xl" />
    </main>
  );

  return (
    <main className="p-4 flex flex-col items-center">
      <div className="flex gap-2 mb-8 mt-4 animate-fade-up">
        {(Object.keys(PRESETS) as PresetKey[]).map((p) => (
          <button key={p} onClick={() => switchPreset(p)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${preset === p ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-ios-card-dark text-ios-gray shadow-sm"}`}>{p}</button>
        ))}
      </div>
      <div className="relative w-72 h-72 mb-6 animate-scale-in">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="#E5E5EA" strokeWidth="8" />
          <circle cx="130" cy="130" r="120" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="text-black dark:text-white transition-all duration-300" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-ios-gray text-sm uppercase tracking-widest mb-1">{modeLabel}</span>
          <span className="text-6xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-8 animate-fade-up">
        {[0,1,2,3].map((i) => <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < sessionsDone ? "bg-black dark:bg-white" : "bg-ios-separator"}`} />)}
        <span className="text-sm text-ios-gray ml-2">{sessionsDone}/4 сессий</span>
      </div>
      <div className="flex items-center gap-6 mb-10 animate-fade-up">
        <button onClick={resetTimer} className="w-14 h-14 rounded-full bg-white dark:bg-ios-card-dark flex items-center justify-center shadow-sm border border-ios-separator/30 active:scale-90 transition-transform"><RotateCcw size={22} /></button>
        <button onClick={toggleTimer} className="w-20 h-20 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform">{isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}</button>
        <button onClick={stopTimer} className="w-14 h-14 rounded-full bg-white dark:bg-ios-card-dark flex items-center justify-center shadow-sm border border-ios-separator/30 active:scale-90 transition-transform"><Square size={22} fill="currentColor" /></button>
      </div>
      <div className="w-full max-w-sm animate-fade-up">
        <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-2">Текущая задача</p>
        <button onClick={() => setShowTaskSelect(!showTaskSelect)} className="w-full bg-white dark:bg-ios-card-dark rounded-2xl px-4 py-3 shadow-sm border border-ios-separator/30 flex items-center justify-between text-left active:scale-[0.98] transition-transform">
          <span className={selectedTask ? "text-base font-medium" : "text-ios-gray"}>{tasks.find((t) => t.id === selectedTask)?.title || "Выберите задачу..."}</span>
          <ChevronDown size={18} className={`text-ios-gray transition-transform ${showTaskSelect ? "rotate-180" : ""}`} />
        </button>
        {showTaskSelect && (
          <div className="mt-2 bg-white dark:bg-ios-card-dark rounded-2xl shadow-sm border border-ios-separator/30 overflow-hidden animate-scale-in">
            {tasks.length === 0 && <div className="px-4 py-3 text-ios-gray text-sm">Нет активных задач</div>}
            {tasks.map((task) => (
              <button key={task.id} onClick={() => { setSelectedTask(task.id); setShowTaskSelect(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-ios-bg dark:hover:bg-white/5 transition-colors ${selectedTask === task.id ? "font-medium bg-ios-bg dark:bg-white/5" : ""}`}>{task.title}</button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
