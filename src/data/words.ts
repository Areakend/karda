// Mots de lecture : chaque mot n'utilise que des lettres du groupe indiqué
// ou des groupes précédents. La romanisation est calculée automatiquement
// (voir transliterate dans alphabet.ts).

export interface Word {
  hy: string;
  fr: string;
  /** Groupe le plus avancé requis pour lire ce mot */
  group: number;
  emoji?: string;
}

export const WORDS: Word[] = [
  // Groupe 1 : Ա Մ Ն Տ
  { hy: 'մամա', fr: 'maman', group: 0, emoji: '👩' },
  { hy: 'մատ', fr: 'doigt', group: 0, emoji: '☝️' },
  { hy: 'տատ', fr: 'mamie', group: 0, emoji: '👵' },
  { hy: 'նա', fr: 'il / elle', group: 0, emoji: '🧍' },

  // Groupe 2 : + Ս Ե Ր Կ
  { hy: 'ես', fr: 'je / moi', group: 1, emoji: '🙋' },
  { hy: 'սար', fr: 'montagne', group: 1, emoji: '🏔️' },
  { hy: 'սեր', fr: 'amour', group: 1, emoji: '❤️' },
  { hy: 'մեկ', fr: 'un (1)', group: 1, emoji: '1️⃣' },
  { hy: 'երեկ', fr: 'hier', group: 1, emoji: '🌆' },
  { hy: 'կես', fr: 'moitié', group: 1, emoji: '➗' },
  { hy: 'տես', fr: 'regarde !', group: 1, emoji: '👀' },
  { hy: 'նկար', fr: 'image, dessin', group: 1, emoji: '🖼️' },
  { hy: 'կատակ', fr: 'blague', group: 1, emoji: '😄' },

  // Groupe 3 : + Ի Լ Հ Ո
  { hy: 'հիմա', fr: 'maintenant', group: 2, emoji: '⏰' },
  { hy: 'իմ', fr: 'mon / ma', group: 2, emoji: '🫶' },
  { hy: 'ամիս', fr: 'mois', group: 2, emoji: '📅' },
  { hy: 'ոսկի', fr: 'or', group: 2, emoji: '🥇' },
  { hy: 'հին', fr: 'vieux, ancien', group: 2, emoji: '🏛️' },
  { hy: 'լիմոն', fr: 'citron', group: 2, emoji: '🍋' },
  { hy: 'սիրել', fr: 'aimer', group: 2, emoji: '💕' },
  { hy: 'կին', fr: 'femme', group: 2, emoji: '👩‍🦱' },
  { hy: 'տարի', fr: 'année', group: 2, emoji: '🎊' },

  // Groupe 4 : + ՈՒ Վ Դ Բ
  { hy: 'դու', fr: 'tu / toi', group: 3, emoji: '👉' },
  { hy: 'լավ', fr: 'bien', group: 3, emoji: '👍' },
  { hy: 'վատ', fr: 'mauvais', group: 3, emoji: '👎' },
  { hy: 'դաս', fr: 'leçon', group: 3, emoji: '📚' },
  { hy: 'վարդ', fr: 'rose (fleur)', group: 3, emoji: '🌹' },
  { hy: 'ուտել', fr: 'manger', group: 3, emoji: '🍽️' },
  { hy: 'բարի', fr: 'bon, gentil', group: 3, emoji: '😊' },
  { hy: 'անուն', fr: 'prénom', group: 3, emoji: '📛' },
  { hy: 'երկու', fr: 'deux (2)', group: 3, emoji: '2️⃣' },
  { hy: 'բերան', fr: 'bouche', group: 3, emoji: '👄' },

  // Groupe 5 : + Գ Զ Յ Շ
  { hy: 'մայր', fr: 'mère', group: 4, emoji: '👩‍👧' },
  { hy: 'հայ', fr: 'arménien(ne)', group: 4, emoji: '🇦🇲' },
  { hy: 'Հայաստան', fr: 'Arménie', group: 4, emoji: '🇦🇲' },
  { hy: 'շուն', fr: 'chien', group: 4, emoji: '🐕' },
  { hy: 'գիշեր', fr: 'nuit', group: 4, emoji: '🌙' },
  { hy: 'շատ', fr: 'très, beaucoup', group: 4, emoji: '💯' },
  { hy: 'գարուն', fr: 'printemps', group: 4, emoji: '🌸' },
  { hy: 'զանգ', fr: 'sonnerie, cloche', group: 4, emoji: '🔔' },
  { hy: 'գետ', fr: 'rivière', group: 4, emoji: '🏞️' },
  { hy: 'այո', fr: 'oui', group: 4, emoji: '✅' },
  { hy: 'զատիկ', fr: 'coccinelle', group: 4, emoji: '🐞' },

  // Groupe 6 : + Պ Խ Թ Ց
  { hy: 'պապիկ', fr: 'papi', group: 5, emoji: '👴' },
  { hy: 'հաց', fr: 'pain', group: 5, emoji: '🍞' },
  { hy: 'թեյ', fr: 'thé', group: 5, emoji: '🍵' },
  { hy: 'խոտ', fr: 'herbe', group: 5, emoji: '🌿' },
  { hy: 'ցուրտ', fr: 'froid', group: 5, emoji: '🥶' },
  { hy: 'թիվ', fr: 'nombre', group: 5, emoji: '🔢' },
  { hy: 'պատ', fr: 'mur', group: 5, emoji: '🧱' },
  { hy: 'ցերեկ', fr: 'journée', group: 5, emoji: '☀️' },
  { hy: 'թատրոն', fr: 'théâtre', group: 5, emoji: '🎭' },

  // Groupe 7 : + Ղ Ջ Չ Ռ
  { hy: 'ջուր', fr: 'eau', group: 6, emoji: '💧' },
  { hy: 'աղ', fr: 'sel', group: 6, emoji: '🧂' },
  { hy: 'ինչ', fr: 'quoi ?', group: 6, emoji: '❓' },
  { hy: 'ոչ', fr: 'non', group: 6, emoji: '❌' },
  { hy: 'խաղ', fr: 'jeu', group: 6, emoji: '🎲' },
  { hy: 'աղջիկ', fr: 'fille', group: 6, emoji: '👧' },
  { hy: 'ռադիո', fr: 'radio', group: 6, emoji: '📻' },
  { hy: 'չամիչ', fr: 'raisin sec', group: 6, emoji: '🍇' },
  { hy: 'գեղեցիկ', fr: 'beau, belle', group: 6, emoji: '✨' },

  // Groupe 8 : + Է Ը Ժ Ձ
  { hy: 'ժամ', fr: 'heure', group: 7, emoji: '🕐' },
  { hy: 'ձի', fr: 'cheval', group: 7, emoji: '🐴' },
  { hy: 'ձուկ', fr: 'poisson', group: 7, emoji: '🐟' },
  { hy: 'էջ', fr: 'page', group: 7, emoji: '📄' },
  { hy: 'ընկեր', fr: 'ami', group: 7, emoji: '🤝' },
  { hy: 'ձմեռ', fr: 'hiver', group: 7, emoji: '❄️' },
  { hy: 'ժամանակ', fr: 'temps', group: 7, emoji: '⏳' },
  { hy: 'էշ', fr: 'âne', group: 7, emoji: '🫏' },

  // Groupe 9 : + Ծ Ճ Փ Ք
  { hy: 'ծառ', fr: 'arbre', group: 8, emoji: '🌳' },
  { hy: 'քար', fr: 'pierre', group: 8, emoji: '🪨' },
  { hy: 'ճաշ', fr: 'déjeuner, repas', group: 8, emoji: '🍲' },
  { hy: 'փոքր', fr: 'petit', group: 8, emoji: '🤏' },
  { hy: 'մեծ', fr: 'grand', group: 8, emoji: '🐘' },
  { hy: 'աչք', fr: 'œil', group: 8, emoji: '👁️' },
  { hy: 'քաղաք', fr: 'ville', group: 8, emoji: '🏙️' },
  { hy: 'փող', fr: 'argent', group: 8, emoji: '💰' },
  { hy: 'ծիծաղ', fr: 'rire', group: 8, emoji: '😂' },
  { hy: 'ճանապարհ', fr: 'route, chemin', group: 8, emoji: '🛣️' },

  // Groupe 10 : + Օ Ֆ Եվ
  { hy: 'օր', fr: 'jour', group: 9, emoji: '📆' },
  { hy: 'օդ', fr: 'air', group: 9, emoji: '💨' },
  { hy: 'ֆիլմ', fr: 'film', group: 9, emoji: '🎬' },
  { hy: 'ֆուտբոլ', fr: 'football', group: 9, emoji: '⚽' },
  { hy: 'բարև', fr: 'bonjour', group: 9, emoji: '👋' },
  { hy: 'Երևան', fr: 'Erevan (capitale)', group: 9, emoji: '🏛️' },
  { hy: 'և', fr: 'et', group: 9, emoji: '➕' },

  // Vocabulaire supplémentaire — leçons bonus et phrases
  { hy: 'տուն', fr: 'maison', group: 3, emoji: '🏠' },
  { hy: 'հայր', fr: 'père', group: 4, emoji: '👨‍👧' },
  { hy: 'ուրախ', fr: 'content, joyeux', group: 5, emoji: '😄' },
  { hy: 'դպրոց', fr: 'école', group: 5, emoji: '🏫' },
  { hy: 'ծով', fr: 'mer', group: 8, emoji: '🌊' },
  { hy: 'գիրք', fr: 'livre', group: 8, emoji: '📖' },
  { hy: 'մենք', fr: 'nous', group: 8, emoji: '🙌' },
  { hy: 'արև', fr: 'soleil', group: 9, emoji: '☀️' },
];

export function wordsUpToGroup(g: number): Word[] {
  return WORDS.filter((w) => w.group <= g);
}

export function wordsOfGroup(g: number): Word[] {
  return WORDS.filter((w) => w.group === g);
}
