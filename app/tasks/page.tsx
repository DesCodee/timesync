"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Star, Calendar } from "lucide-react";
import { useUser } from "@/hooks/use-user";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  work_type: string | null;
  due_date: string | null;
  is_mit: boolean;
  is_completed: boolean;
  completed_at: string | null;
  project_id: string | null;
  projects?: { name: string } | null;
};

type Project = {
  id: string;
  name: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const supabase = createClient();

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newWorkType, setNewWorkType] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMit, setNewMit] = useState(false);

  async function fetchTasks() {
    if (!user) return;
    const { data } = await supabase
      .from("tasks")
      .select("*, projects(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  async function fetchProjects() {
    if (!user) return;
    const { data } = await supabase.from("projects").select("id, name").eq("user_id", user.id);
    setProjects(data || []);
  }

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProjects();
    }
  }, [user]);

  async function toggleTask(id: string, current: boolean) {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !current, completed_at: !current ? new Date().toISOString() : null })
      .eq("id", id);
    if (!error) fetchTasks();
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTitle,
      priority: newPriority,
      work_type: newWorkType || null,
      project_id: newProject || null,
      due_date: newDate || null,
      is_mit: newMit,
    });
    if (!error) {
      setShowModal(false);
      setNewTitle("");
      setNewPriority("medium");
      setNewWorkType("");
      setNewProject("");
      setNewDate("");
      setNewMit(false);
      fetchTasks();
    }
  }

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && !t.is_completed;
    if (filter === "done") return matchesSearch && t.is_completed;
    if (filter === "no-mit") return matchesSearch && !t.is_mit && !t.is_completed;
    return matchesSearch;
  });

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.is_completed).length,
    "no-mit": tasks.filter((t) => !t.is_mit && !t.is_completed).length,
    done: tasks.filter((t) => t.is_completed).length,
  };

  const priorityColors: Record<string, string> = {
    critical: "bg-brand-red text-white",
    high: "bg-brand-orange text-white",
    medium: "bg-brand-blue text-white",
    low: "bg-ios-bg text-ios-gray dark:bg-white/10",
  };

  const filters = [
    { key: "all", label: "Все" },
    { key: "active", label: "Активные" },
    { key: "no-mit", label: "Без MIT" },
    { key: "done", label: "Готово" },
  ];

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold">Задачи</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1"
        >
          <span>+</span> Новая
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск задач..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60 shadow-sm"
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-ios-card-dark text-ios-gray shadow-sm"
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-ios-bg dark:bg-white/10"}`}>
              {counts[f.key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTask(task.id, task.is_completed)}
                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  task.is_completed ? "bg-brand-green border-brand-green" : "border-ios-gray"
                }`}
              >
                {task.is_completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-medium ${task.is_completed ? "line-through text-ios-gray" : ""}`}>
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  {task.work_type && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-ios-bg dark:bg-white/10 text-ios-gray">
                      {task.work_type}
                    </span>
                  )}
                  {task.projects?.name && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-ios-bg dark:bg-white/10 text-ios-gray">
                      #{task.projects.name}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="text-xs flex items-center gap-1 text-ios-gray">
                      <Calendar size={12} />
                      {task.due_date}
                    </span>
                  )}
                </div>
              </div>
              {task.is_mit && <Star size={18} className="text-black dark:text-white fill-current" />}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-ios-gray text-center py-8">Нет задач</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Новая задача</h2>
              <button onClick={() => setShowModal(false)} className="text-ios-gray text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Название</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Что нужно сделать?"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Приоритет</label>
                <div className="flex gap-2">
                  {["critical", "high", "medium", "low"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize ${
                        newPriority === p ? priorityColors[p] : "bg-ios-bg dark:bg-white/5 text-ios-gray"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Тип работы</label>
                <select
                  value={newWorkType}
                  onChange={(e) => setNewWorkType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                >
                  <option value="">Выберите...</option>
                  <option value="Deep Work">Deep Work</option>
                  <option value="Light Work">Light Work</option>
                  <option value="Creative">Creative</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Проект</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                >
                  <option value="">Без проекта</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Дедлайн</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewMit(!newMit)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    newMit ? "bg-brand-green border-brand-green" : "border-ios-gray"
                  }`}
                >
                  {newMit && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </button>
                <span className="text-sm">Сделать MIT (главной задачей дня)</span>
              </div>
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium">
                Создать задачу
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
