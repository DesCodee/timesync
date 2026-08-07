"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Play, Pause, Square, RotateCcw, ChevronDown } from "lucide-react";

type Task = {
  id: string;
  title: string;
};

const PRESETS = {
  "25/5": { work: 25, break: 5, longBreak: 15 },
  "52/17": { work: 52, break: 17, longBreak: 30 },
  "90/20": { work: 90, break: 20, longBreak: 45 },
};

type Mode = "work" | "break" | "longBreak";

export default function FocusPage() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>("25/5");
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(PRESETS["25/5"].work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskSelect, setShowTaskSelect] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { user } = useUser();
  const supabase = createClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentPreset = PRESETS[preset];
  const totalTime =
    mode === "work" ? currentPreset.work : mode === "break" ? currentPreset.break : currentPreset.longBreak;

  const progress = ((totalTime * 60 - timeLeft) / (totalTime * 60)) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Загрузка активных задач
  useEffect(() => {
    if (!user) return;
    supabase
      .from("tasks")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTasks(data || []));
  }, [user]);

  // Таймер
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Обновляем сессию в БД
    if (sessionId) {
      const actualMin = Math.round((totalTime * 60 - timeLeft) / 60);
      supabase
        .from("focus_sessions")
        .update({ ended_at: new Date().toISOString(), actual_duration_min: actualMin || 1 })
        .eq("id", sessionId);
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
  }, [mode, sessionsDone, sessionId, totalTime, timeLeft, currentPreset]);

  async function toggleTimer() {
    if (!isRunning) {
      // Старт
      setIsRunning(true);
      startTimeRef.current = Date.now();

      if (mode === "work" && user) {
        const { data } = await supabase
          .from("focus_sessions")
          .insert({
            user_id: user.id,
            task_id: selectedTask,
            duration_min: currentPreset.work,
            session_type: "work",
            started_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (data) setSessionId(data.id);
      }
    } else {
      // Пауза
      setIsRunning(false);
      if (sessionId) {
        const actualMin = Math.round((Date.now() - startTimeRef.current) / 60000);
        supabase
          .from("focus_sessions")
          .update({ actual_duration_min: actualMin || 1 })
          .eq("id", sessionId);
      }
    }
  }

  function stopTimer() {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionId) {
      const actualMin = Math.round((Date.now() - startTimeRef.current) / 60000);
      supabase
        .from("focus_sessions")
        .update({ ended_at: new Date().toISOString(), actual_duration_min: actualMin || 1 })
        .eq("id", sessionId);
      setSessionId(null);
    }
    setMode("work");
    setTimeLeft(currentPreset.work * 60);
    setSessionsDone(0);
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
  }

  function switchPreset(p: keyof typeof PRESETS) {
    setPreset(p);
    setIsRunning(false);
    setMode("work");
    setTimeLeft(PRESETS[p].work * 60);
    setSessionsDone(0);
    if (sessionId) {
      supabase.from("focus_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
      setSessionId(null);
    }
  }

  const modeLabel = mode === "work" ? "РАБОТА" : mode === "break" ? "ПЕРЕРЫВ" : "ДЛИННЫЙ ПЕРЕРЫВ";

  return (
    <main className="p-4 flex flex-col items-center">
      {/* Пресеты */}
      <div className="flex gap-2 mb-8 mt-4">
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((p) => (
          <button
            key={p}
            onClick={() => switchPreset(p)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              preset === p
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-ios-card-dark text-ios-gray shadow-sm"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Круглый таймер */}
      <div className="relative w-72 h-72 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="#E5E5EA" strokeWidth="8" />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-black dark:text-white transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-ios-gray text-sm uppercase tracking-widest mb-1">{modeLabel}</span>
          <span className="text-6xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Сессии */}
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < sessionsDone ? "bg-black dark:bg-white" : "bg-ios-separator"
            }`}
          />
        ))}
        <span className="text-sm text-ios-gray ml-2">{sessionsDone}/4 сессий</span>
      </div>

      {/* Управление */}
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-full bg-white dark:bg-ios-card-dark flex items-center justify-center shadow-sm border border-ios-separator/30"
        >
          <RotateCcw size={22} />
        </button>
        <button
          onClick={toggleTimer}
          className="w-20 h-20 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg"
        >
          {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        <button
          onClick={stopTimer}
          className="w-14 h-14 rounded-full bg-white dark:bg-ios-card-dark flex items-center justify-center shadow-sm border border-ios-separator/30"
        >
          <Square size={22} fill="currentColor" />
        </button>
      </div>

      {/* Текущая задача */}
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-2">Текущая задача</p>
        <button
          onClick={() => setShowTaskSelect(!showTaskSelect)}
          className="w-full bg-white dark:bg-ios-card-dark rounded-2xl px-4 py-3 shadow-sm border border-ios-separator/30 flex items-center justify-between text-left"
        >
          <span className={selectedTask ? "text-base font-medium" : "text-ios-gray"}>
            {tasks.find((t) => t.id === selectedTask)?.title || "Выберите задачу..."}
          </span>
          <ChevronDown size={18} className={`text-ios-gray transition-transform ${showTaskSelect ? "rotate-180" : ""}`} />
        </button>

        {showTaskSelect && (
          <div className="mt-2 bg-white dark:bg-ios-card-dark rounded-2xl shadow-sm border border-ios-separator/30 overflow-hidden">
            {tasks.length === 0 && (
              <div className="px-4 py-3 text-ios-gray text-sm">Нет активных задач</div>
            )}
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  setSelectedTask(task.id);
                  setShowTaskSelect(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-ios-bg dark:hover:bg-white/5 transition-colors ${
                  selectedTask === task.id ? "font-medium bg-ios-bg dark:bg-white/5" : ""
                }`}
              >
                {task.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
