import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · Every Squishy Ever" },
      {
        name: "description",
        content: "Individual and team squishy projects for Primary 1 through Primary 7.",
      },
    ],
  }),
  component: ProjectsPage,
});

type Kind = "individual" | "team";

type Project = {
  year: number;
  ages: string;
  kind: Kind;
  title: string;
  summary: string;
  need: string;
  steps: string[];
  learn: string;
};

const PROJECTS: Project[] = [
  {
    year: 1,
    ages: "about age 5–6",
    kind: "individual",
    title: "Squeeze and say",
    summary: "Learn one feeling word for a squishy.",
    need: "One squishy, a crayon, and paper.",
    steps: [
      "Squeeze the squishy in your hand.",
      "Say one word for the feel, such as soft, slow, or bumpy.",
      "Draw the squishy.",
      "Write the word, or ask an adult to write it under the drawing.",
    ],
    learn: "Naming how something feels.",
  },
  {
    year: 1,
    ages: "about age 5–6",
    kind: "team",
    title: "Sorting baskets",
    summary: "Sort toys by how they feel.",
    need: "Four to six squishies, or pictures from the shelf, and two boxes labeled Soft and Slow.",
    steps: [
      "Sit in a circle.",
      "Each person squeezes one toy.",
      "The team chooses a box for it.",
      "Tell the class the rule you used.",
    ],
    learn: "Sorting together.",
  },
  {
    year: 2,
    ages: "about age 6–7",
    kind: "individual",
    title: "Color and feel card",
    summary: "Look closely at one squishy.",
    need: "The catalog and a piece of paper.",
    steps: [
      "Pick one squishy.",
      "Write its name.",
      "Color a square for each color you see.",
      "Write two words for how it feels.",
    ],
    learn: "Looking closely.",
  },
  {
    year: 2,
    ages: "about age 6–7",
    kind: "team",
    title: "Feel museum",
    summary: "Make a table of feeling cards.",
    need: "One card from each person.",
    steps: [
      "Everyone makes a color and feel card.",
      "Put the cards on a table, grouped by how the toy feels.",
      "Invite another team to find the slow one.",
      "Explain how you grouped the cards.",
    ],
    learn: "Grouping and explaining.",
  },
  {
    year: 3,
    ages: "about age 7–8",
    kind: "individual",
    title: "Four-picture story",
    summary: "Tell a squishy story in order.",
    need: "Paper folded into four boxes.",
    steps: [
      "Draw four pictures: find, squeeze, share, put away.",
      "Write one sentence under each picture.",
      "Read the story out loud.",
      "Check that the pictures are in that order.",
    ],
    learn: "A story in order.",
  },
  {
    year: 3,
    ages: "about age 7–8",
    kind: "team",
    title: "Category shop",
    summary: "Open a pretend shop for one shelf.",
    need: "One category from the shelf, and paper tags marked 1, 2, or 3 pretend coins.",
    steps: [
      "Choose Cheese, Fruit, or Animal.",
      "Each person makes one label with the name and a pretend price.",
      "Set the labels on a table.",
      "Take turns being the shopkeeper.",
    ],
    learn: "Categories and speaking in a role.",
  },
  {
    year: 4,
    ages: "about age 8–9",
    kind: "individual",
    title: "Same and different",
    summary: "Compare two squishies.",
    need: "Two squishies from the catalog.",
    steps: [
      "Make a table with Size, Feel, Category, and Colors.",
      "Fill one column for each toy.",
      "Write one sentence about how they are the same.",
      "Write one sentence about how they are different.",
    ],
    learn: "Comparing two things.",
  },
  {
    year: 4,
    ages: "about age 8–9",
    kind: "team",
    title: "Class favorite tally",
    summary: "Find out which squishy the class likes.",
    need: "The hall of fame page and a tally sheet.",
    steps: [
      "Ask 8 people to name a favorite squishy.",
      "Tally the answers.",
      "Draw a bar made of squares for each answer.",
      "Say whether your winner is in the hall of fame.",
    ],
    learn: "Collecting and showing data.",
  },
  {
    year: 5,
    ages: "about age 9–10",
    kind: "individual",
    title: "Slow-rise watch",
    summary: "Watch how a squishy changes after a squeeze.",
    need: "A slow-rise squishy if you have one, or its catalog page, and a timer. An adult can keep the time.",
    steps: [
      "Press it and let go, or read what slow-rise foam means.",
      "Look at the start, the middle, and the end of 30 seconds.",
      "Write what changed, or what you would measure if you had the toy.",
      "Say what stayed the same.",
    ],
    learn: "Noticing change.",
  },
  {
    year: 5,
    ages: "about age 9–10",
    kind: "team",
    title: "Invent a squishy",
    summary: "Design a new hand toy.",
    need: "Poster paper.",
    steps: [
      "It must fit in a hand. It cannot be a pillow.",
      "Agree a name, a feel, a category, and who it is for.",
      "Draw it.",
      "Add three tags, the way the catalog does.",
    ],
    learn: "Designing with rules.",
  },
  {
    year: 6,
    ages: "about age 10–11",
    kind: "individual",
    title: "Fair squeeze test",
    summary: "Test two squishies in a fair way.",
    need: "Two squishies that feel different.",
    steps: [
      "Ask: which is easier to squeeze with one hand?",
      "Use the same hand and the same amount of time for each toy.",
      "Try each toy 3 times and write what you noticed.",
      "Write one thing that could make the test unfair.",
    ],
    learn: "A fair test.",
  },
  {
    year: 6,
    ages: "about age 10–11",
    kind: "team",
    title: "Write a mini quiz",
    summary: "Write questions another team can answer.",
    need: "The shelf, and paper for five questions.",
    steps: [
      "Write 5 questions. Each one needs 4 answers, and only one is right.",
      "One person checks that the right answer is really right.",
      "Try the quiz on another team.",
      "Change any question that was confusing.",
    ],
    learn: "Writing a clear question.",
  },
  {
    year: 7,
    ages: "about age 11–12",
    kind: "individual",
    title: "Catalog card",
    summary: "Explain one squishy in your own words.",
    need: "One squishy page from the shelf.",
    steps: [
      "Read the page, then close it.",
      "Write the name, category, and how it feels.",
      "Say who might like it, and why it is a squishy rather than a pillow.",
      "Do not copy the words from the page.",
    ],
    learn: "Explaining in your own words.",
  },
  {
    year: 7,
    ages: "about age 11–12",
    kind: "team",
    title: "Squishy fair plan",
    summary: "Plan a class fair.",
    need: "One page for the plan.",
    steps: [
      "Include a sharing rule and a hall of fame vote.",
      "Plan two stations and who runs each one.",
      "Write what each station does.",
      "Tell another team the plan in under one minute.",
    ],
    learn: "Planning and speaking.",
  },
];

