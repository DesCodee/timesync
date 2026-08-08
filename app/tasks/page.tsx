"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Star, Calendar, Pencil, Trash2, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";
import { SkeletonCard } from "@/components/skeletons";

type Task = { id: string; title: string; description: string | null; priority: string; work_type: string | null; due_date: string | null; is_mit: boolean; is_completed: boolean; completed_at: string | null; project_id: string | null; projects?: { name: string } | null; };
type Project = { id: string; name: string };

const priorityColors: Record<string, string> = { critical: "bg-brand-red text-white", high: "bg-brand-orange text-white", medium: "bg-brand-blue text-white", low: "bg-ios-bg text-ios-gray dark:bg-white/10" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newWorkType, setNewWorkType] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMit, setNewMit] = useState(false);

  async function fetchTasks() { if (!user) return; const { data } = await supabase.from("tasks").select("*, projects(name)").eq("user_id", user.id).order("created_at", { ascending: false }); setTasks(data || []); setLoading(false); }
  async function fetchProjects() { if (!user) return; const { data } = await supabase.from("projects").select("id, name").eq("user_id", user.id); setProjects(data || []); }
  useEffect(() => { if (user) { fetchTasks(); fetchProjects(); } }, [user]);

  async function toggleTask(id: string, current: boolean) {
    await supabase.from("tasks").update({ is_completed: !current, completed_at: !current ? new Date().toISOString() : null }).eq("id", id);
    showToast(!current ? "Задача выполнена!" : "Задача возвращена", "success");
    fetchTasks();
  }
  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;
    await supabase.from("tasks").insert({ user_id: user.id, title: newTitle, priority: newPriority, work_type: newWorkType || null, project_id: newProject || null, due_date: newDate || null, is_mit: newMit });
    showToast("Задача создана", "success");
    closeModal(); fetchTasks();
  }
  async function updateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !newTitle.trim()) return;
    await supabase.from("tasks").update({ title: newTitle, priority: newPriority, work_type: newWorkType || null, project_id: newProject || null, due_date: newDate || null, is_mit: newMit }).eq("id", editId);
    showToast("Задача обновлена", "success");
    closeModal(); fetchTasks();
  }
  async function deleteTask(id: string) {
    if (!window.confirm("Удалить задачу?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    showToast("Задача удалена", "info");
    fetchTasks();
  }
  function openEdit(task: Task) { setEditMode(true); setEditId(task.id); setNewTitle(task.title); setNewPriority(task.priority); setNewWorkType(task.work_type || ""); setNewProject(task.project_id || ""); setNewDate(task.due_date || ""); setNewMit(task.is_mit); setShowModal(true); }
  function openCreate() { setEditMode(false); setEditId(null); setNewTitle(""); setNewPriority("medium"); setNewWorkType(""); setNewProject(""); setNewDate(""); setNewMit(false); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditMode(false); setEditId(null); }

  const filtered = tasks.filter((t) => { const m = t.title.toLowerCase().includes(search.toLowerCase()); if (filter === "active") return m && !t.is_completed; if (filter === "done") return m && t.is_completed; if (filter === "no-mit") return m && !t.is_mit && !t.is_completed; return m; });
  const counts = { all: tasks.length, active: tasks.filter((t) => !t.is_completed).length, "no-mit": tasks.filter((t) => !t.is_mit && !t.is_completed).length, done: tasks.filter((t) => t.is_completed).length };
  const filters = [{ key: "all", label: "Все" }, { key: "active", label: "Активные" }, { key: "no-mit", label: "Без MIT" }, { key: "done", label: "Готово" }];

  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="skeleton h-8 w-32 mb-4" />
      <div className="skeleton h-12 w-full rounded-2xl mb-4" />
      <div className="flex gap-2 mb-4">
        {[0,1,2,3].map((i) => <div key={i} className="skeleton h-10 flex-1 rounded-full" />)}
      </div>
      {[0,1,2,3,4].map((i) => <SkeletonCard key={i} lines={2} />)}
    </main>
  );

  return (
    <main className="p-4">
      <div className={anim("animate-fade-up")}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-bold">Задачи</h1>
          <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 active:scale-95 transition-transform"><span>+</span> Новая</button>
        </div>
      </div>
      <div className={anim("animate-fade-up", 1)}>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск задач..." className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60 shadow-sm" />
        </div>
      </div>
      <div className={anim("animate-fade-up", 2)}>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${filter === f.key ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-ios-card-dark text-ios-gray shadow-sm"}`}>
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-ios-bg dark:bg-white/10"}`}>{counts[f.key as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((task, i) => (
          <div key={task.id} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30 group">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleTask(task.id, task.is_completed)} className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.is_completed ? "bg-brand-green border-brand-green" : "border-ios-gray"} active:scale-85 transition-transform`}>
                  {task.is_completed && <svg className="animate-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(task)}>
                  <p className={`text-base font-medium ${task.is_completed ? "line-through text-ios-gray" : ""}`}>{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    {task.work_type && <span className="text-xs px-2 py-0.5 rounded-md bg-ios-bg dark:bg-white/10 text-ios-gray">{task.work_type}</span>}
                    {task.projects?.name && <span className="text-xs px-2 py-0.5 rounded-md bg-ios-bg dark:bg-white/10 text-ios-gray">#{task.projects.name}</span>}
                    {task.due_date && <span className="text-xs flex items-center gap-1 text-ios-gray"><Calendar size={12} />{task.due_date}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-ios-bg dark:hover:bg-white/10 text-ios-gray"><Pencil size={16} /></button>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-brand-red/10 text-ios-gray hover:text-brand-red"><Trash2 size={16} /></button>
                </div>
                {task.is_mit && <Star size={18} className="text-black dark:text-white fill-current flex-shrink-0" />}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-ios-gray text-center py-8">Нет задач</p>}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editMode ? "Редактировать" : "Новая задача"}</h2>
              <button onClick={closeModal} className="text-ios-gray text-2xl leading-none"><X size={20} /></button>
            </div>
            <form onSubmit={editMode ? updateTask : createTask} className="space-y-4">
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Название</label><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Что нужно сделать?" required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60" /></div>
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Приоритет</label><div className="flex gap-2">{["critical","high","medium","low"].map((p) => (<button key={p} type="button" onClick={() => setNewPriority(p)} className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize ${newPriority === p ? priorityColors[p] : "bg-ios-bg dark:bg-white/5 text-ios-gray"}`}>{p}</button>))}</div></div>
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Тип работы</label><select value={newWorkType} onChange={(e) => setNewWorkType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"><option value="">Выберите...</option><option value="Deep Work">Deep Work</option><option value="Light Work">Light Work</option><option value="Creative">Creative</option><option value="Admin">Admin</option></select></div>
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Проект</label><select value={newProject} onChange={(e) => setNewProject(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"><option value="">Без проекта</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Дедлайн</label><input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" /></div>
              <div className="flex items-center gap-3"><button type="button" onClick={() => setNewMit(!newMit)} className={`w-6 h-6 rounded border-2 flex items-center justify-center ${newMit ? "bg-brand-green border-brand-green" : "border-ios-gray"}`}>{newMit && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}</button><span className="text-sm">Сделать MIT</span></div>
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium active:scale-[0.98] transition-transform">{editMode ? "Сохранить" : "Создать задачу"}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
