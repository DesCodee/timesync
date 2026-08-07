"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
};

type Task = {
  id: string;
  project_id: string | null;
  is_completed: boolean;
  due_date: string | null;
};

const COLORS = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#5856D6"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const supabase = createClient();

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  async function fetchData() {
    if (!user) return;
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tasks").select("id, project_id, is_completed, due_date").eq("user_id", user.id),
    ]);
    setProjects(p || []);
    setTasks(t || []);
    setLoading(false);
  }

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    await supabase.from("projects").insert({
      user_id: user.id,
      name: newName,
      description: newDesc || null,
      color: newColor,
    });
    setShowModal(false);
    setNewName("");
    setNewDesc("");
    setNewColor(COLORS[0]);
    fetchData();
  }

  function getStats(projectId: string) {
    const pt = tasks.filter((t) => t.project_id === projectId);
    const total = pt.length;
    const completed = pt.filter((t) => t.is_completed).length;
    const hasOverdue = pt.some(
      (t) => !t.is_completed && t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0))
    );
    return { total, completed, hasOverdue };
  }

  if (loading) return <div className="p-4">Загрузка...</div>;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.is_completed).length;

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold">Проекты</h1>
        <button onClick={() => setShowModal(true)} className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
          <span>+</span> Новый
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm border border-ios-separator/30">
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-xs text-ios-gray">Проектов</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm border border-ios-separator/30">
          <p className="text-2xl font-bold">{totalTasks}</p>
          <p className="text-xs text-ios-gray">Задач</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm border border-ios-separator/30">
          <p className="text-2xl font-bold">{doneTasks}</p>
          <p className="text-xs text-ios-gray">Готово</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((project) => {
          const s = getStats(project.id);
          const progress = s.total > 0 ? (s.completed / s.total) * 100 : 0;
          const status = s.hasOverdue ? "Просрочено" : "Активен";
          const statusColor = s.hasOverdue ? "text-brand-red bg-brand-red/10" : "text-brand-green bg-brand-green/10";

          return (
            <div key={project.id} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  <h3 className="text-base font-bold">{project.name}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{status}</span>
              </div>
              <p className="text-ios-gray text-sm mb-3">{project.description || "—"}</p>
              <div className="h-1.5 bg-ios-bg rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {["А", "М"].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-ios-card-dark" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                      {c}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-ios-gray">{s.completed}/{s.total} задач</span>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && <p className="text-ios-gray text-center py-8">Нет проектов. Создайте первый!</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Новый проект</h2>
              <button onClick={() => setShowModal(false)} className="text-ios-gray text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Название</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название проекта" required
                  className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60" />
              </div>
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Описание</label>
                <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Описание"
                  className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60" />
              </div>
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Цвет</label>
                <div className="flex gap-3">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setNewColor(c)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${newColor === c ? "border-black dark:border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium">
                Создать проект
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
