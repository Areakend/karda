import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialect } from '../data/alphabet';

export interface Progress {
  /** Force de mémorisation par lettre : 0 (inconnue) à 5 (maîtrisée) */
  strengths: Record<string, number>;
  /** Groupes dont la leçon a été terminée */
  completed: number[];
  xp: number;
  streak: number;
  /** Date (YYYY-MM-DD) de la dernière activité */
  lastActive: string | null;
}

export interface Settings {
  dialect: Dialect | null;
  /** Rappel quotidien local (19h) pour entretenir la série */
  dailyReminder: boolean;
}

export const EMPTY_SETTINGS: Settings = {
  dialect: null,
  dailyReminder: false,
};

export const EMPTY_PROGRESS: Progress = {
  strengths: {},
  completed: [],
  xp: 0,
  streak: 0,
  lastActive: null,
};

const K_PROGRESS = 'karda.progress.v1';
const K_SETTINGS = 'karda.settings.v1';

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(K_PROGRESS);
    if (raw) return { ...EMPTY_PROGRESS, ...JSON.parse(raw) };
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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Met à jour la série de jours consécutifs après une activité */
export function touchStreak(p: Progress): Progress {
  const today = isoDate(new Date());
  if (p.lastActive === today) return p;
  const yesterday = isoDate(new Date(Date.now() - 24 * 3600 * 1000));
  const streak = p.lastActive === yesterday ? p.streak + 1 : 1;
  return { ...p, streak, lastActive: today };
}
