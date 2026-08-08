"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dict, Lang, Dict } from "./dict";

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (section: keyof Dict, key: string) => string };

const I18nContext = createContext<I18nCtx>({ lang: "ru", setLang: () => {}, t: () => "" });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => {
    const saved = (localStorage.getItem("timesync-lang") as Lang) || "ru";
    setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("timesync-lang", l); };
  const t = (section: keyof Dict, key: string) => {
    const s = dict[lang][section] as Record<string, string>;
    return s?.[key] ?? key;
  };
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
