import { createServerFn } from "@tanstack/react-start";

export const ACCESS_COOKIE = "squishy-access";

const YEAR = 60 * 60 * 24 * 400;

export const readAccess = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getCookie } = await import("@tanstack/react-start/server");
    const { hasPass } = await import("./allowlist");
    return hasPass(getCookie(ACCESS_COOKIE));
  } catch {
    return false;
  }
});

export const unlockWithKey = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const key =
      input && typeof input === "object" && "key" in input && typeof input.key === "string" ? input.key : "";
    return { key: key.slice(0, 80) };
  })
  .handler(async ({ data }) => {
    const { getRequestProtocol, setCookie } = await import("@tanstack/react-start/server");
    const { keyMatches, passToken } = await import("./allowlist");
    if (!keyMatches(data.key)) return { ok: false as const };
    setCookie(ACCESS_COOKIE, passToken(), {
      httpOnly: true,
      secure: getRequestProtocol() === "https",
      sameSite: "lax",
      path: "/",
      maxAge: YEAR,
    });
    return { ok: true as const };
  });

export const lockShelf = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie, getRequestProtocol } = await import("@tanstack/react-start/server");
  deleteCookie(ACCESS_COOKIE, {
    path: "/",
    secure: getRequestProtocol() === "https",
    sameSite: "lax",
  });
  return { ok: true as const };
});
