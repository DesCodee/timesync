"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Check, Plus, Search, X, Trash2, Edit3 } from "lucide-react";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";
import { SkeletonCard } from "@/components/skeletons";
import { useTranslation } from "@/hooks/use-translation";

type Task = { id: string; title: string; is_completed: boolean; is_mit: boolean; priority: string; due_date: string | null; project_id: string | null; };
type Project = { id: string; name: string; color: string };

const todayISO = () => new Date().toISOString().split("T")[0];

export default function TasksPage() {
  const { user } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();
  const { t, lang } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "noMIT" | "completed">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  async function fetchData() {
    if (!user) return;
    try {
      const [{ data: td }, { data: pd }] = await Promise.all([
        supabase.from("tasks").select("id, title, is_completed, is_mit, priority, due_date, project_id").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("projects").select("id, name, color").eq("user_id", user.id),
      ]);
      setTasks(td || []);
      setProjects(pd || []);
    } catch {
      showToast(lang === "en" ? "Network error" : "Ошибка сети", "error");
    }
    setLoading(false);
  }
  useEffect(() => { if (user) fetchData(); }, [user]);

  const filtered = tasks.filter((task) => {
    if (filter === "active") return !task.is_completed;
    if (filter === "completed") return task.is_completed;
    if (filter === "noMIT") return !task.is_mit;
    return true;
  }).filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.is_completed).length,
    noMIT: tasks.filter((t) => !t.is_mit).length,
    completed: tasks.filter((t) => t.is_completed).length,
  };

  async function toggleTask(id: string, done: boolean) {
    await supabase.from("tasks").update({ is_completed: !done, completed_at: !done ? new Date().toISOString() : null }).eq("id", id);
    showToast(!done ? t("dashboard", "markDone") : t("common", "cancel"), "success");
    fetchData();
  }

  async function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title) return;
    if (editing) {
      await supabase.from("tasks").update({ title, priority, due_date: dueDate || null, project_id: projectId }).eq("id", editing.id);
      showToast(t("common", "save"), "success");
    } else {
      await supabase.from("tasks").insert({ user_id: user.id, title, priority, due_date: dueDate || null, project_id: projectId, is_mit: false });
      showToast(t("tasks", "newTask") + " " + (lang === "en" ? "created" : "создана"), "success");
    }
    setShowModal(false);
    setEditing(null);
    setTitle(""); setPriority("medium"); setDueDate(""); setProjectId(null);
    fetchData();
  }

  async function deleteTask(id: string) {
    if (!window.confirm(t("common", "delete") + "?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    showToast(t("common", "delete"), "info");
    fetchData();
  }

  function openEdit(task: Task) {
    setEditing(task);
    setTitle(task.title);
    setPriority(task.priority);
    setDueDate(task.due_date || "");
    setProjectId(task.project_id);
    setShowModal(true);
  }

  function openNew() {
    setEditing(null);
    setTitle(""); setPriority("medium"); setDueDate(""); setProjectId(null);
    setShowModal(true);
  }

  const filters: { key: "all" | "active" | "noMIT" | "completed"; label: string }[] = [
    { key: "all", label: `${t("tasks", "all")} ${counts.all}` },
    { key: "active", label: `${t("tasks", "active")} ${counts.active}` },
    { key: "noMIT", label: `${t("tasks", "noMIT")} ${counts.noMIT}` },
    { key: "completed", label: `${t("tasks", "completed")} ${counts.completed}` },
  ];

  const priorityColor = (p: string) => {
    if (p === "critical") return "bg-brand-red";
    if (p === "high") return "bg-brand-orange";
    if (p === "medium") return "bg-brand-blue";
    return "bg-ios-gray";
  };

  const priorityLabel = (p: string) => {
    if (p === "critical") return t("tasks", "critical");
    if (p === "high") return t("tasks", "high");
    if (p === "medium") return t("tasks", "medium");
    return t("tasks", "low");
  };

  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2"><div className="skeleton h-8 w-32" /><div className="skeleton h-10 w-24 rounded-full" /></div>
      <div className="skeleton h-12 w-full rounded-2xl" />
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">{[0,1,2,3].map((i) => <div key={i} className="skeleton h-8 w-24 rounded-full" />)}</div>
      {[0,1,2].map((i) => <SkeletonCard key={i} lines={2} />)}
    </main>
  );

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[28px] font-bold">{t("tasks", "title")}</h1>
        <button onClick={openNew} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform flex items-center gap-1">
          <Plus size={16} /> {t("tasks", "add")}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("tasks", "search")} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-ios-card-dark border-0 text-base outline-none placeholder:text-ios-gray/60 shadow-sm" />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${filter === f.key ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-ios-card-dark text-ios-gray shadow-sm"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((task, i) => (
          <div key={task.id} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="flex items-center gap-3 bg-white dark:bg-ios-card-dark rounded-xl p-3 shadow-sm border border-ios-separator/30">
              <button onClick={() => toggleTask(task.id, task.is_completed)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.is_completed ? "bg-brand-green border-brand-green" : "border-ios-gray"} active:scale-85 transition-transform`}>
                {task.is_completed && <svg className="animate-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-base ${task.is_completed ? "line-through text-ios-gray" : ""}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${priorityColor(task.priority)}`} />
                  <span className="text-xs text-ios-gray capitalize">{priorityLabel(task.priority)}</span>
                  {task.due_date && <span className="text-xs text-ios-gray">{task.due_date}</span>}
                  {task.project_id && <span className="text-xs text-ios-gray">{projects.find((p) => p.id === task.project_id)?.name}</span>}
                </div>
              </div>
              <button onClick={() => openEdit(task)} className="p-2 rounded-lg hover:bg-ios-bg dark:hover:bg-white/5 text-ios-gray"><Edit3 size={16} /></button>
              <button onClick={() => deleteTask(task.id)} className="p-2 rounded-lg hover:bg-brand-red/10 text-ios-gray hover:text-brand-red"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-ios-gray text-sm text-center py-8">{t("tasks", "noTasks")}</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t("tasks", "edit") : t("tasks", "newTask")}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-ios-gray" /></button>
            </div>
            <form onSubmit={saveTask} className="space-y-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("tasks", "title")} required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none placeholder:text-ios-gray/60" />
              <div>
                <label className="text-xs text-ios-gray mb-1 block">{t("tasks", "priority")}</label>
                <div className="flex gap-2">
                  {["critical", "high", "medium", "low"].map((p) => (
                    <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${priority === p ? "bg-black text-white dark:bg-white dark:text-black" : "bg-ios-bg dark:bg-white/5 text-ios-gray"}`}>
                      {priorityLabel(p)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-ios-gray mb-1 block">{t("tasks", "dueDate")}</label>
                <input type="date" lang={lang} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none" />
              </div>
              <div>
                <label className="text-xs text-ios-gray mb-1 block">{t("tasks", "project")}</label>
                <select value={projectId || ""} onChange={(e) => setProjectId(e.target.value || null)} className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none">
                  <option value="">{lang === "en" ? "None" : "Нет"}</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl bg-ios-bg dark:bg-white/10 font-medium active:scale-[0.98] transition-transform">{t("common", "cancel")}</button>
                <button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-medium active:scale-[0.98] transition-transform">{t("common", "save")}</button>
              </div>
              {editing && <button type="button" onClick={() => { deleteTask(editing.id); setShowModal(false); }} className="w-full py-3 rounded-xl text-brand-red font-medium active:scale-[0.98] transition-transform">{t("common", "delete")}</button>}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
