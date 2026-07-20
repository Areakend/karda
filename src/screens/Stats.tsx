import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LETTERS } from '../data/alphabet';
import { acquiredCount, dailyXpDeltas, MASTERY } from '../lib/engine';
import { Progress } from '../lib/store';
import { Card } from '../ui/components';
import { Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function Stats({
  progress,
  onClose,
}: {
  progress: Progress;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { C } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);

  const total = LETTERS.length;
  const acquired = acquiredCount(progress);
  const totalAttempts = progress.attempts.correct + progress.attempts.wrong;
  const accuracy =
    totalAttempts > 0 ? Math.round((progress.attempts.correct / totalAttempts) * 100) : null;
  const days = useMemo(() => dailyXpDeltas(progress, 14), [progress]);
  const maxXp = Math.max(1, ...days.map((d) => d.xp));

  return (
    <ScrollView contentContainerStyle={st.wrap} showsVerticalScrollIndicator={false}>
      <View style={st.top}>
        <Pressable onPress={onClose} hitSlop={12} style={st.closeBtn}>
          <Text style={st.close}>✕</Text>
        </Pressable>
        <Text style={st.title}>Statistiques</Text>
      </View>

      <View style={st.grid}>
        <Tile theme={theme} value={`${acquired}/${total}`} label="Lettres maîtrisées" />
        <Tile theme={theme} value={accuracy !== null ? `${accuracy}%` : '—'} label="Précision globale" />
        <Tile theme={theme} value={`${progress.streak} 🔥`} label="Série actuelle" />
        <Tile theme={theme} value={`${progress.bestStreak} 🏆`} label="Meilleure série" />
        <Tile theme={theme} value={`${progress.xp}`} label="XP total" />
        <Tile theme={theme} value={`${totalAttempts}`} label="Réponses données" />
      </View>

      <Card style={{ marginTop: 8 }}>
        <Text style={st.cardTitle}>Activité — 14 derniers jours</Text>
        <View style={st.chart}>
          {days.map((d, i) => {
            const dow = new Date(d.date + 'T00:00:00').getDay();
            const h = d.xp > 0 ? Math.max(6, (d.xp / maxXp) * 90) : 3;
            const isToday = i === days.length - 1;
            return (
              <View key={d.date} style={st.barCol}>
                <View style={st.barTrack}>
                  <View
                    style={[
                      st.bar,
                      {
                        height: h,
                        backgroundColor: d.xp > 0 ? C.coral : C.line,
                      },
                    ]}
                  />
                </View>
                <Text style={[st.barLabel, isToday && { color: C.grenat }]}>
                  {DAY_LABELS[dow]}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Text style={st.footnote}>
        La précision compte toutes les réponses données dans les leçons et les
        quiz depuis le début.
      </Text>
    </ScrollView>
  );
}

function Tile({ value, label, theme }: { value: string; label: string; theme: Theme }) {
  const st = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={st.tile}>
      <Text style={st.tileValue}>{value}</Text>
      <Text style={st.tileLabel}>{label}</Text>
    </View>
  );
}

function makeStyles({ C, F, R, SHADOW }: Theme) {
  return StyleSheet.create({
    wrap: { padding: 18, paddingTop: 58, paddingBottom: 60 },
    top: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW,
    },
    close: { fontSize: 15, color: C.inkSoft, fontFamily: F.uiX },
    title: { fontSize: 22, fontFamily: F.uiX, color: C.ink, marginLeft: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    tile: {
      width: '31.5%',
      backgroundColor: C.card,
      borderRadius: R.m,
      paddingVertical: 16,
      alignItems: 'center',
      ...SHADOW,
    },
    tileValue: { fontSize: 19, fontFamily: F.uiX, color: C.ink },
    tileLabel: {
      fontSize: 10.5,
      fontFamily: F.uiSemi,
      color: C.inkSoft,
      marginTop: 4,
      textAlign: 'center',
      paddingHorizontal: 4,
    },
    cardTitle: { fontSize: 15, fontFamily: F.uiBold, color: C.ink, marginBottom: 16 },
    chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    barCol: { alignItems: 'center', gap: 6, flex: 1 },
    barTrack: { height: 90, justifyContent: 'flex-end' },
    bar: { width: 10, borderRadius: 5 },
    barLabel: { fontSize: 10, fontFamily: F.uiBold, color: C.inkSoft },
    footnote: {
      fontSize: 12,
      fontFamily: F.ui,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 17,
    },
  });
}
