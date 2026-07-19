import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { C, F, G, R, SHADOW } from './theme';

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={st.screen}>{children}</View>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[st.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'soft' | 'danger';
  disabled?: boolean;
}) {
  if (kind === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          st.btnShadow,
          disabled && { opacity: 0.4 },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={G.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.btn}
        >
          <Text style={st.btnLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        st.btn,
        kind === 'ghost' && st.btnGhost,
        kind === 'soft' && st.btnSoft,
        kind === 'danger' && { backgroundColor: C.error },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          st.btnLabel,
          kind === 'ghost' && { color: C.coral },
          kind === 'soft' && { color: C.grenatDeep },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ProgressBar({
  value,
  track = C.apricotSoft,
}: {
  value: number; // 0..1
  track?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View style={[st.barTrack, { backgroundColor: track }]}>
      <LinearGradient
        colors={G.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[st.barFill, { width: `${pct}%` }]}
      />
    </View>
  );
}

/** Anneau de progression SVG avec dégradé */
export function Ring({
  size,
  stroke,
  value,
  track = 'rgba(255,255,255,0.25)',
  children,
}: {
  size: number;
  stroke: number;
  value: number; // 0..1
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={G.ring[0]} />
            <Stop offset="1" stopColor={G.ring[1]} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export function Chip({
  label,
  tone = 'apricot',
}: {
  label: string;
  tone?: 'apricot' | 'grenat' | 'teal' | 'glass';
}) {
  const bg =
    tone === 'glass'
      ? 'rgba(255,255,255,0.22)'
      : tone === 'grenat'
        ? C.grenatSoft
        : tone === 'teal'
          ? C.tealSoft
          : C.apricotSoft;
  const color =
    tone === 'glass'
      ? C.white
      : tone === 'grenat'
        ? C.grenatDeep
        : tone === 'teal'
          ? C.teal
          : C.grenatDeep;
  return (
    <View style={[st.chip, { backgroundColor: bg }]}>
      <Text style={[st.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  card: {
    backgroundColor: C.card,
    borderRadius: R.l,
    padding: 20,
    ...SHADOW,
  },
  btnShadow: {
    borderRadius: 16,
    ...SHADOW,
  },
  btn: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: C.coral,
    paddingVertical: 13.5,
  },
  btnSoft: {
    backgroundColor: C.apricotSoft,
  },
  btnLabel: {
    color: C.white,
    fontSize: 15,
    fontFamily: F.uiX,
    letterSpacing: 0.2,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 5 },
  chip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipLabel: { fontSize: 12.5, fontFamily: F.uiBold },
});
