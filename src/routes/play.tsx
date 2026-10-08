import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SquishyPhoto } from "@/components/squishy-photo";
import { Button } from "@/components/ui/button";
import { getSquishy, squishies, type Squishy } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Squish quiz · Every Squishy Ever" },
      { name: "description", content: "A 20-question squishy quiz for up to four teams." },
    ],
  }),
  component: PlayPage,
});

const QUESTION_COUNT = 20;

const ICON_IDS = [
  "nice-cube",
  "cheese-wedge",
  "butter-stick",
  "mochi-squishy",
  "avocado",
  "donut",
  "needoh-gummy-bear",
  "whale",
  "burger",
  "egg",
  "ice-cream-cone",
  "panic-pete",
];

const ICONS = ICON_IDS.map((id) => getSquishy(id)).filter((item): item is Squishy => item != null);

type Question = {
  prompt: string;
  image?: Squishy;
  choices: string[];
  answer: string;
};

type Draft = { key: number; name: string; iconId: string };
type RosterTeam = Draft & { score: number; asked: number };

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function uniqueChoices(answer: string, extras: string[], count: number) {
  const choices = [answer];
  for (const extra of extras) {
    if (!choices.includes(extra)) choices.push(extra);
    if (choices.length === count) break;
  }
  return shuffle(choices);
}

function buildQuiz(): Question[] {
  const pool = shuffle(squishies.filter((item) => item.image));
  const questions: Question[] = [];

  function take() {
    return pool.pop();
  }

  for (let i = 0; i < 10; i++) {
    const item = take();
    if (!item) break;
    const decoys = shuffle(squishies.filter((other) => other.name !== item.name)).map((other) => other.name);
    questions.push({
      prompt: "What is this squishy called?",
      image: item,
      choices: uniqueChoices(item.name, decoys, 4),
      answer: item.name,
    });
  }

  for (let i = 0; i < 6; i++) {
    const item = take();
    if (!item) break;
    const decoys = shuffle(squishies.filter((other) => other.texture !== item.texture)).map((other) => other.texture);
    questions.push({
      prompt: `How does the ${item.name} feel?`,
      image: item,
      choices: uniqueChoices(item.texture, decoys, 4),
      answer: item.texture,
    });
  }

  for (let i = 0; i < 4; i++) {
    const item = take();
    if (!item) break;
    const decoys = shuffle(squishies.filter((other) => other.category !== item.category)).map((other) => other.category);
    questions.push({
      prompt: `Which shelf is the ${item.name} on?`,
      image: item,
      choices: uniqueChoices(item.category, decoys, 4),
      answer: item.category,
    });
  }

  return shuffle(questions).slice(0, QUESTION_COUNT);
}

