import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect } from '../data/alphabet';
import { C, F, G, R, SHADOW, SHADOW_STRONG } from '../ui/theme';

export default function Onboarding({
  onChoose,
}: {
  onChoose: (d: Dialect) => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={st.wrap}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={G.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.badge}
      >
        <Text style={st.badgeGlyph}>Կ</Text>
      </LinearGradient>
      <Text style={st.title}>Karda</Text>
      <Text style={st.subtitle}>Կարդա՛ · « Lis ! »</Text>
      <Text style={st.body}>
        Apprends à lire l'alphabet arménien pas à pas : les lettres dans un
        ordre logique, puis de vrais mots dès la première leçon.
      </Text>
      <Text style={st.question}>Quel arménien veux-tu lire ?</Text>

      <Pressable
        onPress={() => onChoose('west')}
        style={({ pressed }) => [st.choice, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <View style={[st.choiceBar, { backgroundColor: C.grenat }]} />
        <View style={{ flex: 1 }}>
          <Text style={[st.choiceTitle, { color: C.grenat }]}>
            Arménien occidental
          </Text>
          <Text style={st.choiceDesc}>
            Celui de la diaspora — France, Liban, Syrie, Istanbul. Si ta famille
            vient du génocide de 1915, c'est probablement celui-ci.
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onChoose('east')}
        style={({ pressed }) => [st.choice, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <View style={[st.choiceBar, { backgroundColor: C.teal }]} />
        <View style={{ flex: 1 }}>
          <Text style={[st.choiceTitle, { color: C.teal }]}>Arménien oriental</Text>
          <Text style={st.choiceDesc}>
            Celui de la République d'Arménie (Erevan) et d'Iran. C'est la langue
            officielle du pays aujourd'hui.
          </Text>
        </View>
      </Pressable>

      <Text style={st.note}>
        Les lettres sont les mêmes — seule la prononciation de certaines
        change. Tu pourras basculer à tout moment dans les réglages.
      </Text>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 26, paddingTop: 76, alignItems: 'stretch', paddingBottom: 48 },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW_STRONG,
  },
  badgeGlyph: { fontSize: 54, fontFamily: F.hyBold, color: C.white, lineHeight: 72 },
  title: {
    fontSize: 36,
    fontFamily: F.uiX,
    textAlign: 'center',
    color: C.ink,
    marginTop: 18,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: F.hy,
    textAlign: 'center',
    color: C.grenat,
    marginTop: 2,
    marginBottom: 20,
  },
  body: {
    fontSize: 15,
    fontFamily: F.ui,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 30,
  },
  question: {
    fontSize: 18,
    fontFamily: F.uiX,
    color: C.ink,
    marginBottom: 14,
    textAlign: 'center',
  },
  choice: {
    backgroundColor: C.card,
    borderRadius: R.l,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 14,
    ...SHADOW,
  },
  choiceBar: { width: 5, borderRadius: 3 },
  choiceTitle: { fontSize: 16.5, fontFamily: F.uiX },
  choiceDesc: {
    fontSize: 13,
    fontFamily: F.ui,
    color: C.inkSoft,
    marginTop: 5,
    lineHeight: 19,
  },
  note: {
    fontSize: 12.5,
    fontFamily: F.ui,
    color: C.inkSoft,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});
