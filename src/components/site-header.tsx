import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Dices } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchField } from "@/components/search-field";
import { buttonClass } from "@/components/ui/button";
import { EMPTY_SEARCH, parseSearch, squishies, type CatalogSearch } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Squishies" },
  { to: "/top", label: "Top 20" },
  { to: "/play", label: "Quiz" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const rawSearch = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
  const onHome = pathname === "/";
  const current = onHome ? parseSearch(rawSearch) : EMPTY_SEARCH;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showMini = !onHome || scrolled;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
      event.preventDefault();
      document.getElementById(showMini ? "search-sticky" : "search-hero")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMini]);

  function goSearch(next: CatalogSearch) {
    void navigate({ to: "/", search: next, replace: true });
  }

  function surprise() {
    const pick = squishies[Math.floor(Math.random() * squishies.length)];
    if (!pick) return;
    void navigate({ to: "/squishy/$id", params: { id: pick.id } });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <Link to="/" search={EMPTY_SEARCH} className="flex min-h-11 min-w-0 items-center gap-2 rounded-full pr-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-butter shadow-card" aria-hidden="true">
            <span className="size-4 rounded-md bg-cream" />
          </span>
          <span className="truncate font-display text-lg leading-none sm:text-xl">Every Squishy Ever</span>
        </Link>
        <nav
          className="order-3 flex w-full flex-wrap gap-x-1 gap-y-1 lg:order-none lg:w-auto"
          aria-label="Primary"
        >
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                search={item.to === "/" ? EMPTY_SEARCH : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-2.5 text-sm font-bold whitespace-nowrap lg:px-3",
                  active ? "bg-butter text-ink" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn("order-4 min-w-0 flex-1 basis-full lg:order-none lg:basis-56", showMini ? "block" : "hidden")}>
          <SearchField
            id="search-sticky"
            label="Search the catalog"
            value={onHome ? current.q : ""}
            onChange={(q) => goSearch({ ...(onHome ? current : EMPTY_SEARCH), q })}
          />
        </div>
        <button
          type="button"
          className={cn(buttonClass("ink"), "ml-auto shrink-0 px-3 lg:ml-0")}
          onClick={surprise}
          aria-label="Surprise me"
        >
          <Dices className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Surprise me</span>
        </button>
      </div>
    </header>
  );
}