function PlayPage() {
  const [nextKey, setNextKey] = useState(3);
  const [drafts, setDrafts] = useState<Draft[]>([
    { key: 1, name: "", iconId: "" },
    { key: 2, name: "", iconId: "" },
  ]);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"setup" | "quiz" | "league">("setup");
  const [roster, setRoster] = useState<RosterTeam[]>([]);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const question = quiz?.[round];
  const turn = roster[round % Math.max(roster.length, 1)];

  function updateDraft(key: number, patch: Partial<Draft>) {
    setDrafts((current) => current.map((team) => (team.key === key ? { ...team, ...patch } : team)));
    setError("");
  }

  function addTeam() {
    if (drafts.length >= 4) return;
    setDrafts((current) => [...current, { key: nextKey, name: "", iconId: "" }]);
    setNextKey((value) => value + 1);
  }

  function removeTeam(key: number) {
    if (drafts.length <= 1) return;
    setDrafts((current) => current.filter((team) => team.key !== key));
  }

  function start(from?: Draft[]) {
    const source = from ?? drafts;
    const names = source.map((team) => team.name.trim());
    if (names.some((name) => name.length < 1)) {
      setError("Every team needs a name.");
      return;
    }
    if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
      setError("Team names have to be different.");
      return;
    }
    if (source.some((team) => !team.iconId)) {
      setError("Every team needs a squishy icon.");
      return;
    }
    setError("");
    setRoster(
      source.map((team) => ({
        key: team.key,
        name: team.name.trim(),
        iconId: team.iconId,
        score: 0,
        asked: 0,
      })),
    );
    setQuiz(buildQuiz());
    setRound(0);
    setPicked(null);
    setPhase("quiz");
  }

  function choose(choice: string) {
    if (!question || picked || !turn) return;
    setPicked(choice);
    const correct = choice === question.answer;
    setRoster((current) =>
      current.map((team) =>
        team.key === turn.key ? { ...team, asked: team.asked + 1, score: team.score + (correct ? 1 : 0) } : team,
      ),
    );
  }

  function next() {
    if (!quiz) return;
    if (round + 1 >= quiz.length) {
      setPhase("league");
      return;
    }
    setRound((value) => value + 1);
    setPicked(null);
  }

  const ranked = [...roster].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const leader = ranked[0];
  const tied = ranked.filter((team) => team.score === leader?.score).length > 1;

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8 pb-28">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">Play</p>
      <h1 className="mt-2 font-display text-5xl">Squish quiz</h1>
      {phase === "setup" ? (
        <Setup
          drafts={drafts}
          error={error}
          onChange={updateDraft}
          onAdd={addTeam}
          onRemove={removeTeam}
          onStart={() => start()}
        />
      ) : null}
      {phase === "quiz" && question && turn ? (
        <section className="mt-6" aria-live="polite">
          <ScoreStrip teams={roster} activeKey={turn.key} />
          <div className="mt-4 flex items-center gap-3 rounded-3xl bg-butter px-4 py-3">
            <TeamFace iconId={turn.iconId} />
            <div>
              <p className="text-sm font-bold">Your turn</p>
              <p className="font-display text-2xl leading-tight">{turn.name}</p>
            </div>
            <p className="ml-auto text-sm font-bold tabular-nums">
              {round + 1} / {quiz?.length}
            </p>
          </div>
          <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
            <h2 className="font-display text-3xl">{question.prompt}</h2>
            {question.image ? (
              <div className="mx-auto mt-4 aspect-square w-full max-w-xs overflow-hidden rounded-2xl">
                <SquishyPhoto item={question.image} alt={question.prompt} />
              </div>
            ) : null}
            <div className="mt-4 grid gap-2">
              {question.choices.map((choice) => {
                const correct = picked && choice === question.answer;
                const wrong = picked === choice && choice !== question.answer;
                return (
                  <button
                    key={choice}
                    type="button"
                    className={cn(
                      "min-h-11 rounded-2xl px-4 text-left font-bold break-words shadow-card",
                      correct ? "bg-mint text-ink" : wrong ? "bg-blush text-ink" : "bg-cream text-ink",
                    )}
                    onClick={() => choose(choice)}
                    disabled={picked != null}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {picked ? (
              <Button variant="ink" className="mt-4" onClick={next}>
                {quiz && round + 1 === quiz.length ? "See the league" : "Next team"}
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
      {phase === "league" && leader ? (
        <section className="mt-6">
          <div className="rounded-3xl bg-butter p-6">
            <h2 className="font-display text-4xl">{tied ? "It's a tie at the top!" : `${leader.name} wins!`}</h2>
            <p className="mt-2 text-lg">Twenty questions. Here is the league table.</p>
          </div>
          <ol className="mt-4 grid gap-3">
            {ranked.map((team, index) => (
              <li key={team.key} className="flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream font-display text-2xl">
                  {index + 1}
                </span>
                <TeamFace iconId={team.iconId} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-2xl">{team.name}</p>
                  <p className="text-sm text-muted tabular-nums">
                    {team.score} right out of {team.asked}
                  </p>
                </div>
                <p className="font-display text-4xl tabular-nums">{team.score}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ink"
              onClick={() =>
                start(
                  roster.map((team) => ({
                    key: team.key,
                    name: team.name,
                    iconId: team.iconId,
                  })),
                )
              }
            >
              Play again
            </Button>
            <Button variant="surface" onClick={() => setPhase("setup")}>
              Change teams
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Setup({
  drafts,
  error,
  onChange,
  onAdd,
  onRemove,
  onStart,
}: {
  drafts: Draft[];
  error: string;
  onChange: (key: number, patch: Partial<Draft>) => void;
  onAdd: () => void;
  onRemove: (key: number) => void;
  onStart: () => void;
}) {
  const taken = new Set(drafts.map((team) => team.iconId).filter(Boolean));
  return (
    <div className="mt-4">
      <p className="text-lg">
        Twenty questions. Add up to four teams. Each team picks a name and a squishy, then you take turns.
      </p>
      <div className="mt-4 grid gap-4">
        {drafts.map((team, index) => (
          <fieldset key={team.key} className="rounded-3xl bg-surface p-4 shadow-card">
            <legend className="px-1 font-display text-2xl">Team {index + 1}</legend>
            <label className="mt-2 block text-sm font-bold" htmlFor={`team-name-${team.key}`}>
              Team name
            </label>
            <input
              id={`team-name-${team.key}`}
              value={team.name}
              maxLength={18}
              onChange={(event) => onChange(team.key, { name: event.target.value })}
              placeholder="Lemon Lions"
              className="mt-1 min-h-11 w-full rounded-full bg-cream px-4 text-ink shadow-card"
            />
            <p className="mt-3 text-sm font-bold" id={`team-icon-${team.key}`}>
              Squishy icon
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6" role="group" aria-labelledby={`team-icon-${team.key}`}>
              {ICONS.map((icon) => {
                const selected = team.iconId === icon.id;
                const used = taken.has(icon.id) && !selected;
                return (
                  <button
                    key={icon.id}
                    type="button"
                    aria-pressed={selected}
                    aria-label={used ? `${icon.name} is already picked` : icon.name}
                    disabled={used}
                    onClick={() => onChange(team.key, { iconId: icon.id })}
                    className={cn(
                      "aspect-square overflow-hidden rounded-2xl",
                      selected ? "ring-2 ring-ink ring-offset-2" : "shadow-card",
                      used && "opacity-35",
                    )}
                  >
                    <SquishyPhoto item={icon} />
                  </button>
                );
              })}
            </div>
            {drafts.length > 1 ? (
              <button type="button" className="mt-3 min-h-11 font-bold" onClick={() => onRemove(team.key)}>
                Remove team
              </button>
            ) : null}
          </fieldset>
        ))}
      </div>
      {error ? (
        <p className="mt-3 font-bold" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {drafts.length < 4 ? (
          <Button variant="surface" onClick={onAdd}>
            Add a team
          </Button>
        ) : null}
        <Button variant="ink" onClick={onStart}>
          Start quiz
        </Button>
      </div>
    </div>
  );
}

function ScoreStrip({ teams, activeKey }: { teams: RosterTeam[]; activeKey: number }) {
  return (
    <ul className="flex gap-2 overflow-x-auto" aria-label="Scores so far">
      {teams.map((team) => (
        <li
          key={team.key}
          className={cn(
            "flex min-h-11 shrink-0 items-center gap-2 rounded-full px-2 pr-3",
            team.key === activeKey ? "bg-ink text-cream" : "bg-surface text-ink shadow-card",
          )}
        >
          <TeamFace iconId={team.iconId} small />
          <span className="max-w-28 truncate text-sm font-bold">{team.name}</span>
          <span className="text-sm font-bold tabular-nums">{team.score}</span>
        </li>
      ))}
    </ul>
  );
}

function TeamFace({ iconId, small = false }: { iconId: string; small?: boolean }) {
  const icon = getSquishy(iconId);
  if (!icon) return null;
  return (
    <span className={cn("shrink-0 overflow-hidden rounded-full", small ? "size-8" : "size-14")}>
      <SquishyPhoto item={icon} alt="" />
    </span>
  );
}
