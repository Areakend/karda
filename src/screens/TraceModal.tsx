import React, { useMemo, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Dialect, Letter, pron } from '../data/alphabet';
import { speakHy } from '../lib/speech';
import { Button } from '../ui/components';
import DrawCanvas, { DrawCanvasHandle } from '../ui/DrawCanvas';
import { Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';

const CANVAS = 260;

/**
 * Zone de tracé au doigt en pleine page. Sans données vectorielles par
 * lettre, on ne peut pas noter la ressemblance du tracé — la lettre-guide
 * en transparence sert uniquement de repère visuel pour l'entraînement du
 * geste.
 */
export default function TraceModal({
  letter,
  dialect,
  onClose,
}: {
  letter: Letter | null;
  dialect: Dialect;
  onClose: () => void;
}) {
  const theme = useTheme();
  const st = useMemo(() => makeStyles(theme), [theme]);
  const canvasRef = useRef<DrawCanvasHandle>(null);

  if (!letter) return null;
  const p = pron(letter, dialect);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={() => canvasRef.current?.clear()}
    >
      <View style={st.backdrop}>
        <View style={st.modal}>
          <Text style={st.title}>Trace la lettre</Text>
          <Pressable onPress={() => speakHy(letter.U, p.rInitial ?? p.r)}>
            <Text style={st.sound}>{p.rInitial ?? p.r} 🔊</Text>
          </Pressable>

          <View style={{ marginTop: 18 }}>
            <DrawCanvas ref={canvasRef} size={CANVAS} guide={letter.L} />
          </View>

          <Text style={st.hint}>
            Suis le contour avec le doigt, autant de fois que tu veux.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button label="Effacer" kind="ghost" onPress={() => canvasRef.current?.clear()} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Terminé" onPress={onClose} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles({ C, F, R, SHADOW_STRONG }: Theme) {
  return StyleSheet.create({
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
    title: { fontSize: 18, fontFamily: F.uiX, color: C.ink },
    sound: { fontSize: 15, color: C.grenat, fontFamily: F.uiBold, marginTop: 4 },
    hint: {
      fontSize: 12.5,
      fontFamily: F.ui,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 14,
    },
  });
}
