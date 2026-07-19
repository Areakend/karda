import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Dialect,
  GROUP_TITLES,
  letterName,
  lettersOfGroup,
  pron,
  transliterate,
} from '../data/alphabet';
import { wordsOfGroup } from '../data/words';
import { makeQuiz, Question } from '../lib/engine';
import { speakHy } from '../lib/speech';
import { Progress } from '../lib/store';
import { Button, Card, ProgressBar } from '../ui/components';
import { C } from '../ui/theme';
import QuizView from './QuizView';
import TraceModal from './TraceModal';

type Phase = 'learn' | 'words' | 'quiz' | 'done';

export default function Lesson({
  group,
  progress,
  dialect,
  onAnswer,
  onComplete,
  onQuit,
}: {
  group: number;
  progress: Progress;
  dialect: Dialect;
  onAnswer: (q: Question, correct: boolean) => void;
  onComplete: (score: number, total: number) => void;
  onQuit: () => void;
}) {
  const letters = useMemo(() => lettersOfGroup(group), [group]);
  const words = useMemo(() => wordsOfGroup(group), [group]);
  const [phase, setPhase] = useState<Phase>('learn');
  const [idx, setIdx] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [tracing, setTracing] = useState(false);

  const quiz = useMemo(
    () =>
      phase === 'quiz'
        ? makeQuiz(progress, dialect, 6, group, new Set(words.map((w) => w.hy)))
        : [],
    [phase, group, dialect] // progress volontairement figé au lancement du quiz
  );

  if (phase === 'quiz') {
    return (
      <QuizView
        questions={quiz}
        dialect={dialect}
        onAnswer={onAnswer}
        onComplete={(score) => {
          setFinalScore(score);
          setPhase('done');
        }}
        onQuit={onQuit}
      />
    );
  }

  if (phase === 'done') {
    return (
      <View style={[st.wrap, { justifyContent: 'center', padding: 24 }]}>
        <Text style={st.doneEmoji}>{finalScore >= 5 ? '🏆' : finalScore >= 3 ? '🎉' : '💪'}</Text>
        <Text style={st.doneTitle}>Leçon {group + 1} terminée !</Text>
        <Text style={st.doneScore}>
          {finalScore}/6 bonnes réponses · +50 XP
        </Text>
        <Text style={st.doneTxt}>
          Les nouvelles lettres vont maintenant apparaître dans tes quiz de
          révision. Répète-les pour les rendre « acquises ».
        </Text>
        <View style={{ marginTop: 24 }}>
          <Button label="Continuer" onPress={() => onComplete(finalScore, 6)} />
        </View>
      </View>
    );
  }

  if (phase === 'words') {
    return (
      <View style={st.wrap}>
        <Header
          title={`Leçon ${group + 1} · À toi de lire !`}
          onQuit={onQuit}
          value={0.9}
        />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={st.wordsIntro}>
            Avec {letters.map((l) => l.U).join(', ')}, tu peux déjà lire ces
            mots. Essaie à voix haute, puis touche un mot pour vérifier.
          </Text>
          {words.map((w) => (
            <RevealWord
              key={w.hy}
              hy={w.hy}
              fr={w.fr}
              emoji={w.emoji}
              translit={transliterate(w.hy, dialect)}
            />
          ))}
          <View style={{ marginTop: 16 }}>
            <Button label="Petit quiz pour valider !" onPress={() => setPhase('quiz')} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // phase === 'learn'
  const letter = letters[idx];
  const p = pron(letter, dialect);
  const isLast = idx === letters.length - 1;

  return (
    <View style={st.wrap}>
      <Header
        title={`Leçon ${group + 1} · ${GROUP_TITLES[group]}`}
        onQuit={onQuit}
        value={(idx + 1) / (letters.length + 2)}
      />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <Text style={st.newLabel}>
          Nouvelle lettre {idx + 1}/{letters.length}
        </Text>
        <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Pressable onPress={() => speakHy(letter.U, p.r)}>
            <Text style={st.glyph}>
              {letter.U} {letter.L}
            </Text>
          </Pressable>
          <Text style={st.name}>
            « {letter.nameHy} » ({letterName(letter, dialect)})
          </Text>
          <View style={st.soundPill}>
            <Text style={st.soundPillTxt}>
              {p.rInitial ? `${p.rInitial} / ${p.r}` : p.r}
            </Text>
          </View>
          <Text style={st.hint}>{p.hint}</Text>
          {letter.tip && <Text style={st.tip}>💡 {letter.tip}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button label="🔊 Écouter" kind="ghost" onPress={() => speakHy(letter.U, p.r)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="✍️ Tracer" kind="ghost" onPress={() => setTracing(true)} />
            </View>
          </View>
        </Card>
        <TraceModal
          letter={tracing ? letter : null}
          dialect={dialect}
          onClose={() => setTracing(false)}
        />
        <View style={st.navRow}>
          {idx > 0 ? (
            <View style={{ flex: 1 }}>
              <Button label="← Précédente" kind="ghost" onPress={() => setIdx(idx - 1)} />
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <View style={{ flex: 1 }}>
            <Button
              label={isLast ? 'Lire des mots !' : 'Suivante →'}
              onPress={() => (isLast ? setPhase('words') : setIdx(idx + 1))}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Header({
  title,
  value,
  onQuit,
}: {
  title: string;
  value: number;
  onQuit: () => void;
}) {
  return (
    <View style={st.top}>
      <Pressable onPress={onQuit} hitSlop={12}>
        <Text style={st.quit}>✕</Text>
      </Pressable>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={st.topTitle}>{title}</Text>
        <View style={{ marginTop: 6 }}>
          <ProgressBar value={value} />
        </View>
      </View>
    </View>
  );
}

function RevealWord({
  hy,
  fr,
  emoji,
  translit,
}: {
  hy: string;
  fr: string;
  emoji?: string;
  translit: string;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        setRevealed(!revealed);
        if (!revealed) speakHy(hy, translit);
      }}
      style={st.word}
    >
      <Text style={st.wordHy}>
        {emoji} {hy}
      </Text>
      <Text style={st.wordAnswer}>
        {revealed ? `${translit} — ${fr}` : 'Touche pour vérifier 👆'}
      </Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 10,
  },
  quit: { fontSize: 20, color: C.textSoft, fontWeight: '700', marginTop: 2 },
  topTitle: { fontSize: 14, fontWeight: '700', color: C.textSoft },
  newLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Poids normal : les polices arméniennes de secours du système n'ont
  // pas toutes une vraie graisse grasse, un poids élevé fait donc
  // synthétiser un faux gras qui déforme les lettres.
  glyph: { fontSize: 84, fontWeight: 'normal', color: C.text },
  name: { fontSize: 15, color: C.textSoft, marginTop: 4 },
  soundPill: {
    backgroundColor: C.primarySoft,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginTop: 14,
  },
  soundPillTxt: { fontSize: 24, fontWeight: '800', color: C.primary },
  hint: {
    fontSize: 15,
    color: C.text,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  tip: {
    fontSize: 13.5,
    color: C.textSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  wordsIntro: { fontSize: 15, color: C.text, lineHeight: 22, marginBottom: 14 },
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
  wordAnswer: { fontSize: 13.5, color: C.textSoft, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  doneEmoji: { fontSize: 64, textAlign: 'center' },
  doneTitle: { fontSize: 26, fontWeight: '800', color: C.text, textAlign: 'center', marginTop: 12 },
  doneScore: { fontSize: 16, fontWeight: '700', color: C.primary, textAlign: 'center', marginTop: 8 },
  doneTxt: { fontSize: 14.5, color: C.textSoft, textAlign: 'center', marginTop: 12, lineHeight: 21 },
});
