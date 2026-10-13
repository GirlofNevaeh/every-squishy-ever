import { createFileRoute, Link } from "@tanstack/react-router";
import { CirclePlay } from "lucide-react";
import { SquishyCard } from "@/components/squishy-card";
import { SquishyPhoto, PhotoCredit } from "@/components/squishy-photo";
import { buttonClass } from "@/components/ui/button";
import { CATEGORY_CHIP, EMPTY_SEARCH, getSquishy, relatedSquishies, youtubeUrl } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/context";
import { labelBrand, labelCategory, labelColor, labelPrice, labelSize, labelTexture, localizedDescription } from "@/lib/i18n/text";
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
  const { t, lang } = useI18n();
  const item = getSquishy(id);

  if (!item) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-5xl">{t("empty.title")}</h1>
        <p className="mt-3 text-muted">{t("detail.missing")}</p>
        <p className="mt-6">
          <Link to="/" search={EMPTY_SEARCH} className={buttonClass("ink")}>
            {t("empty.back")}
          </Link>
        </p>
      </main>
    );
  }

  const related = relatedSquishies(item);

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <p>
        <Link to="/" search={EMPTY_SEARCH} className="inline-flex min-h-11 items-center font-bold">
          {t("detail.all")}
        </Link>
      </p>
      <article className="mt-4 grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-3xl bg-surface p-3 shadow-card">
          <div className="aspect-square overflow-hidden rounded-2xl">
            <SquishyPhoto item={item} alt={item.name} />
          </div>
          {item.imageCredit ? (
            <div className="px-2 pt-3 pb-1">
              <PhotoCredit credit={item.imageCredit} />
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-wide text-muted uppercase">{labelBrand(item.brand, lang)}</p>
          <h1 className="mt-1 font-display text-5xl">{item.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${CATEGORY_CHIP[item.category]}`}>
              {labelCategory(item.category, lang)}
            </span>
            {item.bestsellerRank ? (
              <Link to="/top" className="inline-flex rounded-full bg-butter px-3 py-1 text-sm font-bold">
                {t("detail.hall", { n: item.bestsellerRank })}
              </Link>
            ) : null}
          </div>
          <p className="mt-4 text-lg leading-relaxed">{localizedDescription(item, lang)}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Spec term={t("detail.line")} value={item.line || t("detail.notListed")} />
            <Spec term={t("detail.texture")} value={labelTexture(item.texture, lang)} />
            <Spec term={t("detail.size")} value={labelSize(item.size, lang)} />
            <Spec term={t("detail.year")} value={item.yearIntroduced == null ? t("detail.notListed") : String(item.yearIntroduced)} />
          </dl>
          <div className="mt-4">
            <h2 className="text-sm font-bold text-muted">{t("detail.colors")}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {item.colors.map((color) => (
                <li key={color} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-3 shadow-card">
                  <span className="size-3 rounded-full" style={{ background: swatch(color) }} aria-hidden="true" />
                  {labelColor(color, lang)}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 rounded-2xl bg-cream-deep px-4 py-3">
            <h2 className="font-display text-xl">{t("detail.price")}</h2>
            <p className="mt-1">{labelPrice(item.priceNote, lang)}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={youtubeUrl(item.youtubeQuery)}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("surface")}
            >
              {t("detail.watch")}
              <CirclePlay className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl">{t("detail.related")}</h2>
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
