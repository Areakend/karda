import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialect } from '../data/alphabet';

/** Instantané quotidien pour l'écran de statistiques */
export interface DaySnapshot {
  xp: number;
  acquired: number;
}

export interface Progress {
  /** Force de mémorisation par lettre : 0 (inconnue) à 5 (maîtrisée) */
  strengths: Record<string, number>;
  /** Prochaine date de révision (YYYY-MM-DD) par lettre — répétition espacée */
  due: Record<string, string>;
  /** Intervalle courant en jours par lettre (grandit à chaque bonne réponse) */
  interval: Record<string, number>;
  /** Facteur de facilité par lettre (SM-2 simplifié), 1.3 mini */
  ease: Record<string, number>;
  /** Groupes dont la leçon a été terminée */
  completed: number[];
  /** Leçons bonus (mots + phrases, après les 39 lettres) terminées */
  bonusCompleted: number[];
  xp: number;
  streak: number;
  bestStreak: number;
  /** Date (YYYY-MM-DD) de la dernière activité */
  lastActive: string | null;
  /** Compteur cumulé de réponses correctes/incorrectes, pour la précision globale */
  attempts: { correct: number; wrong: number };
  /** Historique quotidien (clé = date YYYY-MM-DD), pour le mini-graphe de stats */
  history: Record<string, DaySnapshot>;
}

export interface Settings {
  dialect: Dialect | null;
  /** Rappel quotidien local (19h) pour entretenir la série */
  dailyReminder: boolean;
  /** Préférence d'apparence : suit le système, ou forcé */
  themeMode: 'system' | 'light' | 'dark';
}

export const EMPTY_SETTINGS: Settings = {
  dialect: null,
  dailyReminder: false,
  themeMode: 'system',
};

export const EMPTY_PROGRESS: Progress = {
  strengths: {},
  due: {},
  interval: {},
  ease: {},
  completed: [],
  bonusCompleted: [],
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  attempts: { correct: 0, wrong: 0 },
  history: {},
};

const K_PROGRESS = 'karda.progress.v1';
const K_SETTINGS = 'karda.settings.v1';

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(K_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...EMPTY_PROGRESS,
        ...parsed,
        attempts: { ...EMPTY_PROGRESS.attempts, ...parsed.attempts },
      };
    }
  } catch {}
  return { ...EMPTY_PROGRESS };
}

export async function saveProgress(p: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(K_PROGRESS, JSON.stringify(p));
  } catch {}
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(K_SETTINGS);
    if (raw) return { ...EMPTY_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...EMPTY_SETTINGS };
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(K_SETTINGS, JSON.stringify(s));
  } catch {}
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function today(): string {
  return isoDate(new Date());
}

/** Met à jour la série de jours consécutifs après une activité */
export function touchStreak(p: Progress): Progress {
  const t = today();
  if (p.lastActive === t) return p;
  const yesterday = isoDate(new Date(Date.now() - 24 * 3600 * 1000));
  const streak = p.lastActive === yesterday ? p.streak + 1 : 1;
  return { ...p, streak, bestStreak: Math.max(p.bestStreak, streak), lastActive: t };
}

/** Enregistre un instantané du jour (XP, lettres acquises) pour l'historique */
export function snapshotToday(p: Progress, acquired: number): Progress {
  const t = today();
  const existing = p.history[t];
  if (existing && existing.xp === p.xp && existing.acquired === acquired) return p;
  return { ...p, history: { ...p.history, [t]: { xp: p.xp, acquired } } };
}
