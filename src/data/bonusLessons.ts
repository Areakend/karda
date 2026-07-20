// Leçons bonus : débloquées une fois les 39 lettres apprises (les 10
// leçons terminées). Pas de nouvelle lettre ici — juste beaucoup de mots
// et de phrases complètes à lire, pour gagner en vitesse et en aisance.

import { Phrase, PHRASES } from './phrases';
import { Word, WORDS } from './words';

export interface BonusLesson {
  id: number;
  title: string;
  emoji: string;
  words: Word[];
  phrases: Phrase[];
}

function chunk<T>(arr: T[], parts: number): T[][] {
  const size = Math.ceil(arr.length / parts);
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const BONUS_COUNT = 4;
const TITLES = ['Leçon bonus 1', 'Leçon bonus 2', 'Leçon bonus 3', 'Leçon bonus 4'];
const EMOJIS = ['📗', '📘', '📙', '📕'];

const wordChunks = chunk(WORDS, BONUS_COUNT);
const phraseChunks = chunk(PHRASES, BONUS_COUNT);

export const BONUS_LESSONS: BonusLesson[] = wordChunks.map((words, i) => ({
  id: i,
  title: TITLES[i] ?? `Leçon bonus ${i + 1}`,
  emoji: EMOJIS[i] ?? '⭐',
  words,
  phrases: phraseChunks[i] ?? [],
}));

export function bonusLessonById(id: number): BonusLesson | undefined {
  return BONUS_LESSONS.find((b) => b.id === id);
}
