import { createFileRoute, Link } from "@tanstack/react-router";
import { EMPTY_SEARCH } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Every Squishy Ever" },
      {
        name: "description",
        content: "What a squishy is on this shelf, and why the list keeps growing.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useI18n();
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">{t("about.kicker")}</p>
      <h1 className="mt-2 font-display text-5xl">{t("about.title")}</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <p>{t("about.p3")}</p>
        <p>{t("about.p4")}</p>
      </div>
      <p className="mt-8 flex flex-wrap gap-4 font-bold">
        <Link to="/" search={EMPTY_SEARCH} className="underline">
          {t("about.back")}
        </Link>
        <Link to="/play" className="underline">
          {t("about.quiz")}
        </Link>
      </p>
    </main>
  );
}