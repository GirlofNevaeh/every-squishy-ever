import { createFileRoute, Link } from "@tanstack/react-router";
import { CirclePlay, ExternalLink } from "lucide-react";
import { SquishyPhoto } from "@/components/squishy-photo";
import { buttonClass } from "@/components/ui/button";
import { amazonUrl, EMPTY_SEARCH, getSquishy, youtubeUrl } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare squishies · Every Squishy Ever" },
      { name: "description", content: "Put up to three squishies side by side." },
    ],
  }),
  component: ComparePage,
});

const ROWS = [
  { label: "How it feels", value: (item: NonNullable<ReturnType<typeof getSquishy>>) => item.description },
  { label: "Brand", value: (item: NonNullable<ReturnType<typeof getSquishy>>) => item.brand },
  { label: "Texture", value: (item: NonNullable<ReturnType<typeof getSquishy>>) => item.texture },
  { label: "Size", value: (item: NonNullable<ReturnType<typeof getSquishy>>) => item.size },
  { label: "Colors", value: (item: NonNullable<ReturnType<typeof getSquishy>>) => item.colors.join(", ") },
  { label: "Price note", value: (item: NonNullable<ReturnType<typeof getSquishy>>) => item.priceNote },
] as const;

function ComparePage() {
  const { ids, clear } = useCompare();
  const picks = ids.map((id) => getSquishy(id)).filter((item) => item != null);

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <h1 className="font-display text-5xl">Compare squishies</h1>
      <p className="mt-2 text-lg text-muted">Pick up to three. Tap the pictures on the cards to add or remove them.</p>
      {picks.length < 2 ? (
        <p className="mt-8 rounded-3xl bg-surface p-6 shadow-card">
          Choose at least two squishies.{" "}
          <Link to="/" search={EMPTY_SEARCH} className="font-bold underline">
            Back to the shelf
          </Link>
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-separate border-spacing-3">
            <thead>
              <tr>
                <th className="w-28" />
                {picks.map((item) => (
                  <th key={item.id} className="align-bottom text-left">
                    <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
                      <div className="aspect-square">
                        <SquishyPhoto item={item} />
                      </div>
                    </div>
                    <Link to="/squishy/$id" params={{ id: item.id }} className="mt-2 block font-display text-2xl">
                      {item.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th className="align-top text-left text-sm font-bold text-muted">{row.label}</th>
                  {picks.map((item) => (
                    <td key={item.id} className="align-top rounded-2xl bg-surface p-3 shadow-card">
                      {row.value(item)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="text-left text-sm font-bold text-muted">Links</th>
                {picks.map((item) => (
                  <td key={item.id} className="align-top">
                    <div className="flex flex-col gap-2">
                      <a className={buttonClass("butter")} href={amazonUrl(item.amazonQuery)} target="_blank" rel="noreferrer">
                        Amazon
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                      <a className={buttonClass("surface")} href={youtubeUrl(item.youtubeQuery)} target="_blank" rel="noreferrer">
                        Videos
                        <CirclePlay className="size-4" aria-hidden="true" />
                      </a>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <button type="button" className={buttonClass("surface", "mt-4")} onClick={clear}>
            Clear compare
          </button>
        </div>
      )}
    </main>
  );
}
