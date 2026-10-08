import { Link } from "@tanstack/react-router";
import { CirclePlay, ExternalLink } from "lucide-react";
import { SquishyPhoto } from "@/components/squishy-photo";
import { buttonClass } from "@/components/ui/button";
import { amazonUrl, CATEGORY_CHIP, feelLine, youtubeUrl, type Squishy } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";
import { cn } from "@/lib/cn";

export function SquishyCard({ item }: { item: Squishy }) {
  const { ids, toggle } = useCompare();
  const picked = ids.includes(item.id);

  return (
    <article className="squish-card group flex h-full min-w-0 flex-col rounded-3xl bg-surface p-2 shadow-card">
      <Link
        to="/squishy/$id"
        params={{ id: item.id }}
        className="relative overflow-hidden rounded-2xl"
        aria-label={`See ${item.name}`}
      >
        {item.bestsellerRank ? (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-butter px-2 py-1 text-sm font-bold">
            #{item.bestsellerRank}
          </span>
        ) : null}
        <div className="toy-squish aspect-square">
          <SquishyPhoto item={item} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-2">
        <p className="text-sm font-bold text-muted">{item.brand}</p>
        <h2 className="font-display text-xl leading-tight break-words">
          <Link to="/squishy/$id" params={{ id: item.id }} className="rounded-md">
            {item.name}
          </Link>
        </h2>
        <p>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${CATEGORY_CHIP[item.category]}`}>
            {item.texture}
          </span>
        </p>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{feelLine(item)}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link to="/squishy/$id" params={{ id: item.id }} className={buttonClass("ink", "flex-1")}>
            See it
          </Link>
          <button
            type="button"
            aria-pressed={picked}
            onClick={() => toggle(item.id)}
            className={cn(buttonClass(picked ? "mint" : "surface"), "flex-1")}
          >
            {picked ? "Added" : "Compare"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={amazonUrl(item.amazonQuery)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass("butter", "flex-1")}
            aria-label={`Search Amazon for ${item.name} (opens in a new tab)`}
          >
            Amazon
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <a
            href={youtubeUrl(item.youtubeQuery)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass("surface", "flex-1")}
            aria-label={`Search YouTube for ${item.name} (opens in a new tab)`}
          >
            Videos
            <CirclePlay className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
