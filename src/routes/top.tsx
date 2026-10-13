import { createFileRoute } from "@tanstack/react-router";
import { SquishyCard } from "@/components/squishy-card";
import { topSellers } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/top")({
  head: () => ({
    meta: [
      { title: "Hall of Fame · Every Squishy Ever" },
      {
        name: "description",
        content: "The hall of fame of squishies people have loved and bought the most.",
      },
    ],
  }),
  component: TopPage,
});

function TopPage() {
  const { t } = useI18n();
  const items = topSellers();
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-5xl">{t("top.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg">{t("top.intro")}</p>
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
