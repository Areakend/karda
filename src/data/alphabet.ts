// Alphabet arménien — 39 unités d'apprentissage (38 lettres + digramme ՈՒ).
// Chaque lettre porte sa prononciation en arménien oriental (Arménie)
// et occidental (diaspora : France, Liban, Syrie, Turquie…).

export type Dialect = 'east' | 'west';

export interface Pronunciation {
  /** Romanisation "à la française" affichée à l'écran */
  r: string;
  /** Romanisation en début de mot, si différente (ե, ո, և) */
  rInitial?: string;
  /** Explication du son pour un francophone */
  hint: string;
}

export interface Letter {
  id: string;
  /** Majuscule */
  U: string;
  /** Minuscule */
  L: string;
  /** Nom de la lettre en arménien */
  nameHy: string;
  /** Nom romanisé */
  name: string;
  east: Pronunciation;
  west: Pronunciation;
  /** Index du groupe d'apprentissage (0 = premier) */
  group: number;
  /** Astuce mnémotechnique (optionnelle) */
  tip?: string;
}

export const LETTERS: Letter[] = [
  // ——— Groupe 1 : premières lettres, premiers mots ———
  { id: 'a', U: 'Ա', L: 'ա', nameHy: 'այբ', name: 'ayb', group: 0,
    east: { r: 'a', hint: '« a » de papa' },
    west: { r: 'a', hint: '« a » de papa' },
    tip: 'Un « U » avec une petite jambe à droite : c\'est le A.' },
  { id: 'm', U: 'Մ', L: 'մ', nameHy: 'մեն', name: 'men', group: 0,
    east: { r: 'm', hint: '« m » de maman' },
    west: { r: 'm', hint: '« m » de maman' },
    tip: 'Deux vagues, comme un M qui fond.' },
  { id: 'n', U: 'Ն', L: 'ն', nameHy: 'նու', name: 'nou', group: 0,
    east: { r: 'n', hint: '« n » de nuit' },
    west: { r: 'n', hint: '« n » de nuit' },
    tip: 'Comme Մ (m) mais avec une seule vague : une lettre plus « légère ».' },
  { id: 't', U: 'Տ', L: 'տ', nameHy: 'տյուն', name: 'tioun', group: 0,
    east: { r: 't', hint: '« t » de table' },
    west: { r: 'd', hint: '« d » de dos' } },

  // ——— Groupe 2 ———
  { id: 's', U: 'Ս', L: 'ս', nameHy: 'սե', name: 'sé', group: 1,
    east: { r: 's', hint: '« s » de soleil' },
    west: { r: 's', hint: '« s » de soleil' },
    tip: 'Ressemble à un U latin… mais c\'est un S !' },
  { id: 'e', U: 'Ե', L: 'ե', nameHy: 'եչ', name: 'yetch', group: 1,
    east: { r: 'é', rInitial: 'yé', hint: '« é » ; se lit « yé » en début de mot' },
    west: { r: 'é', rInitial: 'yé', hint: '« é » ; se lit « yé » en début de mot' } },
  { id: 'r', U: 'Ր', L: 'ր', nameHy: 'րե', name: 'ré', group: 1,
    east: { r: 'r', hint: '« r » doux, à peine roulé' },
    west: { r: 'r', hint: '« r » doux, à peine roulé' } },
  { id: 'k', U: 'Կ', L: 'կ', nameHy: 'կեն', name: 'ken', group: 1,
    east: { r: 'k', hint: '« k » de kilo' },
    west: { r: 'g', hint: '« g » dur de gare' } },

  // ——— Groupe 3 ———
  { id: 'i', U: 'Ի', L: 'ի', nameHy: 'ինի', name: 'ini', group: 2,
    east: { r: 'i', hint: '« i » de lit' },
    west: { r: 'i', hint: '« i » de lit' } },
  { id: 'l', U: 'Լ', L: 'լ', nameHy: 'լյուն', name: 'lioun', group: 2,
    east: { r: 'l', hint: '« l » de lune' },
    west: { r: 'l', hint: '« l » de lune' },
    tip: 'Un L latin qui penche.' },
  { id: 'h', U: 'Հ', L: 'հ', nameHy: 'հո', name: 'ho', group: 2,
    east: { r: 'h', hint: '« h » aspiré, comme l\'anglais hello' },
    west: { r: 'h', hint: '« h » aspiré, comme l\'anglais hello' } },
  { id: 'vo', U: 'Ո', L: 'ո', nameHy: 'ո', name: 'vo', group: 2,
    east: { r: 'o', rInitial: 'vo', hint: '« o » ; se lit « vo » en début de mot' },
    west: { r: 'o', rInitial: 'vo', hint: '« o » ; se lit « vo » en début de mot' },
    tip: 'Comme un U ouvert. Attention : ne pas confondre avec Ռ (r roulé).' },

  // ——— Groupe 4 ———
  { id: 'ou', U: 'Ու', L: 'ու', nameHy: 'ու', name: 'ou', group: 3,
    east: { r: 'ou', hint: '« ou » de loup — deux lettres (ո + ւ) qui n\'en font qu\'une' },
    west: { r: 'ou', hint: '« ou » de loup — deux lettres (ո + ւ) qui n\'en font qu\'une' } },
  { id: 'v', U: 'Վ', L: 'վ', nameHy: 'վեվ', name: 'vev', group: 3,
    east: { r: 'v', hint: '« v » de vélo' },
    west: { r: 'v', hint: '« v » de vélo' } },
  { id: 'd', U: 'Դ', L: 'դ', nameHy: 'դա', name: 'da', group: 3,
    east: { r: 'd', hint: '« d » de dos' },
    west: { r: 't', hint: '« t » de table' } },
  { id: 'b', U: 'Բ', L: 'բ', nameHy: 'բեն', name: 'ben', group: 3,
    east: { r: 'b', hint: '« b » de bébé' },
    west: { r: 'p', hint: '« p » de papa' } },

  // ——— Groupe 5 ———
  { id: 'g', U: 'Գ', L: 'գ', nameHy: 'գիմ', name: 'gim', group: 4,
    east: { r: 'g', hint: '« g » dur de gare' },
    west: { r: 'k', hint: '« k » de kilo' } },
  { id: 'z', U: 'Զ', L: 'զ', nameHy: 'զա', name: 'za', group: 4,
    east: { r: 'z', hint: '« z » de zèbre' },
    west: { r: 'z', hint: '« z » de zèbre' },
    tip: 'Ressemble à un 2 : Զ comme… Zorro.' },
  { id: 'y', U: 'Յ', L: 'յ', nameHy: 'յի', name: 'yi', group: 4,
    east: { r: 'y', hint: '« y » de yaourt' },
    west: { r: 'y', hint: '« y » de yaourt' } },
  { id: 'sh', U: 'Շ', L: 'շ', nameHy: 'շա', name: 'cha', group: 4,
    east: { r: 'ch', hint: '« ch » de chat' },
    west: { r: 'ch', hint: '« ch » de chat' },
    tip: 'Un 2 à l\'envers. Զ (z) et Շ (ch) sont des miroirs.' },

  // ——— Groupe 6 ———
  { id: 'p', U: 'Պ', L: 'պ', nameHy: 'պե', name: 'pé', group: 5,
    east: { r: 'p', hint: '« p » de papa' },
    west: { r: 'b', hint: '« b » de bébé' } },
  { id: 'kh', U: 'Խ', L: 'խ', nameHy: 'խե', name: 'khé', group: 5,
    east: { r: 'kh', hint: 'comme la jota espagnole ou le « ch » allemand de Bach' },
    west: { r: 'kh', hint: 'comme la jota espagnole ou le « ch » allemand de Bach' } },
  { id: 'th', U: 'Թ', L: 'թ', nameHy: 'թո', name: 'to', group: 5,
    east: { r: 't', hint: '« t » avec un souffle (t aspiré)' },
    west: { r: 't', hint: '« t » avec un souffle (t aspiré)' } },
  { id: 'ts2', U: 'Ց', L: 'ց', nameHy: 'ցո', name: 'tso', group: 5,
    east: { r: 'ts', hint: '« ts » de tsunami, avec un souffle' },
    west: { r: 'ts', hint: '« ts » de tsunami, avec un souffle' } },

  // ——— Groupe 7 ———
  { id: 'gh', U: 'Ղ', L: 'ղ', nameHy: 'ղատ', name: 'ghat', group: 6,
    east: { r: 'gh', hint: 'comme le « r » français de rue !' },
    west: { r: 'gh', hint: 'comme le « r » français de rue !' },
    tip: 'Le son le plus facile pour un Français : c\'est notre « r » !' },
  { id: 'j', U: 'Ջ', L: 'ջ', nameHy: 'ջե', name: 'djé', group: 6,
    east: { r: 'dj', hint: '« dj » de Djibouti' },
    west: { r: 'tch', hint: '« tch » de match' } },
  { id: 'ch2', U: 'Չ', L: 'չ', nameHy: 'չա', name: 'tcha', group: 6,
    east: { r: 'tch', hint: '« tch » de match' },
    west: { r: 'tch', hint: '« tch » de match' } },
  { id: 'rr', U: 'Ռ', L: 'ռ', nameHy: 'ռա', name: 'ra', group: 6,
    east: { r: 'r', hint: '« r » roulé, bien appuyé' },
    west: { r: 'r', hint: '« r » roulé, bien appuyé' },
    tip: 'Comme Ո (o) mais avec une jambe en plus : le R roulé.' },

  // ——— Groupe 8 ———
  { id: 'eh', U: 'Է', L: 'է', nameHy: 'է', name: 'é', group: 7,
    east: { r: 'é', hint: '« é » de été (toujours é, même en début de mot)' },
    west: { r: 'é', hint: '« é » de été (toujours é, même en début de mot)' } },
  { id: 'schwa', U: 'Ը', L: 'ը', nameHy: 'ըթ', name: 'ët', group: 7,
    east: { r: 'e', hint: '« e » muet de le, je' },
    west: { r: 'e', hint: '« e » muet de le, je' } },
  { id: 'zh', U: 'Ժ', L: 'ժ', nameHy: 'ժե', name: 'jé', group: 7,
    east: { r: 'j', hint: '« j » de jour' },
    west: { r: 'j', hint: '« j » de jour' } },
  { id: 'dz', U: 'Ձ', L: 'ձ', nameHy: 'ձա', name: 'dza', group: 7,
    east: { r: 'dz', hint: '« dz » de pizza' },
    west: { r: 'ts', hint: '« ts » de tsé-tsé' } },

  // ——— Groupe 9 ———
  { id: 'ts', U: 'Ծ', L: 'ծ', nameHy: 'ծա', name: 'tsa', group: 8,
    east: { r: 'ts', hint: '« ts » sec de tsé-tsé' },
    west: { r: 'dz', hint: '« dz » de pizza' } },
  { id: 'tch', U: 'Ճ', L: 'ճ', nameHy: 'ճե', name: 'tché', group: 8,
    east: { r: 'tch', hint: '« tch » sec de tchèque' },
    west: { r: 'dj', hint: '« dj » de Djibouti' } },
  { id: 'ph', U: 'Փ', L: 'փ', nameHy: 'փյուր', name: 'piour', group: 8,
    east: { r: 'p', hint: '« p » avec un souffle (p aspiré)' },
    west: { r: 'p', hint: '« p » avec un souffle (p aspiré)' } },
  { id: 'q', U: 'Ք', L: 'ք', nameHy: 'քե', name: 'ké', group: 8,
    east: { r: 'k', hint: '« k » avec un souffle (k aspiré)' },
    west: { r: 'k', hint: '« k » avec un souffle (k aspiré)' } },

  // ——— Groupe 10 ———
  { id: 'o', U: 'Օ', L: 'օ', nameHy: 'օ', name: 'o', group: 9,
    east: { r: 'o', hint: '« o » de rose' },
    west: { r: 'o', hint: '« o » de rose' },
    tip: 'Identique à notre O — facile !' },
  { id: 'f', U: 'Ֆ', L: 'ֆ', nameHy: 'ֆե', name: 'fé', group: 9,
    east: { r: 'f', hint: '« f » de fête' },
    west: { r: 'f', hint: '« f » de fête' } },
  { id: 'yev', U: 'Եվ', L: 'և', nameHy: 'և', name: 'yev', group: 9,
    east: { r: 'év', rInitial: 'yév', hint: 'ligature de ե + ւ ; seul, c\'est le mot « et »' },
    west: { r: 'év', rInitial: 'yév', hint: 'ligature de ե + ւ ; seul, c\'est le mot « et »' } },
];

