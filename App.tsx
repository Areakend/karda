import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  NotoSerifArmenian_500Medium,
  NotoSerifArmenian_700Bold,
} from '@expo-google-fonts/noto-serif-armenian';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Dialect, lettersOfGroup } from './src/data/alphabet';
import { bonusLessonById } from './src/data/bonusLessons';
import { acquiredCount, applyResult, makeQuiz, Question } from './src/lib/engine';
import { disableDailyReminder, enableDailyReminder } from './src/lib/notifications';
import {
  EMPTY_PROGRESS,
  EMPTY_SETTINGS,
  loadProgress,
  loadSettings,
  Progress,
  saveProgress,
  saveSettings,
  Settings as SettingsData,
  snapshotToday,
  touchStreak,
} from './src/lib/store';
import Alphabet from './src/screens/Alphabet';
import BonusLesson from './src/screens/BonusLesson';
import Home from './src/screens/Home';
import Lesson from './src/screens/Lesson';
import Onboarding from './src/screens/Onboarding';
import QuizView from './src/screens/QuizView';
import Settings from './src/screens/Settings';
import Stats from './src/screens/Stats';
import Words from './src/screens/Words';
import { Button } from './src/ui/components';
import { Theme } from './src/ui/theme';
import { ThemeProvider, useTheme } from './src/ui/ThemeContext';

