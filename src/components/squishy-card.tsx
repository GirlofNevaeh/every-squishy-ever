import { Link } from "@tanstack/react-router";
import { SquishyPhoto, PhotoCredit } from "@/components/squishy-photo";
import { buttonClass } from "@/components/ui/button";
import { CATEGORY_CHIP, type Squishy } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/context";
import { labelBrand, labelTexture, localizedFeel } from "@/lib/i18n/text";

export function SquishyCard({ item }: { item: Squishy }) {
  const { t, lang } = useI18n();
  return (
    <article className="squish-card group flex h-full min-w-0 flex-col rounded-3xl bg-surface p-2 shadow-card">
      <Link
        to="/squishy/$id"
        params={{ id: item.id }}
        className="relative overflow-hidden rounded-2xl"
        aria-label={t("card.seeAria", { name: item.name })}
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
        <p className="text-sm font-bold text-muted">{labelBrand(item.brand, lang)}</p>
        <h2 className="font-display text-xl leading-tight break-words">
          <Link to="/squishy/$id" params={{ id: item.id }} className="rounded-md">
            {item.name}
          </Link>
        </h2>
        <p>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${CATEGORY_CHIP[item.category]}`}>
            {labelTexture(item.texture, lang)}
          </span>
        </p>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{localizedFeel(item, lang)}</p>
        {item.imageCredit ? <PhotoCredit credit={item.imageCredit} /> : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link to="/squishy/$id" params={{ id: item.id }} className={buttonClass("ink", "flex-1")}>
            {t("card.see")}
          </Link>
        </div>
      </div>
    </article>
  );
}