export const GROUP_COUNT = 10;

export const GROUP_TITLES: string[] = [
  'Les premières lettres',
  'De quoi faire des phrases',
  'Les voyelles s\'installent',
  'Le son « ou » et ses amis',
  'La famille de « hay »',
  'Les souffles',
  'Le « r » français existe !',
  'Les discrètes',
  'Les costaudes',
  'Les dernières venues',
];

export function lettersOfGroup(g: number): Letter[] {
  return LETTERS.filter((l) => l.group === g);
}

// Familles de lettres visuellement proches — utilisées pour forcer des
// questions de confrontation directe ("lequel est le vrai Ռ ?") plutôt que
// des distracteurs purement aléatoires, qui entraînent moins bien l'œil.
const CONFUSABLE_GROUPS: string[][] = [
  ['vo', 'rr'], // Ո / Ռ — quasi identiques, un seul trait de plus
  ['z', 'sh'], // Զ / Շ — images miroir l'une de l'autre
  ['ts2', 'ts', 'dz'], // Ց / Ծ / Ձ — famille "ts/dz" facilement mélangée
];

const CONFUSABLES: Record<string, string[]> = {};
for (const group of CONFUSABLE_GROUPS) {
  for (const id of group) {
    CONFUSABLES[id] = group.filter((other) => other !== id);
  }
}

