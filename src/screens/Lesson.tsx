import { LinearGradient } from 'expo-linear-gradient';
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
import { Button, ProgressBar } from '../ui/components';
import { C, F, G, R, SHADOW, SHADOW_STRONG } from '../ui/theme';
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
      <View style={[st.wrap, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <LinearGradient colors={G.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.doneBadge}>
          <Text style={st.doneBadgeTxt}>
            {finalScore >= 5 ? '🏆' : finalScore >= 3 ? '🎉' : '💪'}
          </Text>
        </LinearGradient>
        <Text style={st.doneTitle}>Leçon {group + 1} terminée !</Text>
        <Text style={st.doneScore}>{finalScore}/6 bonnes réponses · +50 XP</Text>
        <Text style={st.doneTxt}>
          Les nouvelles lettres vont maintenant apparaître dans tes quiz de
          révision. Répète-les pour les rendre « acquises ».
        </Text>
        <View style={{ marginTop: 28, alignSelf: 'stretch' }}>
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
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={st.wordsIntro}>
            Avec{' '}
            <Text style={{ fontFamily: F.hyBold, color: C.grenat }}>
              {letters.map((l) => l.U).join(' ')}
            </Text>
            , tu peux déjà lire ces mots. Essaie à voix haute, puis touche pour
            vérifier.
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
          <View style={{ marginTop: 18 }}>
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
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={st.newLabel}>
          Nouvelle lettre {idx + 1}/{letters.length}
        </Text>

        <View style={st.letterCard}>
          <LinearGradient
            colors={['#FFF3E4', '#FFE3D2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.letterHalo}
          >
            <Pressable onPress={() => speakHy(letter.U, p.r)}>
              <Text style={st.glyph}>
                {letter.U} {letter.L}
              </Text>
            </Pressable>
          </LinearGradient>
          <Text style={st.name}>
            « {letter.nameHy} » · {letterName(letter, dialect)}
          </Text>
          <LinearGradient
            colors={G.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.soundPill}
          >
            <Text style={st.soundPillTxt}>
              {p.rInitial ? `${p.rInitial} / ${p.r}` : p.r}
            </Text>
          </LinearGradient>
          <Text style={st.hint}>{p.hint}</Text>
          {letter.tip && <Text style={st.tip}>💡 {letter.tip}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button label="🔊 Écouter" kind="soft" onPress={() => speakHy(letter.U, p.r)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="✍️ Tracer" kind="soft" onPress={() => setTracing(true)} />
            </View>
          </View>
        </View>

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
      <Pressable onPress={onQuit} hitSlop={12} style={st.quitBtn}>
        <Text style={st.quit}>✕</Text>
      </Pressable>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={st.topTitle}>{title}</Text>
        <View style={{ marginTop: 7 }}>
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
      style={({ pressed }) => [st.word, pressed && { transform: [{ scale: 0.985 }] }]}
    >
      <Text style={st.wordHy}>
        {emoji} {hy}
      </Text>
      <Text style={[st.wordAnswer, revealed && { color: C.grenat, fontFamily: F.uiBold }]}>
        {revealed ? `${translit} — ${fr}` : 'Touche pour vérifier'}
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
    paddingTop: 58,
    paddingBottom: 12,
  },
  quitBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  quit: { fontSize: 15, color: C.inkSoft, fontFamily: F.uiX },
  topTitle: { fontSize: 13.5, fontFamily: F.uiBold, color: C.inkSoft },
  newLabel: {
    fontSize: 11,
    fontFamily: F.uiX,
    color: C.grenat,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  letterCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: 22,
    alignItems: 'center',
    ...SHADOW,
  },
  letterHalo: {
    alignSelf: 'stretch',
    borderRadius: R.l,
    alignItems: 'center',
    paddingVertical: 22,
  },
  glyph: { fontSize: 88, fontFamily: F.hyBold, color: C.ink, lineHeight: 116 },
  name: { fontSize: 14, fontFamily: F.uiSemi, color: C.inkSoft, marginTop: 14 },
  soundPill: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 26,
    marginTop: 12,
  },
  soundPillTxt: { fontSize: 23, fontFamily: F.uiX, color: C.white },
  hint: {
    fontSize: 15,
    fontFamily: F.ui,
    color: C.ink,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  tip: {
    fontSize: 13,
    fontFamily: F.ui,
    color: C.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  wordsIntro: {
    fontSize: 15,
    fontFamily: F.ui,
    color: C.ink,
    lineHeight: 23,
    marginBottom: 16,
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
  doneBadge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW_STRONG,
  },
  doneBadgeTxt: { fontSize: 52 },
  doneTitle: {
    fontSize: 26,
    fontFamily: F.uiX,
    color: C.ink,
    textAlign: 'center',
    marginTop: 20,
  },
  doneScore: {
    fontSize: 15,
    fontFamily: F.uiBold,
    color: C.grenat,
    textAlign: 'center',
    marginTop: 8,
  },
  doneTxt: {
    fontSize: 14,
    fontFamily: F.ui,
    color: C.inkSoft,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 21,
  },
});
