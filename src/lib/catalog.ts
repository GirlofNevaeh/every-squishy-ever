import raw from "@/data/squishies.json";
import { AFFILIATE_TAG } from "@/data/config";

export const CATEGORIES = [
  "NeeDoh",
  "Cheese",
  "Butter & Bread",
  "Dumpling",
  "Mochi & Candy",
  "Fruit & Food",
  "Animal",
  "Cube & Stress",
  "Mystery Box",
  "Other",
] as const;

export const SIZES = ["mini", "standard", "jumbo"] as const;

export const TEXTURES = [
  "super-solid squish",
  "slow-rise foam",
  "soft dough",
  "maltose",
  "gel",
  "glitter gel",
  "fuzzy",
  "air-filled",
  "air-whipped foam",
  "water-bead",
  "bead mesh",
] as const;

export const BRANDS = ["Schylling", "Sunny Days Entertainment", "Generic"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Size = (typeof SIZES)[number];

export type Squishy = {
  id: string;
  name: string;
  brand: string;
  line: string;
  category: Category;
  texture: string;
  size: Size;
  colors: string[];
  yearIntroduced: number | null;
  description: string;
  tags: string[];
  amazonQuery: string;
  amazonAsin: string | null;
  priceNote: string;
  imageKey: string;
  image: string;
  youtubeQuery: string;
  bestsellerRank: number | null;
  imageHint?: string;
};

export type CatalogSearch = {
  q: string;
  category: string;
  brand: string;
  texture: string;
  size: string;
  best: string;
};

export const EMPTY_SEARCH: CatalogSearch = {
  q: "",
  category: "",
  brand: "",
  texture: "",
  size: "",
  best: "",
};

export const squishies = raw as Squishy[];

export function facetOptions() {
  const textureSet = new Set(squishies.map((item) => item.texture));
  const brandSet = new Set(squishies.map((item) => item.brand));
  const extraTextures = [...textureSet]
    .filter((texture) => !(TEXTURES as readonly string[]).includes(texture))
    .sort((a, b) => a.localeCompare(b));
  const extraBrands = [...brandSet]
    .filter((brand) => !(BRANDS as readonly string[]).includes(brand))
    .sort((a, b) => a.localeCompare(b));

  return {
    categories: CATEGORIES.filter((category) => squishies.some((item) => item.category === category)),
    brands: [...BRANDS.filter((brand) => brandSet.has(brand)), ...extraBrands],
    textures: [...TEXTURES.filter((texture) => textureSet.has(texture)), ...extraTextures],
    sizes: SIZES.filter((size) => squishies.some((item) => item.size === size)),
  };
}

export const CATEGORY_DOT: Record<Category, string> = {
  NeeDoh: "bg-cat-needoh",
  Cheese: "bg-cat-cheese",
  "Butter & Bread": "bg-cat-bread",
  Dumpling: "bg-cat-dumpling",
  "Mochi & Candy": "bg-cat-mochi",
  "Fruit & Food": "bg-cat-fruit",
  Animal: "bg-cat-animal",
  "Cube & Stress": "bg-cat-cube",
  "Mystery Box": "bg-cat-mystery",
  Other: "bg-cat-other",
};

export const CATEGORY_CHIP: Record<Category, string> = {
  NeeDoh: "bg-cat-needoh text-ink",
  Cheese: "bg-cat-cheese text-ink",
  "Butter & Bread": "bg-cat-bread text-ink",
  Dumpling: "bg-cat-dumpling text-ink",
  "Mochi & Candy": "bg-cat-mochi text-ink",
  "Fruit & Food": "bg-cat-fruit text-ink",
  Animal: "bg-cat-animal text-ink",
  "Cube & Stress": "bg-cat-cube text-ink",
  "Mystery Box": "bg-cat-mystery text-ink",
  Other: "bg-cat-other text-ink",
};

export function parseSearch(search: Record<string, unknown>): CatalogSearch {
  const read = (key: keyof CatalogSearch) => (typeof search[key] === "string" ? search[key] : "");
  return {
    q: read("q"),
    category: read("category"),
    brand: read("brand"),
    texture: read("texture"),
    size: read("size"),
    best: read("best"),
  };
}

export function tokens(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function toggleToken(value: string, token: string): string {
  const current = tokens(value);
  const next = current.includes(token) ? current.filter((item) => item !== token) : [...current, token];
  return next.join(",");
}

export function amazonUrl(item: Pick<Squishy, "amazonQuery" | "amazonAsin">): string {
  const tag = AFFILIATE_TAG.trim();
  if (item.amazonAsin) {
    const url = new URL(`https://www.amazon.com/dp/${item.amazonAsin}`);
    if (tag) url.searchParams.set("tag", tag);
    return url.toString();
  }
  const url = new URL("https://www.amazon.com/s");
  url.searchParams.set("k", item.amazonQuery);
  if (tag) url.searchParams.set("tag", tag);
  return url.toString();
}

export function youtubeUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function suggestSquishies(query: string, limit = 8): Squishy[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: Squishy[] = [];
  const includes: Squishy[] = [];
  for (const item of squishies) {
    const name = item.name.toLowerCase();
    if (name.startsWith(q)) starts.push(item);
    else if (name.includes(q)) includes.push(item);
  }
  return [...starts, ...includes].slice(0, limit);
}

export function feelLine(item: Squishy): string {
  const [first] = item.description.split(/(?<=\.)\s/);
  return first ?? item.description;
}

export function topSellers(): Squishy[] {
  return squishies
    .filter((item) => item.bestsellerRank)
    .sort((a, b) => (a.bestsellerRank ?? 1000) - (b.bestsellerRank ?? 1000));
}

export function filterSquishies(items: Squishy[], search: CatalogSearch): Squishy[] {
  const q = search.q.trim().toLowerCase();
  const categories = tokens(search.category);
  const brands = tokens(search.brand);
  const textures = tokens(search.texture);
  const sizes = tokens(search.size);

  const list = items.filter((item) => {
    if (categories.length && !categories.includes(item.category)) return false;
    if (brands.length && !brands.includes(item.brand)) return false;
    if (textures.length && !textures.includes(item.texture)) return false;
    if (sizes.length && !sizes.includes(item.size)) return false;
    if (search.best === "1" && !item.bestsellerRank) return false;
    if (!q) return true;
    const haystack = [item.name, item.brand, item.line, item.texture, item.category, ...item.tags, ...item.colors]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
  if (search.best === "1") {
    return list.sort((a, b) => (a.bestsellerRank ?? 1000) - (b.bestsellerRank ?? 1000));
  }
  return list;
}

export function getSquishy(id: string): Squishy | undefined {
  return squishies.find((item) => item.id === id);
}

export function relatedSquishies(item: Squishy, count = 4): Squishy[] {
  const sameCategory = squishies.filter((other) => other.id !== item.id && other.category === item.category);
  const sameTexture = squishies.filter(
    (other) => other.id !== item.id && other.texture === item.texture && other.category !== item.category,
  );
  return [...sameCategory, ...sameTexture].slice(0, count);
}

export function countLabel(count: number): string {
  return count === 1 ? "1 squishy" : `${count} squishies`;
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "new-squishy";
}