/** Identifiants des lettres visuellement confondables avec celle-ci */
export function confusablesOf(id: string): string[] {
  return CONFUSABLES[id] ?? [];
}

export function letterById(id: string): Letter {
  const l = LETTERS.find((x) => x.id === id);
  if (!l) throw new Error(`Lettre inconnue : ${id}`);
  return l;
}

/** Prononciation d'une lettre selon le dialecte choisi */
export function pron(l: Letter, dialect: Dialect): Pronunciation {
  return dialect === 'east' ? l.east : l.west;
}

/** Map minuscule -> lettre (ու traité comme digramme dans transliterate) */
const BY_LOWER = new Map<string, Letter>(LETTERS.map((l) => [l.L, l]));

/**
 * Décompose un mot arménien en unités d'apprentissage.
 * Gère le digramme ու et la ligature և.
 */
export function decompose(word: string): Letter[] {
  const w = word.toLowerCase();
  const out: Letter[] = [];
  let i = 0;
  while (i < w.length) {
    if (w[i] === 'ո' && w[i + 1] === 'ւ') {
      out.push(letterById('ou'));
      i += 2;
      continue;
    }
    const l = BY_LOWER.get(w[i]);
    if (l) out.push(l);
    i += 1;
  }
  return out;
}

/** Romanisation "à la française" d'un mot, selon le dialecte */
export function transliterate(word: string, dialect: Dialect): string {
  const parts = decompose(word);
  return parts
    .map((l, idx) => {
      const p = pron(l, dialect);
      return idx === 0 && p.rInitial ? p.rInitial : p.r;
    })
    .join('');
}

/**
 * Romanisation du nom traditionnel de la lettre (այբ, բեն, գիմ…), selon le
 * dialecte. Calculée via transliterate() plutôt que stockée en dur : le nom
 * est lui-même un mot arménien, donc sa prononciation change avec le
 * dialecte exactement comme celle de n'importe quel mot (ex. Կ « կեն » se
 * lit "ken" à l'orientale mais "gen" à l'occidentale, comme le son de la
 * lettre elle-même).
 */
export function letterName(l: Letter, dialect: Dialect): string {
  return transliterate(l.nameHy, dialect);
}

/** Romanisation d'une courte phrase (mots séparés par des espaces) */
export function transliteratePhrase(phrase: string, dialect: Dialect): string {
  return phrase
    .split(' ')
    .map((w) => transliterate(w, dialect))
    .join(' ');
}
