import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect, transliterate, transliteratePhrase } from '../data/alphabet';
import { BonusLesson as BonusLessonData } from '../data/bonusLessons';
import { makeBonusQuiz, Question } from '../lib/engine';
import { speakHy } from '../lib/speech';
import { Button, ProgressBar } from '../ui/components';
import { Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';
import QuizView from './QuizView';

type Phase = 'read' | 'quiz' | 'done';

export default function BonusLesson({
  lesson,
  dialect,
  onAnswer,
  onComplete,
  onQuit,
}: {
  lesson: BonusLessonData;
  dialect: Dialect;
  onAnswer: (q: Question, correct: boolean) => void;
  onComplete: (score: number, total: number) => void;
  onQuit: () => void;
}) {
  const theme = useTheme();
  const { F, G } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  const [phase, setPhase] = useState<Phase>('read');
  const [finalScore, setFinalScore] = useState(0);

  const N = 8;
  const quiz = useMemo(
    () => (phase === 'quiz' ? makeBonusQuiz(lesson, dialect, N) : []),
    [phase, lesson, dialect]
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
            {finalScore >= Math.ceil(N * 0.8) ? '🏆' : finalScore >= N / 2 ? '🎉' : '💪'}
          </Text>
        </LinearGradient>
        <Text style={st.doneTitle}>{lesson.title} terminée !</Text>
        <Text style={st.doneScore}>
          {finalScore}/{N} bonnes réponses
        </Text>
        <Text style={st.doneTxt}>
          Cette leçon reste disponible pour t'entraîner autant de fois que tu
          veux.
        </Text>
        <View style={{ marginTop: 28, alignSelf: 'stretch' }}>
          <Button label="Continuer" onPress={() => onComplete(finalScore, N)} />
        </View>
      </View>
    );
  }

  // phase === 'read'
  return (
    <View style={st.wrap}>
      <View style={st.top}>
        <Pressable onPress={onQuit} hitSlop={12} style={st.quitBtn}>
          <Text style={st.quit}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={st.topTitle}>
            {lesson.emoji} {lesson.title}
          </Text>
          <View style={{ marginTop: 7 }}>
            <ProgressBar value={0.15} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text style={st.intro}>
          Toutes tes lettres sont acquises — entraîne-toi à lire vite avec{' '}
          {lesson.words.length} mots et {lesson.phrases.length} phrases.
        </Text>

        {lesson.words.map((w) => (
          <RevealItem
            key={w.hy}
            hy={w.hy}
            fr={w.fr}
            emoji={w.emoji}
            translit={transliterate(w.hy, dialect)}
            theme={theme}
          />
        ))}

        {lesson.phrases.length > 0 && (
          <>
            <Text style={st.sectionTitle}>Phrases</Text>
            {lesson.phrases.map((ph) => (
              <RevealItem
                key={ph.hy}
                hy={ph.hy}
                fr={ph.fr}
                translit={transliteratePhrase(ph.hy, dialect)}
                theme={theme}
                phrase
              />
            ))}
          </>
        )}

        <View style={{ marginTop: 18 }}>
          <Button label="Quiz de la leçon !" onPress={() => setPhase('quiz')} />
        </View>
      </ScrollView>
    </View>
  );
}

function RevealItem({
  hy,
  fr,
  emoji,
  translit,
  theme,
  phrase,
}: {
  hy: string;
  fr: string;
  emoji?: string;
  translit: string;
  theme: Theme;
  phrase?: boolean;
}) {
  const st = useMemo(() => makeStyles(theme), [theme]);
  const [revealed, setRevealed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        setRevealed(!revealed);
        if (!revealed) speakHy(hy, translit);
      }}
      style={({ pressed }) => [
        phrase ? st.phraseItem : st.word,
        pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <Text style={phrase ? st.phraseHy : st.wordHy}>
        {emoji ? `${emoji} ` : ''}
        {hy}
      </Text>
      <Text
        style={[
          st.wordAnswer,
          phrase && { textAlign: 'left', marginTop: 6, marginLeft: 0 },
          revealed && { color: theme.C.grenat, fontFamily: theme.F.uiBold },
        ]}
      >
        {revealed ? `${translit} — ${fr}` : 'Touche pour vérifier'}
      </Text>
    </Pressable>
  );
}

function makeStyles({ C, F, R, SHADOW, SHADOW_STRONG }: Theme) {
  return StyleSheet.create({
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
    topTitle: { fontSize: 15, fontFamily: F.uiBold, color: C.inkSoft },
    intro: {
      fontSize: 15,
      fontFamily: F.ui,
      color: C.ink,
      lineHeight: 23,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: F.uiX,
      color: C.ink,
      marginTop: 8,
      marginBottom: 10,
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
    phraseItem: {
      backgroundColor: C.tealSoft,
      borderRadius: R.m,
      padding: 16,
      marginBottom: 10,
    },
    phraseHy: { fontSize: 20, fontFamily: F.hy, color: C.ink, lineHeight: 28 },
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
      fontSize: 24,
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
}
