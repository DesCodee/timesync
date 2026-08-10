"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { ArrowLeft, Lock, Download, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function AccountPage() {
  const { user, profile } = useUser();
  const supabase = createClient();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else setMessage("Password updated successfully");
    setNewPassword("");
    setLoading(false);
  }

  async function exportData() {
    const { data: tasks } = await supabase.from("tasks").select("*").eq("user_id", user?.id);
    const { data: habits } = await supabase.from("habits").select("*").eq("user_id", user?.id);
    const { data: sessions } = await supabase.from("focus_sessions").select("*").eq("user_id", user?.id);
    const payload = { profile, tasks, habits, sessions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesync-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setLoading(true);
    await supabase.from("profiles").delete().eq("user_id", user?.id);
    await supabase.from("tasks").delete().eq("user_id", user?.id);
    await supabase.from("habits").delete().eq("user_id", user?.id);
    await supabase.from("focus_sessions").delete().eq("user_id", user?.id);
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><ArrowLeft size={22} /></Link>
          <h1 className="text-[28px] font-bold">Account</h1>
        </div>

        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30 space-y-1">
          <p className="text-ios-gray text-sm">Signed in as</p>
          <p className="text-lg font-semibold">{profile?.name || user?.email?.split("@")[0]}</p>
          <p className="text-ios-gray text-sm">{user?.email}</p>
        </div>

        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Lock size={18} /> Change Password</h2>
          <form onSubmit={changePassword} className="space-y-3">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required minLength={6} className="w-full px-4 py-3 rounded-2xl bg-ios-bg dark:bg-ios-dark border-0 text-base outline-none placeholder:text-ios-gray/60" />
            {error && <p className="text-sm text-brand-red">{error}</p>}
            {message && <p className="text-sm text-brand-green">{message}</p>}
            <button type="submit" disabled={loading || !newPassword} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-2xl text-base font-medium active:scale-[0.98] transition-transform disabled:opacity-50">Update Password</button>
          </form>
        </div>

        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Download size={18} /> Data Export</h2>
          <p className="text-ios-gray text-sm">Download all your tasks, habits, and focus sessions as JSON.</p>
          <button onClick={exportData} className="w-full bg-ios-bg dark:bg-ios-dark py-3 rounded-2xl text-base font-medium active:scale-[0.98] transition-transform">Export My Data</button>
        </div>

        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-brand-red"><Trash2 size={18} /> Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full border border-brand-red text-brand-red py-3 rounded-2xl text-base font-medium active:scale-[0.98] transition-transform">Delete Account</button>
          ) : (
            <div className="space-y-3 animate-fade-up">
              <div className="flex items-start gap text-brand-red bg-brand-red/10 rounded-xl p-3">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">This will permanently delete all your data. This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-ios-bg dark:bg-ios-dark py-3 rounded-2xl text-base font-medium">Cancel</button>
                <button onClick={deleteAccount} disabled={loading} className="flex-1 bg-brand-red text-white py-3 rounded-2xl text-base font-medium active:scale-[0.98] transition-transform disabled:opacity-50">Confirm Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
