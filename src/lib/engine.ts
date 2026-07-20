// Moteur pédagogique : sélection des questions, suggestion de la
// prochaine activité, répétition espacée, mise à jour des forces de
// mémorisation.

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
  transliteratePhrase,
} from '../data/alphabet';
import { BONUS_LESSONS, BonusLesson } from '../data/bonusLessons';
import { Phrase, phrasesUpToGroup } from '../data/phrases';
import { Word, wordsOfGroup, wordsUpToGroup } from '../data/words';
import { isoDate, Progress, today } from './store';

export const MASTERY = 3; // force à partir de laquelle une lettre est « acquise »
export const MAX_STRENGTH = 5;

export type Question =
  | { type: 'l2s'; letter: Letter; options: string[]; answer: string }
  | { type: 's2l'; letter: Letter; options: Letter[]; answerId: string; sound: string }
  | { type: 'word'; word: Word; options: string[]; answer: string }
  | { type: 'listen'; word: Word; options: Word[]; answer: string }
  | { type: 'phrase'; phrase: Phrase; options: string[]; answer: string }
  /** Auto-évaluée : tracer une lettre au doigt n'est pas fiable à noter
   *  automatiquement, donc c'est l'utilisateur qui indique s'il/elle a
   *  réussi une fois la bonne réponse révélée. */
  | { type: 'draw'; letter: Letter; sound: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ——— Répétition espacée (SM-2 simplifié) ———
// Chaque lettre a un intervalle (jours avant la prochaine révision) et un
// facteur de facilité qui grandit avec les succès et rétrécit avec les
// échecs. Une bonne réponse repousse l'échéance ; une erreur la ramène à
// aujourd'hui, pour revoir la lettre dès la session suivante.
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

function scheduleLetter(
  due: Record<string, string>,
  interval: Record<string, number>,
  ease: Record<string, number>,
  id: string,
  correct: boolean
): { due: Record<string, string>; interval: Record<string, number>; ease: Record<string, number> } {
  const e = ease[id] ?? DEFAULT_EASE;
  const iv = interval[id] ?? 0;
  const nextInterval = correct ? (iv === 0 ? 1 : iv === 1 ? 3 : Math.round(iv * e)) : 0;
  const nextEase = correct ? Math.min(MAX_EASE, e + 0.1) : Math.max(MIN_EASE, e - 0.2);
  const dueDate = isoDate(new Date(Date.now() + nextInterval * 24 * 3600 * 1000));
  return {
    due: { ...due, [id]: dueDate },
    interval: { ...interval, [id]: nextInterval },
    ease: { ...ease, [id]: nextEase },
  };
}

/** Une lettre est due si jamais planifiée, ou si son échéance est passée */
function isDue(p: Progress, id: string): boolean {
  const d = p.due[id];
  return !d || d <= today();
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

/**
 * Choisit une lettre à réviser : priorité aux lettres dont l'échéance de
 * répétition espacée est due aujourd'hui (ou jamais planifiée), avec un
 * biais vers les plus faibles parmi elles. S'il n'y en a aucune (tout est
 * à jour), retombe sur la pondération par faiblesse classique parmi
 * toutes les lettres apprises, pour ne jamais produire un quiz vide.
 */
function pickForReview(letters: Letter[], p: Progress): Letter {
  const due = letters.filter((l) => isDue(p, l.id));
  return pickWeighted(due.length > 0 ? due : letters, p);
}

/** Lettres des groupes dont la leçon est terminée */
export function learnedLetters(p: Progress): Letter[] {
  return LETTERS.filter((l) => p.completed.includes(l.group));
}

export function acquiredCount(p: Progress): number {
  return LETTERS.filter((l) => (p.strengths[l.id] ?? 0) >= MASTERY).length;
}

/**
 * XP gagné chaque jour sur les `days` derniers jours, calculé à partir des
 * instantanés cumulés de `history` (report de la dernière valeur connue
 * pour les jours sans activité).
 */
export function dailyXpDeltas(p: Progress, days: number): { date: string; xp: number }[] {
  const dates = Object.keys(p.history).sort();
  const windowStart = isoDate(new Date(Date.now() - (days - 1) * 24 * 3600 * 1000));
  let running = 0;
  for (const d of dates) {
    if (d < windowStart) running = p.history[d].xp;
  }
  const out: { date: string; xp: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDate(new Date(Date.now() - i * 24 * 3600 * 1000));
    const cumulative = p.history[d]?.xp ?? running;
    out.push({ date: d, xp: Math.max(0, cumulative - running) });
    running = cumulative;
  }
  return out;
}

/** Nombre de lettres apprises dont la révision est due aujourd'hui */
export function dueCount(p: Progress): number {
  return learnedLetters(p).filter((l) => isDue(p, l.id)).length;
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

/** Les leçons bonus se débloquent une fois les 39 lettres apprises */
export function bonusUnlocked(p: Progress): boolean {
  return nextLessonGroup(p) === null;
}

/** Première leçon bonus pas encore faite, ou null si tout est fait (ou pas encore débloqué) */
export function nextBonusLesson(p: Progress): number | null {
  if (!bonusUnlocked(p)) return null;
  for (const b of BONUS_LESSONS) {
    if (!p.bonusCompleted.includes(b.id)) return b.id;
  }
  return null;
}

export type Suggestion =
  | { kind: 'lesson'; group: number; reason: string }
  | { kind: 'bonus'; id: number; reason: string }
  | { kind: 'quiz'; reason: string };

/** Prochaine activité conseillée */
export function suggest(p: Progress): Suggestion {
  const next = nextLessonGroup(p);
  const weak = learnedLetters(p).filter((l) => (p.strengths[l.id] ?? 0) < MASTERY);
  const due = dueCount(p);
  if (next === 0) {
    return { kind: 'lesson', group: 0, reason: 'Découvre tes 4 premières lettres !' };
  }
  if (due >= 4) {
    return {
      kind: 'quiz',
      reason: `${due} lettre${due > 1 ? 's' : ''} à réviser aujourd'hui pour ne pas les oublier.`,
    };
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
  const bonus = nextBonusLesson(p);
  if (bonus !== null) {
    const lesson = BONUS_LESSONS[bonus];
    return {
      kind: 'bonus',
      id: bonus,
      reason: `Les 39 lettres sont acquises — ${lesson.title.toLowerCase()} t'attend : plein de mots et de phrases.`,
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

function makeDrawQ(letter: Letter, dialect: Dialect): Question {
  return { type: 'draw', letter, sound: pron(letter, dialect).r };
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

function makePhraseQ(phrase: Phrase, dialect: Dialect, pool: Phrase[]): Question {
  const answer = transliteratePhrase(phrase.hy, dialect);
  const distractors = shuffle(pool.filter((ph) => ph.hy !== phrase.hy))
    .map((ph) => transliteratePhrase(ph.hy, dialect))
    .filter((t) => t !== answer)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, 3);
  return { type: 'phrase', phrase, options: shuffle([answer, ...distractors]), answer };
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
  // Les phrases n'apparaissent que dans le quiz libre (pas le mini-quiz de
  // fin de leçon, centré sur les 4 nouvelles lettres), et seulement de
  // temps en temps — la lecture de phrase est plus exigeante qu'un mot seul.
  const phrasePool = focusGroup === undefined ? phrasesUpToGroup(maxGroup) : [];

  const questions: Question[] = [];
  let lastLetterId: string | null = null;
  const usedWords = new Set<string>();
  const usedPhrases = new Set<string>();

  for (let i = 0; i < n; i++) {
    // Environ 1 question sur 3 porte sur un mot entier (si disponible),
    // moitié en lecture, moitié en écoute.
    const wantWord = words.length > 0 && i % 3 === 2 && wordPool.length >= 4;
    if (wantWord) {
      const wantPhrase = phrasePool.length > 0 && Math.random() < 0.35;
      if (wantPhrase) {
        const remaining = phrasePool.filter((ph) => !usedPhrases.has(ph.hy));
        const ph = shuffle(remaining.length > 0 ? remaining : phrasePool)[0];
        usedPhrases.add(ph.hy);
        questions.push(makePhraseQ(ph, dialect, phrasePool));
        continue;
      }
      const remaining = words.filter((w) => !usedWords.has(w.hy));
      const w = shuffle(remaining.length > 0 ? remaining : words)[0];
      usedWords.add(w.hy);
      questions.push(
        Math.random() < 0.5 ? makeWordQ(w, dialect, wordPool) : makeListenQ(w, wordPool)
      );
      continue;
    }
    let letter = pickForReview(letters, p);
    if (letters.length > 1) {
      let guard = 0;
      while (letter.id === lastLetterId && guard++ < 10) {
        letter = pickForReview(letters, p);
      }
    }
    lastLetterId = letter.id;
    // De temps en temps (~1 question sur 5), on demande de tracer la
    // lettre plutôt que de la reconnaître — un exercice à part, auto-évalué
    // par l'utilisateur (voir QuizView).
    const r = Math.random();
    questions.push(
      r < 0.2
        ? makeDrawQ(letter, dialect)
        : r < 0.6
          ? makeL2S(letter, dialect, letters)
          : makeS2L(letter, dialect, letters)
    );
  }
  return questions;
}

/**
 * Quiz d'une leçon bonus : uniquement des mots et des phrases (les lettres
 * sont déjà toutes maîtrisées), piochés dans le contenu propre à cette
 * leçon — pas de répétition espacée ici, l'objectif est la vitesse et
 * l'aisance de lecture, pas la mémorisation d'un alphabet déjà acquis.
 */
export function makeBonusQuiz(lesson: BonusLesson, dialect: Dialect, n: number): Question[] {
  const { words, phrases } = lesson;
  if (words.length === 0 && phrases.length === 0) return [];

  const questions: Question[] = [];
  const usedWords = new Set<string>();
  const usedPhrases = new Set<string>();

  for (let i = 0; i < n; i++) {
    const wantPhrase = phrases.length > 0 && (words.length === 0 || i % 3 === 2);
    if (wantPhrase) {
      const remaining = phrases.filter((ph) => !usedPhrases.has(ph.hy));
      const ph = shuffle(remaining.length > 0 ? remaining : phrases)[0];
      usedPhrases.add(ph.hy);
      questions.push(makePhraseQ(ph, dialect, phrases));
      continue;
    }
    const remaining = words.filter((w) => !usedWords.has(w.hy));
    const w = shuffle(remaining.length > 0 ? remaining : words)[0];
    usedWords.add(w.hy);
    questions.push(
      Math.random() < 0.5 ? makeWordQ(w, dialect, words) : makeListenQ(w, words)
    );
  }
  return questions;
}

/** Applique le résultat d'une question aux forces de mémorisation et au planning */
export function applyResult(p: Progress, q: Question, correct: boolean): Progress {
  const strengths = { ...p.strengths };
  let due = p.due;
  let interval = p.interval;
  let ease = p.ease;

  const bump = (id: string, isCorrect: boolean) => {
    const cur = strengths[id] ?? 0;
    strengths[id] = Math.max(0, Math.min(MAX_STRENGTH, cur + (isCorrect ? 1 : -1)));
    const sched = scheduleLetter(due, interval, ease, id, isCorrect);
    due = sched.due;
    interval = sched.interval;
    ease = sched.ease;
  };

  if (q.type === 'word' || q.type === 'listen') {
    if (correct) {
      for (const l of new Set(wordLetterIds(q.word.hy))) bump(l, true);
    }
  } else if (q.type === 'phrase') {
    if (correct) {
      const ids = q.phrase.hy.split(' ').flatMap(wordLetterIds);
      for (const l of new Set(ids)) bump(l, true);
    }
  } else {
    bump(q.letter.id, correct);
  }

  const attempts = {
    correct: p.attempts.correct + (correct ? 1 : 0),
    wrong: p.attempts.wrong + (correct ? 0 : 1),
  };

  return {
    ...p,
    strengths,
    due,
    interval,
    ease,
    attempts,
    xp: p.xp + (correct ? 10 : 0),
  };
}

function wordLetterIds(hy: string): string[] {
  return decompose(hy).map((l) => l.id);
}
