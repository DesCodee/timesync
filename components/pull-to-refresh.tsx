"use client";

import { useState, useRef, useCallback, ReactNode } from "react";

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: ReactNode }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const y = e.touches[0].clientY;
    const diff = y - startY.current;
    if (diff > 0 && diff < 150) {
      setPulling(true);
      setPullDistance(diff);
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance > 80) {
      setPullDistance(80);
      try { await onRefresh(); } catch {}
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, onRefresh]);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="relative touch-pan-y">
      <div className="absolute left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        style={{ top: 0, transform: `translateY(${Math.max(0, pullDistance - 40)}px)`, opacity: Math.min(1, pullDistance / 60), transition: pulling ? "none" : "all 0.3s ease" }}>
        <div className="w-6 h-6 border-2 border-ios-gray border-t-brand-blue rounded-full animate-spin" />
      </div>
      <div style={{ transform: `translateY(${pullDistance * 0.4}px)`, transition: pulling ? "none" : "transform 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        {children}
      </div>
    </div>
  );
}
