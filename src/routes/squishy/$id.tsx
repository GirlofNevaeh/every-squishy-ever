import { createFileRoute, Link } from "@tanstack/react-router";
import { CirclePlay, ExternalLink } from "lucide-react";
import { SquishyCard } from "@/components/squishy-card";
import { SquishyPhoto } from "@/components/squishy-photo";
import { buttonClass } from "@/components/ui/button";
import { amazonUrl, CATEGORY_CHIP, EMPTY_SEARCH, getSquishy, relatedSquishies, youtubeUrl } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";
import { cn } from "@/lib/cn";
import { swatch } from "@/lib/swatches";

export const Route = createFileRoute("/squishy/$id")({
  head: ({ params }) => {
    const item = getSquishy(params.id);
    return {
      meta: [
        { title: item ? `${item.name} · Every Squishy Ever` : "Missing squishy · Every Squishy Ever" },
        {
          name: "description",
          content: item?.description ?? "That squishy is not in the catalog.",
        },
      ],
    };
  },
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const item = getSquishy(id);
  const { ids, toggle } = useCompare();

  if (!item) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-5xl">That squish hasn’t been squished into the catalog yet</h1>
        <p className="mt-3 text-muted">It may have a different name, or it is still waiting to be added.</p>
        <p className="mt-6">
          <Link to="/" search={EMPTY_SEARCH} className={buttonClass("ink")}>
            Back to the squishies
          </Link>
        </p>
      </main>
    );
  }

  const related = relatedSquishies(item);
  const year = item.yearIntroduced ?? "Not listed";
  const picked = ids.includes(item.id);

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <p>
        <Link to="/" search={EMPTY_SEARCH} className="inline-flex min-h-11 items-center font-bold">
          All squishies
        </Link>
      </p>
      <article className="mt-4 grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-3xl bg-surface p-3 shadow-card">
          <div className="aspect-square overflow-hidden rounded-2xl">
            <SquishyPhoto item={item} alt={item.name} />
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-wide text-muted uppercase">{item.brand}</p>
          <h1 className="mt-1 font-display text-5xl">{item.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${CATEGORY_CHIP[item.category]}`}>
              {item.category}
            </span>
            {item.bestsellerRank ? (
              <Link to="/top" className="inline-flex rounded-full bg-butter px-3 py-1 text-sm font-bold">
                Top 20 #{item.bestsellerRank}
              </Link>
            ) : null}
          </div>
          <p className="mt-4 text-lg leading-relaxed">{item.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Spec term="Line" value={item.line || "Not listed"} />
            <Spec term="Texture" value={item.texture} />
            <Spec term="Size" value={item.size[0]?.toUpperCase() + item.size.slice(1)} />
            <Spec term="Year" value={String(year)} />
          </dl>
          <div className="mt-4">
            <h2 className="text-sm font-bold text-muted">Colors</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {item.colors.map((color) => (
                <li key={color} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-3 shadow-card">
                  <span className="size-3 rounded-full" style={{ background: swatch(color) }} aria-hidden="true" />
                  {color}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 rounded-2xl bg-cream-deep px-4 py-3">
            <h2 className="font-display text-xl">About the price</h2>
            <p className="mt-1">{item.priceNote}</p>
            <p className="mt-1 text-sm text-muted">Shops change the price. This is only a hint, not today’s price.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={amazonUrl(item.amazonQuery)}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("butter")}
            >
              Find on Amazon
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
            <a
              href={youtubeUrl(item.youtubeQuery)}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("surface")}
            >
              Watch on YouTube
              <CirclePlay className="size-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              aria-pressed={picked}
              onClick={() => toggle(item.id)}
              className={cn(buttonClass(picked ? "mint" : "ink"))}
            >
              {picked ? "Added to compare" : "Compare"}
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Amazon and YouTube open a search for “{item.amazonQuery}”. Other toys and videos can show up too.
          </p>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Squishies like this</h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((other) => (
              <li key={other.id}>
                <SquishyCard item={other} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function Spec({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface px-3 py-3 shadow-card">
      <dt className="text-sm font-bold text-muted">{term}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}
