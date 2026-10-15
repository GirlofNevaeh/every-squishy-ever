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
import { useI18n } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages";
import { labelCategory, labelColor, labelTexture } from "@/lib/i18n/text";
import type { Lang } from "@/lib/i18n/languages";
import { gateMeta } from "@/lib/access/public-head";

export const Route = createFileRoute("/play")({
  head: () =>
    gateMeta(
      "Play Squishy Quiz · Every Squishy Ever",
      "A quick 10-question quiz or a 25-question mega quiz, for one player or up to 10 teams of 4.",
    ),
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

function validateRoster(
  source: Draft[],
  asSolo: boolean,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
) {
  if (asSolo) {
    const person = source[0];
    if (!person?.name) return t("err.name");
    if (!person.iconId) return t("err.icon");
    return "";
  }
  if (source.length < 1 || source.length > MAX_TEAMS) return t("err.teams");
  if (source.some((team) => !team.name)) return t("err.teamName");
  const teamNames = source.map((team) => team.name.toLowerCase());
  if (new Set(teamNames).size !== teamNames.length) return t("err.teamNames");
  if (source.some((team) => !team.iconId)) return t("err.teamIcon");
  const icons = source.map((team) => team.iconId);
  if (new Set(icons).size !== icons.length) return t("err.ownIcon");
  let playerCount = 0;
  for (const team of source) {
    if (team.players.length < 1 || team.players.length > MAX_PLAYERS) {
      return t("err.players");
    }
    const local = team.players.map((player) => player.toLowerCase());
    if (new Set(local).size !== local.length) return t("err.samePlayer", { name: team.name });
    playerCount += local.length;
  }
  if (playerCount > MAX_TEAMS * MAX_PLAYERS) return t("err.tooMany");
  return "";
}

function cheerKey(score: number, asked: number): MessageKey {
  if (asked > 0 && score === asked) return "cheer.perfect";
  if (asked > 0 && score / asked >= 0.7) return "cheer.high";
  if (asked > 0 && score / asked >= 0.5) return "cheer.mid";
  return "cheer.low";
}

function joinTeams(names: string[], and: string) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} ${and} ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} ${and} ${names.at(-1)}`;
}

function questionKind(question: QuizQuestion) {
  return question.id.split(":")[0] ?? "name";
}

function choiceLabel(kind: string, choice: string, lang: Lang) {
  if (kind === "feel") return labelTexture(choice, lang);
  if (kind === "category") return labelCategory(choice, lang);
  if (kind === "color") return labelColor(choice, lang);
  return choice;
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
  const { t } = useI18n();
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
    const problem = validateRoster(source, asSolo, t);
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
          <h1 className="mt-2 max-w-full font-display leading-none whitespace-nowrap text-ink [font-size:clamp(1.35rem,7.4vw,3rem)]">
            {t("play.title")}
          </h1>
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
            label={solo || roster.length === 1 ? t("play.yourTurn") : t("play.teamTurn")}
            detail={solo ? null : t("play.oneAnswer", { players: turn.players.join(", ") })}
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
              {leader && leader.score === 0 ? t("play.tieZero") : t("play.tieTop")}
            </h2>
            <p className="mt-2 text-lg" aria-live="polite">
              {decideLeft > 0
                ? t("play.tied", {
                    names: joinTeams(
                      tiedTeams.map((team) => team.name),
                      t("play.and"),
                    ),
                    zero: leader?.score === 0 ? t("play.zero") : "",
                    seconds: decideLeft,
                  })
                : t("play.timeUp")}
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button variant="ink" className="min-h-14 text-base" onClick={beginPlayoff}>
              {t("play.playoff")}
            </Button>
            <Button variant="butter" className="min-h-14 text-base" onClick={beginDancePick}>
              {t("play.dance")}
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
            label={t("play.playoffLabel")}
            detail={t("play.oneAnswer", { players: playoffTeam.players.join(", ") })}
            progress={t("play.round", { n: playoffRound + 1, total: PLAYOFF_ROUNDS })}
          />
          <AnswerBoard question={playoffQuestion} picked={picked} onChoose={choosePlayoff} />
        </section>
      ) : null}
      {phase === "dance-pick" ? (
        <section className="mt-6">
          <h2 className="font-display text-4xl">{t("play.danceNow")}</h2>
          <p className="mt-2 text-lg">{t("play.dancePick")}</p>
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
          <h2 className="font-display text-4xl">{t("play.whoWon")}</h2>
          <p className="mt-2 text-lg">{t("play.pickDancer")}</p>
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink" role="status" aria-label={t("play.draw")}>
          <p className="draw-flash draw-word font-display text-butter">{t("play.draw")}</p>
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
  const { t, lang } = useI18n();
  const image = questionImage(question);
  const kind = questionKind(question);
  const name = image?.name ?? "";
  const prompt =
    kind === "feel"
      ? t("quiz.feel", { name })
      : kind === "category"
        ? t("quiz.category", { name })
        : kind === "color"
          ? t("quiz.color", { name })
          : t("quiz.name");
  const shown = (choice: string) => choiceLabel(kind, choice, lang);
  return (
    <div className="mt-3 rounded-3xl bg-surface p-3 shadow-card">
      <h2 className="font-display text-2xl leading-tight">{prompt}</h2>
      <div className={cn("mt-3 grid items-stretch gap-2", image ? "grid-cols-[minmax(7.5rem,42%)_minmax(0,1fr)]" : "grid-cols-1")}>
        {image ? (
          <div className="relative min-h-32 overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
              <SquishyPhoto item={image} alt={prompt} eager />
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
                {shown(choice)}
              </button>
            );
          })}
        </div>
      </div>
      {picked ? (
        <p className="mt-2 font-display text-xl" role="status">
          {picked === question.answer ? t("play.yes") : t("play.itWas", { answer: shown(question.answer) })}
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
  const { t } = useI18n();
  return (
    <section className="mt-6">
      {solo ? (
        <div className="rounded-3xl bg-butter p-6">
          <h2 className="font-display text-4xl">
            {t("play.outOf", { score: leader.score, asked: leader.asked })}
          </h2>
          <p className="mt-2 text-lg">
            {t("play.niceWork", { name: leader.name, cheer: t(cheerKey(leader.score, leader.asked)) })}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-butter p-6">
          <h2 className="font-display text-4xl">{t("play.wins", { name: leader.name })}</h2>
          <p className="mt-2 text-lg">{t("play.askedNote", { n: leader.asked })}</p>
        </div>
      )}
      {solo ? null : <ScoreList teams={ranked} />}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ink" onClick={onAgain}>
          {t("play.again")}
        </Button>
        <Button variant="surface" onClick={onSetup}>
          {solo ? t("play.changeName") : t("play.changeTeams")}
        </Button>
      </div>
    </section>
  );
}

function ScoreList({ teams }: { teams: RosterTeam[] }) {
  const { t } = useI18n();
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
              {t("play.rightOut", { score: team.score, asked: team.asked })}
            </p>
          </div>
          <p className="font-display text-4xl tabular-nums">{team.score}</p>
        </li>
      ))}
    </ol>
  );
}

function CelebrateScreen({ celebrate }: { celebrate: Celebrate }) {
  const { t } = useI18n();
  return (
    <section className="mt-6">
      {celebrate.kind === "playoff" ? (
        <h2 className="font-display text-5xl">{t("play.hasWon", { name: celebrate.teamName })}</h2>
      ) : null}
      {celebrate.kind === "dance" ? (
        <h2 className="font-display text-4xl break-words">
          {t("play.danceWin", { dancer: celebrate.dancer, team: celebrate.teamName })}
        </h2>
      ) : null}
      {celebrate.kind === "draw" ? (
        <div>
          <h2 className="font-display text-4xl break-words">
            {t("play.winWord", {
              names: joinTeams(
                celebrate.teams.map((team) => team.name),
                t("play.and"),
              ),
            })}
          </h2>
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
          {t("play.leave")}
        </Link>
      </p>
      <p
        className="congrats-flash fixed inset-x-0 bottom-0 z-30 bg-ink px-4 py-4 text-center font-display text-3xl tracking-wide text-butter sm:text-5xl"
        role="status"
      >
        {t("play.congrats")}
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
  const { t } = useI18n();
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
      <p className="absolute top-3 left-3 z-20 rounded-full bg-butter px-3 py-2 text-sm font-bold">{t("play.dance")}</p>
      <p
        className="absolute top-3 right-3 z-20 grid size-16 place-items-center rounded-2xl bg-ink font-display text-3xl text-cream tabular-nums"
        aria-label={t("play.seconds", { n: seconds })}
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
  const { t } = useI18n();
  const taken = new Set(drafts.map((team) => team.iconId).filter(Boolean));
  const named = drafts.reduce((count, team) => count + team.players.filter((player) => player.trim()).length, 0);
  return (
    <div className="mt-4">
      <p className="text-lg">{t("play.intro")}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-cream-deep p-1" role="group" aria-label={t("play.length")}>
        <button
          type="button"
          aria-pressed={quizSize === QUIZ_QUICK}
          className={cn("min-h-11 rounded-full font-bold", quizSize === QUIZ_QUICK ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onQuizSize(QUIZ_QUICK)}
        >
          {t("play.quick")}
        </button>
        <button
          type="button"
          aria-pressed={quizSize === QUIZ_MEGA}
          className={cn("min-h-11 rounded-full font-bold", quizSize === QUIZ_MEGA ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onQuizSize(QUIZ_MEGA)}
        >
          {t("play.mega")}
        </button>
      </div>
      <p className="mt-2 text-sm font-bold text-muted">
        {quizSize === QUIZ_MEGA ? t("play.megaHelp") : t("play.quickHelp")}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-cream-deep p-1" role="group" aria-label={t("play.who")}>
        <button
          type="button"
          aria-pressed={mode === "solo"}
          className={cn("min-h-11 rounded-full font-bold", mode === "solo" ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onMode("solo")}
        >
          {t("play.solo")}
        </button>
        <button
          type="button"
          aria-pressed={mode === "teams"}
          className={cn("min-h-11 rounded-full font-bold", mode === "teams" ? "bg-ink text-cream" : "text-ink")}
          onClick={() => onMode("teams")}
        >
          {t("play.teams")}
        </button>
      </div>
      {mode === "solo" ? (
        <section className="mt-4 rounded-3xl bg-surface p-4 shadow-card" aria-labelledby="solo-name-label">
          <h2 id="solo-name-label" className="font-display text-2xl">
            {t("play.yourName")}
          </h2>
          <label className="mt-2 block text-sm font-bold" htmlFor="solo-name">
            {t("play.callYou")}
          </label>
          <input
            id="solo-name"
            value={soloName}
            maxLength={24}
            onChange={(event) => onSoloName(event.target.value)}
            placeholder="Nancy"
            className="mt-1 min-h-11 w-full rounded-full bg-cream px-4 text-ink shadow-card"
          />
          <p className="mt-3 text-sm font-bold" id="solo-icon">
            {t("play.yourSquishy")}
          </p>
          <IconPicker selectedId={soloIcon} taken={new Set()} labelId="solo-icon" onPick={onSoloIcon} />
        </section>
      ) : (
        <div className="mt-4 grid gap-4">
          <p className="text-sm font-bold">
            {t("play.teamCount", {
              teams: drafts.length,
              maxTeams: MAX_TEAMS,
              players: named,
              maxPlayers: MAX_TEAMS * MAX_PLAYERS,
            })}
          </p>
          {drafts.map((team, index) => (
            <section key={team.key} className="rounded-3xl bg-surface p-4 shadow-card" aria-labelledby={`team-name-label-${team.key}`}>
              <h2 id={`team-name-label-${team.key}`} className="font-display text-2xl">
                {t("play.team", { n: index + 1 })}
              </h2>
              <label className="mt-2 block text-sm font-bold" htmlFor={`team-name-${team.key}`}>
                {t("play.teamName")}
              </label>
              <input
                id={`team-name-${team.key}`}
                value={team.name}
                maxLength={24}
                onChange={(event) => onChange(team.key, { name: event.target.value })}
                placeholder="Lemon Lions"
                className="mt-1 min-h-11 w-full rounded-full bg-cream px-4 text-ink shadow-card"
              />
              <p className="mt-3 text-sm font-bold">{t("play.players")}</p>
              <p className="text-sm text-muted">{t("play.playersHelp")}</p>
              <div className="mt-2 grid gap-2">
                {team.players.map((player, playerIndex) => (
                  <div key={`${team.key}-${playerIndex}`} className="flex gap-2">
                    <input
                      value={player}
                      maxLength={24}
                      aria-label={t("play.playerAria", { player: playerIndex + 1, team: index + 1 })}
                      onChange={(event) => onPlayer(team.key, playerIndex, event.target.value)}
                      placeholder={playerIndex === 0 ? "Nancy" : t("play.another")}
                      className="min-h-11 min-w-0 flex-1 rounded-full bg-cream px-4 text-ink shadow-card"
                    />
                    {team.players.length > 1 ? (
                      <button
                        type="button"
                        className="min-h-11 shrink-0 rounded-full px-3 font-bold"
                        onClick={() => onRemovePlayer(team.key, playerIndex)}
                      >
                        {t("play.remove")}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {team.players.length < MAX_PLAYERS ? (
                <button type="button" className="mt-2 min-h-11 font-bold" onClick={() => onAddPlayer(team.key)}>
                  {t("play.addPlayer")}
                </button>
              ) : null}
              <p className="mt-3 text-sm font-bold" id={`team-icon-${team.key}`}>
                {t("play.icon")}
              </p>
              <IconPicker
                selectedId={team.iconId}
                taken={taken}
                labelId={`team-icon-${team.key}`}
                onPick={(id) => onChange(team.key, { iconId: id })}
              />
              {drafts.length > 1 ? (
                <button type="button" className="mt-3 min-h-11 font-bold" onClick={() => onRemove(team.key)}>
                  {t("play.removeTeam")}
                </button>
              ) : null}
            </section>
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
            {t("play.addTeam")}
          </Button>
        ) : null}
        <Button variant="ink" onClick={onStart}>
          {quizSize === QUIZ_MEGA ? t("play.startMega") : t("play.startQuick")}
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
  const { t } = useI18n();
  const picked = ICONS.find((icon) => icon.id === selectedId);
  return (
    <div>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-labelledby={labelId}>
        {ICONS.map((icon) => {
          const selected = selectedId === icon.id;
          const used = taken.has(icon.id) && !selected;
          return (
            <label
              key={icon.id}
              className={cn("relative block", used && "opacity-35")}
              onClick={() => {
                if (!used) onPick(icon.id);
              }}
            >
              <input
                type="radio"
                name={labelId}
                value={icon.id}
                checked={selected}
                disabled={used}
                aria-label={used ? t("play.taken", { name: icon.name }) : icon.name}
                onChange={() => {
                  if (!used) onPick(icon.id);
                }}
                className="absolute inset-0 z-20 m-0 h-full w-full cursor-pointer appearance-none opacity-[0.02]"
              />
              <span
                className={cn(
                  "relative block aspect-square min-h-16 overflow-hidden rounded-2xl border-4",
                  selected ? "border-ink bg-butter" : "border-transparent bg-cream-deep shadow-card",
                )}
              >
                <span className="pointer-events-none absolute inset-0">
                  <SquishyPhoto item={icon} alt="" />
                </span>
              </span>
              <span className="mt-1 block text-center text-xs leading-tight font-bold">{icon.name}</span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-bold" aria-live="polite">
        {picked ? t("play.picked", { name: picked.name }) : t("play.tap")}
      </p>
    </div>
  );
}

function ScoreStrip({ teams, activeKey }: { teams: RosterTeam[]; activeKey: number }) {
  const { t } = useI18n();
  return (
    <ul className="flex gap-2 overflow-x-auto" aria-label={t("play.scores")}>
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