const YEARS = [1, 2, 3, 4, 5, 6, 7];

function ProjectsPage() {
  const [year, setYear] = useState<number | "all">("all");
  const [kind, setKind] = useState<Kind | "both">("both");
  const shown = PROJECTS.filter(
    (project) => (year === "all" || project.year === year) && (kind === "both" || project.kind === kind),
  );

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-5xl">Projects</h1>
      <p className="mt-3 max-w-2xl text-lg">
        Individual and team projects for Primary 1 through Primary 7. Use a squishy from home or a picture from the
        shelf. Toys stay in hands, not mouths. An adult helps with sharing and timing.
      </p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="School year">
        <FilterButton pressed={year === "all"} onClick={() => setYear("all")}>
          All years
        </FilterButton>
        {YEARS.map((item) => (
          <FilterButton key={item} pressed={year === item} onClick={() => setYear(item)}>
            Primary {item}
          </FilterButton>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Project type">
        <FilterButton pressed={kind === "both"} onClick={() => setKind("both")}>
          Both
        </FilterButton>
        <FilterButton pressed={kind === "individual"} onClick={() => setKind("individual")}>
          Individual
        </FilterButton>
        <FilterButton pressed={kind === "team"} onClick={() => setKind("team")}>
          Team
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
                Primary {project.year}
                <span className="font-bold tracking-normal normal-case text-ink/70"> · {project.ages}</span>
              </p>
              <p className="mt-1 text-sm font-bold">{project.kind === "individual" ? "Individual" : "Team"}</p>
              <h2 className="mt-2 font-display text-3xl">{project.title}</h2>
              <p className="mt-2 text-lg">{project.summary}</p>
              <p className="mt-3 text-sm font-bold">You need</p>
              <p>{project.need}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5">
                {project.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 font-bold">You learn: {project.learn}</p>
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
        "min-h-11 rounded-full px-3 text-sm font-bold",
        pressed ? "bg-ink text-cream" : "bg-surface text-ink shadow-card",
      )}
    >
      {children}
    </button>
  );
}
