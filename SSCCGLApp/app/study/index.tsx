// app/study/index.tsx
// Topic Mastery — 4 header tabs (GK / GS / English / Misc).
// Flow:
//   1. Active tab → list topics (expandable)
//   2. Tap topic → expand to show chapters
//   3. Each chapter has 4 rings (flashcard/mindmap/ebook/oneliner)
//   4. Tap chapter row → open quiz
//   5. Tap a ring on chapter → open study tool modal

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import {
  SUBJECT_GROUPS, Chapter,
  totalChapters, totalTopics,
} from '../../src/constants/subjectGroups';
import ProgressRing from '../../src/components/common/ProgressRing';
import FlashcardsView from '../../src/components/study/FlashcardsView';
import EbookView from '../../src/components/study/EbookView';
import MindMapView from '../../src/components/study/MindMapView';
import OneLinerView from '../../src/components/study/OneLinerView';

// ─── Fake mastery data (will be replaced with Firestore-backed state) ──
const MASTERY: Record<string, Record<string, number>> = {};

type ToolId = 'flashcard' | 'mindmap' | 'ebook' | 'oneliner';

const TOOL_META: Record<ToolId, { icon: string; label: string; color: string }> = {
  flashcard: { icon: '🃏', label: 'Flashcards', color: '#2E86DE' },
  mindmap:   { icon: '🧠', label: 'Mind Map',   color: '#9B59B6' },
  ebook:     { icon: '📖', label: 'E-Book',     color: '#27AE60' },
  oneliner:  { icon: '⚡', label: 'One-Liners', color: '#F39C12' },
};

export default function StudyHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(SUBJECT_GROUPS[0].id);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Modal state
  const [modalTool, setModalTool] = useState<ToolId | null>(null);
  const [modalChapter, setModalChapter] = useState<Chapter | null>(null);

  const group = SUBJECT_GROUPS.find((g) => g.id === activeTab)!;

  const getMastery = (chapterId: string, tool: string) =>
    MASTERY[`${activeTab}_${chapterId}`]?.[tool] ?? 0;

  const openTool = (tool: ToolId, chapter: Chapter) => {
    setModalTool(tool);
    setModalChapter(chapter);
  };

  const closeTool = () => {
    setModalTool(null);
    setModalChapter(null);
  };

  const renderStudyTool = () => {
    if (!modalChapter || !modalTool) return null;
    const props = { section: modalChapter.quizParams.section, tag: modalChapter.quizParams.tag };

    switch (modalTool) {
      case 'flashcard': return <FlashcardsView {...props} />;
      case 'ebook':     return <EbookView {...props} />;
      case 'mindmap':   return <MindMapView {...props} />;
      case 'oneliner':  return <OneLinerView {...props} />;
      default:          return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg_primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Topic Mastery</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* ── Segmented Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {SUBJECT_GROUPS.map((g) => {
          const active = g.id === activeTab;
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.tab, active && { backgroundColor: g.color + '30', borderColor: g.color }]}
              activeOpacity={0.8}
              onPress={() => { setActiveTab(g.id); setExpandedTopic(null); }}
            >
              <Text style={styles.tabIcon}>{g.icon}</Text>
              <Text style={[styles.tabLabel, active && { color: g.color, fontWeight: '800' }]}>
                {g.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Group Stats Bar ── */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {totalTopics(group)} topics · {totalChapters(group)} chapters
        </Text>
      </View>

      {/* ── Topic List ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {group.topics.map((topic) => {
          const expanded = expandedTopic === topic.id;
          return (
            <View key={topic.id}>
              {/* Topic Card — tap to expand, no rings */}
              <TouchableOpacity
                style={[styles.topicCard, expanded && { borderColor: group.color }]}
                activeOpacity={0.85}
                onPress={() => setExpandedTopic(expanded ? null : topic.id)}
              >
                <View style={[styles.topicIconWrap, { backgroundColor: group.color + '22' }]}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicLabel}>{topic.label}</Text>
                  <Text style={styles.topicMeta}>
                    {topic.chapters.length} chapters
                  </Text>
                </View>
                <Text style={[styles.chevron, expanded && styles.chevronUp]}>›</Text>
              </TouchableOpacity>

              {/* Expanded Chapters — each with rings */}
              {expanded && (
                <View style={styles.chapterList}>
                  {topic.chapters.map((ch, idx) => (
                    <View
                      key={ch.id}
                      style={[
                        styles.chapterCard,
                        idx === topic.chapters.length - 1 && styles.chapterCardLast,
                      ]}
                    >
                      {/* Tap this area = quiz */}
                      <TouchableOpacity
                        style={styles.chapterMain}
                        activeOpacity={0.8}
                        onPress={() =>
                          router.push({
                            pathname: '/quiz/play',
                            params: { type: 'topic', section: ch.quizParams.section, tag: ch.quizParams.tag, count: '10' },
                          })
                        }
                      >
                        <View style={styles.chapterDot} />
                        <Text style={styles.chapterLabel}>{ch.label}</Text>
                        <Text style={styles.chapterArrow}>Quiz →</Text>
                      </TouchableOpacity>

                      {/* 4 rings for this chapter */}
                      <View style={styles.chapterRings}>
                        {(Object.keys(TOOL_META) as ToolId[]).map((toolId) => (
                          <TouchableOpacity
                            key={toolId}
                            activeOpacity={0.7}
                            onPress={() => openTool(toolId, ch)}
                          >
                            <ProgressRing
                              icon={TOOL_META[toolId].icon}
                              progress={getMastery(ch.id, toolId)}
                              color={TOOL_META[toolId].color}
                              size={34}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ── Study Tool Modal ── */}
      <Modal
        visible={modalTool !== null && modalChapter !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeTool}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeTool}>
              <Text style={styles.modalBack}>← Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalTool ? TOOL_META[modalTool].icon : ''}{' '}
              {modalChapter?.label ?? ''} — {modalTool ? TOOL_META[modalTool].label : ''}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={styles.modalBody}>
            {renderStudyTool()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  // Tabs
  tabRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg_card,
  },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, color: COLORS.text_secondary, fontWeight: '600' },

  // Stats
  statsBar: { paddingHorizontal: 20, paddingBottom: 12 },
  statsText: { fontSize: 11, color: COLORS.text_muted, fontWeight: '600' },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 40 },

  // Topic Card — no rings, just expand
  topicCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8, gap: 12,
  },
  topicIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  topicIcon: { fontSize: 20 },
  topicInfo: { flex: 1 },
  topicLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  topicMeta: { fontSize: 11, color: COLORS.text_secondary, marginTop: 2 },
  chevron: { fontSize: 18, color: COLORS.text_muted, marginLeft: 4 },
  chevronUp: { transform: [{ rotate: '90deg' }] },

  // Chapters
  chapterList: {
    marginLeft: 68, marginBottom: 8,
    backgroundColor: COLORS.bg_secondary, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  chapterCard: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  chapterCardLast: { borderBottomWidth: 0 },
  chapterMain: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  chapterDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent_light,
  },
  chapterLabel: { flex: 1, fontSize: 13, color: COLORS.text_primary, fontWeight: '600' },
  chapterArrow: { fontSize: 11, color: COLORS.accent_light, fontWeight: '700' },
  chapterRings: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 14, paddingBottom: 10,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg_primary },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalBack: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  modalTitle: {
    flex: 1, textAlign: 'center', color: COLORS.text_primary,
    fontWeight: '800', fontSize: 14,
  },
  modalBody: { flex: 1 },
});
