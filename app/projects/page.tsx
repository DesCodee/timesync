"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Pencil, Trash2, X } from "lucide-react";
import { anim } from "@/lib/anim";
import { useToast } from "@/lib/toast";
import { SkeletonWidget, SkeletonCard } from "@/components/skeletons";

type Project = { id: string; name: string; description: string | null; color: string };
type Task = { id: string; project_id: string | null; is_completed: boolean; due_date: string | null };

const COLORS = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#5856D6"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();
  const { showToast } = useToast();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  async function fetchData() {
    if (!user) return;
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tasks").select("id, project_id, is_completed, due_date").eq("user_id", user.id),
    ]);
    setProjects(p || []); setTasks(t || []); setLoading(false);
  }
  useEffect(() => { if (user) fetchData(); }, [user]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    await supabase.from("projects").insert({ user_id: user.id, name: newName, description: newDesc || null, color: newColor });
    showToast("Проект создан", "success");
    closeModal(); fetchData();
  }
  async function updateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !newName.trim()) return;
    await supabase.from("projects").update({ name: newName, description: newDesc || null, color: newColor }).eq("id", editId);
    showToast("Проект обновлён", "success");
    closeModal(); fetchData();
  }
  async function deleteProject(id: string) {
    if (!window.confirm("Удалить проект?")) return;
    await supabase.from("projects").delete().eq("id", id);
    showToast("Проект удалён", "info");
    fetchData();
  }
  function getStats(projectId: string) {
    const pt = tasks.filter((t) => t.project_id === projectId);
    return { total: pt.length, completed: pt.filter((t) => t.is_completed).length, hasOverdue: pt.some((t) => !t.is_completed && t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0))) };
  }
  function openEdit(p: Project) { setEditMode(true); setEditId(p.id); setNewName(p.name); setNewDesc(p.description || ""); setNewColor(p.color); setShowModal(true); }
  function openCreate() { setEditMode(false); setEditId(null); setNewName(""); setNewDesc(""); setNewColor(COLORS[0]); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditMode(false); setEditId(null); }

  if (loading) return (
    <main className="p-4 space-y-4">
      <div className="skeleton h-8 w-32 mb-4" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0,1,2].map((i) => <SkeletonWidget key={i} />)}
      </div>
      {[0,1,2].map((i) => <SkeletonCard key={i} lines={3} />)}
    </main>
  );

  const totalTasks = tasks.length; const doneTasks = tasks.filter((t) => t.is_completed).length;

  return (
    <main className="p-4">
      <div className={anim("animate-fade-up")}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-bold">Проекты</h1>
          <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 active:scale-95 transition-transform"><span>+</span> Новый</button>
        </div>
      </div>
      <div className={anim("animate-fade-up", 1)}>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{ label: "Проектов", value: projects.length }, { label: "Задач", value: totalTasks }, { label: "Готово", value: doneTasks }].map((s, i) => (
            <div key={s.label} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm border border-ios-separator/30 active:scale-[0.97] transition-transform">
                <p className="text-2xl font-bold animate-scale-in">{s.value}</p>
                <p className="text-xs text-ios-gray">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {projects.map((project, i) => {
          const s = getStats(project.id);
          const progress = s.total > 0 ? (s.completed / s.total) * 100 : 0;
          const status = s.hasOverdue ? "Просрочен" : "Активен";
          const statusColor = s.hasOverdue ? "text-brand-red bg-brand-red/10" : "text-brand-green bg-brand-green/10";
          return (
            <div key={project.id} className={anim("animate-fade-up", i)} style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30 group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                    <h3 className="text-base font-bold">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{status}</span>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg hover:bg-ios-bg dark:hover:bg-white/10 text-ios-gray"><Pencil size={14} /></button>
                      <button onClick={() => deleteProject(project.id)} className="p-1.5 rounded-lg hover:bg-brand-red/10 text-ios-gray hover:text-brand-red"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
                <p className="text-ios-gray text-sm mb-3">{project.description || "—"}</p>
                <div className="h-1.5 bg-ios-bg rounded-full overflow-hidden mb-3"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: project.color }} /></div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">{["А","М"].map((c, idx) => (<div key={idx} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-ios-card-dark" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>{c}</div>))}</div>
                  <span className="text-sm text-ios-gray">{s.completed}/{s.total} задач</span>
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && <p className="text-ios-gray text-center py-8">Нет проектов. Создайте первый!</p>}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-ios-card-dark w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editMode ? "Редактировать" : "Новый проект"}</h2>
              <button onClick={closeModal} className="text-ios-gray"><X size={20} /></button>
            </div>
            <form onSubmit={editMode ? updateProject : createProject} className="space-y-4">
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Название</label><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название проекта" required className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60" /></div>
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Описание</label><input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Описание" className="w-full px-4 py-3 rounded-xl bg-ios-bg dark:bg-white/5 border-0 text-base focus:ring-2 focus:ring-black dark:focus:ring-white outline-none placeholder:text-ios-gray/60" /></div>
              <div><label className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-1.5 block">Цвет</label><div className="flex gap-3">{COLORS.map((c) => (<button key={c} type="button" onClick={() => setNewColor(c)} className={`w-10 h-10 rounded-full border-2 transition-all ${newColor === c ? "border-black dark:border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />))}</div></div>
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-base font-medium active:scale-[0.98] transition-transform">{editMode ? "Сохранить" : "Создать проект"}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
