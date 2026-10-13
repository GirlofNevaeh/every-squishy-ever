import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LANG_LABEL, LANGS } from "@/lib/i18n/languages";
import { cn } from "@/lib/cn";

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-3 text-sm font-bold text-ink shadow-card"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("lang.choose")}
        onClick={() => setOpen((value) => !value)}
      >
        {LANG_LABEL[lang]}
        <ChevronDown className={cn("size-4", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("lang.choose")}
          className="absolute top-full left-0 z-50 mt-1 max-h-[70vh] w-52 overflow-auto rounded-2xl bg-surface shadow-lift"
        >
          {LANGS.map((code) => {
            const selected = code === lang;
            return (
              <li key={code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    "flex min-h-11 w-full items-center px-4 text-left font-bold",
                    selected ? "bg-butter text-ink" : "text-ink",
                  )}
                  lang={code}
                  onClick={() => {
                    setLang(code);
                    setOpen(false);
                  }}
                >
                  {LANG_LABEL[code]}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
