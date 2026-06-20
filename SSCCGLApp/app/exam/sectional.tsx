// app/exam/sectional.tsx
// Sectional practice: lets the user pick which mock test paper to draw
// questions from, then drills them on a single section (QA / GIR / GA / EN).
//
// The mock-test picker reads parent metadata docs from `mock_tests/{id}`.
// If that collection is empty, we fall back to a default `mock_test_01`
// pool with a hint banner — same behaviour as the old hardcoded path.

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { COLORS } from '../../src/theme/colors';
import { SECTIONS, EXAM_CONFIG } from '../../src/constants/examConfig';
import { db } from '../../src/services/firebase';

type MockPaper = {
  id: string;
  title?: string;
  totalQuestions?: number;
  isActive?: boolean;
};

const SUBJECT_DETAILS: Record<string, { desc: string; topics: string }> = {
  QA: { desc: 'Test mathematical abilities, speed, and accuracy in numerical problems.', topics: '25 topics · Arithmetic, Algebra, Geometry, Trigonometry, DI' },
  GIR: { desc: 'Analyze reasoning ability, patterns, classification, and verbal intelligence.', topics: '22 topics · Coding, Blood Relations, Syllogisms, Series' },
  GA: { desc: 'Evaluate general knowledge, current events, history, science, and constitution.', topics: '20 topics · History, Polity, Geography, Science, Economy' },
  EN: { desc: 'Assess English vocabulary, sentence corrections, grammar, and basic comprehension.', topics: '18 topics · Grammar, Idioms, Antonyms, Cloze Test' },
};

export default function SectionalScreen() {
  const router = useRouter();
  const [papers, setPapers] = useState<MockPaper[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          // Parent metadata docs created by the seeder live at /mock_tests/{id}
          const q = query(collection(db, 'mock_tests'), orderBy('createdAt', 'desc'), limit(50));
          const snap = await getDocs(q);
          if (cancelled) return;
          const list: MockPaper[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<MockPaper, 'id'>),
          }));
          setPapers(list);
        } catch (e) {
          console.error('mock_tests fetch failed', e);
          if (!cancelled) setPapers([]);
        }
      })();
      return () => { cancelled = true; };
    }, []),
  );

  const startSectional = (sectionId: string, paperId: string) => {
    // The exam runner detects sectional mode when `id` is one of
    // ['QA','GIR','GA','EN']. We pass the chosen mock paper through a
    // `sourceMock` query param so the runner can use it instead of the
    // default `mock_test_01`.
    router.push({
      pathname: `/exam/${sectionId}`,
      params: { sourceMock: paperId },
    } as any);
  };

  const hasPapers = papers && papers.length > 0;
  const effectivePaper: MockPaper = hasPapers
    ? papers![0]
    : { id: 'mock_test_01', title: 'Default Mock Test', totalQuestions: 100 };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnTxt}>◄ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Sectional Test</Text>
          <Text style={styles.subtitle}>Practice focused subject-wise mock tests</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>
            Sectional Mock Practice
          </Text>
          <Text style={styles.introSub}>
            Practicing single sections is highly recommended to improve subject-specific speed. Each sectional test is 15 minutes and consists of 15 questions.
          </Text>
        </View>

        {/* MOCK-TEST PICKER */}
        <Text style={styles.listHeader}>Source Mock Test</Text>
        {papers === null ? (
          <View style={styles.pickerLoading}>
            <ActivityIndicator color={COLORS.accent_light} />
            <Text style={styles.pickerLoadingTxt}>Loading mock tests…</Text>
          </View>
        ) : hasPapers ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pickerRow}
          >
            {papers!.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.pickerCard, p.id === effectivePaper.id && styles.pickerCardActive]}
                activeOpacity={0.85}
                onPress={() => setPapers([p, ...papers!.filter((x) => x.id !== p.id)])}
              >
                <Text style={styles.pickerEmoji}>📄</Text>
                <Text style={styles.pickerTitle} numberOfLines={1}>
                  {p.title || p.id}
                </Text>
                <Text style={styles.pickerMeta}>
                  {p.totalQuestions ?? '?'} Qs
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintTxt}>
              ⚠️ No mock tests found. Showing questions from the default pool (mock_test_01).
            </Text>
          </View>
        )}

        <Text style={styles.listHeader}>Select a Subject</Text>

        {SECTIONS.map((sub) => {
          const detail = SUBJECT_DETAILS[sub.id] || { desc: '', topics: '' };
          return (
            <View key={sub.id} style={[styles.card, { borderLeftColor: sub.color }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: sub.color + '15' }]}>
                  <Text style={styles.cardIcon}>{sub.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{sub.name}</Text>
                  <Text style={styles.cardTopics}>{detail.topics}</Text>
                </View>
              </View>

              <Text style={styles.cardDesc}>{detail.desc}</Text>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>QUESTIONS</Text>
                  <Text style={styles.metaValue}>15 Qs</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>TIME LIMIT</Text>
                  <Text style={styles.metaValue}>15 Mins</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>MAX MARKS</Text>
                  <Text style={styles.metaValue}>30 Marks</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: sub.color }]}
                activeOpacity={0.85}
                onPress={() => startSectional(sub.id, effectivePaper.id)}
              >
                <Text style={styles.startBtnTxt}>⚡ Start Sectional Test</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    backgroundColor: COLORS.bg_card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  backBtnTxt: { color: COLORS.text_primary, fontSize: 12, fontWeight: '700' },
  headerTitleRow: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text_primary },
  subtitle: { fontSize: 11, color: COLORS.text_secondary, marginTop: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  introBox: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  introTitle: { fontSize: 14, fontWeight: '800', color: COLORS.accent_light, marginBottom: 6 },
  introSub: { fontSize: 11, color: COLORS.text_secondary, lineHeight: 16 },

  // Picker
  pickerLoading: {
    paddingVertical: 20, alignItems: 'center',
  },
  pickerLoadingTxt: { color: COLORS.text_muted, fontSize: 12, marginTop: 8 },
  pickerRow: { gap: 10, paddingBottom: 4, paddingRight: 4 },
  pickerCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.border,
    minWidth: 130, marginRight: 10,
  },
  pickerCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  pickerEmoji: { fontSize: 22, marginBottom: 6 },
  pickerTitle: { color: COLORS.text_primary, fontWeight: '700', fontSize: 12 },
  pickerMeta: { color: COLORS.text_muted, fontSize: 10, marginTop: 2 },
  emptyHint: {
    backgroundColor: '#F39C1222', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#F39C12', marginBottom: 8,
  },
  emptyHintTxt: { color: COLORS.text_secondary, fontSize: 11, lineHeight: 16 },

  listHeader: { fontSize: 13, fontWeight: '800', color: COLORS.text_primary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  card: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text_primary },
  cardTopics: { fontSize: 10, color: COLORS.text_secondary, marginTop: 2 },
  cardDesc: { fontSize: 12, color: COLORS.text_secondary, marginTop: 10, lineHeight: 17 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaCol: { alignItems: 'center', flex: 1 },
  metaLabel: { fontSize: 8, color: COLORS.text_muted, fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  metaValue: { fontSize: 11, color: COLORS.text_primary, fontWeight: '700' },
  startBtn: {
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
    elevation: 2,
  },
  startBtnTxt: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
});