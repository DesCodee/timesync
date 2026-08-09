"use client";
import Link from "next/link";
import { Clock, CheckCircle2, Flame, CalendarDays, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <main className="min-h-screen bg-ios-bg dark:bg-ios-dark">
      <div className="max-w-md mx-auto px-6 py-12 space-y-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-black dark:bg-white flex items-center justify-center">
            <Clock size={40} className="text-white dark:text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">TimeSync</h1>
          <p className="text-ios-gray text-lg">Tasks, habits, focus & meetings — all in one place.</p>
          <Link href="/auth" className="mt-4 inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl text-base font-medium active:scale-[0.98] transition-transform">
            Get Started <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30">
            <CheckCircle2 className="text-brand-green mb-3" size={28} />
            <h3 className="font-semibold text-base">Daily Tasks</h3>
            <p className="text-ios-gray text-sm mt-1">MIT prioritization & progress tracking</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30">
            <Flame className="text-brand-orange mb-3" size={28} />
            <h3 className="font-semibold text-base">Habit Streaks</h3>
            <p className="text-ios-gray text-sm mt-1">Build consistency with fire streaks</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30">
            <Clock className="text-brand-blue mb-3" size={28} />
            <h3 className="font-semibold text-base">Focus Timer</h3>
            <p className="text-ios-gray text-sm mt-1">Pomodoro sessions with stats</p>
          </div>
          <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-5 shadow-sm border border-ios-separator/30">
            <CalendarDays className="text-brand-purple mb-3" size={28} />
            <h3 className="font-semibold text-base">Meetings</h3>
            <p className="text-ios-gray text-sm mt-1">Schedule & never miss a call</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-ios-gray text-sm">Already have an account?</p>
          <Link href="/auth" className="text-base font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
