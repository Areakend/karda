// Design system « manuscrit moderne » — inspiré des enluminures arméniennes :
// papier chaud, encre prune, dégradés abricot → grenade (le fruit et la
// pierre d'Arménie), serif arménien véritable pour les glyphes.

export const C = {
  // Fonds
  bg: '#FBF5EC', // papier chaud
  bgDeep: '#F3EADC', // papier ombré (canvases, tuiles verrouillées)
  card: '#FFFFFF',

  // Encres
  ink: '#2B1B2E', // prune encre
  inkSoft: '#95818F', // lilas gris
  line: '#F0E4D6', // filets

  // Identité
  apricot: '#FF9E5E',
  coral: '#F2634E',
  grenat: '#D64550',
  grenatDeep: '#A93054',
  gold: '#E9B44C',
  teal: '#2F7E79',

  // Teintes douces
  apricotSoft: '#FFEFDF',
  grenatSoft: '#FBE4E4',
  tealSoft: '#E1F0EC',
  goldSoft: '#FBF0D8',

  // États
  success: '#3E9A6B',
  successSoft: '#E1F3E8',
  error: '#D64550',
  errorSoft: '#FBE4E4',
  locked: '#D8CCBD',

  white: '#FFFFFF',
};

/** Dégradés signature (LinearGradient colors) */
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

/** Ombre douce standard pour les cartes */
export const SHADOW = {
  shadowColor: '#3B2418',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export const SHADOW_STRONG = {
  shadowColor: '#3B2418',
  shadowOpacity: 0.16,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};
