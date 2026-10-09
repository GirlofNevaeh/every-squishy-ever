import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SquishyPhoto } from "@/components/squishy-photo";
import { Button } from "@/components/ui/button";
import { EMPTY_SEARCH, getSquishy, squishies, type Squishy } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import {
  dealPlayoff,
  dealQuiz,
  questionImage,
  QUIZ_MEGA,
  QUIZ_QUICK,
  shuffleList,
  type QuizQuestion,
} from "@/lib/quiz-bank";
import { holdAudio, playAirHorn, playCheer, playFart, warmAudio } from "@/lib/quiz-sounds";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play Squishy Quiz · Every Squishy Ever" },
      {
        name: "description",
        content: "A quick 10-question quiz or a 25-question mega quiz, for one player or up to 10 teams of 4.",
      },
    ],
  }),
  component: PlayPage,
});

const MAX_TEAMS = 10;
const MAX_PLAYERS = 4;
const ANSWER_PAUSE_MS = 1000;
const DECIDE_SECONDS = 10;
const PLAYOFF_ROUNDS = 3;
const DANCE_SECONDS = 30;
const DRAW_FLASH_MS = 3000;

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

type Draft = { key: number; name: string; iconId: string; players: string[] };
type RosterTeam = Draft & { score: number; asked: number };
type PlayMode = "solo" | "teams";
type Phase =
  | "setup"
  | "quiz"
  | "league"
  | "decide"
  | "playoff"
  | "draw-flash"
  | "dance-pick"
  | "dance"
  | "dance-judge"
  | "celebrate";
type Dancer = { teamKey: number; name: string; squishyId: string };
type Celebrate =
  | { kind: "playoff"; teamName: string }
  | { kind: "draw"; teams: RosterTeam[] }
  | { kind: "dance"; dancer: string; teamName: string };

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
  let playerCount = 0;
  for (const team of source) {
    if (team.players.length < 1 || team.players.length > MAX_PLAYERS) {
      return "Each team needs 1 to 4 player names.";
    }
    const local = team.players.map((player) => player.toLowerCase());
    if (new Set(local).size !== local.length) return `${team.name} has two players with the same name.`;
    playerCount += local.length;
  }
  if (playerCount > MAX_TEAMS * MAX_PLAYERS) return "That's more than 40 players.";
  return "";
}

function cheer(score: number, asked: number) {
  if (asked > 0 && score === asked) return "You got every one. Squish legend!";
  if (asked > 0 && score / asked >= 0.7) return "Wow, you really know your squishies.";
  if (asked > 0 && score / asked >= 0.5) return "Nice squeezes. Play again if you want to beat that score.";
  return "That was a tricky round. The shelf is still there if you want another look.";
}

