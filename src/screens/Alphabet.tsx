import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Dialect,
  GROUP_COUNT,
  GROUP_TITLES,
  Letter,
  letterName,
  lettersOfGroup,
  pron,
  transliterate,
} from '../data/alphabet';
import { WORDS } from '../data/words';
import { isGroupUnlocked, MASTERY } from '../lib/engine';
import { speakHy } from '../lib/speech';
import { Progress } from '../lib/store';
import { Button } from '../ui/components';
import { Colors, Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';
import TraceModal from './TraceModal';

function stateColor(C: Colors, p: Progress, l: Letter, unlocked: boolean): string {
  if (!unlocked) return C.locked;
  const s = p.strengths[l.id] ?? 0;
  if (s >= MASTERY) return C.success;
  if (s >= 1) return C.apricot;
  return C.teal;
}

export default function Alphabet({
  progress,
  dialect,
}: {
  progress: Progress;
  dialect: Dialect;
}) {
  const theme = useTheme();
  const { C } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  const [sel, setSel] = useState<Letter | null>(null);
  const [tracing, setTracing] = useState<Letter | null>(null);

  return (
    <ScrollView contentContainerStyle={st.wrap} showsVerticalScrollIndicator={false}>
      <Text style={st.title}>Alphabet</Text>
      <Text style={st.subtitle}>
        39 sons à apprivoiser, groupe après groupe.
      </Text>
      <View style={st.legend}>
        <Legend theme={theme} color={C.success} label="acquise" />
        <Legend theme={theme} color={C.apricot} label="en cours" />
        <Legend theme={theme} color={C.teal} label="nouvelle" />
        <Legend theme={theme} color={C.locked} label="verrouillée" />
      </View>

      {Array.from({ length: GROUP_COUNT }, (_, g) => {
        const unlocked = isGroupUnlocked(progress, g);
        return (
          <View key={g} style={{ marginBottom: 22 }}>
            <Text style={st.groupTitle}>
              {unlocked ? '' : '🔒 '}
              {GROUP_TITLES[g]}
            </Text>
            <View style={st.grid}>
              {lettersOfGroup(g).map((l) => (
                <Pressable
                  key={l.id}
                  disabled={!unlocked}
                  onPress={() => setSel(l)}
                  style={({ pressed }) => [
                    st.cell,
                    !unlocked && st.cellLocked,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <View
                    style={[st.stateDot, { backgroundColor: stateColor(C, progress, l, unlocked) }]}
                  />
                  <Text style={[st.cellGlyph, !unlocked && { color: C.locked }]}>
                    {l.U} {l.L}
                  </Text>
                  <Text style={st.cellSound}>
                    {unlocked ? pron(l, dialect).r : '·'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      <LetterModal
        letter={sel}
        dialect={dialect}
        onClose={() => setSel(null)}
        onTrace={(l) => {
          setSel(null);
          setTracing(l);
        }}
      />
      <TraceModal letter={tracing} dialect={dialect} onClose={() => setTracing(null)} />
    </ScrollView>
  );
}

function Legend({ color, label, theme }: { color: string; label: string; theme: Theme }) {
  const st = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={st.legendItem}>
      <View style={[st.legendDot, { backgroundColor: color }]} />
      <Text style={st.legendTxt}>{label}</Text>
    </View>
  );
}

export function LetterModal({
  letter,
  dialect,
  onClose,
  onTrace,
}: {
  letter: Letter | null;
  dialect: Dialect;
  onClose: () => void;
  onTrace?: (letter: Letter) => void;
}) {
  const theme = useTheme();
  const { G } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  if (!letter) return null;
  const p = pron(letter, dialect);
  const example = WORDS.find((w) =>
    w.hy.toLowerCase().includes(letter.id === 'ou' ? 'ու' : letter.L)
  );
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={st.backdrop} onPress={onClose}>
        <Pressable style={st.modal} onPress={() => {}}>
          <Text style={st.modalGlyph}>
            {letter.U} {letter.L}
          </Text>
          <Text style={st.modalName}>
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
          {example && (
            <View style={st.example}>
              <Text style={st.exampleHy}>
                {example.emoji} {example.hy}
              </Text>
              <Text style={st.exampleTr}>
                {transliterate(example.hy, dialect)} — {example.fr}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button
                label="🔊 Écouter"
                kind="soft"
                onPress={() => speakHy(letter.U, p.rInitial ?? p.r)}
              />
            </View>
            {onTrace && (
              <View style={{ flex: 1 }}>
                <Button label="✍️ Tracer" kind="soft" onPress={() => onTrace(letter)} />
              </View>
            )}
          </View>
          <View style={{ marginTop: 10, alignSelf: 'stretch' }}>
            <Button label="Fermer" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles({ C, F, R, SHADOW, SHADOW_STRONG }: Theme) {
  return StyleSheet.create({
    wrap: { padding: 18, paddingTop: 60, paddingBottom: 120 },
    title: { fontSize: 28, fontFamily: F.uiX, color: C.ink },
    subtitle: {
      fontSize: 14,
      fontFamily: F.ui,
      color: C.inkSoft,
      marginTop: 4,
      marginBottom: 14,
    },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 22 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 9, height: 9, borderRadius: 5 },
    legendTxt: { fontSize: 12, fontFamily: F.uiSemi, color: C.inkSoft },
    groupTitle: {
      fontSize: 13,
      fontFamily: F.uiX,
      color: C.inkSoft,
      marginBottom: 10,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    cell: {
      width: 76,
      backgroundColor: C.card,
      borderRadius: R.m,
      paddingVertical: 12,
      alignItems: 'center',
      ...SHADOW,
    },
    cellLocked: {
      backgroundColor: C.bgDeep,
      shadowOpacity: 0,
      elevation: 0,
    },
    stateDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    cellGlyph: { fontSize: 21, fontFamily: F.hy, color: C.ink },
    cellSound: { fontSize: 11.5, fontFamily: F.uiSemi, color: C.inkSoft, marginTop: 3 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(43,27,46,0.55)',
      justifyContent: 'center',
      padding: 24,
    },
    modal: {
      backgroundColor: C.card,
      borderRadius: R.xl,
      padding: 26,
      alignItems: 'center',
      ...SHADOW_STRONG,
    },
    modalGlyph: { fontSize: 66, fontFamily: F.hyBold, color: C.ink, lineHeight: 84 },
    modalName: { fontSize: 14, fontFamily: F.uiSemi, color: C.inkSoft, marginTop: 2 },
    soundPill: {
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 22,
      marginTop: 14,
    },
    soundPillTxt: { fontSize: 20, fontFamily: F.uiX, color: C.white },
    hint: {
      fontSize: 14.5,
      fontFamily: F.ui,
      color: C.ink,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 21,
    },
    tip: {
      fontSize: 13,
      fontFamily: F.ui,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 19,
    },
    example: {
      marginTop: 16,
      alignItems: 'center',
      backgroundColor: C.tealSoft,
      borderRadius: R.s,
      padding: 14,
      alignSelf: 'stretch',
    },
    exampleHy: { fontSize: 22, fontFamily: F.hy, color: C.ink },
    exampleTr: { fontSize: 13, fontFamily: F.uiSemi, color: C.teal, marginTop: 4 },
  });
}
