import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GROUP_COUNT, GROUP_TITLES, LETTERS, lettersOfGroup } from '../data/alphabet';
import { BONUS_LESSONS } from '../data/bonusLessons';
import { acquiredCount, bonusUnlocked, MASTERY, suggest, Suggestion } from '../lib/engine';
import { Progress } from '../lib/store';
import { Button, Card, Chip, Ring } from '../ui/components';
import { Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';

export default function Home({
  progress,
  onLesson,
  onQuiz,
  onStats,
  onBonus,
}: {
  progress: Progress;
  onLesson: (group: number) => void;
  onQuiz: () => void;
  onStats: () => void;
  onBonus: (id: number) => void;
}) {
  const theme = useTheme();
  const { C, F, G } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  const acquired = acquiredCount(progress);
  const total = LETTERS.length;
  const s: Suggestion = suggest(progress);

  return (
    <ScrollView contentContainerStyle={st.wrap} showsVerticalScrollIndicator={false}>
      {/* ——— Héro ——— */}
      <LinearGradient
        colors={G.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.1, y: 1 }}
        style={st.hero}
      >
        <Text style={st.heroWatermark}>Կ</Text>
        <View style={{ flex: 1 }}>
          <Text style={st.heroHello}>Բարև՛</Text>
          <Text style={st.heroSub}>Ta lecture arménienne</Text>
          <View style={st.heroChips}>
            {progress.streak > 0 && (
              <Chip tone="glass" label={`🔥 ${progress.streak} jour${progress.streak > 1 ? 's' : ''}`} />
            )}
            <Chip tone="glass" label={`⭐ ${progress.xp} XP`} />
          </View>
        </View>
        <Pressable onPress={onStats} hitSlop={8}>
          <Ring size={92} stroke={9} value={acquired / total}>
            <Text style={st.ringCount}>{acquired}</Text>
            <Text style={st.ringTotal}>/ {total}</Text>
          </Ring>
        </Pressable>
      </LinearGradient>

      {/* ——— Suggestion ——— */}
      <Card style={{ marginTop: 18 }}>
        <Text style={st.eyebrow}>CONSEILLÉ MAINTENANT</Text>
        <Text style={st.suggestTitle}>
          {s.kind === 'lesson' && `Leçon ${s.group + 1} · ${GROUP_TITLES[s.group]}`}
          {s.kind === 'bonus' && BONUS_LESSONS[s.id]?.title}
          {s.kind === 'quiz' && 'Quiz de révision'}
        </Text>
        <Text style={st.suggestReason}>{s.reason}</Text>
        <View style={{ marginTop: 16 }}>
          <Button
            label={
              s.kind === 'lesson'
                ? 'Commencer la leçon'
                : s.kind === 'bonus'
                  ? 'Découvrir la leçon bonus'
                  : 'Lancer le quiz'
            }
            onPress={() => {
              if (s.kind === 'lesson') onLesson(s.group);
              else if (s.kind === 'bonus') onBonus(s.id);
              else onQuiz();
            }}
          />
        </View>
        {progress.completed.length > 0 && s.kind !== 'quiz' && (
          <View style={{ marginTop: 10 }}>
            <Button label="Ou réviser avec un quiz libre" kind="soft" onPress={onQuiz} />
          </View>
        )}
      </Card>

      {/* ——— Parcours (timeline) ——— */}
      <Text style={st.sectionTitle}>Parcours</Text>
      <View style={st.path}>
        {GROUP_TITLES.map((title, g) => {
          const done = progress.completed.includes(g);
          const isNext = !done && progress.completed.length === g;
          const locked = !done && !isNext;
          const letters = lettersOfGroup(g);
          const mastered = letters.filter(
            (l) => (progress.strengths[l.id] ?? 0) >= MASTERY
          ).length;
          const isLast = g === GROUP_COUNT - 1;
          return (
            <View key={g} style={st.pathRow}>
              {/* Colonne nœud + connecteur */}
              <View style={st.nodeCol}>
                {done ? (
                  <LinearGradient colors={G.primary} style={st.node}>
                    <Text style={st.nodeTxtDone}>✓</Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      st.node,
                      isNext ? st.nodeNext : st.nodeLocked,
                    ]}
                  >
                    <Text style={[st.nodeTxt, locked && { color: C.locked }]}>
                      {g + 1}
                    </Text>
                  </View>
                )}
                {!isLast && (
                  <View
                    style={[
                      st.connector,
                      { backgroundColor: done ? C.apricot : C.line },
                    ]}
                  />
                )}
              </View>

              {/* Carte étape */}
              <Pressable
                disabled={locked}
                onPress={() => onLesson(g)}
                style={({ pressed }) => [
                  st.step,
                  isNext && st.stepNext,
                  locked && { opacity: 0.55 },
                  pressed && !locked && { transform: [{ scale: 0.985 }] },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={st.stepTitle}>{title}</Text>
                  <Text style={st.stepGlyphs}>
                    {letters.map((l) => l.U).join('  ')}
                  </Text>
                  {done && (
                    <Text style={st.stepMeta}>
                      {mastered}/{letters.length} lettres acquises
                    </Text>
                  )}
                </View>
                {!locked && (
                  <Text style={[st.stepArrow, isNext && { color: C.grenat }]}>
                    {done ? '↻' : '→'}
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* ——— Leçons bonus (débloquées une fois les 39 lettres acquises) ——— */}
      {bonusUnlocked(progress) && (
        <>
          <Text style={st.sectionTitle}>Leçons bonus</Text>
          <Text style={st.bonusIntro}>
            Toutes les lettres sont acquises ! Ces leçons n'en ajoutent pas de
            nouvelles — juste beaucoup de mots et de phrases pour lire plus
            vite.
          </Text>
          {BONUS_LESSONS.map((b) => {
            const done = progress.bonusCompleted.includes(b.id);
            return (
              <Pressable
                key={b.id}
                onPress={() => onBonus(b.id)}
                style={({ pressed }) => [
                  st.step,
                  { marginLeft: 58 },
                  pressed && { transform: [{ scale: 0.985 }] },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={st.stepTitle}>
                    {b.emoji} {b.title}
                  </Text>
                  <Text style={st.stepMeta}>
                    {b.words.length} mots · {b.phrases.length} phrases
                  </Text>
                </View>
                <Text style={[st.stepArrow, done && { color: C.success }]}>
                  {done ? '✓' : '→'}
                </Text>
              </Pressable>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

function makeStyles({ C, F, R, SHADOW }: Theme) {
  return StyleSheet.create({
    wrap: { padding: 18, paddingTop: 60, paddingBottom: 120 },
    hero: {
      borderRadius: R.xl,
      padding: 22,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      overflow: 'hidden',
      ...SHADOW,
    },
    heroWatermark: {
      position: 'absolute',
      right: -18,
      top: -38,
      fontSize: 190,
      fontFamily: F.hyBold,
      color: 'rgba(255,255,255,0.10)',
    },
    heroHello: { fontSize: 34, fontFamily: F.hyBold, color: C.white },
    heroSub: {
      fontSize: 13.5,
      fontFamily: F.uiSemi,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    heroChips: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
    ringCount: { fontSize: 26, fontFamily: F.uiX, color: C.white, lineHeight: 30 },
    ringTotal: { fontSize: 11, fontFamily: F.uiBold, color: 'rgba(255,255,255,0.8)' },
    eyebrow: {
      fontSize: 11,
      fontFamily: F.uiX,
      color: C.grenat,
      letterSpacing: 1.2,
    },
    suggestTitle: { fontSize: 19, fontFamily: F.uiX, color: C.ink, marginTop: 8 },
    suggestReason: {
      fontSize: 14,
      fontFamily: F.ui,
      color: C.inkSoft,
      marginTop: 4,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: F.uiX,
      color: C.ink,
      marginTop: 28,
      marginBottom: 14,
    },
    bonusIntro: {
      fontSize: 13.5,
      fontFamily: F.ui,
      color: C.inkSoft,
      lineHeight: 19,
      marginTop: -6,
      marginBottom: 14,
    },
    path: {},
    pathRow: { flexDirection: 'row', gap: 14 },
    nodeCol: { alignItems: 'center', width: 44 },
    node: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.card,
    },
    nodeNext: {
      borderWidth: 2.5,
      borderColor: C.coral,
      ...SHADOW,
    },
    nodeLocked: {
      borderWidth: 1.5,
      borderColor: C.line,
      backgroundColor: C.bgDeep,
    },
    nodeTxt: { fontSize: 16, fontFamily: F.uiX, color: C.coral },
    nodeTxtDone: { fontSize: 18, fontFamily: F.uiX, color: C.white },
    connector: { width: 3, flex: 1, borderRadius: 2, marginVertical: 4, minHeight: 18 },
    step: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: R.m,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      ...SHADOW,
    },
    stepNext: {
      borderWidth: 2,
      borderColor: C.coral,
    },
    stepTitle: { fontSize: 15, fontFamily: F.uiBold, color: C.ink },
    stepGlyphs: {
      fontSize: 15,
      fontFamily: F.hy,
      color: C.inkSoft,
      marginTop: 3,
    },
    stepMeta: {
      fontSize: 11.5,
      fontFamily: F.uiSemi,
      color: C.success,
      marginTop: 3,
    },
    stepArrow: { fontSize: 20, fontFamily: F.uiX, color: C.inkSoft },
  });
}
