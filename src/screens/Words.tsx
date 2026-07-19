import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect, transliterate, transliteratePhrase } from '../data/alphabet';
import { phrasesUpToGroup } from '../data/phrases';
import { wordsUpToGroup } from '../data/words';
import { speakHy } from '../lib/speech';
import { Progress } from '../lib/store';
import { C } from '../ui/theme';

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
    <ScrollView contentContainerStyle={st.wrap}>
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
            style={st.word}
          >
            <Text style={st.wordHy}>
              {w.emoji} {w.hy}
            </Text>
            <Text style={[st.wordAnswer, isOpen && { color: C.primary, fontWeight: '700' }]}>
              {isOpen ? `${transliterate(w.hy, dialect)} — ${w.fr}` : '···'}
            </Text>
          </Pressable>
        );
      })}

      {phrases.length > 0 && (
        <>
          <Text style={st.sectionTitle}>Phrases courtes</Text>
          <Text style={st.subtitle}>
            Des vrais bouts de phrases, avec le vocabulaire déjà vu ci-dessus.
          </Text>
          {phrases.map((ph) => {
            const isOpen = revealed.has(ph.hy);
            return (
              <Pressable
                key={ph.hy}
                onPress={() => toggle(ph.hy, transliteratePhrase(ph.hy, dialect))}
                style={st.phrase}
              >
                <Text style={st.phraseHy}>{ph.hy}</Text>
                <Text style={[st.wordAnswer, isOpen && { color: C.primary, fontWeight: '700' }]}>
                  {isOpen ? `${transliteratePhrase(ph.hy, dialect)} — ${ph.fr}` : 'Touche pour vérifier 👆'}
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
  wrap: { padding: 18, paddingTop: 54, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.textSoft, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginTop: 20,
    marginBottom: 4,
  },
  word: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordHy: { fontSize: 24, fontWeight: 'normal', color: C.text },
  wordAnswer: {
    fontSize: 13.5,
    color: C.textSoft,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  phrase: {
    backgroundColor: C.blueSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  phraseHy: { fontSize: 22, fontWeight: 'normal', color: C.text, marginBottom: 6 },
});
