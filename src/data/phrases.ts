// Phrases courtes : chaque mot vient si possible du vocabulaire déjà
// enseigné dans words.ts, pour rester dans un univers lexical cohérent.
// Le groupe requis est calculé et vérifié par un script (voir README) plutôt
// que déduit à l'œil, car une seule lettre avancée dans un petit mot de
// liaison (ex. "է") suffit à décaler tout le groupe.

export interface Phrase {
  hy: string;
  fr: string;
  /** Groupe le plus avancé requis pour lire cette phrase */
  group: number;
}

export const PHRASES: Phrase[] = [
  { hy: 'ես լավ եմ', fr: 'je vais bien', group: 3 },
  { hy: 'դու լավ ես', fr: 'tu vas bien', group: 3 },
  { hy: 'ես շատ լավ եմ', fr: 'je vais très bien', group: 4 },
  { hy: 'ես հայ եմ', fr: 'je suis arménien(ne)', group: 4 },
  { hy: 'նա լավ է', fr: 'il / elle va bien', group: 7 },
  { hy: 'ջուրը լավ է', fr: "l'eau est bonne", group: 7 },
  { hy: 'մեծ ծառ', fr: 'un grand arbre', group: 8 },
  { hy: 'փոքր քաղաք', fr: 'une petite ville', group: 8 },
  { hy: 'ես քեզ սիրում եմ', fr: "je t'aime", group: 8 },
  { hy: 'բարև ընկեր', fr: 'salut, ami', group: 9 },
  { hy: 'այսօր լավ օր է', fr: 'aujourd\'hui est un bon jour', group: 9 },

  // Vocabulaire supplémentaire — voir words.ts
  { hy: 'ջուրը ցուրտ է', fr: "l'eau est froide", group: 7 },
  { hy: 'իմ հայրը ուրախ է', fr: 'mon père est content', group: 7 },
  { hy: 'իմ ընկերը ուրախ է', fr: 'mon ami est content', group: 7 },
  { hy: 'ես դպրոց գնում եմ', fr: "je vais à l'école", group: 5 },
  { hy: 'իմ տունը մեծ է', fr: 'ma maison est grande', group: 8 },
  { hy: 'ես գիրք եմ կարդում', fr: 'je lis un livre', group: 8 },
  { hy: 'մենք ընկերներ ենք', fr: 'nous sommes amis', group: 8 },
  { hy: 'մենք հայ ենք', fr: 'nous sommes arméniens', group: 8 },
  { hy: 'մեծ ծով', fr: 'une grande mer', group: 8 },
  { hy: 'գեղեցիկ արև', fr: 'un beau soleil', group: 9 },
  { hy: 'արևը գեղեցիկ է', fr: 'le soleil est beau', group: 9 },
];

export function phrasesUpToGroup(g: number): Phrase[] {
  return PHRASES.filter((p) => p.group <= g);
}
