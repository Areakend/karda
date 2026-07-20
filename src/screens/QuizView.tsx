import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect, pron, transliterate } from '../data/alphabet';
import { Question } from '../lib/engine';
import { playFeedback } from '../lib/feedback';
import { speakHy } from '../lib/speech';
import { Button, ProgressBar } from '../ui/components';
import DrawCanvas, { DrawCanvasHandle } from '../ui/DrawCanvas';
import { Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';

/**
 * Déroule une série de questions avec feedback immédiat.
 * Utilisé par le quiz libre et par le mini-quiz de fin de leçon.
 */
export default function QuizView({
  questions,
  dialect,
  onAnswer,
  onComplete,
  onQuit,
}: {
  questions: Question[];
  dialect: Dialect;
  onAnswer: (q: Question, correct: boolean) => void;
  onComplete: (score: number) => void;
  onQuit: () => void;
}) {
  const theme = useTheme();
  const { C, G } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [drawRevealed, setDrawRevealed] = useState(false);
  const [drawResult, setDrawResult] = useState<boolean | null>(null);
  const canvasRef = useRef<DrawCanvasHandle>(null);

  const q = questions[idx];

  // Le mode écoute joue le mot dès son apparition, sans que l'utilisateur
  // ait besoin de toucher quoi que ce soit.
  useEffect(() => {
    if (q?.type === 'listen') {
      speakHy(q.word.hy, transliterate(q.word.hy, dialect));
    }
  }, [idx]);

  if (!q) return null;

  const isDraw = q.type === 'draw';
  const correctKey = q.type === 's2l' ? q.answerId : q.type === 'draw' ? null : q.answer;

  function keyOf(opt: unknown): string {
    if (q.type === 's2l') return (opt as { id: string }).id;
    if (q.type === 'listen') return (opt as { hy: string }).hy;
    return opt as string;
  }
  function labelOf(opt: unknown): string {
    if (q.type === 's2l') {
      const l = opt as (typeof q.options)[number];
      return `${l.U} ${l.L}`;
    }
    if (q.type === 'listen') {
      return (opt as { hy: string }).hy;
    }
    return opt as string;
  }

  const answered = isDraw ? drawResult !== null : picked !== null;
  const isCorrect = isDraw ? drawResult === true : answered && picked === correctKey;
  const armenianOptions = q.type === 's2l' || q.type === 'listen';

  function pick(key: string) {
    if (answered) return;
    setPicked(key);
    const ok = key === correctKey;
    if (ok) setScore((s) => s + 1);
    playFeedback(ok);
    onAnswer(q, ok);
  }

  function reportDraw(ok: boolean) {
    if (drawResult !== null) return;
    setDrawResult(ok);
    if (ok) setScore((s) => s + 1);
    playFeedback(ok);
    onAnswer(q, ok);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      onComplete(score);
    } else {
      setIdx(idx + 1);
      setPicked(null);
      setDrawRevealed(false);
      setDrawResult(null);
      canvasRef.current?.clear();
    }
  }

  return (
    <View style={st.wrap}>
      <View style={st.top}>
        <Pressable onPress={onQuit} hitSlop={12} style={st.quitBtn}>
          <Text style={st.quit}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <ProgressBar value={idx / questions.length} />
        </View>
        <Text style={st.counter}>
          {idx + 1}/{questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
        {q.type === 'l2s' && (
          <>
            <Text style={st.prompt}>Comment se lit cette lettre ?</Text>
            <Pressable onPress={() => speakHy(q.letter.U, pron(q.letter, dialect).r)}>
              <Text style={st.bigGlyph}>
                {q.letter.U} {q.letter.L}
              </Text>
            </Pressable>
          </>
        )}
        {q.type === 's2l' && (
          <>
            <Text style={st.prompt}>Quelle lettre fait ce son ?</Text>
            <Text style={st.bigSound}>« {q.sound} »</Text>
          </>
        )}
        {q.type === 'word' && (
          <>
            <Text style={st.prompt}>Lis ce mot :</Text>
            <Pressable onPress={() => speakHy(q.word.hy, q.answer)}>
              <Text style={st.bigWord}>{q.word.hy}</Text>
            </Pressable>
          </>
        )}
        {q.type === 'phrase' && (
          <>
            <Text style={st.prompt}>Lis cette phrase :</Text>
            <Pressable onPress={() => speakHy(q.phrase.hy, q.answer)}>
              <Text style={st.bigPhrase}>{q.phrase.hy}</Text>
            </Pressable>
          </>
        )}
        {q.type === 'listen' && (
          <>
            <Text style={st.prompt}>Écoute, puis choisis le bon mot :</Text>
            <Pressable
              onPress={() => speakHy(q.word.hy, transliterate(q.word.hy, dialect))}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <LinearGradient
                colors={G.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={st.listenBtn}
              >
                <Text style={st.listenIcon}>🔊</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}

        {q.type === 'draw' && (
          <>
            <Text style={st.prompt}>Trace la lettre qui fait ce son :</Text>
            <Text style={st.bigSound}>« {q.sound} »</Text>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <DrawCanvas ref={canvasRef} size={220} />
            </View>
            <Text style={st.drawHint}>
              Fais de ton mieux — le tracé au doigt n'est pas évident, ce n'est
              pas noté automatiquement.
            </Text>

            {!drawRevealed ? (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Effacer" kind="ghost" onPress={() => canvasRef.current?.clear()} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="J'ai fini →" onPress={() => setDrawRevealed(true)} />
                </View>
              </View>
            ) : (
              <View style={st.revealBox}>
                <Text style={st.revealLabel}>C'était :</Text>
                <Text style={st.revealGlyph}>
                  {q.letter.U} {q.letter.L}
                </Text>
                {drawResult === null && (
                  <>
                    <Text style={st.revealHint}>
                      Sois indulgent·e avec toi-même : si ton tracé ressemble
                      à ça, compte-le bon.
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, alignSelf: 'stretch' }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          label="Je me suis trompé·e"
                          kind="ghost"
                          onPress={() => reportDraw(false)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button label="J'avais bon ! ✅" onPress={() => reportDraw(true)} />
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
          </>
        )}

        {q.type !== 'draw' && (
          <View style={st.options}>
            {q.options.map((opt) => {
              const key = keyOf(opt);
              const isPicked = picked === key;
              const showCorrect = answered && key === correctKey;
              const showWrong = answered && isPicked && key !== correctKey;
              return (
                <Pressable
                  key={key}
                  onPress={() => pick(key)}
                  style={({ pressed }) => [
                    st.option,
                    showCorrect && st.optionCorrect,
                    showWrong && st.optionWrong,
                    pressed && !answered && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text
                    style={[
                      armenianOptions ? st.optionTxtHy : st.optionTxt,
                      showCorrect && { color: C.success },
                      showWrong && { color: C.error },
                    ]}
                  >
                    {labelOf(opt)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {answered && (
          <View
            style={[
              st.feedback,
              { backgroundColor: isCorrect ? C.successSoft : C.errorSoft },
            ]}
          >
            <Text style={[st.feedbackTitle, { color: isCorrect ? C.success : C.error }]}>
              {isCorrect ? 'Bravo ! 🎉' : 'Pas tout à fait…'}
            </Text>
            {q.type === 'word' && (
              <Text style={st.feedbackTxt}>
                {q.word.emoji} {q.word.hy} = « {q.answer} » — {q.word.fr}
              </Text>
            )}
            {q.type === 'listen' && (
              <Text style={st.feedbackTxt}>
                {q.word.emoji} {q.word.hy} = « {transliterate(q.word.hy, dialect)} » —{' '}
                {q.word.fr}
              </Text>
            )}
            {q.type === 'phrase' && (
              <Text style={st.feedbackTxt}>
                {q.phrase.hy} = « {q.answer} » — {q.phrase.fr}
              </Text>
            )}
            {q.type === 'l2s' && !isCorrect && (
              <Text style={st.feedbackTxt}>
                {q.letter.U} se lit « {q.answer} » — {pron(q.letter, dialect).hint}
              </Text>
            )}
            {q.type === 's2l' && !isCorrect && (
              <Text style={st.feedbackTxt}>
                « {q.sound} » s'écrit {q.letter.U} {q.letter.L}
              </Text>
            )}
            <View style={{ marginTop: 14 }}>
              <Button
                label={idx + 1 >= questions.length ? 'Voir le résultat' : 'Suivant'}
                onPress={next}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles({ C, F, R, SHADOW }: Theme) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingTop: 58,
      paddingBottom: 10,
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
    counter: { fontSize: 12.5, color: C.inkSoft, fontFamily: F.uiX },
    body: { padding: 18, paddingBottom: 48 },
    prompt: {
      fontSize: 15,
      fontFamily: F.uiSemi,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 12,
    },
    bigGlyph: {
      fontSize: 74,
      fontFamily: F.hyBold,
      color: C.ink,
      textAlign: 'center',
      marginVertical: 18,
      lineHeight: 100,
    },
    bigSound: {
      fontSize: 44,
      fontFamily: F.uiX,
      color: C.grenat,
      textAlign: 'center',
      marginVertical: 26,
    },
    bigWord: {
      fontSize: 44,
      fontFamily: F.hy,
      color: C.ink,
      textAlign: 'center',
      marginVertical: 24,
      lineHeight: 62,
    },
    bigPhrase: {
      fontSize: 28,
      fontFamily: F.hy,
      color: C.ink,
      textAlign: 'center',
      marginVertical: 22,
      lineHeight: 40,
      paddingHorizontal: 8,
    },
    listenBtn: {
      alignSelf: 'center',
      borderRadius: 999,
      width: 96,
      height: 96,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 22,
      ...SHADOW,
    },
    listenIcon: { fontSize: 40 },
    drawHint: {
      fontSize: 12,
      fontFamily: F.ui,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 17,
      paddingHorizontal: 12,
    },
    revealBox: {
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: R.m,
      padding: 18,
      marginTop: 14,
      ...SHADOW,
    },
    revealLabel: { fontSize: 12.5, fontFamily: F.uiSemi, color: C.inkSoft },
    revealGlyph: {
      fontSize: 56,
      fontFamily: F.hyBold,
      color: C.ink,
      lineHeight: 74,
      marginTop: 4,
    },
    revealHint: {
      fontSize: 12.5,
      fontFamily: F.ui,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 18,
    },
    options: { gap: 10 },
    option: {
      backgroundColor: C.card,
      borderRadius: R.m,
      borderWidth: 2,
      borderColor: 'transparent',
      paddingVertical: 15,
      alignItems: 'center',
      ...SHADOW,
    },
    optionCorrect: { backgroundColor: C.successSoft, borderColor: C.success },
    optionWrong: { backgroundColor: C.errorSoft, borderColor: C.error },
    optionTxt: { fontSize: 17, fontFamily: F.uiBold, color: C.ink },
    optionTxtHy: { fontSize: 23, fontFamily: F.hy, color: C.ink, lineHeight: 32 },
    feedback: { borderRadius: R.m, padding: 18, marginTop: 18 },
    feedbackTitle: { fontSize: 16.5, fontFamily: F.uiX },
    feedbackTxt: {
      fontSize: 14,
      fontFamily: F.ui,
      color: C.ink,
      marginTop: 6,
      lineHeight: 20,
    },
  });
}
