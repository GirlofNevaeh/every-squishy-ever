import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SearchField } from "@/components/search-field";
import { SquishyCard } from "@/components/squishy-card";
import { SquishyPhoto } from "@/components/squishy-photo";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_DOT,
  countLabel,
  EMPTY_SEARCH,
  facetOptions,
  filterSquishies,
  getSquishy,
  parseSearch,
  squishies,
  toggleToken,
  tokens,
  topSellers,
  type CatalogSearch,
  type Category,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";

const PAGE = 36;

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => parseSearch(search),
  search: {
    middlewares: [stripSearchParams(EMPTY_SEARCH)],
  },
  head: () => ({
    meta: [
      { title: "Every Squishy Ever" },
      {
        name: "description",
        content: "A kid-friendly shelf of squishy toys. See the picture, the squish, and where to look it up.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const facets = facetOptions();
  const results = filterSquishies(squishies, search);
  const filtersOn = Boolean(search.category || search.brand || search.texture || search.size || search.best);
  const [shown, setShown] = useState(PAGE);
  const heroes = ["nice-cube", "cheese-wedge", "butter-stick"]
    .map((id) => getSquishy(id))
    .filter((item) => item != null);
  const hall = topSellers();
  const visible = results.slice(0, shown);
  const showHall = !filtersOn && !search.q;

  useEffect(() => {
    setShown(PAGE);
  }, [search.q, search.category, search.brand, search.texture, search.size, search.best]);

  function update(next: CatalogSearch) {
    void navigate({ to: "/", search: next, replace: true });
  }

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <section className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="hero-rise font-display text-2xl text-ink sm:text-3xl">A Squishy Encyclopaedia For Nancy</p>
          <h1 className="hero-rise-2 mt-2 font-display text-4xl text-ink sm:text-5xl">Every Squishy Ever</h1>
          <p className="hero-rise-3 mt-3 max-w-xl text-lg text-ink">See the toy, learn the squish, then find it.</p>
          <div className="mt-6 max-w-xl">
            <SearchField
              id="search-hero"
              label="Search squishies"
              large
              value={search.q}
              onChange={(q) => update({ ...search, q })}
            />
            <p className="mt-2 hidden text-sm text-muted sm:block">Type a name for suggestions. Press / to jump here.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3" aria-hidden="true">
          {heroes.map((item) => (
            <div key={item.id} className="aspect-square overflow-hidden rounded-2xl shadow-card">
              <SquishyPhoto item={item} eager />
            </div>
          ))}
        </div>
      </section>

      {showHall ? (
        <section className="mt-8" aria-label="Top 20 best sellers">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl">Top 20 best sellers</h2>
            <Link to="/top" className="inline-flex min-h-11 items-center font-bold">
              See the hall of fame
            </Link>
          </div>
          <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {hall.map((item) => (
              <li key={item.id} className="w-36 shrink-0">
                <Link to="/squishy/$id" params={{ id: item.id }} className="block">
                  <div className="aspect-square overflow-hidden rounded-2xl shadow-card">
                    <SquishyPhoto item={item} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-tight font-bold">
                    #{item.bestsellerRank} {item.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6" aria-label="Filters">
        <div className="mb-3">
          <h2 className="mb-1 font-display text-base">Hall of fame</h2>
          <button
            type="button"
            aria-pressed={search.best === "1"}
            onClick={() => update({ ...search, best: search.best === "1" ? "" : "1" })}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold",
              search.best === "1" ? "bg-ink text-cream" : "bg-butter text-ink",
            )}
          >
            Top 20 of all time
          </button>
        </div>
        <div className="space-y-3 lg:hidden">
          <ChipRow
            label="Category"
            options={facets.categories}
            selected={search.category}
            onToggle={(token) => update({ ...search, category: toggleToken(search.category, token) })}
            dotFor={(option) => CATEGORY_DOT[option as Category]}
          />
          <details className="rounded-2xl bg-surface px-3 shadow-card">
            <summary className="flex min-h-11 cursor-pointer items-center font-bold">Brand, texture, and size</summary>
            <div className="space-y-3 pb-3">
              <FilterGroups facets={facets} search={search} update={update} />
            </div>
          </details>
        </div>
        <div className="hidden gap-x-8 gap-y-3 lg:grid lg:grid-cols-2">
          <ChipRow
            label="Category"
            options={facets.categories}
            selected={search.category}
            onToggle={(token) => update({ ...search, category: toggleToken(search.category, token) })}
            dotFor={(option) => CATEGORY_DOT[option as Category]}
          />
          <FilterGroups facets={facets} search={search} update={update} />
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-muted tabular-nums" aria-live="polite">
          {countLabel(results.length)}
          {search.q ? ` for “${search.q.trim()}”` : ""}
          {search.best === "1" ? " in the top 20" : ""}
        </p>
        {filtersOn || search.q ? (
          <Button variant="surface" onClick={() => update(EMPTY_SEARCH)}>
            Clear
          </Button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-surface px-6 py-12 text-center shadow-card">
          <h2 className="font-display text-3xl">That squish hasn’t been squished into the catalog yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">Try another word, or clear the filters. New toys get added all the time.</p>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <li key={item.id} className="min-w-0">
                <SquishyCard item={item} />
              </li>
            ))}
          </ul>
          {shown < results.length ? (
            <div className="mt-6 text-center">
              <Button variant="ink" onClick={() => setShown((count) => count + PAGE)}>
                Show more squishies
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

function FilterGroups({
  facets,
  search,
  update,
  includeCategory = false,
}: {
  facets: ReturnType<typeof facetOptions>;
  search: CatalogSearch;
  update: (next: CatalogSearch) => void;
  includeCategory?: boolean;
}) {
  return (
    <>
      {includeCategory ? (
        <ChipRow
          label="Category"
          options={facets.categories}
          selected={search.category}
          onToggle={(token) => update({ ...search, category: toggleToken(search.category, token) })}
          dotFor={(option) => CATEGORY_DOT[option as Category]}
        />
      ) : null}
      <ChipRow
        label="Brand"
        options={facets.brands}
        selected={search.brand}
        onToggle={(token) => update({ ...search, brand: toggleToken(search.brand, token) })}
      />
      <ChipRow
        label="Texture"
        options={facets.textures}
        selected={search.texture}
        onToggle={(token) => update({ ...search, texture: toggleToken(search.texture, token) })}
      />
      <ChipRow
        label="Size"
        options={facets.sizes}
        selected={search.size}
        onToggle={(token) => update({ ...search, size: toggleToken(search.size, token) })}
        format={(option) => option[0]?.toUpperCase() + option.slice(1)}
      />
    </>
  );
}

function ChipRow({
  label,
  options,
  selected,
  onToggle,
  format,
  dotFor,
}: {
  label: string;
  options: readonly string[];
  selected: string;
  onToggle: (token: string) => void;
  format?: (option: string) => string;
  dotFor?: (option: string) => string | undefined;
}) {
  const active = tokens(selected);
  return (
    <div>
      <h2 className="mb-1 font-display text-base">{label}</h2>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={label}>
        {options.map((option) => {
          const pressed = active.includes(option);
          const dot = dotFor?.(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(option)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-bold",
                pressed ? "bg-ink text-cream" : "bg-surface text-ink shadow-card",
              )}
            >
              {dot ? <span className={cn("size-2.5 rounded-full", dot, pressed && "ring-2 ring-cream")} /> : null}
              {format ? format(option) : option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
