import { createServerFn } from "@tanstack/react-start";

export const ACCESS_COOKIE = "squishy-access";

const YEAR = 60 * 60 * 24 * 400;
const TASTER_CHECK = "https://www.everyschoolever.com/api/licence/check";

function visitorIp() {
  return import("@tanstack/react-start/server").then(({ getRequest }) => {
    const header = getRequest().headers.get("x-forwarded-for");
    const ip = (header ? header.split(",")[0] : getRequest().headers.get("x-real-ip"))?.trim() ?? "";
    return /^[0-9a-fA-F:.]+$/.test(ip) ? ip : "";
  });
}

async function openWeek(key: string) {
  const relay = process.env.TASTER_RELAY_SECRET?.trim() ?? "";
  const ip = await visitorIp();
  if (relay.length < 16 || !ip) return { ok: false as const };
  const response = await fetch(TASTER_CHECK, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-taster-auth": relay,
      "x-taster-ip": ip,
    },
    body: JSON.stringify({ key, siteId: "squishy" }),
  });
  const body = (await response.json().catch(() => null)) as { allowed?: boolean; expiresAt?: string } | null;
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt).getTime() : 0;
  if (!response.ok || !body?.allowed || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return { ok: false as const };
  }
  return { ok: true as const, exp: Math.floor(expiresAt / 1000) };
}

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
    const { isWeekKey, keyMatches, passToken, weekPass } = await import("./allowlist");
    const cookieBase = {
      httpOnly: true,
      secure: getRequestProtocol() === "https",
      sameSite: "lax" as const,
      path: "/",
    };
    if (isWeekKey(data.key)) {
      const opened = await openWeek(data.key);
      if (!opened.ok) return { ok: false as const };
      const token = weekPass(opened.exp);
      if (!token) return { ok: false as const };
      setCookie(ACCESS_COOKIE, token, {
        ...cookieBase,
        maxAge: Math.max(60, opened.exp - Math.floor(Date.now() / 1000)),
      });
      return { ok: true as const };
    }
    if (!keyMatches(data.key)) return { ok: false as const };
    setCookie(ACCESS_COOKIE, passToken(), { ...cookieBase, maxAge: YEAR });
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
