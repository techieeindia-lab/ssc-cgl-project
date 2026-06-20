// app/exam/pyst.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';

const SUBJECTS = [
  { id: 'QA',  name: 'Quantitative Aptitude',  icon: '🔢', color: '#E74C3C', part: 'PART-C' },
  { id: 'GIR', name: 'Reasoning & Intelligence', icon: '🧠', color: '#9B59B6', part: 'PART-B' },
  { id: 'GA',  name: 'General Awareness',      icon: '🌍', color: '#27AE60', part: 'PART-D' },
  { id: 'EN',  name: 'English Comprehension',   icon: '📝', color: '#F39C12', part: 'PART-A' },
];

const PYST_SETS = {
  QA: [
    { id: 'pyst_QA_2023_s1', year: 2023, shift: 'Shift 1', title: 'QA Sectional - 2023 Shift 1', difficulty: 'Medium' },
    { id: 'pyst_QA_2023_s2', year: 2023, shift: 'Shift 2', title: 'QA Sectional - 2023 Shift 2', difficulty: 'Hard' },
    { id: 'pyst_QA_2022_s1', year: 2022, shift: 'Shift 1', title: 'QA Sectional - 2022 Shift 1', difficulty: 'Easy' },
    { id: 'pyst_QA_2022_s2', year: 2022, shift: 'Shift 2', title: 'QA Sectional - 2022 Shift 2', difficulty: 'Medium' },
    { id: 'pyst_QA_2021_s1', year: 2021, shift: 'Shift 1', title: 'QA Sectional - 2021 Shift 1', difficulty: 'Medium' },
    { id: 'pyst_QA_2020_s1', year: 2020, shift: 'Shift 1', title: 'QA Sectional - 2020 Shift 1', difficulty: 'Easy' },
  ],
  GIR: [
    { id: 'pyst_GIR_2023_s1', year: 2023, shift: 'Shift 1', title: 'Reasoning Sectional - 2023 Shift 1', difficulty: 'Easy' },
    { id: 'pyst_GIR_2023_s2', year: 2023, shift: 'Shift 2', title: 'Reasoning Sectional - 2023 Shift 2', difficulty: 'Medium' },
    { id: 'pyst_GIR_2022_s1', year: 2022, shift: 'Shift 1', title: 'Reasoning Sectional - 2022 Shift 1', difficulty: 'Medium' },
    { id: 'pyst_GIR_2022_s2', year: 2022, shift: 'Shift 2', title: 'Reasoning Sectional - 2022 Shift 2', difficulty: 'Hard' },
    { id: 'pyst_GIR_2021_s1', year: 2021, shift: 'Shift 1', title: 'Reasoning Sectional - 2021 Shift 1', difficulty: 'Easy' },
  ],
  GA: [
    { id: 'pyst_GA_2023_s1', year: 2023, shift: 'Shift 1', title: 'GA Sectional - 2023 Shift 1', difficulty: 'Hard' },
    { id: 'pyst_GA_2023_s2', year: 2023, shift: 'Shift 2', title: 'GA Sectional - 2023 Shift 2', difficulty: 'Medium' },
    { id: 'pyst_GA_2022_s1', year: 2022, shift: 'Shift 1', title: 'GA Sectional - 2022 Shift 1', difficulty: 'Medium' },
    { id: 'pyst_GA_2021_s1', year: 2021, shift: 'Shift 1', title: 'GA Sectional - 2021 Shift 1', difficulty: 'Easy' },
  ],
  EN: [
    { id: 'pyst_EN_2023_s1', year: 2023, shift: 'Shift 1', title: 'English Sectional - 2023 Shift 1', difficulty: 'Medium' },
    { id: 'pyst_EN_2023_s2', year: 2023, shift: 'Shift 2', title: 'English Sectional - 2023 Shift 2', difficulty: 'Easy' },
    { id: 'pyst_EN_2022_s1', year: 2022, shift: 'Shift 1', title: 'English Sectional - 2022 Shift 1', difficulty: 'Medium' },
    { id: 'pyst_EN_2022_s2', year: 2022, shift: 'Shift 2', title: 'English Sectional - 2022 Shift 2', difficulty: 'Hard' },
    { id: 'pyst_EN_2021_s1', year: 2021, shift: 'Shift 1', title: 'English Sectional - 2021 Shift 1', difficulty: 'Easy' },
  ],
};

export default function PystScreen() {
  const router = useRouter();
  const [activeSub, setActiveSub] = useState('QA');

  const currentSubject = SUBJECTS.find((s) => s.id === activeSub) || SUBJECTS[0];
  const paperSets = PYST_SETS[activeSub as keyof typeof PYST_SETS] || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnTxt}>◄ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>PYST</Text>
          <Text style={styles.subtitle}>Previous Year Sectional Tests</Text>
        </View>
      </View>

      {/* Subject Tab Bar */}
      <View style={styles.tabBar}>
        {SUBJECTS.map((sub) => {
          const isActive = activeSub === sub.id;
          return (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.tabBtn,
                isActive && { borderBottomColor: sub.color, backgroundColor: COLORS.bg_secondary },
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveSub(sub.id)}
            >
              <Text style={styles.tabEmoji}>{sub.icon}</Text>
              <Text
                style={[
                  styles.tabTxt,
                  isActive && { color: sub.color, fontWeight: '800' },
                ]}
              >
                {sub.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>
            Practice Section-wise Past Papers
          </Text>
          <Text style={styles.introSub}>
            Practicing previous year shift papers is the secret to scoring 50/50 in SSC CGL. Select any sectional shift paper below to begin.
          </Text>
        </View>

        {/* Paper Cards List */}
        <Text style={styles.listHeader}>
          Available {currentSubject.name} Sets ({paperSets.length})
        </Text>

        {paperSets.map((set, index) => (
          <View key={set.id} style={[styles.card, { borderLeftColor: currentSubject.color }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{set.title}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: currentSubject.color + '22' }]}>
                    <Text style={[styles.badgeTxt, { color: currentSubject.color }]}>
                      CGL {set.year}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: COLORS.accent_dark + '22' }]}>
                    <Text style={[styles.badgeTxt, { color: COLORS.accent_light }]}>
                      {set.shift}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#ffffff11' }]}>
                    <Text style={[styles.badgeTxt, { color: COLORS.text_secondary }]}>
                      {set.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.cardIndex}>#{index + 1}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>QUESTIONS</Text>
                <Text style={styles.metaValue}>25 Qs</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>TIME LIMIT</Text>
                <Text style={styles.metaValue}>15 Mins</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>MAX MARKS</Text>
                <Text style={styles.metaValue}>50 Marks</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: currentSubject.color }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/exam/${set.id}`)}
            >
              <Text style={styles.startBtnTxt}>🔒 Unlock & Start Test</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg_secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabEmoji: { fontSize: 16, marginBottom: 2 },
  tabTxt: { fontSize: 10, color: COLORS.text_secondary, fontWeight: '600', letterSpacing: 0.5 },
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
  listHeader: { fontSize: 13, fontWeight: '800', color: COLORS.text_primary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  card: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  cardIndex: { color: COLORS.text_muted, fontSize: 16, fontWeight: '900' },
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
