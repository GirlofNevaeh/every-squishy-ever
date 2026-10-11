import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { SquishyPhoto } from "@/components/squishy-photo";
import { suggestSquishies } from "@/lib/catalog";
import { cn } from "@/lib/cn";

type SearchFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  large?: boolean;
};

export function SearchField({ id, value, onChange, label, large = false }: SearchFieldProps) {
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [moved, setMoved] = useState(false);
  const [draft, setDraft] = useState(value);
  const matches = useMemo(() => suggestSquishies(draft), [draft]);
  const shown = open && draft.trim().length > 0;
  const current = matches[active];

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    setActive(0);
    setMoved(false);
  }, [draft]);

  useEffect(() => {
    if (!shown) return;
    function onPointer(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [shown]);

  function send(next = draft) {
    setDraft(next);
    onChange(next);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setMoved(true);
      if (!shown) {
        setOpen(true);
        setActive(0);
        return;
      }
      setActive((index) => (matches.length === 0 ? 0 : (index + 1) % matches.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setMoved(true);
      if (!shown) {
        setOpen(true);
        setActive(0);
        return;
      }
      setActive((index) => (matches.length === 0 ? 0 : (index - 1 + matches.length) % matches.length));
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && shown && moved && current) {
      event.preventDefault();
      send(current.name);
    }
  }

  return (
    <div ref={boxRef} className="relative min-w-0">
      <form
        role="search"
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id={id}
          type="search"
          role="combobox"
          value={draft}
          aria-expanded={shown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={shown && moved && current ? `${listId}-${current.id}` : undefined}
          enterKeyHint="search"
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search name, brand, texture, tag"
          autoComplete="off"
          suppressHydrationWarning
          className={
            large
              ? "min-h-14 w-full rounded-full bg-surface pr-28 pl-11 text-base text-ink shadow-card placeholder:text-muted"
              : "min-h-12 w-full rounded-full bg-surface pr-24 pl-11 text-sm text-ink shadow-card placeholder:text-muted"
          }
        />
        <button
          type="submit"
          className={
            large
              ? "absolute top-1/2 right-1.5 z-10 min-h-11 -translate-y-1/2 rounded-full bg-ink px-4 text-sm font-bold text-cream"
              : "absolute top-1/2 right-1 z-10 min-h-11 -translate-y-1/2 rounded-full bg-ink px-3 text-sm font-bold text-cream"
          }
        >
          Search
        </button>
      </form>
      {shown ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching squishy names"
          className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl bg-surface shadow-lift"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">No squishy name matches that yet.</li>
          ) : (
            matches.map((item, index) => (
              <li key={item.id} id={`${listId}-${item.id}`} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 px-3 text-left",
                    index === active ? "bg-butter" : "bg-surface",
                  )}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => send(item.name)}
                >
                  <span className="size-10 shrink-0 overflow-hidden rounded-xl">
                    <SquishyPhoto item={item} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{highlightName(item.name, draft)}</span>
                    <span className="block truncate text-xs text-muted">{item.category}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function highlightName(name: string, query: string) {
  const q = query.trim();
  const index = name.toLowerCase().indexOf(q.toLowerCase());
  if (!q || index < 0) return name;
  return (
    <>
      {name.slice(0, index)}
      <span className="underline decoration-ink decoration-2">{name.slice(index, index + q.length)}</span>
      {name.slice(index + q.length)}
    </>
  );
}
