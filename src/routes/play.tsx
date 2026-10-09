import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SquishyPhoto } from "@/components/squishy-photo";
import { Button } from "@/components/ui/button";
import { getSquishy, squishies, type Squishy } from "@/lib/catalog";
import { playCheer, playFart } from "@/lib/quiz-sounds";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Squish quiz · Every Squishy Ever" },
      {
        name: "description",
        content: "A 20-question squishy quiz for one player, or up to 10 teams of 4.",
      },
    ],
  }),
  component: PlayPage,
});

const QUESTION_COUNT = 20;
const MAX_TEAMS = 10;
const MAX_PLAYERS = 4;

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
  "bread-loaf",
  "sunny-days-squeezy",
  "fuzz-ball",
  "dream-drop",
];

const ICONS = ICON_IDS.map((id) => getSquishy(id)).filter((item): item is Squishy => item != null);

type Question = {
  prompt: string;
  image?: Squishy;
  choices: string[];
  answer: string;
};

type Draft = { key: number; name: string; iconId: string; players: string[] };
type RosterTeam = Draft & { score: number; asked: number };
type PlayMode = "solo" | "teams";

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

function validateRoster(source: Draft[], asSolo: boolean) {
  if (asSolo) {
    const person = source[0];
    if (!person?.name) return "Type your name first.";
    if (!person.iconId) return "Pick a squishy to play as.";
    return "";
  }
  if (source.length < 1 || source.length > MAX_TEAMS) return "Add between 1 and 10 teams.";
  if (source.some((team) => !team.name)) return "Every team needs a team name.";
  const teamNames = source.map((team) => team.name.toLowerCase());
  if (new Set(teamNames).size !== teamNames.length) return "Team names have to be different.";
  if (source.some((team) => !team.iconId)) return "Every team picks a squishy.";
  const icons = source.map((team) => team.iconId);
  if (new Set(icons).size !== icons.length) return "Each team needs its own squishy.";
  const allPlayers: string[] = [];
  for (const team of source) {
    if (team.players.length < 1 || team.players.length > MAX_PLAYERS) {
      return "Each team needs 1 to 4 player names.";
    }
    const local = team.players.map((player) => player.toLowerCase());
    if (new Set(local).size !== local.length) return `${team.name} has two players with the same name.`;
    allPlayers.push(...local);
  }
  if (new Set(allPlayers).size !== allPlayers.length) return "Every player name has to be different, even on other teams.";
  if (allPlayers.length > MAX_TEAMS * MAX_PLAYERS) return "That's more than 40 players.";
  return "";
}

function cheer(score: number, asked: number) {
  if (asked > 0 && score === asked) return "You got every one. Squish legend!";
  if (score >= 15) return "Wow, you really know your squishies.";
  if (score >= 8) return "Nice squeezes. Play again if you want to beat that score.";
  return "That was a tricky round. The shelf is still there if you want another look.";
}

