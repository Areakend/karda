import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialect } from '../data/alphabet';
import { C, R } from '../ui/theme';

export default function Onboarding({
  onChoose,
}: {
  onChoose: (d: Dialect) => void;
}) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={st.wrap}>
      <Text style={st.glyph}>Կ</Text>
      <Text style={st.title}>Karda</Text>
      <Text style={st.subtitle}>Կարդա՛ — « Lis ! »</Text>
      <Text style={st.body}>
        Apprends à lire l'alphabet arménien pas à pas : les lettres dans un
        ordre logique, puis de vrais mots dès la première leçon.
      </Text>
      <Text style={st.question}>Quel arménien veux-tu lire ?</Text>

      <Pressable style={st.choice} onPress={() => onChoose('west')}>
        <Text style={st.choiceTitle}>Arménien occidental</Text>
        <Text style={st.choiceDesc}>
          Celui de la diaspora — France, Liban, Syrie, Istanbul. Si ta famille
          vient du génocide de 1915, c'est probablement celui-ci.
        </Text>
      </Pressable>

      <Pressable style={st.choice} onPress={() => onChoose('east')}>
        <Text style={st.choiceTitle}>Arménien oriental</Text>
        <Text style={st.choiceDesc}>
          Celui de la République d'Arménie (Erevan) et d'Iran. C'est la langue
          officielle du pays aujourd'hui.
        </Text>
      </Pressable>

      <Text style={st.note}>
        Les lettres sont les mêmes — seule la prononciation de certaines
        change. Tu pourras basculer à tout moment dans les réglages.
      </Text>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 64, alignItems: 'stretch' },
  glyph: {
    fontSize: 72,
    textAlign: 'center',
    color: C.primary,
    fontWeight: 'normal',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: C.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: C.textSoft,
    marginBottom: 18,
  },
  body: {
    fontSize: 15,
    color: C.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  choice: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 2,
    borderColor: C.primarySoft,
    padding: 18,
    marginBottom: 12,
  },
  choiceTitle: { fontSize: 17, fontWeight: '700', color: C.primary },
  choiceDesc: { fontSize: 13.5, color: C.textSoft, marginTop: 6, lineHeight: 19 },
  note: {
    fontSize: 12.5,
    color: C.textSoft,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
});
