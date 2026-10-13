import { createServerFn } from "@tanstack/react-start";
import { LANG_COOKIE } from "@/lib/i18n/languages";

export const readLangCookie = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(LANG_COOKIE) ?? "";
});
