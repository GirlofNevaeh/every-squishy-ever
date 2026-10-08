const SWATCH: Record<string, string> = {
  "butter yellow": "var(--color-swatch-butter)",
  butter: "var(--color-swatch-butter)",
  cheddar: "var(--color-swatch-cheddar)",
  cream: "var(--color-swatch-cream)",
  blush: "var(--color-swatch-blush)",
  pink: "var(--color-swatch-blush)",
  berry: "var(--color-swatch-berry)",
  "cherry red": "var(--color-swatch-berry)",
  red: "var(--color-swatch-berry)",
  mint: "var(--color-swatch-mint)",
  "leaf green": "var(--color-swatch-leaf)",
  green: "var(--color-swatch-leaf)",
  "sky blue": "var(--color-swatch-sky)",
  blue: "var(--color-swatch-sky)",
  "ice blue": "var(--color-swatch-ice)",
  ice: "var(--color-swatch-ice)",
  clear: "var(--color-swatch-ice)",
  lilac: "var(--color-swatch-lilac)",
  "grape purple": "var(--color-swatch-grape)",
  purple: "var(--color-swatch-grape)",
  coral: "var(--color-swatch-coral)",
  orange: "var(--color-swatch-coral)",
  cocoa: "var(--color-swatch-cocoa)",
  brown: "var(--color-swatch-cocoa)",
  chocolate: "var(--color-swatch-cocoa)",
  nori: "var(--color-swatch-nori)",
  yolk: "var(--color-swatch-yolk)",
  "lemon yellow": "var(--color-swatch-yolk)",
  yellow: "var(--color-swatch-yolk)",
  gold: "var(--color-swatch-cheddar)",
  peach: "var(--color-swatch-peach)",
  toast: "var(--color-swatch-toast)",
  sesame: "var(--color-swatch-toast)",
  amber: "var(--color-swatch-amber)",
  "watermelon pink": "var(--color-swatch-melon)",
  "strawberry red": "var(--color-swatch-berry)",
  white: "var(--color-swatch-cream)",
  charcoal: "var(--color-swatch-ink)",
  pearlescent: "var(--color-swatch-pearl)",
  "glow green": "var(--color-swatch-glow)",
  "galaxy purple": "var(--color-swatch-galaxy)",
};

const FALLBACKS = [
  "var(--color-swatch-butter)",
  "var(--color-swatch-blush)",
  "var(--color-swatch-mint)",
  "var(--color-swatch-sky)",
  "var(--color-swatch-peach)",
  "var(--color-swatch-lilac)",
];

export function swatch(name: string | undefined): string {
  if (!name) return "var(--color-swatch-butter)";
  const key = name.toLowerCase();
  const direct = SWATCH[key];
  if (direct) return direct;
  let hash = 0;
  for (const char of key) hash = (hash + char.charCodeAt(0)) % FALLBACKS.length;
  return FALLBACKS[hash] ?? "var(--color-swatch-butter)";
}
