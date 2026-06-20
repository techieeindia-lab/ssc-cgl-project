// app/study/[tool]/[section].tsx
// Topic picker for a given tool + section. Renders the actual tool view.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../src/theme/colors';
import { SECTIONS, QUIZ_TOPICS } from '../../../src/constants/examConfig';
import FlashcardsView from '../../../src/components/study/FlashcardsView';
import EbookView from '../../../src/components/study/EbookView';
import MindMapView from '../../../src/components/study/MindMapView';
import OneLinerView from '../../../src/components/study/OneLinerView';

type Tool = 'flashcards' | 'ebook' | 'mindmap' | 'oneliner';

export default function StudyTopic() {
  const router = useRouter();
  const { tool, section } = useLocalSearchParams<{ tool: Tool; section: string }>();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const sec = SECTIONS.find((s) => s.id === section);
  const topics = section ? (QUIZ_TOPICS[section as keyof typeof QUIZ_TOPICS] ?? []) : [];

  if (!tool || !sec) {
    return (
      <View style={styles.center}>
        <Text style={styles.errTxt}>Invalid study route.</Text>
      </View>
    );
  }

  // If a topic is chosen, render the actual tool view
  if (selectedTag) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg_primary }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setSelectedTag(null)}>
            <Text style={styles.back}>← Topics</Text>
          </TouchableOpacity>
          <Text style={styles.subHeading}>
            {tool === 'flashcards' ? '🃏' :
             tool === 'ebook'      ? '📖' :
             tool === 'mindmap'    ? '🧠' : '⚡'}{' '}
            {topics.find((t) => t.tag === selectedTag)?.label}
          </Text>
          <View style={{ width: 60 }} />
        </View>
        {tool === 'flashcards' && <FlashcardsView section={sec.id} tag={selectedTag} />}
        {tool === 'ebook'      && <EbookView      section={sec.id} tag={selectedTag} />}
        {tool === 'mindmap'    && <MindMapView    section={sec.id} tag={selectedTag} />}
        {tool === 'oneliner'   && <OneLinerView   section={sec.id} tag={selectedTag} />}
      </View>
    );
  }

  // Topic picker
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg_primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.sectionChip, { borderColor: sec.color }]}>
          <Text style={[styles.sectionChipTxt, { color: sec.color }]}>
            {sec.icon} {sec.shortName}
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.hint}>Choose a topic to {toolLabel(tool)}:</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {topics.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTxt}>No topics defined for this section yet.</Text>
          </View>
        ) : (
          topics.map((t) => (
            <TouchableOpacity
              key={t.tag}
              style={styles.topicCard}
              activeOpacity={0.85}
              onPress={() => setSelectedTag(t.tag)}
            >
              <Text style={styles.topicLbl}>{t.label}</Text>
              <Text style={styles.topicArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const toolLabel = (t: Tool) =>
  t === 'flashcards' ? 'start flashcards' :
  t === 'ebook'      ? 'read the e-book chapter' :
  t === 'mindmap'    ? 'see the mind map' :
  'see the one-liners';

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary },
  errTxt: { color: COLORS.text_secondary, fontSize: 14 },

  subHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  subHeading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 15, flex: 1, textAlign: 'center' },

  sectionChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.bg_card, borderWidth: 1.5,
  },
  sectionChipTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  hint: { color: COLORS.text_secondary, paddingHorizontal: 20, marginBottom: 12, fontSize: 13 },

  topicCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: COLORS.bg_card, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  topicLbl: { color: COLORS.text_primary, fontWeight: '600', fontSize: 14 },
  topicArrow: { color: COLORS.text_muted, fontSize: 20 },

  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 14 },
});