import { useState, useEffect, useCallback } from "react";

export function useOfflineSync<T>(key: string, fetcher: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await fetcher();
      setData(fresh);
      localStorage.setItem(`offline-${key}`, JSON.stringify(fresh));
    } catch {
      const cached = localStorage.getItem(`offline-${key}`);
      if (cached) setData(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    const cached = localStorage.getItem(`offline-${key}`);
    if (cached) {
      try { setData(JSON.parse(cached)); } catch {}
      setLoading(false);
    }
    refresh();
  }, [refresh]);

  return { data, setData, loading, refresh };
}