type Tab = 'home' | 'alphabet' | 'words' | 'settings';
type Overlay =
  | { name: 'none' }
  | { name: 'lesson'; group: number }
  | { name: 'bonus'; id: number }
  | { name: 'quiz' }
  | { name: 'quizDone'; score: number; total: number }
  | { name: 'stats' };

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSerifArmenian_500Medium,
    NotoSerifArmenian_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(EMPTY_SETTINGS);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [tab, setTab] = useState<Tab>('home');
  const [overlay, setOverlay] = useState<Overlay>({ name: 'none' });

  const dialect = settings.dialect;

  useEffect(() => {
    (async () => {
      const [s, p] = await Promise.all([loadSettings(), loadProgress()]);
      setSettings(s);
      setProgress(p);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, fontsLoaded]);

  function updateProgress(fn: (p: Progress) => Progress) {
    setProgress((prev) => {
      const updated = fn(prev);
      const next = snapshotToday(updated, acquiredCount(updated));
      saveProgress(next);
      return next;
    });
  }

  function updateSettings(patch: Partial<SettingsData>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  async function handleToggleReminder(next: boolean) {
    if (next) {
      const ok = await enableDailyReminder();
      if (!ok) {
        Alert.alert(
          'Notifications désactivées',
          "Karda n'a pas la permission d'envoyer des notifications. Active-la dans les réglages de ton téléphone pour recevoir un rappel quotidien."
        );
        return;
      }
    } else {
      await disableDailyReminder();
    }
    updateSettings({ dailyReminder: next });
  }

  return (
    <ThemeProvider preference={settings.themeMode}>
      <AppBody
        ready={ready}
        fontsLoaded={!!fontsLoaded}
        settings={settings}
        progress={progress}
        dialect={dialect}
        tab={tab}
        setTab={setTab}
        overlay={overlay}
        setOverlay={setOverlay}
        updateProgress={updateProgress}
        updateSettings={updateSettings}
        onToggleReminder={handleToggleReminder}
      />
    </ThemeProvider>
  );
}

function AppBody({
  ready,
  fontsLoaded,
  settings,
  progress,
  dialect,
  tab,
  setTab,
  overlay,
  setOverlay,
  updateProgress,
  updateSettings,
  onToggleReminder,
}: {
  ready: boolean;
  fontsLoaded: boolean;
  settings: SettingsData;
  progress: Progress;
  dialect: Dialect | null;
  tab: Tab;
  setTab: (t: Tab) => void;
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  updateProgress: (fn: (p: Progress) => Progress) => void;
  updateSettings: (patch: Partial<SettingsData>) => void;
  onToggleReminder: (next: boolean) => void;
}) {
  const theme = useTheme();
  const { C, F, G, SHADOW_STRONG } = theme;
  const st = useMemo(() => makeStyles(theme), [theme]);
  const barStyle = theme.mode === 'dark' ? 'light' : 'dark';

  const freeQuiz = useMemo(
    () => (overlay.name === 'quiz' && dialect ? makeQuiz(progress, dialect, 8) : []),
    // Questions figées à l'ouverture du quiz
    [overlay.name, dialect]
  );

  if (!ready || !fontsLoaded) {
    return (
      <View style={st.splash}>
        <Text style={st.splashGlyph}>Կ</Text>
      </View>
    );
  }

  if (!dialect) {
    return (
      <>
        <StatusBar style={barStyle} />
        <Onboarding onChoose={(d) => updateSettings({ dialect: d })} />
      </>
    );
  }

  const onAnswer = (q: Question, correct: boolean) =>
    updateProgress((p) => applyResult(p, q, correct));

  if (overlay.name === 'lesson') {
    return (
      <>
        <StatusBar style={barStyle} />
        <Lesson
          group={overlay.group}
          progress={progress}
          dialect={dialect}
          onAnswer={onAnswer}
          onComplete={() => {
            const g = overlay.group;
            updateProgress((p) => {
              const strengths = { ...p.strengths };
              // Toute lettre vue en leçon démarre au moins à 1
              for (const l of lettersOfGroup(g)) {
                strengths[l.id] = Math.max(1, strengths[l.id] ?? 0);
              }
              const completed = p.completed.includes(g)
                ? p.completed
                : [...p.completed, g];
              return touchStreak({
                ...p,
                strengths,
                completed,
                xp: p.xp + (p.completed.includes(g) ? 10 : 50),
              });
            });
            setOverlay({ name: 'none' });
            setTab('home');
          }}
          onQuit={() => setOverlay({ name: 'none' })}
        />
      </>
    );
  }

  if (overlay.name === 'bonus') {
    const lesson = bonusLessonById(overlay.id);
    if (!lesson) {
      setOverlay({ name: 'none' });
      return null;
    }
    return (
      <>
        <StatusBar style={barStyle} />
        <BonusLesson
          lesson={lesson}
          dialect={dialect}
          onAnswer={onAnswer}
          onComplete={() => {
            const id = lesson.id;
            updateProgress((p) => {
              const bonusCompleted = p.bonusCompleted.includes(id)
                ? p.bonusCompleted
                : [...p.bonusCompleted, id];
              return touchStreak({
                ...p,
                bonusCompleted,
                xp: p.xp + (p.bonusCompleted.includes(id) ? 10 : 30),
              });
            });
            setOverlay({ name: 'none' });
            setTab('home');
          }}
          onQuit={() => setOverlay({ name: 'none' })}
        />
      </>
    );
  }

  if (overlay.name === 'quiz') {
    return (
      <>
        <StatusBar style={barStyle} />
        <QuizView
          questions={freeQuiz}
          dialect={dialect}
          onAnswer={onAnswer}
          onComplete={(score) => {
            updateProgress((p) => touchStreak(p));
            setOverlay({ name: 'quizDone', score, total: freeQuiz.length });
          }}
          onQuit={() => setOverlay({ name: 'none' })}
        />
      </>
    );
  }

  if (overlay.name === 'stats') {
    return (
      <>
        <StatusBar style={barStyle} />
        <Stats progress={progress} onClose={() => setOverlay({ name: 'none' })} />
      </>
    );
  }

  if (overlay.name === 'quizDone') {
    const pct = overlay.total > 0 ? overlay.score / overlay.total : 0;
    return (
      <View style={st.doneWrap}>
        <StatusBar style={barStyle} />
        <LinearGradient
          colors={G.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.doneBadge}
        >
          <Text style={st.doneBadgeTxt}>
            {pct >= 0.8 ? '🏆' : pct >= 0.5 ? '🎉' : '💪'}
          </Text>
        </LinearGradient>
        <Text style={st.doneTitle}>
          {overlay.score}
          <Text style={st.doneTotal}> / {overlay.total}</Text>
        </Text>
        <Text style={st.doneTxt}>
          {pct >= 0.8
            ? 'Excellente lecture ! Tes lettres se renforcent.'
            : pct >= 0.5
              ? 'Bien joué — encore quelques répétitions et ce sera automatique.'
              : "Continue, chaque erreur t'apprend une lettre. Réessaie !"}
        </Text>
        <View style={{ marginTop: 28, alignSelf: 'stretch', gap: 12 }}>
          <Button label="Encore un quiz !" onPress={() => setOverlay({ name: 'quiz' })} />
          <Button
            label="Retour à l'accueil"
            kind="ghost"
            onPress={() => setOverlay({ name: 'none' })}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={barStyle} />
      <View style={{ flex: 1 }}>
        {tab === 'home' && (
          <Home
            progress={progress}
            onLesson={(g) => setOverlay({ name: 'lesson', group: g })}
            onBonus={(id) => setOverlay({ name: 'bonus', id })}
            onQuiz={() => setOverlay({ name: 'quiz' })}
            onStats={() => setOverlay({ name: 'stats' })}
          />
        )}
        {tab === 'alphabet' && <Alphabet progress={progress} dialect={dialect} />}
        {tab === 'words' && <Words progress={progress} dialect={dialect} />}
        {tab === 'settings' && (
          <Settings
            dialect={dialect}
            onDialect={(d) => updateSettings({ dialect: d })}
            dailyReminder={settings.dailyReminder}
            onToggleReminder={onToggleReminder}
            themeMode={settings.themeMode}
            onThemeMode={(m) => updateSettings({ themeMode: m })}
            onStats={() => setOverlay({ name: 'stats' })}
            onReset={() => {
              updateProgress(() => ({ ...EMPTY_PROGRESS }));
              setTab('home');
            }}
          />
        )}
      </View>

      <View style={st.tabbar}>
        <TabBtn
          label="Accueil"
          active={tab === 'home'}
          onPress={() => setTab('home')}
          theme={theme}
          render={(color) => <Ionicons name="home" size={21} color={color} />}
        />
        <TabBtn
          label="Alphabet"
          active={tab === 'alphabet'}
          onPress={() => setTab('alphabet')}
          theme={theme}
          render={(color) => (
            <Text style={{ fontFamily: F.hyBold, fontSize: 17, color, lineHeight: 22 }}>
              Աա
            </Text>
          )}
        />
        <TabBtn
          label="Mots"
          active={tab === 'words'}
          onPress={() => setTab('words')}
          theme={theme}
          render={(color) => <Ionicons name="book" size={21} color={color} />}
        />
        <TabBtn
          label="Réglages"
          active={tab === 'settings'}
          onPress={() => setTab('settings')}
          theme={theme}
          render={(color) => <Ionicons name="settings-sharp" size={21} color={color} />}
        />
      </View>
    </View>
  );
}

function TabBtn({
  label,
  active,
  onPress,
  render,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  render: (color: string) => React.ReactNode;
  theme: Theme;
}) {
  const st = useMemo(() => makeStyles(theme), [theme]);
  const color = active ? theme.C.grenat : theme.C.inkSoft;
  return (
    <Pressable onPress={onPress} style={st.tabBtn}>
      <View style={[st.tabIconWrap, active && { backgroundColor: theme.C.grenatSoft }]}>
        {render(color)}
      </View>
      <Text style={[st.tabLabel, { color }, active && { fontFamily: theme.F.uiX }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function makeStyles({ C, F, SHADOW_STRONG }: Theme) {
  return StyleSheet.create({
    splash: {
      flex: 1,
      backgroundColor: C.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    splashGlyph: { fontSize: 84, color: C.coral },
    tabbar: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 18,
      flexDirection: 'row',
      backgroundColor: C.card,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 6,
      ...SHADOW_STRONG,
    },
    tabBtn: { flex: 1, alignItems: 'center', gap: 1 },
    tabIconWrap: {
      width: 46,
      height: 30,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: { fontSize: 10, fontFamily: F.uiBold },
    doneWrap: {
      flex: 1,
      backgroundColor: C.bg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    doneBadge: {
      width: 112,
      height: 112,
      borderRadius: 56,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW_STRONG,
    },
    doneBadgeTxt: { fontSize: 52 },
    doneTitle: {
      fontSize: 52,
      fontFamily: F.uiX,
      color: C.ink,
      marginTop: 20,
    },
    doneTotal: { fontSize: 24, color: C.inkSoft, fontFamily: F.uiBold },
    doneTxt: {
      fontSize: 15,
      color: C.inkSoft,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 22,
      fontFamily: F.ui,
    },
  });
}
