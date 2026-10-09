import { Link } from "@tanstack/react-router";
import { AddToHome } from "@/components/add-to-home";
import { EMPTY_SEARCH } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-3">
          <AddToHome />
          <p>Add the icon in Safari, then open it once so the shelf can save.</p>
        </div>
        <nav className="flex flex-wrap gap-4 font-bold" aria-label="Footer">
          <Link to="/" search={EMPTY_SEARCH} className="inline-flex min-h-11 items-center">
            Squishies
          </Link>
          <Link to="/top" className="inline-flex min-h-11 items-center">
            Hall of Fame
          </Link>
          <Link to="/play" className="inline-flex min-h-11 items-center">
            Quiz
          </Link>
          <Link to="/about" className="inline-flex min-h-11 items-center">
            About
          </Link>
          <Link to="/suggest" className="inline-flex min-h-11 items-center">
            Suggest a squishy
          </Link>
        </nav>
        <p>
          Pictures are original catalog photos, not brand photos. The words are ours. Buy opens an Amazon product page
          when we know the listing, and an Amazon search otherwise, so other toys can show up. YouTube links are
          searches too. Prices change. The hall of fame is not an official sales chart. This site is not part
          of Schylling, NeeDoh, Amazon, YouTube, or other brands unless an affiliate tag is added later.
        </p>
      </div>
    </footer>
  );
}
