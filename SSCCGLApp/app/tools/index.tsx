// app/tools/index.tsx
// Tools hub — pick Calculator, Periodic Table, or Maths Speed Drill.

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';

const TOOLS = [
  {
    id: 'calculator', icon: '🧮', title: 'Calculator',
    sub: 'Smart keyboard with percentages, powers, roots',
    color: '#2E86DE', route: '/tools/calculator',
  },
  {
    id: 'periodic', icon: '⚛️', title: 'Periodic Table',
    sub: 'All 118 elements · tap for details',
    color: '#27AE60', route: '/tools/periodic-table',
  },
  {
    id: 'speed-math', icon: '⏱️', title: 'Speed Math Drill',
    sub: '60-second arithmetic challenge',
    color: '#F39C12', route: '/tools/speed-math',
  },
];

export default function ToolsHub() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Smart Tools</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.intro}>
          Three built-in utilities to speed up your prep and daily calculations.
        </Text>
        {TOOLS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.card, { borderLeftColor: t.color }]}
            activeOpacity={0.85}
            onPress={() => router.push(t.route as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: t.color + '22' }]}>
              <Text style={styles.icon}>{t.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.sub}>{t.sub}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },
  intro: { color: COLORS.text_secondary, paddingHorizontal: 20, marginBottom: 16, fontSize: 13, lineHeight: 19 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
    gap: 14,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  title: { color: COLORS.text_primary, fontWeight: '800', fontSize: 15 },
  sub: { color: COLORS.text_secondary, fontSize: 12, marginTop: 3 },
  arrow: { color: COLORS.text_muted, fontSize: 20 },
});