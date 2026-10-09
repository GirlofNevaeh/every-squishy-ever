import { useEffect, useId, useRef, useState } from "react";
import { squishies } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

const SHELF_CACHE = "every-squishy-ever-v1";

type Device = "iphone" | "ipad" | "other";
type SaveStatus = "idle" | "saving" | "saved" | "partial" | "error";

function detectDevice(): Device {
  const ua = navigator.userAgent || "";
  if (/iPad/.test(ua)) return "ipad";
  if (/iPhone|iPod/.test(ua)) return "iphone";
  if (/Mac/.test(navigator.platform || "") && navigator.maxTouchPoints > 1) return "ipad";
  return "other";
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
  await navigator.serviceWorker.register("/sw.js");
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
            await cache.put(url, response);
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
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [progress, setProgress] = useState("");
  const titleId = useId();
  const saving = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDevice(detectDevice());
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

  return (
    <>
      <Button variant="butter" onClick={() => setOpen(true)}>
        {label}
      </Button>
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
              {label}
            </h2>
            <p className="mt-2 text-lg">
              Keep the squishy shelf on your {deviceName(device)} so you can open it without wifi.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Open this site in Safari.</li>
              <li>Tap the Share button (the square with an arrow).</li>
              <li>
                Tap <strong>Add to Home Screen</strong>, then Add.
              </li>
            </ol>
            <p className="mt-3">
              <a className="font-bold underline" href="/?install=1&platform=ios">
                Show me the picture steps
              </a>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ink" onClick={() => void runSave()} disabled={status === "saving"}>
                {status === "saving" ? `Saving ${progress}` : status === "saved" ? "Saved for offline" : "Save for offline"}
              </Button>
              <Button variant="surface" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            {status === "saved" ? (
              <p className="mt-3 font-bold">Pictures and pages are saved on this device. Add the icon, then open it anytime.</p>
            ) : null}
            {status === "partial" ? (
              <p className="mt-3 font-bold" role="status">
                Most of the shelf is saved. A few pictures did not finish. You can try again.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="mt-3 font-bold" role="alert">
                This browser could not save the shelf. Try Safari on an iPhone or iPad.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
