// app/study/index.tsx
// Study Hub home — pick section then tool (Flashcards / E-book / Mind Map / One-liners).

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { SECTIONS, QUIZ_TOPICS } from '../../src/constants/examConfig';

type Tool = 'flashcards' | 'ebook' | 'mindmap' | 'oneliner';

const TOOLS: { id: Tool; icon: string; title: string; sub: string; color: string }[] = [
  { id: 'flashcards', icon: '🃏', title: 'Flashcards',  sub: 'Flip-card recall practice',  color: '#E74C3C' },
  { id: 'ebook',      icon: '📖', title: 'E-Book',       sub: 'Read short chapters',       color: '#2E86DE' },
  { id: 'mindmap',    icon: '🧠', title: 'Mind Map',     sub: 'Visual topic outlines',     color: '#9B59B6' },
  { id: 'oneliner',   icon: '⚡', title: 'One-liners',   sub: 'Quick facts & formulas',    color: '#F39C12' },
];

export default function StudyHub() {
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);

  if (!tool) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Study Hub</Text>
          <View style={{ width: 48 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.intro}>
            Choose a study tool. Each tool gives you a fast, focused way to revise.
          </Text>
          {TOOLS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolCard, { borderLeftColor: t.color }]}
              activeOpacity={0.85}
              onPress={() => setTool(t.id)}
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

  // Tool picked → section picker
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setTool(null)}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>
          {TOOLS.find((t) => t.id === tool)?.title}
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.intro}>Pick a subject to continue.</Text>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.toolCard, { borderLeftColor: s.color }]}
            activeOpacity={0.85}
            onPress={() => {
              // E-book and mindmap go to a single picker screen that lists topics.
              // Flashcards and one-liners go straight to the topic picker too.
              router.push(`/study/${tool}/${s.id}`);
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: s.color + '22' }]}>
              <Text style={styles.icon}>{s.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{s.name}</Text>
              <Text style={styles.sub}>
                {QUIZ_TOPICS[s.id as keyof typeof QUIZ_TOPICS]?.length ?? 0} topics
              </Text>
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

  toolCard: {
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