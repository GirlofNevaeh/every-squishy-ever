import descriptions from "@/data/i18n/descriptions.json";
import type { Squishy } from "@/lib/catalog";
import { americanize } from "@/lib/i18n/american";
import { BRAND_LABEL, CATEGORY_LABEL, COLOR_LABEL, lookup, PRICE_LABEL, SIZE_LABEL, TEXTURE_LABEL } from "@/lib/i18n/lexicon";
import type { Lang } from "@/lib/i18n/languages";

type DescriptionMap = Record<string, Partial<Record<Lang, string>>>;

const COPY = descriptions as DescriptionMap;

export function localizedDescription(item: Squishy, lang: Lang): string {
  if (lang === "en") return item.description;
  if (lang === "en-US") return americanize(item.description);
  return COPY[item.id]?.[lang] || item.description;
}

export function localizedFeel(item: Squishy, lang: Lang): string {
  const text = localizedDescription(item, lang);
  const [first] = text.split(/(?<=\.)\s/);
  return first ?? text;
}

export function labelCategory(value: string, lang: Lang): string {
  return lookup(CATEGORY_LABEL, value, lang);
}

export function labelTexture(value: string, lang: Lang): string {
  return lookup(TEXTURE_LABEL, value, lang);
}

export function labelSize(value: string, lang: Lang): string {
  return lookup(SIZE_LABEL, value, lang);
}

export function labelColor(value: string, lang: Lang): string {
  return lookup(COLOR_LABEL, value, lang);
}

export function labelBrand(value: string, lang: Lang): string {
  return lookup(BRAND_LABEL, value, lang);
}

export function labelPrice(value: string, lang: Lang): string {
  return lookup(PRICE_LABEL, value, lang);
}

export function searchBlob(item: Squishy, lang: Lang): string {
  if (lang === "en" || lang === "en-US") return "";
  return [
    localizedDescription(item, lang),
    labelCategory(item.category, lang),
    labelTexture(item.texture, lang),
    labelSize(item.size, lang),
    labelBrand(item.brand, lang),
    ...item.colors.map((color) => labelColor(color, lang)),
  ].join(" ");
}
