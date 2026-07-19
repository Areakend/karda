import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect, pron, transliterate } from '../data/alphabet';
import { Question } from '../lib/engine';
import { speakHy } from '../lib/speech';
import { Button, ProgressBar } from '../ui/components';
import { C, R } from '../ui/theme';

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
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];

  // Le mode écoute joue le mot dès son apparition, sans que l'utilisateur
  // ait besoin de toucher quoi que ce soit.
  useEffect(() => {
    if (q?.type === 'listen') {
      speakHy(q.word.hy, transliterate(q.word.hy, dialect));
    }
  }, [idx]);

  if (!q) return null;

  const correctKey = q.type === 's2l' ? q.answerId : q.answer;

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

  const answered = picked !== null;
  const isCorrect = answered && picked === correctKey;

  function pick(key: string) {
    if (answered) return;
    setPicked(key);
    const ok = key === correctKey;
    if (ok) setScore((s) => s + 1);
    onAnswer(q, ok);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      onComplete(score);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  return (
    <View style={st.wrap}>
      <View style={st.top}>
        <Pressable onPress={onQuit} hitSlop={12}>
          <Text style={st.quit}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <ProgressBar value={idx / questions.length} />
        </View>
        <Text style={st.counter}>
          {idx + 1}/{questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={st.body}>
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
        {q.type === 'listen' && (
          <>
            <Text style={st.prompt}>Écoute, puis choisis le bon mot :</Text>
            <Pressable
              onPress={() => speakHy(q.word.hy, transliterate(q.word.hy, dialect))}
              style={st.listenBtn}
            >
              <Text style={st.listenIcon}>🔊</Text>
            </Pressable>
          </>
        )}

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
                style={[
                  st.option,
                  showCorrect && { backgroundColor: C.successSoft, borderColor: C.success },
                  showWrong && { backgroundColor: C.errorSoft, borderColor: C.error },
                ]}
              >
                <Text
                  style={[
                    st.optionTxt,
                    (q.type === 's2l' || q.type === 'listen') && {
                      fontSize: 24,
                      fontWeight: 'normal',
                    },
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

        {answered && (
          <View style={[st.feedback, { backgroundColor: isCorrect ? C.successSoft : C.errorSoft }]}>
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
                {q.word.emoji} {q.word.hy} = « {transliterate(q.word.hy, dialect)} » — {q.word.fr}
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
            <View style={{ marginTop: 12 }}>
              <Button label={idx + 1 >= questions.length ? 'Voir le résultat' : 'Suivant'} onPress={next} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 8,
  },
  quit: { fontSize: 20, color: C.textSoft, fontWeight: '700' },
  counter: { marginLeft: 12, fontSize: 13, color: C.textSoft, fontWeight: '700' },
  body: { padding: 18, paddingBottom: 40 },
  prompt: { fontSize: 16, color: C.textSoft, textAlign: 'center', marginTop: 12 },
  bigGlyph: {
    fontSize: 72,
    fontWeight: 'normal',
    color: C.text,
    textAlign: 'center',
    marginVertical: 18,
  },
  bigSound: {
    fontSize: 44,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
    marginVertical: 24,
  },
  bigWord: {
    fontSize: 44,
    fontWeight: 'normal',
    color: C.text,
    textAlign: 'center',
    marginVertical: 24,
  },
  listenBtn: {
    alignSelf: 'center',
    backgroundColor: C.primarySoft,
    borderRadius: 999,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  listenIcon: { fontSize: 40 },
  options: { gap: 10 },
  option: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 2,
    borderColor: C.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  optionTxt: { fontSize: 18, fontWeight: '700', color: C.text },
  feedback: { borderRadius: R, padding: 16, marginTop: 16 },
  feedbackTitle: { fontSize: 17, fontWeight: '800' },
  feedbackTxt: { fontSize: 14.5, color: C.text, marginTop: 6, lineHeight: 20 },
});