function PlayPage() {
  const [mode, setMode] = useState<PlayMode>("solo");
  const [soloName, setSoloName] = useState("");
  const [soloIcon, setSoloIcon] = useState("");
  const [nextKey, setNextKey] = useState(3);
  const [drafts, setDrafts] = useState<Draft[]>([
    { key: 1, name: "", iconId: "", players: [""] },
    { key: 2, name: "", iconId: "", players: [""] },
  ]);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"setup" | "quiz" | "league">("setup");
  const [solo, setSolo] = useState(true);
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

  function updatePlayer(key: number, index: number, value: string) {
    setDrafts((current) =>
      current.map((team) =>
        team.key === key
          ? { ...team, players: team.players.map((player, i) => (i === index ? value : player)) }
          : team,
      ),
    );
    setError("");
  }

  function addPlayer(key: number) {
    setDrafts((current) =>
      current.map((team) =>
        team.key === key && team.players.length < MAX_PLAYERS ? { ...team, players: [...team.players, ""] } : team,
      ),
    );
  }

  function removePlayer(key: number, index: number) {
    setDrafts((current) =>
      current.map((team) =>
        team.key === key && team.players.length > 1
          ? { ...team, players: team.players.filter((_, i) => i !== index) }
          : team,
      ),
    );
  }

  function addTeam() {
    if (drafts.length >= MAX_TEAMS) return;
    setDrafts((current) => [...current, { key: nextKey, name: "", iconId: "", players: [""] }]);
    setNextKey((value) => value + 1);
  }

  function removeTeam(key: number) {
    if (drafts.length <= 1) return;
    setDrafts((current) => current.filter((team) => team.key !== key));
  }

  function start(from?: Draft[], asSolo = mode === "solo") {
    const raw =
      from ??
      (asSolo ? [{ key: 0, name: soloName, iconId: soloIcon, players: [soloName] }] : drafts);
    const source = raw.map((team) => ({
      ...team,
      name: team.name.trim(),
      players: team.players.map((player) => player.trim()).filter(Boolean),
    }));
    const problem = validateRoster(source, asSolo);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSolo(asSolo);
    setRoster(source.map((team) => ({ ...team, score: 0, asked: 0 })));
    setQuiz(buildQuiz());
    setRound(0);
    setPicked(null);
    setPhase("quiz");
  }

  function choose(choice: string) {
    if (!question || picked || !turn) return;
    setPicked(choice);
    const correct = choice === question.answer;
    if (correct) playCheer();
    else playFart();
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
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">Play</p>
      <h1 className="mt-2 font-display text-5xl">Squish quiz</h1>
      {phase === "setup" ? (
        <Setup
          mode={mode}
          soloName={soloName}
          soloIcon={soloIcon}
          drafts={drafts}
          error={error}
          onMode={(nextMode) => {
            setMode(nextMode);
            setError("");
          }}
          onSoloName={(value) => {
            setSoloName(value);
            setError("");
          }}
          onSoloIcon={(id) => {
            setSoloIcon(id);
            setError("");
          }}
          onChange={updateDraft}
          onPlayer={updatePlayer}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
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
            <div className="min-w-0">
              <p className="text-sm font-bold">{solo || roster.length === 1 ? "Your turn" : "Your team's turn"}</p>
              <p className="font-display text-2xl leading-tight break-words">{turn.name}</p>
              {solo ? null : (
                <p className="text-sm font-bold break-words">{turn.players.join(", ")}. One answer for the team.</p>
              )}
            </div>
            <p className="ml-auto shrink-0 text-sm font-bold tabular-nums">
              {round + 1} / {quiz?.length}
            </p>
          </div>
          <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
            <h2 className="font-display text-3xl">{question.prompt}</h2>
            {question.image ? (
              <div className="mx-auto mt-4 aspect-square w-full max-w-xs overflow-hidden rounded-2xl">
                <SquishyPhoto item={question.image} alt={question.prompt} eager />
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
                {quiz && round + 1 === quiz.length
                  ? solo
                    ? "See your score"
                    : "See the league"
                  : roster.length === 1
                    ? "Next"
                    : "Next team"}
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
      {phase === "league" && leader ? (
        <section className="mt-6">
          {solo ? (
            <div className="rounded-3xl bg-butter p-6">
              <h2 className="font-display text-4xl">
                {leader.score} out of {leader.asked}
              </h2>
              <p className="mt-2 text-lg">
                Nice work, {leader.name}. {cheer(leader.score, leader.asked)}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-butter p-6">
              <h2 className="font-display text-4xl">{tied ? "It's a tie at the top!" : `${leader.name} wins!`}</h2>
              <p className="mt-2 text-lg">Twenty questions. One answer counted for each team.</p>
            </div>
          )}
          {solo ? null : (
            <ol className="mt-4 grid gap-3">
              {ranked.map((team, index) => (
                <li key={team.key} className="flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream font-display text-2xl">
                    {index + 1}
                  </span>
                  <TeamFace iconId={team.iconId} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl leading-tight break-words">{team.name}</p>
                    <p className="text-sm font-bold break-words">{team.players.join(", ")}</p>
                    <p className="text-sm text-muted tabular-nums">
                      {team.score} right out of {team.asked}
                    </p>
                  </div>
                  <p className="font-display text-4xl tabular-nums">{team.score}</p>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ink"
              onClick={() =>
                start(
                  roster.map((team) => ({
                    key: team.key,
                    name: team.name,
                    iconId: team.iconId,
                    players: [...team.players],
                  })),
                  solo,
                )
              }
            >
              Play again
            </Button>
            <Button variant="surface" onClick={() => setPhase("setup")}>
              {solo ? "Change name" : "Change teams"}
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Setup({
  mode,
  soloName,
  soloIcon,
  drafts,
  error,
  onMode,
  onSoloName,
  onSoloIcon,
  onChange,
  onPlayer,
  onAddPlayer,
  onRemovePlayer,
  onAdd,
  onRemove,
  onStart,
}: {
  mode: PlayMode;
  soloName: string;
  soloIcon: string;
  drafts: Draft[];
  error: string;
  onMode: (mode: PlayMode) => void;
  onSoloName: (value: string) => void;
  onSoloIcon: (id: string) => void;
  onChange: (key: number, patch: Partial<Draft>) => void;
  onPlayer: (key: number, index: number, value: string) => void;
  onAddPlayer: (key: number) => void;
  onRemovePlayer: (key: number, index: number) => void;
  onAdd: () => void;
  onRemove: (key: number) => void;
  onStart: () => void;
}) {
  const taken = new Set(drafts.map((team) => team.iconId).filter(Boolean));
  const named = drafts.reduce((count, team) => count + team.players.filter((player) => player.trim()).length, 0);
  return (
    <div className="mt-4">
      <p className="text-lg">
        Twenty questions. Play by yourself, or with teams of up to 4. Your team can play against as many as 9 other
        teams, 40 players in all. A team gives one answer together.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-cream-deep p-1" role="group" aria-label="Who is playing">
        <button
          type="button"
          aria-pressed={mode === "solo"}
          className={cn("min-h-11 rounded-full font-bold", mode === "solo" ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onMode("solo")}
        >
          Just me
        </button>
        <button
          type="button"
          aria-pressed={mode === "teams"}
          className={cn("min-h-11 rounded-full font-bold", mode === "teams" ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onMode("teams")}
        >
          Teams
        </button>
      </div>
      {mode === "solo" ? (
        <fieldset className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
          <legend className="px-1 font-display text-2xl">Your name</legend>
          <label className="mt-2 block text-sm font-bold" htmlFor="solo-name">
            What should we call you?
          </label>
          <input
            id="solo-name"
            value={soloName}
            maxLength={24}
            onChange={(event) => onSoloName(event.target.value)}
            placeholder="Sam"
            className="mt-1 min-h-11 w-full rounded-full bg-cream px-4 text-ink shadow-card"
          />
          <p className="mt-3 text-sm font-bold" id="solo-icon">
            Your squishy
          </p>
          <IconPicker selectedId={soloIcon} taken={new Set()} labelId="solo-icon" onPick={onSoloIcon} />
        </fieldset>
      ) : (
        <div className="mt-4 grid gap-4">
          <p className="text-sm font-bold">
            {drafts.length} of {MAX_TEAMS} teams · {named} of {MAX_TEAMS * MAX_PLAYERS} players named
          </p>
          {drafts.map((team, index) => (
            <fieldset key={team.key} className="rounded-3xl bg-surface p-4 shadow-card">
              <legend className="px-1 font-display text-2xl">Team {index + 1}</legend>
              <label className="mt-2 block text-sm font-bold" htmlFor={`team-name-${team.key}`}>
                Team name
              </label>
              <input
                id={`team-name-${team.key}`}
                value={team.name}
                maxLength={24}
                onChange={(event) => onChange(team.key, { name: event.target.value })}
                placeholder="Lemon Lions"
                className="mt-1 min-h-11 w-full rounded-full bg-cream px-4 text-ink shadow-card"
              />
              <p className="mt-3 text-sm font-bold">Players</p>
              <p className="text-sm text-muted">Add each person's name. The team still shares one answer.</p>
              <div className="mt-2 grid gap-2">
                {team.players.map((player, playerIndex) => (
                  <div key={`${team.key}-${playerIndex}`} className="flex gap-2">
                    <input
                      value={player}
                      maxLength={24}
                      aria-label={`Player ${playerIndex + 1} on team ${index + 1}`}
                      onChange={(event) => onPlayer(team.key, playerIndex, event.target.value)}
                      placeholder={playerIndex === 0 ? "Sam" : "Another player"}
                      className="min-h-11 min-w-0 flex-1 rounded-full bg-cream px-4 text-ink shadow-card"
                    />
                    {team.players.length > 1 ? (
                      <button
                        type="button"
                        className="min-h-11 shrink-0 rounded-full px-3 font-bold"
                        onClick={() => onRemovePlayer(team.key, playerIndex)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {team.players.length < MAX_PLAYERS ? (
                <button type="button" className="mt-2 min-h-11 font-bold" onClick={() => onAddPlayer(team.key)}>
                  Add a player
                </button>
              ) : null}
              <p className="mt-3 text-sm font-bold" id={`team-icon-${team.key}`}>
                Squishy icon
              </p>
              <IconPicker
                selectedId={team.iconId}
                taken={taken}
                labelId={`team-icon-${team.key}`}
                onPick={(id) => onChange(team.key, { iconId: id })}
              />
              {drafts.length > 1 ? (
                <button type="button" className="mt-3 min-h-11 font-bold" onClick={() => onRemove(team.key)}>
                  Remove team
                </button>
              ) : null}
            </fieldset>
          ))}
        </div>
      )}
      {error ? (
        <p className="mt-3 font-bold" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {mode === "teams" && drafts.length < MAX_TEAMS ? (
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

function IconPicker({
  selectedId,
  taken,
  labelId,
  onPick,
}: {
  selectedId: string;
  taken: Set<string>;
  labelId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8" role="group" aria-labelledby={labelId}>
      {ICONS.map((icon) => {
        const selected = selectedId === icon.id;
        const used = taken.has(icon.id) && !selected;
        return (
          <button
            key={icon.id}
            type="button"
            aria-pressed={selected}
            aria-label={used ? `${icon.name} is already picked` : icon.name}
            disabled={used}
            onClick={() => onPick(icon.id)}
            className={cn(
              "aspect-square overflow-hidden rounded-2xl",
              selected ? "ring-2 ring-ink ring-offset-2" : "shadow-card",
              used && "opacity-35",
            )}
          >
            <SquishyPhoto item={icon} alt="" />
          </button>
        );
      })}
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
