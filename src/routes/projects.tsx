import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/context";
import { PROJECT_COPY, PROJECT_META, type ProjectKind } from "@/lib/i18n/projects-copy";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · Every Squishy Ever" },
      {
        name: "description",
        content: "Individual and team squishy projects for Age 5-6 through Age 11-12.",
      },
    ],
  }),
  component: ProjectsPage,
});

const YEARS = [1, 2, 3, 4, 5, 6, 7];

function ProjectsPage() {
  const { t, lang } = useI18n();
  const [year, setYear] = useState<number | "all">("all");
  const [kind, setKind] = useState<ProjectKind | "both">("both");
  const copy = PROJECT_COPY[lang];
  const shown = PROJECT_META.map((meta, index) => ({ ...meta, ...copy[index] })).filter(
    (project) => project && (year === "all" || project.year === year) && (kind === "both" || project.kind === kind),
  );

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-5xl">{t("projects.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg">{t("projects.intro")}</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t("projects.year")}>
        <FilterButton pressed={year === "all"} onClick={() => setYear("all")}>
          {t("projects.allYears")}
        </FilterButton>
        {YEARS.map((item) => (
          <FilterButton key={item} pressed={year === item} onClick={() => setYear(item)}>
            {t("projects.primary", { range: PROJECT_META.find((meta) => meta.year === item)?.range ?? "" })}
          </FilterButton>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("projects.type")}>
        <FilterButton pressed={kind === "both"} onClick={() => setKind("both")}>
          {t("projects.both")}
        </FilterButton>
        <FilterButton pressed={kind === "individual"} onClick={() => setKind("individual")}>
          {t("projects.individual")}
        </FilterButton>
        <FilterButton pressed={kind === "team"} onClick={() => setKind("team")}>
          {t("projects.team")}
        </FilterButton>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.map((project) => (
          <li key={`${project.year}-${project.kind}`}>
            <article
              className={cn(
                "h-full rounded-3xl p-5 shadow-card",
                project.kind === "individual" ? "bg-butter" : "bg-mint",
              )}
            >
              <p className="text-sm font-extrabold tracking-wide uppercase">
                {t("projects.primary", { range: project.range })}
              </p>
              <p className="mt-1 text-sm font-bold">
                {project.kind === "individual" ? t("projects.individual") : t("projects.team")}
              </p>
              <h2 className="mt-2 font-display text-3xl">{project.title}</h2>
              <p className="mt-2 text-lg">{project.summary}</p>
              <p className="mt-3 text-sm font-bold">{t("projects.need")}</p>
              <p>{project.need}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5">
                {project.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 font-bold">
                {t("projects.learn")}: {project.learn}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}

function FilterButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold",
        pressed ? "bg-ink text-cream" : "bg-surface text-ink shadow-card",
      )}
    >
      {children}
    </button>
  );
}