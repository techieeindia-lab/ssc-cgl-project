// src/screens/Quiz/QuizTypeSelector.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../theme/colors';
import { SECTIONS, QUIZ_TOPICS, QUIZ_COUNTS } from '../../constants/examConfig';

type QuizMode = 'home' | 'subject' | 'topic';

const { width } = Dimensions.get('window');

export default function QuizTypeSelector() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>('home');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  const startQuiz = (type: 'mix' | 'subject' | 'topic', tag?: string) => {
    const params: Record<string, string> = {
      type,
      count: String(questionCount),
    };
    if (selectedSection) params.section = selectedSection;
    if (tag) params.tag = tag;
    router.push({ pathname: '/quiz/play', params });
  };

  // ── Topic picker (after section chosen) ───────────────────────────────────
  if (mode === 'topic' && selectedSection) {
    const topics = QUIZ_TOPICS[selectedSection as keyof typeof QUIZ_TOPICS] ?? [];
    const sec = SECTIONS.find((s) => s.id === selectedSection);
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMode('subject')}>
            <Text style={styles.backArrow}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Topic</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.sectionChip}>
          <Text style={[styles.sectionChipText, { color: sec?.color }]}>
            {sec?.icon} {sec?.shortName}
          </Text>
        </View>
        <CountPicker count={questionCount} onChange={setQuestionCount} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topicGrid}>
            {topics.map((t) => (
              <TouchableOpacity
                key={t.tag}
                style={styles.topicCard}
                onPress={() => startQuiz('topic', t.tag)}
                activeOpacity={0.8}
              >
                <Text style={styles.topicLabel}>{t.label}</Text>
                <Text style={styles.topicArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Subject picker ────────────────────────────────────────────────────────
  if (mode === 'subject') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMode('home')}>
            <Text style={styles.backArrow}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedSection ? 'Choose Topic' : 'Choose Subject'}
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <CountPicker count={questionCount} onChange={setQuestionCount} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.hint}>Tap subject to start · Long-press for topic-wise</Text>
          {SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.id}
              style={[styles.subjectCard, { borderLeftColor: sec.color }]}
              onPress={() => {
                setSelectedSection(sec.id);
                startQuiz('subject');
              }}
              onLongPress={() => {
                setSelectedSection(sec.id);
                setMode('topic');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.subjectIcon}>{sec.icon}</Text>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectShort}>{sec.shortName}</Text>
                <Text style={styles.subjectName}>{sec.name}</Text>
              </View>
              <View style={styles.subjectActions}>
                <View style={[styles.startChip, { backgroundColor: sec.color + '22' }]}>
                  <Text style={[styles.startChipText, { color: sec.color }]}>Start ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={styles.longPressHint}>💡 Long-press a subject for topic-wise quiz</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Home (default) ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Quiz</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Number of Questions</Text>
        <CountPicker count={questionCount} onChange={setQuestionCount} />

        <Text style={styles.sectionLabel}>Quiz Type</Text>

        {/* Mix Quiz */}
        <TouchableOpacity
          style={styles.typeCard}
          onPress={() => startQuiz('mix')}
          activeOpacity={0.85}
        >
          <View style={[styles.typeIconBox, { backgroundColor: '#2E86DE22' }]}>
            <Text style={styles.typeIcon}>🎲</Text>
          </View>
          <View style={styles.typeInfo}>
            <Text style={styles.typeTitle}>Mix Quiz</Text>
            <Text style={styles.typeDesc}>Random questions from all 4 subjects</Text>
          </View>
          <Text style={styles.typeArrow}>›</Text>
        </TouchableOpacity>

        {/* Subject-wise */}
        <TouchableOpacity
          style={styles.typeCard}
          onPress={() => setMode('subject')}
          activeOpacity={0.85}
        >
          <View style={[styles.typeIconBox, { backgroundColor: '#9B59B622' }]}>
            <Text style={styles.typeIcon}>📚</Text>
          </View>
          <View style={styles.typeInfo}>
            <Text style={styles.typeTitle}>Subject-wise Quiz</Text>
            <Text style={styles.typeDesc}>Focus on one subject at a time</Text>
          </View>
          <Text style={styles.typeArrow}>›</Text>
        </TouchableOpacity>

        {/* Topic-wise */}
        <TouchableOpacity
          style={styles.typeCard}
          onPress={() => setMode('subject')}
          activeOpacity={0.85}
        >
          <View style={[styles.typeIconBox, { backgroundColor: '#27AE6022' }]}>
            <Text style={styles.typeIcon}>🎯</Text>
          </View>
          <View style={styles.typeInfo}>
            <Text style={styles.typeTitle}>Topic-wise Quiz</Text>
            <Text style={styles.typeDesc}>Drill down on a specific topic</Text>
          </View>
          <Text style={styles.typeArrow}>›</Text>
        </TouchableOpacity>

        {/* Reward info */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardInfoTitle}>🎁 Rewards per Quiz</Text>
          <View style={styles.rewardInfoRow}>
            <View style={styles.rewardInfoItem}>
              <Text style={styles.rewardInfoValue}>+10</Text>
              <Text style={styles.rewardInfoLabel}>🪙 per correct</Text>
            </View>
            <View style={styles.rewardInfoItem}>
              <Text style={styles.rewardInfoValue}>+50</Text>
              <Text style={styles.rewardInfoLabel}>🪙 perfect score</Text>
            </View>
            <View style={styles.rewardInfoItem}>
              <Text style={styles.rewardInfoValue}>+20</Text>
              <Text style={styles.rewardInfoLabel}>🔥 streak bonus</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Reusable count picker ─────────────────────────────────────────────────────
function CountPicker({ count, onChange }: { count: number; onChange: (n: number) => void }) {
  return (
    <View style={cpStyles.row}>
      {QUIZ_COUNTS.map((n) => (
        <TouchableOpacity
          key={n}
          style={[cpStyles.chip, count === n && cpStyles.chipActive]}
          onPress={() => onChange(n)}
        >
          <Text style={[cpStyles.chipText, count === n && cpStyles.chipTextActive]}>{n} Qs</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const cpStyles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.bg_card, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.text_secondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  backArrow: { fontSize: 14, color: COLORS.accent_light, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text_primary },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: COLORS.text_muted,
    paddingHorizontal: 20, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase',
  },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20,
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, gap: 14,
  },
  typeIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeIcon: { fontSize: 24 },
  typeInfo: { flex: 1 },
  typeTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text_primary, marginBottom: 3 },
  typeDesc: { fontSize: 12, color: COLORS.text_secondary },
  typeArrow: { fontSize: 20, color: COLORS.text_muted },
  subjectCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20,
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
    marginBottom: 12, gap: 14,
  },
  subjectIcon: { fontSize: 24 },
  subjectInfo: { flex: 1 },
  subjectShort: { fontSize: 11, fontWeight: '800', color: COLORS.accent_light, letterSpacing: 1, marginBottom: 2 },
  subjectName: { fontSize: 13, color: COLORS.text_secondary },
  subjectActions: {},
  startChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  startChipText: { fontSize: 12, fontWeight: '800' },
  hint: { fontSize: 12, color: COLORS.text_muted, paddingHorizontal: 20, marginBottom: 12 },
  longPressHint: {
    fontSize: 12, color: COLORS.text_muted, textAlign: 'center',
    paddingHorizontal: 20, marginTop: 8,
  },
  topicGrid: { paddingHorizontal: 20, gap: 10, marginTop: 8 },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  topicLabel: { fontSize: 14, color: COLORS.text_primary, fontWeight: '600' },
  topicArrow: { fontSize: 20, color: COLORS.text_muted },
  sectionChip: {
    marginHorizontal: 20, marginBottom: 12, backgroundColor: COLORS.bg_card,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionChipText: { fontSize: 13, fontWeight: '800' },
  rewardInfo: {
    marginHorizontal: 20, marginTop: 8, backgroundColor: '#F39C1211',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F39C1244',
  },
  rewardInfoTitle: { fontSize: 13, fontWeight: '800', color: '#F39C12', marginBottom: 12 },
  rewardInfoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  rewardInfoItem: { alignItems: 'center' },
  rewardInfoValue: { fontSize: 18, fontWeight: '900', color: COLORS.text_primary },
  rewardInfoLabel: { fontSize: 11, color: COLORS.text_secondary, marginTop: 3 },
});