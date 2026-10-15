import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { type Lang, writeLangCookie } from "@/lib/i18n/languages";
import { translate, type MessageKey } from "@/lib/i18n/messages";

type I18n = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18n | null>(null);

const TITLE_KEY: Record<string, MessageKey> = {
  "/": "meta.home",
  "/top": "meta.top",
  "/play": "meta.play",
  "/projects": "meta.projects",
  "/about": "meta.about",
  "/suggest": "meta.suggest",
};

export function LanguageProvider({
  initial,
  unlocked,
  children,
}: {
  initial: Lang;
  unlocked: boolean;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initial);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang: (next) => {
        writeLangCookie(next);
        setLangState(next);
      },
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    if (!unlocked && pathname !== "/") {
      document.title = "Every Squishy Ever";
      return;
    }
    const key = TITLE_KEY[pathname];
    if (key) document.title = translate(lang, key);
  }, [lang, pathname, unlocked]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("LanguageProvider is missing");
  return value;
}
