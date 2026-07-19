import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { C, R } from './theme';

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
  kind?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        st.btn,
        kind === 'primary' && { backgroundColor: C.primary },
        kind === 'ghost' && st.btnGhost,
        kind === 'danger' && { backgroundColor: C.error },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text
        style={[
          st.btnLabel,
          kind === 'ghost' && { color: C.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ProgressBar({
  value,
  color = C.primary,
}: {
  value: number; // 0..1
  color?: string;
}) {
  return (
    <View style={st.barTrack}>
      <View
        style={[
          st.barFill,
          { width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={st.screen}>{children}</View>;
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  card: {
    backgroundColor: C.card,
    borderRadius: R,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  btnLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: C.primarySoft,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 5 },
});
