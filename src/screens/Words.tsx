import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect, transliterate, transliteratePhrase } from '../data/alphabet';
import { phrasesUpToGroup } from '../data/phrases';
import { wordsUpToGroup } from '../data/words';
import { speakHy } from '../lib/speech';
import { Progress } from '../lib/store';
import { C, F, R, SHADOW } from '../ui/theme';

/**
 * Bibliothèque de lecture : tous les mots et phrases déjà lisibles avec les
 * lettres apprises. La romanisation est masquée par défaut pour s'entraîner.
 */
export default function Words({
  progress,
  dialect,
}: {
  progress: Progress;
  dialect: Dialect;
}) {
  const maxGroup = Math.max(-1, ...progress.completed);
  const words = wordsUpToGroup(maxGroup);
  const phrases = phrasesUpToGroup(maxGroup);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggle(hy: string, romanized: string) {
    const next = new Set(revealed);
    if (next.has(hy)) next.delete(hy);
    else {
      next.add(hy);
      speakHy(hy, romanized);
    }
    setRevealed(next);
  }

  return (
    <ScrollView contentContainerStyle={st.wrap} showsVerticalScrollIndicator={false}>
      <Text style={st.title}>Mes mots</Text>
      <Text style={st.subtitle}>
        {words.length === 0
          ? 'Termine ta première leçon pour débloquer tes premiers mots !'
          : `${words.length} mots lisibles avec tes lettres. Lis à voix haute, touche pour vérifier.`}
      </Text>
      {words.map((w) => {
        const isOpen = revealed.has(w.hy);
        return (
          <Pressable
            key={w.hy}
            onPress={() => toggle(w.hy, transliterate(w.hy, dialect))}
            style={({ pressed }) => [st.word, pressed && { transform: [{ scale: 0.985 }] }]}
          >
            <Text style={st.wordHy}>
              {w.emoji} {w.hy}
            </Text>
            <Text style={[st.wordAnswer, isOpen && st.wordAnswerOpen]}>
              {isOpen ? `${transliterate(w.hy, dialect)} — ${w.fr}` : '···'}
            </Text>
          </Pressable>
        );
      })}

      {phrases.length > 0 && (
        <>
          <Text style={st.sectionTitle}>Phrases courtes</Text>
          <Text style={st.subtitle}>
            De vrais bouts de phrases, avec le vocabulaire déjà vu ci-dessus.
          </Text>
          {phrases.map((ph) => {
            const isOpen = revealed.has(ph.hy);
            return (
              <Pressable
                key={ph.hy}
                onPress={() => toggle(ph.hy, transliteratePhrase(ph.hy, dialect))}
                style={({ pressed }) => [
                  st.phrase,
                  pressed && { transform: [{ scale: 0.985 }] },
                ]}
              >
                <Text style={st.phraseHy}>{ph.hy}</Text>
                <Text style={[st.wordAnswer, { textAlign: 'left' }, isOpen && st.phraseOpen]}>
                  {isOpen
                    ? `${transliteratePhrase(ph.hy, dialect)} — ${ph.fr}`
                    : 'Touche pour vérifier'}
                </Text>
              </Pressable>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 18, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 28, fontFamily: F.uiX, color: C.ink },
  subtitle: {
    fontSize: 14,
    fontFamily: F.ui,
    color: C.inkSoft,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: F.uiX,
    color: C.ink,
    marginTop: 26,
    marginBottom: 4,
  },
  word: {
    backgroundColor: C.card,
    borderRadius: R.m,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOW,
  },
  wordHy: { fontSize: 23, fontFamily: F.hy, color: C.ink },
  wordAnswer: {
    fontSize: 13,
    fontFamily: F.uiSemi,
    color: C.inkSoft,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  wordAnswerOpen: { color: C.grenat, fontFamily: F.uiBold },
  phrase: {
    backgroundColor: C.tealSoft,
    borderRadius: R.m,
    padding: 16,
    marginBottom: 10,
  },
  phraseHy: { fontSize: 21, fontFamily: F.hy, color: C.ink, marginBottom: 6, lineHeight: 30 },
  phraseOpen: { color: C.teal, fontFamily: F.uiBold },
});
