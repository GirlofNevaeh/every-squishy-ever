import { createFileRoute } from "@tanstack/react-router";
import { SquishyCard } from "@/components/squishy-card";
import { topSellers } from "@/lib/catalog";

export const Route = createFileRoute("/top")({
  head: () => ({
    meta: [
      { title: "Top 20 squishies · Every Squishy Ever" },
      {
        name: "description",
        content: "A hall of fame of the squishies people have loved and bought the most.",
      },
    ],
  }),
  component: TopPage,
});

function TopPage() {
  const items = topSellers();
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">Hall of fame</p>
      <h1 className="mt-2 font-display text-5xl">Top 20 best sellers</h1>
      <p className="mt-3 max-w-2xl text-lg">
        These are the squishies kids and collectors talk about the most, from the Nice Cube to cheese, butter, and
        mochi. It is a friendly hall of fame, not an official sales chart.
      </p>
      <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="min-w-0">
            <p className="mb-2 font-display text-2xl tabular-nums">#{item.bestsellerRank}</p>
            <SquishyCard item={item} />
          </li>
        ))}
      </ol>
    </main>
  );
}
