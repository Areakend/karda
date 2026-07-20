import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Theme } from './theme';
import { useTheme } from './ThemeContext';

export interface DrawCanvasHandle {
  clear: () => void;
}

/**
 * Zone de tracé au doigt réutilisable (modale de pratique libre, question
 * de quiz…). Sans données vectorielles par lettre, impossible de noter la
 * ressemblance du tracé — c'est un espace de dessin, pas un correcteur.
 */
const DrawCanvas = forwardRef<
  DrawCanvasHandle,
  { size?: number; guide?: string }
>(function DrawCanvas({ size = 260, guide }, ref) {
  const theme = useTheme();
  const { C, F, R } = theme;
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

  useImperativeHandle(ref, () => ({ clear }), []);

  return (
    <View
      style={[st.canvasWrap, { width: size, height: size }]}
      {...panResponder.panHandlers}
    >
      {guide && (
        <Text
          pointerEvents="none"
          style={[st.guide, { fontSize: size * 0.73, lineHeight: size * 0.96 }]}
        >
          {guide}
        </Text>
      )}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {paths.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={C.coral}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
  );
});

export default DrawCanvas;

function makeStyles({ C, F, R }: Theme) {
  return StyleSheet.create({
    canvasWrap: {
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
      fontFamily: F.hy,
      color: C.line,
    },
  });
}
