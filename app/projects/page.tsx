"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Plus, X, Trash2, Edit3 } from "lucide-react";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";
import { SkeletonCard } from "@/components/skeletons";
import { useTranslation } from "@/hooks/use-translation";

type Project = { id: string; name: string; color: string; order: number };
type Task = { id: string; title: string; is_completed: boolean; project_id: string | null; status: string };

const COLORS = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#007AFF", "#5856D6", "#AF52DE", "#FF2D55"];

export default function ProjectsPage() {
  const { user } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();
  const { t, lang } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  async function fetchData() {
    if (!user) return;
    try {
      const [{ data: pd }, { data: td }] = await Promise.all([
        supabase.from("projects").select("id, name, color, order").eq("user_id", user.id).order("order"),
        supabase.from("tasks").select("id, title, is_completed, project_id, status").eq("user_id", user.id),
      ]);
      setProjects(pd || []);
      setTasks(td || []);
    } catch {
      showToast(lang === "en" ? "Network error" : "Ошибка сети", "error");
    }
    setLoading(false);
  }
  useEffect(() => { if (user) fetchData(); }, [user]);

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name) return;
    if (editing) {
      await supabase.from("projects").update({ name, color }).eq("id", editing.id);
      showToast(t("common", "save"), "success");
    } else {
      await supabase.from("projects").insert({ user_id: user.id, name, color, order: projects.length });
      showToast(t("projects", "newProject") + " " + (lang === "en" ? "created" : "создан"), "success");
    }
    setShowModal(false);
    setEditing(null);
    setName("");
    setColor(COLORS[0]);
    fetchData();
  }

  async function deleteProject(id: string) {
    if (!window.confirm(t("common", "delete") + "?")) return;
    await supabase.from("projects").delete().eq("id", id);
    showToast(t("common", "delete"), "info");
    fetchData();
  }

  function openEdit(p: Project) {
    setEditing(p);
    setName(p.name);
    setColor(p.color);
    setShowModal(true);
  }

  function openNew() {
    setEditing(null);
    setName("");
    setColor(COLORS[0]);
    setShowModal(true);
  }

  async function moveTask(taskId: string, newStatus: string) {
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    fetchData();
  }

  const columns = [
    { key: "todo", label: t("projects", "toDo") },
    { key: "inprogress", label: t("projects", "inProgress") },
    { key: "done", label: t("projects", "done") },
  ];

  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2"><div className="skeleton h-8 w-32" /><div className="skeleton h-10 w-24 rounded-full" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[0,1,2].map((i) => <SkeletonCard key={i} lines={4} />)}</div>
    </main>
  );

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[28px] font-bold">{t("projects", "title")}</h1>
        <button onClick={openNew} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform flex items-center gap-1">
          <Plus size={16} /> {t("projects", "new")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider">{col.label}</h3>
              <span className="text-xs text-ios-gray">{tasks.filter((t) => (t.status || "todo") === col.key && t.project_id).length} {t("projects", "tasks")}</span>
            </div>
            <div className="space-y-2">
              {tasks.filter((t) => (t.status || "todo") === col.key && t.project_id).map((task) => {
                const project = projects.find((p) => p.id === task.project_id);
                return (
                  <div key={task.id} className="p-3 rounded-xl bg-ios-bg dark:bg-white/5 border border-ios-separator/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project?.color || "#999" }} />
                      <span className="text-xs text-ios-gray truncate">{project?.name}</span>
                    </div>
                    <p className={`text-sm ${task.is_completed ? "line-through text-ios-gray" : ""}`}>{task.title}</p>
                    <div className="flex gap-1 mt-2">
                      {columns.filter((c) => c.key !== col.key).map((c) => (
                        <button key={c.key} onClick={() => moveTask(task.id, c.key)} className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-ios-card-dark shadow-sm">{c.label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && <p className="text-ios-gray text-sm text-center py-8">{t("projects", "noProjects")}</p>}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? t("projects", "edit") : t("projects", "newProject")}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-ios-gray" /></button>
            </div>
            <form onSubmit={saveProject} className="space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("projects", "name")} required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base outline-none placeholder:text-ios-gray/60" />
              <div>
                <label className="text-xs text-ios-gray mb-1 block">{t("projects", "color")}</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-black dark:ring-white" : ""}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl bg-ios-bg dark:bg-white/10 font-medium active:scale-[0.98] transition-transform">{t("common", "cancel")}</button>
                <button type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-medium active:scale-[0.98] transition-transform">{t("common", "save")}</button>
              </div>
              {editing && <button type="button" onClick={() => { deleteProject(editing.id); setShowModal(false); }} className="w-full py-3 rounded-xl text-brand-red font-medium active:scale-[0.98] transition-transform">{t("common", "delete")}</button>}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
