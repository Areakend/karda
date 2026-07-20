import React, { useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Dialect, Letter, pron } from '../data/alphabet';
import { speakHy } from '../lib/speech';
import { Button } from '../ui/components';
import { Theme } from '../ui/theme';
import { useTheme } from '../ui/ThemeContext';

const CANVAS = 260;

/**
 * Zone de tracé au doigt. Sans données vectorielles par lettre, on ne peut
 * pas noter la ressemblance du tracé — la lettre-guide en transparence sert
 * uniquement de repère visuel pour l'entraînement du geste.
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
  const { C } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef<string>('');
  const [, forceRender] = useState(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          current.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          forceRender((n) => n + 1);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          current.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          forceRender((n) => n + 1);
        },
        onPanResponderRelease: () => {
          if (current.current) {
            setPaths((p) => [...p, current.current]);
            current.current = '';
          }
        },
      }),
    []
  );

  function clear() {
    setPaths([]);
    current.current = '';
    forceRender((n) => n + 1);
  }

  if (!letter) return null;
  const p = pron(letter, dialect);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={clear}
    >
      <View style={st.backdrop}>
        <View style={st.modal}>
          <Text style={st.title}>Trace la lettre</Text>
          <Pressable onPress={() => speakHy(letter.U, p.rInitial ?? p.r)}>
            <Text style={st.sound}>{p.rInitial ?? p.r} 🔊</Text>
          </Pressable>

          <View style={st.canvasWrap} {...panResponder.panHandlers}>
            <Text style={st.guide} pointerEvents="none">
              {letter.L}
            </Text>
            <Svg width={CANVAS} height={CANVAS} style={StyleSheet.absoluteFill}>
              {paths.map((d, i) => (
                <Path key={i} d={d} stroke={C.coral} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {current.current !== '' && (
                <Path
                  d={current.current}
                  stroke={C.coral}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>

          <Text style={st.hint}>
            Suis le contour avec le doigt, autant de fois que tu veux.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button label="Effacer" kind="ghost" onPress={clear} />
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
    canvasWrap: {
      width: CANVAS,
      height: CANVAS,
      marginTop: 18,
      borderRadius: R.l,
      backgroundColor: C.bgDeep,
      borderWidth: 2,
      borderColor: C.line,
      borderStyle: 'dashed',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    guide: {
      position: 'absolute',
      fontSize: 190,
      lineHeight: 250,
      fontFamily: F.hy,
      color: C.line,
    },
    hint: {
      fontSize: 12.5,
      fontFamily: F.ui,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 14,
    },
  });
}
