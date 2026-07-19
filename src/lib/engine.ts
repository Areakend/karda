// Moteur pédagogique : sélection des questions, suggestion de la
// prochaine activité, mise à jour des forces de mémorisation.

import {
  confusablesOf,
  decompose,
  Dialect,
  GROUP_COUNT,
  Letter,
  LETTERS,
  letterById,
  lettersOfGroup,
  pron,
  transliterate,
} from '../data/alphabet';
import { Word, wordsOfGroup, wordsUpToGroup } from '../data/words';
import { Progress } from './store';

export const MASTERY = 3; // force à partir de laquelle une lettre est « acquise »
export const MAX_STRENGTH = 5;

export type Question =
  | { type: 'l2s'; letter: Letter; options: string[]; answer: string }
  | { type: 's2l'; letter: Letter; options: Letter[]; answerId: string; sound: string }
  | { type: 'word'; word: Word; options: string[]; answer: string }
  | { type: 'listen'; word: Word; options: Word[]; answer: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWeighted(letters: Letter[], p: Progress): Letter {
  const weights = letters.map((l) => 6 - (p.strengths[l.id] ?? 0));
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < letters.length; i++) {
    r -= weights[i];
    if (r <= 0) return letters[i];
  }
  return letters[letters.length - 1];
}

/** Lettres des groupes dont la leçon est terminée */
export function learnedLetters(p: Progress): Letter[] {
  return LETTERS.filter((l) => p.completed.includes(l.group));
}

export function acquiredCount(p: Progress): number {
  return LETTERS.filter((l) => (p.strengths[l.id] ?? 0) >= MASTERY).length;
}

/** Premier groupe dont la leçon n'est pas encore faite, ou null si tout est fait */
export function nextLessonGroup(p: Progress): number | null {
  for (let g = 0; g < GROUP_COUNT; g++) {
    if (!p.completed.includes(g)) return g;
  }
  return null;
}

/** Un groupe est accessible si c'est le premier non terminé (ou déjà terminé) */
export function isGroupUnlocked(p: Progress, g: number): boolean {
  if (p.completed.includes(g)) return true;
  return nextLessonGroup(p) === g;
}

export type Suggestion =
  | { kind: 'lesson'; group: number; reason: string }
  | { kind: 'quiz'; reason: string };

/** Prochaine activité conseillée */
export function suggest(p: Progress): Suggestion {
  const next = nextLessonGroup(p);
  const weak = learnedLetters(p).filter((l) => (p.strengths[l.id] ?? 0) < MASTERY);
  if (next === 0) {
    return { kind: 'lesson', group: 0, reason: 'Découvre tes 4 premières lettres !' };
  }
  if (weak.length >= 4) {
    return {
      kind: 'quiz',
      reason: `${weak.length} lettres ont besoin de révision avant d'avancer.`,
    };
  }
  if (next !== null) {
    return {
      kind: 'lesson',
      group: next,
      reason: 'Tes lettres sont solides, passe au groupe suivant !',
    };
  }
  return { kind: 'quiz', reason: 'Tout est débloqué — entretiens ta lecture !' };
}

/**
 * Choisit jusqu'à 3 lettres-distracteurs pour `letter`, en piochant en
 * priorité ses jumelles visuelles (confusablesOf) si elles sont
 * disponibles dans `poolHint` — plutôt qu'un tirage purement aléatoire, qui
 * confronte moins l'œil aux vraies confusions (Ո/Ռ, Զ/Շ…).
 */
function pickDistractorLetters(
  letter: Letter,
  dialect: Dialect,
  poolHint: Letter[]
): Letter[] {
  const sound = pron(letter, dialect).r;
  const filter = (l: Letter) => l.id !== letter.id && pron(l, dialect).r !== sound;
  const confusables = confusablesOf(letter.id)
    .map((id) => letterById(id))
    .filter(filter)
    .filter((l) => poolHint.some((p) => p.id === l.id));
  const candidates = [
    ...shuffle(confusables),
    ...shuffle(poolHint.filter(filter)),
    ...shuffle(LETTERS.filter(filter)),
  ];
  const seen = new Set<string>();
  const distractors: Letter[] = [];
  for (const c of candidates) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      distractors.push(c);
      if (distractors.length === 3) break;
    }
  }
  return distractors;
}

