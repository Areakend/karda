import React, { useState } from 'react';
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
  GROUP_TITLES,
  Letter,
  letterName,
  lettersOfGroup,
  GROUP_COUNT,
  pron,
  transliterate,
} from '../data/alphabet';
import { WORDS } from '../data/words';
import { isGroupUnlocked, MASTERY } from '../lib/engine';
import { speakHy } from '../lib/speech';
import { Progress } from '../lib/store';
import { Button } from '../ui/components';
import { C, R } from '../ui/theme';
import TraceModal from './TraceModal';

function letterColor(p: Progress, l: Letter, unlocked: boolean): string {
  if (!unlocked) return C.locked;
  const s = p.strengths[l.id] ?? 0;
  if (s >= MASTERY) return C.success;
  if (s >= 1) return C.primary;
  return C.blue;
}

export default function Alphabet({
  progress,
  dialect,
}: {
  progress: Progress;
  dialect: Dialect;
}) {
  const [sel, setSel] = useState<Letter | null>(null);
  const [tracing, setTracing] = useState<Letter | null>(null);

  return (
    <ScrollView contentContainerStyle={st.wrap}>
      <Text style={st.title}>Alphabet</Text>
      <Text style={st.subtitle}>
        39 sons à apprivoiser. Touche une lettre débloquée pour la découvrir.
      </Text>
      <View style={st.legend}>
        <Legend color={C.success} label="acquise" />
        <Legend color={C.primary} label="en cours" />
        <Legend color={C.blue} label="nouvelle" />
        <Legend color={C.locked} label="verrouillée" />
      </View>

      {Array.from({ length: GROUP_COUNT }, (_, g) => {
        const unlocked = isGroupUnlocked(progress, g);
        return (
          <View key={g} style={{ marginBottom: 18 }}>
            <Text style={st.groupTitle}>
              {unlocked ? '' : '🔒 '}Groupe {g + 1} · {GROUP_TITLES[g]}
            </Text>
            <View style={st.grid}>
              {lettersOfGroup(g).map((l) => (
                <Pressable
                  key={l.id}
                  disabled={!unlocked}
                  onPress={() => setSel(l)}
                  style={[st.cell, { borderColor: letterColor(progress, l, unlocked) }]}
                >
                  <Text style={[st.cellGlyph, !unlocked && { color: C.locked }]}>
                    {l.U} {l.L}
                  </Text>
                  <Text style={st.cellSound}>
                    {unlocked ? pron(l, dialect).r : '?'}
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

function Legend({ color, label }: { color: string; label: string }) {
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
            « {letter.nameHy} » ({letterName(letter, dialect)})
          </Text>
          <View style={st.soundPill}>
            <Text style={st.soundPillTxt}>
              {p.rInitial ? `${p.rInitial} / ${p.r}` : p.r}
            </Text>
          </View>
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
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button
                label="🔊 Écouter"
                kind="ghost"
                onPress={() => speakHy(letter.U, p.rInitial ?? p.r)}
              />
            </View>
            {onTrace && (
              <View style={{ flex: 1 }}>
                <Button label="✍️ Tracer" kind="ghost" onPress={() => onTrace(letter)} />
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

const st = StyleSheet.create({
  wrap: { padding: 18, paddingTop: 54, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.textSoft, marginTop: 4, marginBottom: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 12, color: C.textSoft },
  groupTitle: { fontSize: 14, fontWeight: '700', color: C.textSoft, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: 76,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cellGlyph: { fontSize: 20, fontWeight: 'normal', color: C.text },
  cellSound: { fontSize: 12, color: C.textSoft, marginTop: 3 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,20,10,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: C.card,
    borderRadius: R + 6,
    padding: 24,
    alignItems: 'center',
  },
  modalGlyph: { fontSize: 64, fontWeight: 'normal', color: C.text },
  modalName: { fontSize: 15, color: C.textSoft, marginTop: 4 },
  soundPill: {
    backgroundColor: C.primarySoft,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  soundPillTxt: { fontSize: 20, fontWeight: '800', color: C.primary },
  hint: {
    fontSize: 14.5,
    color: C.text,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  tip: {
    fontSize: 13.5,
    color: C.textSoft,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  example: {
    marginTop: 14,
    alignItems: 'center',
    backgroundColor: C.blueSoft,
    borderRadius: 12,
    padding: 12,
    alignSelf: 'stretch',
  },
  exampleHy: { fontSize: 22, fontWeight: 'normal', color: C.text },
  exampleTr: { fontSize: 13.5, color: C.textSoft, marginTop: 4 },
});
