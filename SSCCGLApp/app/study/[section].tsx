// app/study/[section].tsx
// Topic Mastery for one subject. Three stacked phases, all in local state
// (no extra route segments needed — this is what makes adding a 5th study
// tool later a one-line change instead of a new route):
//
//   1. No topic picked yet      → list topics for this subject
//   2. Topic picked, no tool    → pick a study tool for that exact topic
//   3. Topic + tool picked      → render the actual tool view
//
// Optional ?tool= query param (used by Home screen quick-links) skips
// phase 2 the first time: once the user taps a topic, that tool opens
// immediately. Back-navigation still always steps up one phase at a time,
// so the flow stays predictable either way.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { SECTIONS, QUIZ_TOPICS } from '../../src/constants/examConfig';
import FlashcardsView from '../../src/components/study/FlashcardsView';
import EbookView from '../../src/components/study/EbookView';
import MindMapView from '../../src/components/study/MindMapView';
import OneLinerView from '../../src/components/study/OneLinerView';

type Tool = 'flashcards' | 'ebook' | 'mindmap' | 'oneliner';

const TOOLS: { id: Tool; icon: string; title: string; sub: string; color: string }[] = [
  { id: 'flashcards', icon: '🃏', title: 'Flashcards',  sub: 'Flip-card recall practice', color: '#E74C3C' },
  { id: 'ebook',      icon: '📖', title: 'E-Book',       sub: 'Read a short chapter',      color: '#2E86DE' },
  { id: 'mindmap',    icon: '🧠', title: 'Mind Map',     sub: 'Visual topic outline',      color: '#9B59B6' },
  { id: 'oneliner',   icon: '⚡', title: 'One-liners',   sub: 'Quick facts & formulas',    color: '#F39C12' },
];

const isTool = (v: unknown): v is Tool =>
  v === 'flashcards' || v === 'ebook' || v === 'mindmap' || v === 'oneliner';

export default function SubjectTopics() {
  const router = useRouter();
  const { section, tool: toolParam } = useLocalSearchParams<{ section: string; tool?: string }>();

  // If a tool was passed in (e.g. from Home screen quick-links), remember it
  // as a one-shot preference — applied as soon as a topic is picked.
  const [presetTool] = useState<Tool | null>(isTool(toolParam) ? toolParam : null);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const sec = SECTIONS.find((s) => s.id === section);
  const topics = section ? (QUIZ_TOPICS[section as keyof typeof QUIZ_TOPICS] ?? []) : [];

  if (!sec) {
    return (
      <View style={styles.center}>
        <Text style={styles.errTxt}>Invalid subject.</Text>
      </View>
    );
  }

  const handlePickTopic = (tag: string) => {
    setSelectedTag(tag);
    if (presetTool) setSelectedTool(presetTool);
  };

  const topicLabel = topics.find((t) => t.tag === selectedTag)?.label ?? '';

  // ── Phase 3: topic + tool picked → render the actual view ──────────────
  if (selectedTag && selectedTool) {
    const toolMeta = TOOLS.find((t) => t.id === selectedTool)!;
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg_primary }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setSelectedTool(null)}>
            <Text style={styles.back}>← Tools</Text>
          </TouchableOpacity>
          <Text style={styles.subHeading}>{toolMeta.icon} {topicLabel}</Text>
          <View style={{ width: 60 }} />
        </View>
        {selectedTool === 'flashcards' && <FlashcardsView section={sec.id} tag={selectedTag} />}
        {selectedTool === 'ebook'      && <EbookView      section={sec.id} tag={selectedTag} />}
        {selectedTool === 'mindmap'    && <MindMapView    section={sec.id} tag={selectedTag} />}
        {selectedTool === 'oneliner'   && <OneLinerView   section={sec.id} tag={selectedTag} />}
      </View>
    );
  }

  // ── Phase 2: topic picked, no tool yet → pick a study tool ──────────────
  if (selectedTag) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg_primary }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setSelectedTag(null)}>
            <Text style={styles.back}>← Topics</Text>
          </TouchableOpacity>
          <Text style={styles.subHeading}>{topicLabel}</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.hint}>How do you want to study this topic?</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {TOOLS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolCard, { borderLeftColor: t.color }]}
              activeOpacity={0.85}
              onPress={() => setSelectedTool(t.id)}
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

  // ── Phase 1: no topic yet → list topics for this subject ───────────────
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

      <Text style={styles.hint}>Choose a topic to master:</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {topics.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTxt}>No topics defined for this subject yet.</Text>
          </View>
        ) : (
          topics.map((t) => (
            <TouchableOpacity
              key={t.tag}
              style={styles.topicCard}
              activeOpacity={0.85}
              onPress={() => handlePickTopic(t.tag)}
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

  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 14 },
});