function joinTeams(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function leadersOf(teams: RosterTeam[]) {
  if (teams.length === 0) return [];
  const top = Math.max(...teams.map((team) => team.score));
  return teams.filter((team) => team.score === top).sort((a, b) => a.name.localeCompare(b.name));
}

function danceGridClass(count: number) {
  if (count <= 2) return "grid-cols-2 grid-rows-1";
  if (count === 3) return "grid-cols-3 grid-rows-1";
  if (count === 4) return "grid-cols-2 grid-rows-2";
  if (count <= 6) return "grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2";
  if (count <= 8) return "grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2";
  if (count === 9) return "grid-cols-3 grid-rows-3";
  return "grid-cols-2 grid-rows-5 sm:grid-cols-5 sm:grid-rows-2";
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
  const [quizSize, setQuizSize] = useState<typeof QUIZ_QUICK | typeof QUIZ_MEGA>(QUIZ_QUICK);
  const [phase, setPhase] = useState<Phase>("setup");
  const [solo, setSolo] = useState(true);
  const [roster, setRoster] = useState<RosterTeam[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [tiedTeams, setTiedTeams] = useState<RosterTeam[]>([]);
  const [decideLeft, setDecideLeft] = useState(DECIDE_SECONDS);
  const [playoffQuestions, setPlayoffQuestions] = useState<QuizQuestion[]>([]);
  const [playoffRound, setPlayoffRound] = useState(0);
  const [aliveKeys, setAliveKeys] = useState<number[]>([]);
  const [playoffTurn, setPlayoffTurn] = useState(0);
  const [roundMarks, setRoundMarks] = useState<Record<number, boolean>>({});
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [danceLeft, setDanceLeft] = useState(DANCE_SECONDS);
  const [celebrate, setCelebrate] = useState<Celebrate | null>(null);
  const lastQuizIds = useRef<string[]>([]);
  const rosterRef = useRef(roster);
  const soloRef = useRef(solo);
  const roundMarksRef = useRef(roundMarks);
  const hornRef = useRef(false);
  const dancersRef = useRef<Dancer[]>([]);
  rosterRef.current = roster;
  soloRef.current = solo;
  roundMarksRef.current = roundMarks;
  dancersRef.current = dancers;

  const question = quiz?.[round];
  const turn = roster[round % Math.max(roster.length, 1)];
  const playoffQuestion = playoffQuestions[playoffRound];
  const aliveTeams = aliveKeys
    .map((key) => roster.find((team) => team.key === key))
    .filter((team): team is RosterTeam => team != null);
  const playoffTeam = aliveTeams[playoffTurn];
  const playingQuestion = phase === "quiz" || phase === "playoff";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase, round, playoffRound, playoffTurn]);

  useEffect(() => {
    document.body.classList.toggle("quiz-tight", playingQuestion);
    return () => document.body.classList.remove("quiz-tight");
  }, [playingQuestion]);

  useEffect(() => {
    if (phase !== "quiz" || !picked || !quiz) return;
    const timer = window.setTimeout(() => {
      const teams = rosterRef.current;
      const isLast = round + 1 >= quiz.length;
      setPicked(null);
      if (!isLast) {
        setRound(round + 1);
        return;
      }
      const tiedGroup = leadersOf(teams);
      if (!soloRef.current && teams.length > 1 && tiedGroup.length > 1) {
        setTiedTeams(tiedGroup);
        setDecideLeft(DECIDE_SECONDS);
        setPhase("decide");
        return;
      }
      setPhase("league");
    }, ANSWER_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, picked, quiz, round]);

  useEffect(() => {
    if (phase !== "playoff" || !picked) return;
    const timer = window.setTimeout(() => {
      const alive = aliveKeys;
      const marks = roundMarksRef.current;
      const unanswered = alive.findIndex((key) => typeof marks[key] !== "boolean");
      setPicked(null);
      if (unanswered >= 0) {
        setPlayoffTurn(unanswered);
        return;
      }
      const right = alive.filter((key) => marks[key]);
      const wrong = alive.filter((key) => marks[key] === false);
      const next = right.length > 0 && wrong.length > 0 ? right : alive;
      if (next.length === 1) {
        const winner = rosterRef.current.find((team) => team.key === next[0]);
        setCelebrate({ kind: "playoff", teamName: winner?.name ?? "The team" });
        setPhase("celebrate");
        return;
      }
      if (playoffRound >= PLAYOFF_ROUNDS - 1) {
        setCelebrate({
          kind: "draw",
          teams: rosterRef.current.filter((team) => next.includes(team.key)),
        });
        setPhase("draw-flash");
        return;
      }
      roundMarksRef.current = {};
      setAliveKeys(next);
      setPlayoffRound(playoffRound + 1);
      setPlayoffTurn(0);
      setRoundMarks({});
    }, ANSWER_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, picked, aliveKeys, playoffTurn, playoffRound]);

  useEffect(() => {
    if (phase !== "decide") return;
    setDecideLeft(DECIDE_SECONDS);
    const timer = window.setInterval(() => {
      setDecideLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "draw-flash") return;
    const timer = window.setTimeout(() => setPhase("celebrate"), DRAW_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "dance") return;
    if (danceLeft > 0) {
      const timer = window.setTimeout(() => setDanceLeft((value) => value - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    if (!hornRef.current) {
      hornRef.current = true;
      playAirHorn();
    }
    const timer = window.setTimeout(() => setPhase("dance-judge"), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, danceLeft]);

  useEffect(() => {
    if (phase !== "dance" && phase !== "draw-flash") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

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
    const nextQuiz = dealQuiz(lastQuizIds.current, quizSize);
    lastQuizIds.current = nextQuiz.map((item) => item.id);
    warmAudio();
    setError("");
    setSolo(asSolo);
    setRoster(source.map((team) => ({ ...team, score: 0, asked: 0 })));
    setQuiz(nextQuiz);
    setRound(0);
    setPicked(null);
    setCelebrate(null);
    setTiedTeams([]);
    setDancers([]);
    setPhase("quiz");
  }

  function choose(choice: string) {
    if (!question || picked || !turn || phase !== "quiz") return;
    setPicked(choice);
    const correct = choice === question.answer;
    warmAudio();
    if (correct) playCheer();
    else playFart();
    setRoster((current) =>
      current.map((team) =>
        team.key === turn.key ? { ...team, asked: team.asked + 1, score: team.score + (correct ? 1 : 0) } : team,
      ),
    );
  }

  function choosePlayoff(choice: string) {
    if (!playoffQuestion || picked || !playoffTeam || phase !== "playoff") return;
    setPicked(choice);
    const correct = choice === playoffQuestion.answer;
    warmAudio();
    if (correct) playCheer();
    else playFart();
    const teamKey = playoffTeam.key;
    const marks = { ...roundMarksRef.current, [teamKey]: correct };
    roundMarksRef.current = marks;
    setRoundMarks(marks);
  }

  function beginPlayoff() {
    warmAudio();
    const used = quiz?.map((item) => item.id) ?? [];
    roundMarksRef.current = {};
    setPlayoffQuestions(dealPlayoff(used, PLAYOFF_ROUNDS));
    setPlayoffRound(0);
    setAliveKeys(tiedTeams.map((team) => team.key));
    setPlayoffTurn(0);
    setRoundMarks({});
    setPicked(null);
    setPhase("playoff");
  }

  function beginDancePick() {
    warmAudio();
    dancersRef.current = [];
    setDancers([]);
    setPhase("dance-pick");
  }

  function selectDancer(teamKey: number, name: string) {
    const next = [
      ...dancersRef.current.filter((dancer) => dancer.teamKey !== teamKey),
      { teamKey, name, squishyId: "" },
    ];
    const ready = tiedTeams.every((team) => next.some((dancer) => dancer.teamKey === team.key));
    if (!ready) {
      dancersRef.current = next;
      setDancers(next);
      return;
    }
    const pool = shuffleList(squishies.filter((item) => item.image));
    const cast = tiedTeams.map((team, index) => ({
      teamKey: team.key,
      name: next.find((dancer) => dancer.teamKey === team.key)?.name ?? team.players[0] ?? team.name,
      squishyId: pool[index]?.id ?? pool[0]?.id ?? "",
    }));
    dancersRef.current = cast;
    hornRef.current = false;
    holdAudio((DANCE_SECONDS + 2) * 1000);
    setDancers(cast);
    setDanceLeft(DANCE_SECONDS);
    setPhase("dance");
  }

  function crownDancer(dancer: Dancer) {
    const team = roster.find((item) => item.key === dancer.teamKey);
    setCelebrate({ kind: "dance", dancer: dancer.name, teamName: team?.name ?? "their team" });
    setPhase("celebrate");
  }

  const ranked = [...roster].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const leader = ranked[0];

  return (
    <main
      id="main"
      className={cn(
        "mx-auto max-w-3xl px-4",
        playingQuestion ? "py-3" : "py-8",
        phase === "celebrate" && "pb-28",
      )}
    >
      {playingQuestion ? null : (
        <>
          <h1 className="mt-2 font-display text-5xl">Play Squishy Quiz</h1>
        </>
      )}
      {phase === "setup" ? (
        <Setup
          mode={mode}
          soloName={soloName}
          soloIcon={soloIcon}
          drafts={drafts}
          error={error}
          quizSize={quizSize}
          onQuizSize={(size) => {
            setQuizSize(size);
            setError("");
          }}
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
        <section className="mt-1" aria-live="polite">
          <ScoreStrip teams={roster} activeKey={turn.key} />
          <TurnBanner
            turn={turn}
            solo={solo}
            teamCount={roster.length}
            label={solo || roster.length === 1 ? "Your turn" : "Your team's turn"}
            detail={solo ? null : `${turn.players.join(", ")}. One answer for the team.`}
            progress={`${round + 1} / ${quiz?.length ?? quizSize}`}
          />
          <AnswerBoard question={question} picked={picked} onChoose={choose} />
        </section>
      ) : null}
      {phase === "league" && leader ? (
        <League
          solo={solo}
          leader={leader}
          ranked={ranked}
          onAgain={() =>
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
          onSetup={() => setPhase("setup")}
        />
      ) : null}
      {phase === "decide" ? (
        <section className="mt-6">
          <div className="rounded-3xl bg-butter p-5">
            <p className="font-display text-5xl tabular-nums" aria-hidden="true">
              {decideLeft}
            </p>
            <h2 className="mt-1 font-display text-4xl">
              {leader && leader.score === 0 ? "It's a tie at 0!" : "It's a tie at the top!"}
            </h2>
            <p className="mt-2 text-lg" aria-live="polite">
              {decideLeft > 0
                ? `${joinTeams(tiedTeams.map((team) => team.name))} are tied${leader?.score === 0 ? " on zero" : ""}. You have ${decideLeft} seconds to choose a Squishy Quiz Playoff or a Dance Off.`
                : "Time is up. Choose a Squishy Quiz Playoff or a Dance Off."}
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button variant="ink" className="min-h-14 text-base" onClick={beginPlayoff}>
              Squishy Quiz Playoff
            </Button>
            <Button variant="butter" className="min-h-14 text-base" onClick={beginDancePick}>
              Dance Off
            </Button>
          </div>
          <ScoreList teams={ranked} />
        </section>
      ) : null}
      {phase === "playoff" && playoffQuestion && playoffTeam ? (
        <section className="mt-1" aria-live="polite">
          <ScoreStrip teams={aliveTeams} activeKey={playoffTeam.key} />
          <TurnBanner
            turn={playoffTeam}
            solo={false}
            teamCount={aliveTeams.length}
            label="Playoff"
            detail={`${playoffTeam.players.join(", ")}. One answer for the team.`}
            progress={`Round ${playoffRound + 1} of ${PLAYOFF_ROUNDS}`}
          />
          <AnswerBoard question={playoffQuestion} picked={picked} onChoose={choosePlayoff} />
        </section>
      ) : null}
      {phase === "dance-pick" ? (
        <section className="mt-6">
          <h2 className="font-display text-4xl">There will now be a dance off.</h2>
          <p className="mt-2 text-lg">Each team picks one dancer. Their names and a squishy show up together, then the dance begins.</p>
          <div className="mt-4 grid gap-4">
            {tiedTeams.map((team) => {
              const chosen = dancers.find((dancer) => dancer.teamKey === team.key)?.name;
              return (
                <fieldset key={team.key} className="rounded-3xl bg-surface p-4 shadow-card">
                  <legend className="px-1 font-display text-2xl">{team.name}</legend>
                  <div className="mt-2 grid gap-2">
                    {team.players.map((player) => (
                      <button
                        key={player}
                        type="button"
                        aria-pressed={chosen === player}
                        className={cn(
                          "min-h-11 rounded-full px-4 text-left font-bold",
                          chosen === player ? "bg-ink text-cream" : "bg-cream text-ink",
                        )}
                        onClick={() => selectDancer(team.key, player)}
                      >
                        {player}
                      </button>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </section>
      ) : null}
      {phase === "dance" ? (
        <DanceStage dancers={dancers} teams={roster} seconds={danceLeft} />
      ) : null}
      {phase === "dance-judge" ? (
        <section className="mt-6">
          <h2 className="font-display text-4xl">Who won the dance off?</h2>
          <p className="mt-2 text-lg">Pick the winning dancer.</p>
          <div className="mt-4 grid gap-2">
            {dancers.map((dancer) => {
              const team = roster.find((item) => item.key === dancer.teamKey);
              return (
                <Button key={dancer.teamKey} variant="surface" className="justify-start" onClick={() => crownDancer(dancer)}>
                  {dancer.name}
                  {team ? ` · ${team.name}` : ""}
                </Button>
              );
            })}
          </div>
        </section>
      ) : null}
      {phase === "draw-flash" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink" role="status" aria-label="Draw">
          <p className="draw-flash draw-word font-display text-butter">DRAW</p>
        </div>
      ) : null}
      {phase === "celebrate" && celebrate ? (
        <CelebrateScreen celebrate={celebrate} />
      ) : null}
    </main>
  );
}

function AnswerBoard({
  question,
  picked,
  onChoose,
}: {
  question: QuizQuestion;
  picked: string | null;
  onChoose: (choice: string) => void;
}) {
  const image = questionImage(question);
  return (
    <div className="mt-3 rounded-3xl bg-surface p-3 shadow-card">
      <h2 className="font-display text-2xl leading-tight">{question.prompt}</h2>
      <div className={cn("mt-3 grid items-stretch gap-2", image ? "grid-cols-[minmax(7.5rem,42%)_minmax(0,1fr)]" : "grid-cols-1")}>
        {image ? (
          <div className="relative min-h-32 overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
              <SquishyPhoto item={image} alt={question.prompt} eager />
            </div>
          </div>
        ) : null}
        <div className="grid content-start gap-2">
          {question.choices.map((choice) => {
            const correct = picked != null && choice === question.answer;
            const wrong = picked === choice && choice !== question.answer;
            return (
              <button
                key={choice}
                type="button"
                className={cn(
                  "min-h-11 rounded-2xl px-3 py-2 text-left text-sm font-bold break-words shadow-card sm:text-base",
                  correct ? "bg-mint text-ink" : wrong ? "bg-blush text-ink" : "bg-cream text-ink",
                )}
                onClick={() => onChoose(choice)}
                disabled={picked != null}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>
      {picked ? (
        <p className="mt-2 font-display text-xl" role="status">
          {picked === question.answer ? "Yes!" : `It was ${question.answer}.`}
        </p>
      ) : null}
    </div>
  );
}

function TurnBanner({
  turn,
  solo,
  teamCount,
  label,
  detail,
  progress,
}: {
  turn: RosterTeam;
  solo: boolean;
  teamCount: number;
  label: string;
  detail: string | null;
  progress: string;
}) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-3xl bg-butter px-3 py-2">
      <TeamFace iconId={turn.iconId} />
      <div className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="truncate font-display text-xl leading-tight">{turn.name}</p>
        {solo || teamCount === 1 || !detail ? null : <p className="truncate text-sm font-bold">{detail}</p>}
      </div>
      <p className="ml-auto shrink-0 text-sm font-bold tabular-nums">{progress}</p>
    </div>
  );
}

function League({
  solo,
  leader,
  ranked,
  onAgain,
  onSetup,
}: {
  solo: boolean;
  leader: RosterTeam;
  ranked: RosterTeam[];
  onAgain: () => void;
  onSetup: () => void;
}) {
  return (
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
          <h2 className="font-display text-4xl">{leader.name} wins!</h2>
          <p className="mt-2 text-lg">{leader.asked} questions. One answer counted for each team.</p>
        </div>
      )}
      {solo ? null : <ScoreList teams={ranked} />}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ink" onClick={onAgain}>
          Play again
        </Button>
        <Button variant="surface" onClick={onSetup}>
          {solo ? "Change name" : "Change teams"}
        </Button>
      </div>
    </section>
  );
}

function ScoreList({ teams }: { teams: RosterTeam[] }) {
  return (
    <ol className="mt-4 grid gap-3">
      {teams.map((team, index) => (
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
  );
}

function CelebrateScreen({ celebrate }: { celebrate: Celebrate }) {
  return (
    <section className="mt-6">
      {celebrate.kind === "playoff" ? (
        <h2 className="font-display text-5xl">{celebrate.teamName} has won!</h2>
      ) : null}
      {celebrate.kind === "dance" ? (
        <h2 className="font-display text-4xl break-words">
          {celebrate.dancer}'s incredible dancing won it for {celebrate.teamName}
        </h2>
      ) : null}
      {celebrate.kind === "draw" ? (
        <div>
          <h2 className="font-display text-4xl break-words">{joinTeams(celebrate.teams.map((team) => team.name))} WIN!</h2>
          <ul className="mt-4 grid gap-3">
            {celebrate.teams.map((team) => (
              <li key={team.key} className="rounded-3xl bg-surface p-4 shadow-card">
                <p className="font-display text-3xl break-words">{team.name}</p>
                <ul className="mt-1">
                  {team.players.map((player) => (
                    <li key={player} className="text-lg font-bold break-words">
                      {player}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-6">
        <Link to="/" search={EMPTY_SEARCH} className="font-bold underline">
          Leave the quiz
        </Link>
      </p>
      <p
        className="congrats-flash fixed inset-x-0 bottom-0 z-30 bg-ink px-4 py-4 text-center font-display text-3xl tracking-wide text-butter sm:text-5xl"
        role="status"
      >
        CONGRATULATIONS!
      </p>
    </section>
  );
}

function rowClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  if (count === 4) return "grid-cols-4";
  return "grid-cols-5";
}

function DanceStage({ dancers, teams, seconds }: { dancers: Dancer[]; teams: RosterTeam[]; seconds: number }) {
  const big = seconds <= 10;

  function card(dancer: Dancer, index: number) {
    const team = teams.find((item) => item.key === dancer.teamKey);
    const squishy = getSquishy(dancer.squishyId);
    return (
      <div
        key={dancer.teamKey}
        className="flex h-full min-h-0 w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-surface px-2 py-2 shadow-card"
      >
        <p className="max-w-full text-center font-display text-sm leading-tight break-words sm:text-2xl">{dancer.name}</p>
        {team ? <p className="max-w-full truncate text-center text-sm font-bold text-muted">{team.name}</p> : null}
        {squishy ? (
          <div className="mt-1 flex w-full min-h-0 flex-1 items-center justify-center">
            <div
              className="squish-dance aspect-square w-full max-h-full max-w-full overflow-hidden rounded-2xl"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <SquishyPhoto item={squishy} alt="" eager />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  let body;
  if (big && dancers.length === 2) {
    body = (
      <div className="grid h-full min-h-0 min-w-0 grid-cols-3 items-stretch gap-2 px-3 pt-16 pb-3">
        {card(dancers[0] as Dancer, 0)}
        <div className="flex items-center justify-center overflow-hidden">
          <p className="dance-count font-display tabular-nums" aria-hidden="true">
            {seconds}
          </p>
        </div>
        {card(dancers[1] as Dancer, 1)}
      </div>
    );
  } else if (big) {
    const mid = Math.ceil(dancers.length / 2);
    const top = dancers.slice(0, mid);
    const bottom = dancers.slice(mid);
    body = (
      <div className="flex h-full flex-col">
        <div className={cn("grid min-h-0 flex-1 gap-2 px-3 pt-16", rowClass(top.length))}>
          {top.map((dancer, index) => card(dancer, index))}
        </div>
        <div className="grid h-2/5 shrink-0 place-items-center overflow-hidden">
          <p className="dance-count dance-count-band font-display tabular-nums" aria-hidden="true">
            {seconds}
          </p>
        </div>
        <div className={cn("grid min-h-0 flex-1 gap-2 px-3 pb-3", rowClass(bottom.length))}>
          {bottom.map((dancer, index) => card(dancer, index + mid))}
        </div>
      </div>
    );
  } else {
    body = (
      <div className={cn("grid h-full min-h-0 min-w-0 gap-2 px-3 pt-16 pb-3", danceGridClass(dancers.length))}>
        {dancers.map((dancer, index) => card(dancer, index))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-cream text-ink">
      <p className="absolute top-3 left-3 z-20 rounded-full bg-butter px-3 py-2 text-sm font-bold">Dance off</p>
      <p
        className="absolute top-3 right-3 z-20 grid size-16 place-items-center rounded-2xl bg-ink font-display text-3xl text-cream tabular-nums"
        aria-label={`${seconds} seconds left`}
      >
        {seconds}
      </p>
      {body}
    </div>
  );
}

function Setup({
  mode,
  soloName,
  soloIcon,
  drafts,
  error,
  quizSize,
  onQuizSize,
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
  quizSize: typeof QUIZ_QUICK | typeof QUIZ_MEGA;
  onQuizSize: (size: typeof QUIZ_QUICK | typeof QUIZ_MEGA) => void;
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
        Pick a quick quiz or a mega quiz. Both use the bank of 100 hall of fame squishies, and the next game asks
        different ones. Play by yourself, or with teams of up to 4. Your team can play against as many as 9 other
        teams, 40 players in all. A team gives one answer together.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-cream-deep p-1" role="group" aria-label="Quiz length">
        <button
          type="button"
          aria-pressed={quizSize === QUIZ_QUICK}
          className={cn("min-h-11 rounded-full font-bold", quizSize === QUIZ_QUICK ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onQuizSize(QUIZ_QUICK)}
        >
          Quick quiz
        </button>
        <button
          type="button"
          aria-pressed={quizSize === QUIZ_MEGA}
          className={cn("min-h-11 rounded-full font-bold", quizSize === QUIZ_MEGA ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onQuizSize(QUIZ_MEGA)}
        >
          Mega quiz
        </button>
      </div>
      <p className="mt-2 text-sm font-bold text-muted">
        {quizSize === QUIZ_MEGA ? "Mega quiz is 25 questions." : "Quick quiz is 10 questions."}
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
          {quizSize === QUIZ_MEGA ? "Start mega quiz" : "Start quick quiz"}
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
