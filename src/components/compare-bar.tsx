import { Link } from "@tanstack/react-router";
import { getSquishy } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";
import { buttonClass } from "@/components/ui/button";
import { SquishyPhoto } from "@/components/squishy-photo";

export function CompareBar() {
  const { ids, full, toggle, clear } = useCompare();
  if (ids.length === 0 && !full) return null;
  const picks = ids.map((id) => getSquishy(id)).filter((item) => item != null);

  return (
    <>
      <div className="h-28" aria-hidden="true" />
      <div className="compare-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <p className="font-display text-lg">Compare {picks.length} of 3</p>
        <ul className="flex gap-2">
          {picks.map((item) => (
            <li key={item.id}>
              <button type="button" className="size-14 overflow-hidden rounded-xl shadow-card" onClick={() => toggle(item.id)} aria-label={`Remove ${item.name}`}>
                <SquishyPhoto item={item} />
              </button>
            </li>
          ))}
        </ul>
        {full ? <p className="text-sm font-bold">Only 3 at a time. Tap one to remove it.</p> : null}
        <div className="ml-auto flex gap-2">
          <button type="button" className={buttonClass("surface")} onClick={clear}>
            Clear
          </button>
          {picks.length >= 2 ? (
            <Link to="/compare" className={buttonClass("ink")}>
              Compare
            </Link>
          ) : (
            <span className={buttonClass("ink", "pointer-events-none opacity-50")}>Compare</span>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
