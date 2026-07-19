import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GROUP_COUNT, GROUP_TITLES, LETTERS } from '../data/alphabet';
import { acquiredCount, suggest, Suggestion } from '../lib/engine';
import { Progress } from '../lib/store';
import { Button, Card, ProgressBar } from '../ui/components';
import { C } from '../ui/theme';

export default function Home({
  progress,
  onLesson,
  onQuiz,
}: {
  progress: Progress;
  onLesson: (group: number) => void;
  onQuiz: () => void;
}) {
  const acquired = acquiredCount(progress);
  const total = LETTERS.length;
  const s: Suggestion = suggest(progress);
  const lessonsDone = progress.completed.length;

  return (
    <ScrollView contentContainerStyle={st.wrap}>
      <View style={st.header}>
        <View>
          <Text style={st.hello}>Բարև՛</Text>
          <Text style={st.helloSub}>Prêt(e) à lire l'arménien ?</Text>
        </View>
        {progress.streak > 0 && (
          <View style={st.streak}>
            <Text style={st.streakTxt}>🔥 {progress.streak}</Text>
            <Text style={st.streakSub}>jour{progress.streak > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <Card>
        <View style={st.rowBetween}>
          <Text style={st.cardTitle}>Lettres acquises</Text>
          <Text style={st.count}>
            {acquired}
            <Text style={st.countTotal}> / {total}</Text>
          </Text>
        </View>
        <ProgressBar value={acquired / total} />
        <View style={[st.rowBetween, { marginTop: 10 }]}>
          <Text style={st.meta}>
            {lessonsDone}/{GROUP_COUNT} leçons
          </Text>
          <Text style={st.meta}>⭐ {progress.xp} XP</Text>
        </View>
      </Card>

      <Card style={{ marginTop: 14, backgroundColor: C.primarySoft, borderColor: C.primarySoft }}>
        <Text style={st.suggestKicker}>CONSEILLÉ MAINTENANT</Text>
        <Text style={st.suggestTitle}>
          {s.kind === 'lesson'
            ? `Leçon ${s.group + 1} · ${GROUP_TITLES[s.group]}`
            : 'Quiz de révision'}
        </Text>
        <Text style={st.suggestReason}>{s.reason}</Text>
        <View style={{ marginTop: 14 }}>
          <Button
            label={s.kind === 'lesson' ? 'Commencer la leçon' : 'Lancer le quiz'}
            onPress={() => (s.kind === 'lesson' ? onLesson(s.group) : onQuiz())}
          />
        </View>
      </Card>

      {lessonsDone > 0 && s.kind === 'lesson' && (
        <View style={{ marginTop: 14 }}>
          <Button label="Ou réviser avec un quiz libre" kind="ghost" onPress={onQuiz} />
        </View>
      )}

      <Text style={st.sectionTitle}>Parcours</Text>
      {GROUP_TITLES.map((title, g) => {
        const done = progress.completed.includes(g);
        const isNext = !done && progress.completed.length === g;
        const locked = !done && !isNext;
        return (
          <Card
            key={g}
            style={{
              marginBottom: 10,
              opacity: locked ? 0.55 : 1,
              borderColor: isNext ? C.primary : C.border,
            }}
          >
            <View style={st.rowBetween}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={st.lessonNum}>
                  {done ? '✅' : isNext ? '👉' : '🔒'} Leçon {g + 1}
                </Text>
                <Text style={st.lessonTitle}>{title}</Text>
              </View>
              {(isNext || done) && (
                <Button
                  label={done ? 'Revoir' : 'Go !'}
                  kind={done ? 'ghost' : 'primary'}
                  onPress={() => onLesson(g)}
                />
              )}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 18, paddingTop: 54, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hello: { fontSize: 32, fontWeight: 'normal', color: C.text },
  helloSub: { fontSize: 14, color: C.textSoft, marginTop: 2 },
  streak: {
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  streakTxt: { fontSize: 18, fontWeight: '800', color: C.text },
  streakSub: { fontSize: 11, color: C.textSoft },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 8 },
  count: { fontSize: 22, fontWeight: '800', color: C.primary },
  countTotal: { fontSize: 14, color: C.textSoft, fontWeight: '600' },
  meta: { fontSize: 12.5, color: C.textSoft },
  suggestKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 1,
  },
  suggestTitle: { fontSize: 19, fontWeight: '800', color: C.text, marginTop: 6 },
  suggestReason: { fontSize: 14, color: C.textSoft, marginTop: 4, lineHeight: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginTop: 24,
    marginBottom: 10,
  },
  lessonNum: { fontSize: 13, fontWeight: '700', color: C.textSoft },
  lessonTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 2 },
});
