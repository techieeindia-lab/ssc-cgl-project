// app/study/index.tsx
// Study Hub home — "Topic Mastery". Pick a SUBJECT first. The tool
// (Flashcards / E-book / Mind Map / One-liners) is chosen later, per topic,
// inside app/study/[section].tsx. This keeps the app scalable: adding a
// 5th study tool later only touches one TOOLS array, not a whole new
// subject/topic picker.
//
// Optional ?tool= query param: Home screen quick-links land here (not on
// a specific subject) since every tool applies to every subject. We just
// carry the hint forward to [section].tsx so the tool auto-opens once the
// user picks a topic.

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { SECTIONS, QUIZ_TOPICS } from '../../src/constants/examConfig';

export default function StudyHub() {
  const router = useRouter();
  const { tool } = useLocalSearchParams<{ tool?: string }>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Topic Mastery</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.intro}>
          Pick a subject, then a topic. You'll choose how to study it —
          flashcards, e-book, mind map, or one-liners — right after.
        </Text>

        {SECTIONS.map((s) => {
          const topicCount = QUIZ_TOPICS[s.id as keyof typeof QUIZ_TOPICS]?.length ?? 0;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.subjectCard, { borderLeftColor: s.color }]}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/study/[section]',
                  params: tool ? { section: s.id, tool } : { section: s.id },
                })
              }
            >
              <View style={[styles.iconBox, { backgroundColor: s.color + '22' }]}>
                <Text style={styles.icon}>{s.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{s.name}</Text>
                <Text style={styles.sub}>{topicCount} topics · 4 study tools each</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        })}
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

  subjectCard: {
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