export const LANGS = ["en", "de", "gd", "cy", "ga", "fr", "it", "es", "ru"] as const;

export type Lang = (typeof LANGS)[number];

export const LANG_COOKIE = "squishy-lang";

export const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  de: "Deutsch",
  gd: "Gàidhlig",
  cy: "Cymraeg",
  ga: "Gaeilge",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  ru: "Русский",
};

export function parseLang(value: string | null | undefined): Lang {
  const code = (value ?? "").toLowerCase();
  return (LANGS as readonly string[]).includes(code) ? (code as Lang) : "en";
}

export function readDocumentLang(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )squishy-lang=([^;]*)/);
  return parseLang(match?.[1] ? decodeURIComponent(match[1]) : "");
}

export function writeLangCookie(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

