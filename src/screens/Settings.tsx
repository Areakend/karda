import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Dialect } from '../data/alphabet';
import { Button, Card } from '../ui/components';
import { C, F } from '../ui/theme';

export default function Settings({
  dialect,
  onDialect,
  dailyReminder,
  onToggleReminder,
  onReset,
}: {
  dialect: Dialect;
  onDialect: (d: Dialect) => void;
  dailyReminder: boolean;
  onToggleReminder: (next: boolean) => void;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <ScrollView contentContainerStyle={st.wrap} showsVerticalScrollIndicator={false}>
      <Text style={st.title}>Réglages</Text>

      <Text style={st.section}>Prononciation</Text>
      <Card>
        <Text style={st.desc}>
          Les lettres sont identiques, mais certaines se prononcent
          différemment selon la branche de l'arménien.
        </Text>
        <View style={st.segment}>
          <Seg
            label="Occidental"
            sub="diaspora"
            active={dialect === 'west'}
            onPress={() => onDialect('west')}
          />
          <Seg
            label="Oriental"
            sub="Arménie"
            active={dialect === 'east'}
            onPress={() => onDialect('east')}
          />
        </View>
      </Card>

      <Text style={st.section}>Rappels</Text>
      <Card>
        <View style={st.rowBetween}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={st.desc}>
              Une notification locale vers 19h si tu n'as rien lu aujourd'hui,
              pour garder ta série 🔥. Rien n'est envoyé à un serveur.
            </Text>
          </View>
          <Switch
            value={dailyReminder}
            onValueChange={onToggleReminder}
            trackColor={{ true: C.coral }}
          />
        </View>
      </Card>

      <Text style={st.section}>Données</Text>
      <Card>
        <Text style={st.desc}>
          Efface toute la progression (lettres, leçons, XP, série). Action
          définitive.
        </Text>
        {confirming ? (
          <View style={{ gap: 10 }}>
            <Button label="Oui, tout effacer" kind="danger" onPress={onReset} />
            <Button label="Annuler" kind="ghost" onPress={() => setConfirming(false)} />
          </View>
        ) : (
          <Button
            label="Réinitialiser la progression"
            kind="soft"
            onPress={() => setConfirming(true)}
          />
        )}
      </Card>

      <Text style={st.about}>
        Karda (Կարդա՛ · « Lis ! ») — apprends à lire l'arménien,{'\n'}une lettre
        à la fois. 🇦🇲
      </Text>
    </ScrollView>
  );
}

function Seg({
  label,
  sub,
  active,
  onPress,
}: {
  label: string;
  sub: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[st.seg, active && { backgroundColor: C.grenat, borderColor: C.grenat }]}
    >
      <Text style={[st.segLabel, active && { color: C.white }]}>{label}</Text>
      <Text style={[st.segSub, active && { color: '#FBD9CB' }]}>{sub}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 18, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 28, fontFamily: F.uiX, color: C.ink },
  section: {
    fontSize: 12.5,
    fontFamily: F.uiX,
    color: C.inkSoft,
    marginTop: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  desc: {
    fontSize: 13.5,
    fontFamily: F.ui,
    color: C.inkSoft,
    lineHeight: 19,
    marginBottom: 14,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  segment: { flexDirection: 'row', gap: 10 },
  seg: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.line,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segLabel: { fontSize: 15, fontFamily: F.uiX, color: C.ink },
  segSub: { fontSize: 11, fontFamily: F.uiSemi, color: C.inkSoft, marginTop: 2 },
  about: {
    fontSize: 12.5,
    fontFamily: F.ui,
    color: C.inkSoft,
    textAlign: 'center',
    marginTop: 34,
    lineHeight: 19,
  },
});
