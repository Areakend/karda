// Design system « manuscrit moderne » — inspiré des enluminures arméniennes :
// papier chaud (ou nuit d'encre), dégradés abricot → grenade (le fruit et
// la pierre d'Arménie), serif arménien véritable pour les glyphes.

export interface Colors {
  bg: string;
  bgDeep: string;
  card: string;
  ink: string;
  inkSoft: string;
  line: string;
  apricot: string;
  coral: string;
  grenat: string;
  grenatDeep: string;
  gold: string;
  teal: string;
  apricotSoft: string;
  grenatSoft: string;
  tealSoft: string;
  goldSoft: string;
  success: string;
  successSoft: string;
  error: string;
  errorSoft: string;
  locked: string;
  white: string;
}

const LIGHT_COLORS: Colors = {
  bg: '#FBF5EC', // papier chaud
  bgDeep: '#F3EADC', // papier ombré (canvases, tuiles verrouillées)
  card: '#FFFFFF',
  ink: '#2B1B2E', // prune encre
  inkSoft: '#95818F', // lilas gris
  line: '#F0E4D6', // filets
  apricot: '#FF9E5E',
  coral: '#F2634E',
  grenat: '#D64550',
  grenatDeep: '#A93054',
  gold: '#E9B44C',
  teal: '#2F7E79',
  apricotSoft: '#FFEFDF',
  grenatSoft: '#FBE4E4',
  tealSoft: '#E1F0EC',
  goldSoft: '#FBF0D8',
  success: '#3E9A6B',
  successSoft: '#E1F3E8',
  error: '#D64550',
  errorSoft: '#FBE4E4',
  locked: '#D8CCBD',
  white: '#FFFFFF',
};

const DARK_COLORS: Colors = {
  bg: '#17101B', // nuit d'encre, plus profonde pour mieux détacher les cartes
  bgDeep: '#0F0A12',
  card: '#332739', // net cran au-dessus du fond, contrairement à l'ancienne version trop proche
  ink: '#FBF4EE', // papier à la bougie, plus clair pour une meilleure lisibilité
  inkSoft: '#C9B9C6',
  line: '#4E3C55',
  apricot: '#FFB27A',
  coral: '#FF8B70',
  grenat: '#FF7690',
  grenatDeep: '#FFD9E1',
  gold: '#F3C871',
  teal: '#5FDAC9',
  apricotSoft: '#432E22',
  grenatSoft: '#472731',
  tealSoft: '#193B36',
  goldSoft: '#413419',
  success: '#74D69C',
  successSoft: '#20392C',
  error: '#FF8A8A',
  errorSoft: '#432525',
  locked: '#5A4A60',
  white: '#FFFFFF',
};

/** Dégradés signature (LinearGradient colors) — identiques dans les deux modes */
export const G = {
  primary: ['#FF9E5E', '#F2634E'] as const, // abricot → corail (boutons)
  hero: ['#FF9E5E', '#E2445E', '#C13154'] as const, // lever de soleil → grenade
  ring: ['#FFD9A0', '#FF9E5E'] as const,
};

/** Familles de polices (jamais combiner avec fontWeight : graisse = famille) */
export const F = {
  /** Arménien (et chiffres décoratifs) — serif Noto */
  hy: 'NotoSerifArmenian_500Medium',
  hyBold: 'NotoSerifArmenian_700Bold',
  /** Interface — Manrope */
  ui: 'Manrope_500Medium',
  uiSemi: 'Manrope_600SemiBold',
  uiBold: 'Manrope_700Bold',
  uiX: 'Manrope_800ExtraBold',
};

/** Rayons */
export const R = {
  s: 12,
  m: 18,
  l: 24,
  xl: 28,
};

export interface ShadowStyle {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

const LIGHT_SHADOW: ShadowStyle = {
  shadowColor: '#3B2418',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};
const LIGHT_SHADOW_STRONG: ShadowStyle = {
  shadowColor: '#3B2418',
  shadowOpacity: 0.16,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};
const DARK_SHADOW: ShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.35,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};
const DARK_SHADOW_STRONG: ShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.5,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

export interface Theme {
  mode: 'light' | 'dark';
  C: Colors;
  G: typeof G;
  F: typeof F;
  R: typeof R;
  SHADOW: ShadowStyle;
  SHADOW_STRONG: ShadowStyle;
}

export const LIGHT: Theme = {
  mode: 'light',
  C: LIGHT_COLORS,
  G,
  F,
  R,
  SHADOW: LIGHT_SHADOW,
  SHADOW_STRONG: LIGHT_SHADOW_STRONG,
};

export const DARK: Theme = {
  mode: 'dark',
  C: DARK_COLORS,
  G,
  F,
  R,
  SHADOW: DARK_SHADOW,
  SHADOW_STRONG: DARK_SHADOW_STRONG,
};
