import { useState } from "react";
import { SquishyArt } from "@/components/squishy-art";
import type { ImageCredit, Squishy } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/context";

export function SquishyPhoto({
  item,
  alt = "",
  eager = false,
}: {
  item: Squishy;
  alt?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <SquishyArt imageKey={item.imageKey} colors={item.colors} label={item.name} />;
  }
  return (
    <img
      src={item.image}
      alt={alt}
      width={640}
      height={640}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full bg-cream-deep object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function PhotoCredit({ credit }: { credit?: ImageCredit }) {
  const { t } = useI18n();
  if (!credit) return null;
  const changes = credit.changes === "cropped" ? t("photo.cropped") : credit.changes;
  return (
    <p className="text-xs leading-snug text-muted">
      {t("photo.by", { author: credit.author })}
      {changes ? t("photo.changes", { changes }) : ""}.{" "}
      <a className="underline" href={credit.licenseUrl} target="_blank" rel="noreferrer">
        {credit.license}
      </a>
      .{" "}
      <a className="underline" href={credit.sourceUrl} target="_blank" rel="noreferrer">
        {t("photo.source")}
      </a>
      .
    </p>
  );
}
