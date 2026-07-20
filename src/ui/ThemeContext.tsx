import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DARK, LIGHT, Theme } from './theme';

export type ThemePreference = 'system' | 'light' | 'dark';

const ThemeCtx = createContext<Theme>(LIGHT);

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const resolved: 'light' | 'dark' =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => (resolved === 'dark' ? DARK : LIGHT), [resolved]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeCtx);
}