function makeL2S(letter: Letter, dialect: Dialect, poolHint: Letter[]): Question {
  const answer = pron(letter, dialect).r;
  const distractors = pickDistractorLetters(letter, dialect, poolHint).map(
    (l) => pron(l, dialect).r
  );
  return { type: 'l2s', letter, options: shuffle([answer, ...distractors]), answer };
}

function makeS2L(letter: Letter, dialect: Dialect, poolHint: Letter[]): Question {
  const sound = pron(letter, dialect).r;
  const distractors = pickDistractorLetters(letter, dialect, poolHint);
  return {
    type: 's2l',
    letter,
    options: shuffle([letter, ...distractors]),
    answerId: letter.id,
    sound,
  };
}

function makeWordQ(word: Word, dialect: Dialect, pool: Word[]): Question {
  const answer = transliterate(word.hy, dialect);
  const distractors = shuffle(pool.filter((w) => w.hy !== word.hy))
    .map((w) => transliterate(w.hy, dialect))
    .filter((t) => t !== answer)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, 3);
  return { type: 'word', word, options: shuffle([answer, ...distractors]), answer };
}

function makeListenQ(word: Word, pool: Word[]): Question {
  const distractors = shuffle(pool.filter((w) => w.hy !== word.hy)).slice(0, 3);
  return {
    type: 'listen',
    word,
    options: shuffle([word, ...distractors]),
    answer: word.hy,
  };
}

/**
 * Génère un quiz.
 * @param focusGroup si fourni, mini-quiz de fin de leçon centré sur ce groupe
 * @param excludeWordsHy mots à éviter comme question si une alternative existe
 *   (ex. les mots déjà montrés juste avant dans la même leçon)
 */
export function makeQuiz(
  p: Progress,
  dialect: Dialect,
  n: number,
  focusGroup?: number,
  excludeWordsHy?: Set<string>
): Question[] {
  const letters =
    focusGroup !== undefined ? lettersOfGroup(focusGroup) : learnedLetters(p);
  if (letters.length === 0) return [];

  const maxGroup =
    focusGroup !== undefined ? focusGroup : Math.max(-1, ...p.completed);
  const wordPool = wordsUpToGroup(maxGroup); // distracteurs
  // Les mots déjà révélés pendant la leçon sont exclus des questions quand
  // une alternative existe (mots de groupes précédents), pour éviter de
  // simplement redemander ce qui vient d'être affiché avec sa réponse.
  const eligible = excludeWordsHy
    ? wordPool.filter((w) => !excludeWordsHy.has(w.hy))
    : wordPool;
  const words = eligible.length > 0 ? eligible : wordPool;

  const questions: Question[] = [];
  let lastLetterId: string | null = null;
  const usedWords = new Set<string>();

  for (let i = 0; i < n; i++) {
    // Environ 1 question sur 3 porte sur un mot entier (si disponible),
    // moitié en lecture, moitié en écoute.
    const wantWord = words.length > 0 && i % 3 === 2 && wordPool.length >= 4;
    if (wantWord) {
      const remaining = words.filter((w) => !usedWords.has(w.hy));
      const w = shuffle(remaining.length > 0 ? remaining : words)[0];
      usedWords.add(w.hy);
      questions.push(
        Math.random() < 0.5 ? makeWordQ(w, dialect, wordPool) : makeListenQ(w, wordPool)
      );
      continue;
    }
    let letter = pickWeighted(letters, p);
    if (letters.length > 1) {
      let guard = 0;
      while (letter.id === lastLetterId && guard++ < 10) {
        letter = pickWeighted(letters, p);
      }
    }
    lastLetterId = letter.id;
    questions.push(
      Math.random() < 0.5
        ? makeL2S(letter, dialect, letters)
        : makeS2L(letter, dialect, letters)
    );
  }
  return questions;
}

/** Applique le résultat d'une question aux forces de mémorisation */
export function applyResult(p: Progress, q: Question, correct: boolean): Progress {
  const strengths = { ...p.strengths };
  const bump = (id: string, delta: number) => {
    const cur = strengths[id] ?? 0;
    strengths[id] = Math.max(0, Math.min(MAX_STRENGTH, cur + delta));
  };
  if (q.type === 'word' || q.type === 'listen') {
    if (correct) {
      for (const l of new Set(wordLetterIds(q.word.hy))) bump(l, 1);
    }
  } else {
    bump(q.letter.id, correct ? 1 : -1);
  }
  return { ...p, strengths, xp: p.xp + (correct ? 10 : 0) };
}

function wordLetterIds(hy: string): string[] {
  return decompose(hy).map((l) => l.id);
}
