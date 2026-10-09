import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { squishies } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

const SHELF_CACHE = "every-squishy-ever-v2";

type Device = "iphone" | "ipad" | "other";
type SaveStatus = "idle" | "saving" | "saved" | "partial" | "error";

function detectDevice(): Device {
  const ua = navigator.userAgent || "";
  if (/iPad/.test(ua)) return "ipad";
  if (/iPhone|iPod/.test(ua)) return "iphone";
  if (/Mac/.test(navigator.platform || "") && navigator.maxTouchPoints > 1) return "ipad";
  return "other";
}

function iosMajor() {
  const ua = navigator.userAgent || "";
  const iphone = ua.match(/iPhone OS (\d+)[._]/);
  const ipad = ua.match(/CPU OS (\d+)[._]/);
  const safari = ua.match(/Version\/(\d+)[._]/);
  const os = iphone ? Number(iphone[1]) : ipad ? Number(ipad[1]) : null;
  const version = safari ? Number(safari[1]) : null;
  if (os == null && version == null) return null;
  return Math.max(os ?? 0, version ?? 0);
}

function inSafari(device: Device) {
  if (device === "other") return true;
  const ua = navigator.userAgent || "";
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV/i.test(ua);
}

function labelFor(device: Device) {
  if (device === "iphone") return "Add to iPhone";
  if (device === "ipad") return "Add to iPad";
  return "Add to iPhone or iPad";
}

function deviceName(device: Device) {
  if (device === "ipad") return "iPad";
  if (device === "iphone") return "iPhone";
  return "iPhone or iPad";
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function cacheable(name: string) {
  try {
    const url = new URL(name, location.origin);
    if (url.origin !== location.origin) return false;
    const path = url.pathname;
    if (
      path.startsWith("/@") ||
      path.startsWith("/src/") ||
      path.startsWith("/node_modules") ||
      path.startsWith("/__vite") ||
      path.startsWith("/__grok") ||
      path.startsWith("/api/")
    ) {
      return false;
    }
    return !url.searchParams.has("install");
  } catch {
    return false;
  }
}

async function saveShelfOffline(onProgress?: (done: number, total: number) => void) {
  if (!("serviceWorker" in navigator) || !("caches" in window)) {
    throw new Error("offline-unsupported");
  }
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const cache = await caches.open(SHELF_CACHE);
  const loaded = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter(cacheable);
  const pending = new Set<string>([
    "/",
    "/play",
    "/top",
    "/about",
    "/suggest",
    "/favicon.svg",
    ...squishies.flatMap((item) => [item.image, `/squishy/${item.id}`]),
    ...loaded,
  ]);
  const seen = new Set<string>();
  let done = 0;
  let failed = 0;

  function shouldScan(url: string) {
    if (url.startsWith("/squishies/") || url.endsWith(".jpg") || url.endsWith(".svg") || url.endsWith(".png")) {
      return false;
    }
    return url.endsWith(".js") || url.endsWith(".css") || url.endsWith(".html") || !url.split("/").pop()?.includes(".");
  }

  while (pending.size > 0) {
    const batch = [...pending];
    pending.clear();
    for (let i = 0; i < batch.length; i += 6) {
      await Promise.all(
        batch.slice(i, i + 6).map(async (url) => {
          if (seen.has(url)) return;
          seen.add(url);
          try {
            const response = await fetch(url, { credentials: "same-origin" });
            if (!response.ok) {
              failed += 1;
              return;
            }
            if (shouldScan(url)) {
              const text = await response.clone().text();
              for (const match of text.matchAll(/assets\/[A-Za-z0-9._-]+\.(?:js|css)/g)) {
                const next = `/${match[0]}`;
                if (!seen.has(next)) pending.add(next);
              }
            }
            const stored = response.redirected ? response.url : url;
            await cache.put(stored, response);
          } catch {
            failed += 1;
          } finally {
            done += 1;
            onProgress?.(done, done + pending.size);
          }
        }),
      );
    }
  }
  return { failed, total: done };
}

export function AddToHome() {
  const [device, setDevice] = useState<Device>("other");
  const [modernIos, setModernIos] = useState(false);
  const [safari, setSafari] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [progress, setProgress] = useState("");
  const titleId = useId();
  const saving = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDevice(detectDevice());
    const kind = detectDevice();
    setSafari(inSafari(kind));
    setModernIos((iosMajor() ?? 0) >= 27);
    setInstalled(isStandalone());
    if (!isStandalone() || !("caches" in window)) return;
    let cancel = false;
    caches.open(SHELF_CACHE).then(async (cache) => {
      if (cancel || (await cache.match("/"))) return;
      await runSave();
    });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function runSave() {
    if (saving.current) return;
    saving.current = true;
    setStatus("saving");
    setProgress("");
    try {
      const result = await saveShelfOffline((done, total) => setProgress(`${done} / ${total}`));
      setStatus(result.failed > 0 ? "partial" : "saved");
    } catch {
      setStatus("error");
    } finally {
      saving.current = false;
    }
  }

  const label = labelFor(device);

  function openSteps(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.assign("/?install=1&platform=ios");
  }

  return (
    <>
      <Button variant="butter" onClick={() => setOpen(true)}>
        {status === "saving" ? `Saving ${progress}` : status === "saved" ? "Saved on this device" : label}
      </Button>
      {status === "error" ? (
        <p className="font-bold text-ink" role="alert">
          The shelf did not save. Stay on wifi and try again.
        </p>
      ) : null}
      {open ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-end bg-ink/40 p-4 sm:place-items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-cream p-5 shadow-card outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId} className="font-display text-3xl">
              {installed ? "Saved on your icon" : label}
            </h2>
            {installed ? (
              <p className="mt-2 text-lg">
                This icon keeps its own copy of the shelf. Leave it open once while wifi is on, and it will work later
                without wifi.
              </p>
            ) : (
              <>
                <p className="mt-2 text-lg">
                  Safari is the only app that can put this shelf on an {deviceName(device)} home screen.
                </p>
                <ol className="mt-3 list-decimal space-y-2 pl-5">
                  {safari ? null : <li>Open this page in Safari. Chrome and other apps cannot add the icon.</li>}
                  {modernIos ? (
                    <li>Tap the puzzle icon in the bottom bar, then the Share icon.</li>
                  ) : (
                    <li>
                      Tap the Share button (the square with an arrow)
                      {device === "ipad" ? " in the toolbar" : " in the bottom bar"}.
                    </li>
                  )}
                  <li>
                    Tap <strong>Add to Home Screen</strong>, then Add.
                  </li>
                  <li>Open the new icon once while you have wifi. The shelf saves onto that icon.</li>
                </ol>
              </>
            )}
            {installed ? null : (
              <p className="mt-3">
                <a className="font-bold underline" href="/?install=1&platform=ios" onClick={openSteps}>
                  Show me the picture steps
                </a>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ink" onClick={() => void runSave()} disabled={status === "saving"}>
                {status === "saving" ? `Saving ${progress}` : status === "saved" ? "Saved for offline" : "Save for offline"}
              </Button>
              <Button variant="surface" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            {status === "saved" ? (
              <p className="mt-3 font-bold">
                {installed
                  ? "Pictures and pages are saved on this icon."
                  : "Saved in this browser. The home screen icon saves its own copy the first time you open it."}
              </p>
            ) : null}
            {status === "partial" ? (
              <p className="mt-3 font-bold" role="status">
                Most of the shelf is saved. A few pictures did not finish. You can try again.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="mt-3 font-bold" role="alert">
                This browser could not save the shelf. Open the site in Safari and try again.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
