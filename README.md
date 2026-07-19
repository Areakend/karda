# Karda (Կարդա՛ — « Lis ! »)

Appli mobile pour apprendre à **lire l'arménien**, pensée pour les francophones.

## Fonctionnalités

- **39 unités de lecture** (36 lettres classiques + Օ, Ֆ, le digramme ՈՒ et la ligature և)
- **Deux prononciations** : arménien **occidental** (diaspora) et **oriental** (Arménie), choisies au premier lancement et modifiables dans les réglages. La romanisation de chaque lettre et de chaque mot s'adapte automatiquement.
- **10 leçons** dans un ordre pédagogique : chaque groupe de 4 lettres permet immédiatement de lire de vrais mots (leçon 1 : Ա Մ Ն Տ → մամա, մատ, տատ, նա).
- **Quiz** à feedback immédiat : lettre → son, son → lettre, et lecture de mots entiers.
- **Suivi de progression** : force de mémorisation par lettre (0 à 5, « acquise » à 3), XP, série de jours consécutifs, suggestion automatique de la prochaine activité (nouvelle leçon ou révision selon les lettres faibles).
- **Bibliothèque de mots** : tous les mots lisibles avec les lettres apprises, romanisation masquée pour s'entraîner.
- **Synthèse vocale** (expo-speech, voix `hy-AM` si disponible sur l'appareil).
- Progression sauvegardée en local (AsyncStorage), aucune connexion requise.

## Lancer

```bash
npm install
npx expo start          # scanner le QR code avec Expo Go
npx expo start --web    # version web
```

## Structure

- `src/data/alphabet.ts` — les 39 lettres, prononciations E/O, groupes, translittération automatique
- `src/data/words.ts` — ~80 mots, chacun lisible avec les lettres de son groupe ou avant
- `src/lib/engine.ts` — génération des quiz, suggestion d'activité, forces de mémorisation
- `src/lib/store.ts` — persistance (AsyncStorage) et streak
- `src/screens/` — Onboarding, Accueil, Alphabet, Leçon, Quiz, Mots, Réglages
