import { getSquishy, squishies, type Squishy } from "@/lib/catalog";

export type QuizQuestion = {
  id: string;
  prompt: string;
  imageId: string;
  choices: string[];
  answer: string;
};

export const QUESTION_BANK_SIZE = 100;
export const QUIZ_LENGTH = 10;

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(list: T[], rand: () => number): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const swap = next[i] as T;
    next[i] = next[j] as T;
    next[j] = swap;
  }
  return next;
}

function withChoices(answer: string, decoys: string[], rand: () => number): string[] | null {
  const choices = [answer];
  for (const extra of seededShuffle(decoys, rand)) {
    if (!choices.includes(extra)) choices.push(extra);
    if (choices.length === 4) break;
  }
  if (choices.length < 4) return null;
  return seededShuffle(choices, rand);
}

function buildBank(): QuizQuestion[] {
  const rand = mulberry32(0xa11f00d1);
  const hall = squishies
    .filter((item) => item.bestsellerRank != null && item.image)
    .sort((a, b) => (a.bestsellerRank ?? 0) - (b.bestsellerRank ?? 0));
  const extras = seededShuffle(
    squishies.filter((item) => item.image && item.bestsellerRank == null),
    rand,
  );
  const pool = seededShuffle([...hall, ...extras].slice(0, QUESTION_BANK_SIZE), rand);
  const names = squishies.map((item) => item.name);
  const textures = [...new Set(squishies.map((item) => item.texture))];
  const categories = [...new Set(squishies.map((item) => item.category))];
  const colors = [...new Set(squishies.flatMap((item) => item.colors))];
  const questions: QuizQuestion[] = [];

  function add(item: Squishy, kind: string, prompt: string, answer: string, decoys: string[]) {
    const choices = withChoices(answer, decoys, rand);
    if (!choices) return false;
    questions.push({ id: `${kind}:${item.id}`, prompt, imageId: item.id, choices, answer });
    return true;
  }

  for (const [index, item] of pool.entries()) {
    const otherNames = names.filter((name) => name !== item.name);
    const slot = index % 4;
    let added = false;
    if (slot === 1) {
      added = add(
        item,
        "feel",
        `How does the ${item.name} feel?`,
        item.texture,
        textures.filter((texture) => texture !== item.texture),
      );
    } else if (slot === 2) {
      added = add(
        item,
        "shelf",
        `Which shelf is the ${item.name} on?`,
        item.category,
        categories.filter((category) => category !== item.category),
      );
    } else if (slot === 3) {
      const answer = item.colors[0];
      added =
        answer != null &&
        add(
          item,
          "color",
          `Which color is on the ${item.name}?`,
          answer,
          colors.filter((color) => !item.colors.includes(color)),
        );
    }
    if (!added) add(item, "name", "What is this squishy called?", item.name, otherNames);
  }

  return questions;
}

export const questionBank: QuizQuestion[] = buildBank();

if (questionBank.length !== QUESTION_BANK_SIZE) {
  throw new Error(`Quiz bank has ${questionBank.length} questions`);
}

export function questionImage(question: QuizQuestion) {
  return getSquishy(question.imageId);
}

export function shuffleList<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i] as T;
    next[i] = next[j] as T;
    next[j] = swap;
  }
  return next;
}

function freshen(question: QuizQuestion): QuizQuestion {
  return { ...question, choices: shuffleList(question.choices) };
}

export function dealQuiz(avoidIds: string[] = []): QuizQuestion[] {
  const avoid = new Set(avoidIds);
  const fresh = questionBank.filter((question) => !avoid.has(question.id));
  const pool = fresh.length >= QUIZ_LENGTH ? fresh : questionBank;
  return shuffleList(pool).slice(0, QUIZ_LENGTH).map(freshen);
}

export function dealPlayoff(usedIds: string[], count: number): QuizQuestion[] {
  const used = new Set(usedIds);
  const fresh = shuffleList(questionBank.filter((question) => !used.has(question.id)));
  const pool = fresh.length >= count ? fresh : shuffleList(questionBank);
  return pool.slice(0, count).map(freshen);
}
