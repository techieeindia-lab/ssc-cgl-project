// app/exam/pyq.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';

// ─── YEARS LIST ─────────────────────────────────────────────
const YEARS = [
  { year: 2025, label: 'CGL 2025 Shift Papers', badge: 'LATEST', count: 39, desc: 'Includes all 39 shifts from the latest CGL Tier-1 exam.' },
  { year: 2024, label: 'CGL 2024 Shift Papers', badge: 'MOST POPULAR', count: 40, desc: 'Complete set of 40 shifts with detailed explanations.' },
  { year: 2023, label: 'CGL 2023 Shift Papers', badge: 'HIGH YIELD', count: 39, desc: 'Official papers from 14th July to 27th July 2023.' },
  { year: 2022, label: 'CGL 2022 Shift Papers', badge: 'SOLVED', count: 40, desc: 'Official shift papers under the newer syllabus format.' },
  { year: 2021, label: 'CGL 2021 Shift Papers', badge: 'SOLVED', count: 21, desc: 'Full length past tests from 13th August to 24th August 2021.' },
  { year: 2020, label: 'CGL 2020 Shift Papers', badge: 'SOLVED', count: 18, desc: 'Shift papers from March 2020, excellent for arithmetic practice.' },
];

// ─── SHIFT DATA STRUCTURE ───────────────────────────────────
type ShiftInfo = {
  id: string;
  shift: number;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

type DateGroup = {
  date: string;
  shifts: ShiftInfo[];
};

// Generates realistic mock shifts grouped by date for each year
const getShiftsForYear = (year: number): DateGroup[] => {
  if (year === 2025) {
    return [
      {
        date: '10 March 2025',
        shifts: [
          { id: 'pyq_2025_d1_s1', shift: 1, time: '09:00 AM - 10:00 AM', difficulty: 'Medium' },
          { id: 'pyq_2025_d1_s2', shift: 2, time: '11:45 AM - 12:45 PM', difficulty: 'Easy' },
          { id: 'pyq_2025_d1_s3', shift: 3, time: '02:30 PM - 03:30 PM', difficulty: 'Hard' },
          { id: 'pyq_2025_d1_s4', shift: 4, time: '05:15 PM - 06:15 PM', difficulty: 'Medium' },
        ],
      },
      {
        date: '11 March 2025',
        shifts: [
          { id: 'pyq_2025_d2_s1', shift: 1, time: '09:00 AM - 10:00 AM', difficulty: 'Easy' },
          { id: 'pyq_2025_d2_s2', shift: 2, time: '11:45 AM - 12:45 PM', difficulty: 'Medium' },
          { id: 'pyq_2025_d2_s3', shift: 3, time: '02:30 PM - 03:30 PM', difficulty: 'Medium' },
          { id: 'pyq_2025_d2_s4', shift: 4, time: '05:15 PM - 06:15 PM', difficulty: 'Hard' },
        ],
      },
    ];
  }
  if (year === 2024) {
    return [
      {
        date: '09 September 2024',
        shifts: [
          { id: 'pyq_2024_d1_s1', shift: 1, time: '09:00 AM - 10:00 AM', difficulty: 'Medium' },
          { id: 'pyq_2024_d1_s2', shift: 2, time: '11:45 AM - 12:45 PM', difficulty: 'Medium' },
          { id: 'pyq_2024_d1_s3', shift: 3, time: '02:30 PM - 03:30 PM', difficulty: 'Easy' },
          { id: 'pyq_2024_d1_s4', shift: 4, time: '05:15 PM - 06:15 PM', difficulty: 'Hard' },
        ],
      },
      {
        date: '10 September 2024',
        shifts: [
          { id: 'pyq_2024_d2_s1', shift: 1, time: '09:00 AM - 10:00 AM', difficulty: 'Easy' },
          { id: 'pyq_2024_d2_s2', shift: 2, time: '11:45 AM - 12:45 PM', difficulty: 'Hard' },
          { id: 'pyq_2024_d2_s3', shift: 3, time: '02:30 PM - 03:30 PM', difficulty: 'Medium' },
          { id: 'pyq_2024_d2_s4', shift: 4, time: '05:15 PM - 06:15 PM', difficulty: 'Medium' },
        ],
      },
    ];
  }
  // Fallback / default for 2023, 2022, 2021, 2020
  return [
    {
      date: `14 July ${year}`,
      shifts: [
        { id: `pyq_${year}_d1_s1`, shift: 1, time: '09:00 AM - 10:00 AM', difficulty: 'Easy' },
        { id: `pyq_${year}_d1_s2`, shift: 2, time: '11:45 AM - 12:45 PM', difficulty: 'Medium' },
        { id: `pyq_${year}_d1_s3`, shift: 3, time: '02:30 PM - 03:30 PM', difficulty: 'Hard' },
        { id: `pyq_${year}_d1_s4`, shift: 4, time: '05:15 PM - 06:15 PM', difficulty: 'Medium' },
      ],
    },
    {
      date: `17 July ${year}`,
      shifts: [
        { id: `pyq_${year}_d2_s1`, shift: 1, time: '09:00 AM - 10:00 AM', difficulty: 'Medium' },
        { id: `pyq_${year}_d2_s2`, shift: 2, time: '11:45 AM - 12:45 PM', difficulty: 'Easy' },
        { id: `pyq_${year}_d2_s3`, shift: 3, time: '02:30 PM - 03:30 PM', difficulty: 'Medium' },
        { id: `pyq_${year}_d2_s4`, shift: 4, time: '05:15 PM - 06:15 PM', difficulty: 'Hard' },
      ],
    },
  ];
};

export default function PYQScreen() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get shifts list for the active year
  const rawData = selectedYear ? getShiftsForYear(selectedYear) : [];

  // Filter shifts based on input search query
  const filteredData = rawData
    .map((group) => {
      const matchingShifts = group.shifts.filter(
        (s) =>
          group.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `shift ${s.shift}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...group, shifts: matchingShifts };
    })
    .filter((group) => group.shifts.length > 0);

  // Return back button function
  const handleBack = () => {
    if (selectedYear) {
      setSelectedYear(null);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  const difficultyColor = (diff: string) => {
    if (diff === 'Easy') return '#27AE60';
    if (diff === 'Hard') return '#E74C3C';
    return '#F39C12';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnTxt}>◄ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>
            {selectedYear ? `${selectedYear} PYQs` : 'Previous Year Papers'}
          </Text>
          <Text style={styles.subtitle}>
            {selectedYear
              ? `Browse shifts for CGL Tier-1 ${selectedYear}`
              : 'Practice full shift-wise previous year question sheets'}
          </Text>
        </View>
      </View>

      {/* STAGE 1: Browse Years */}
      {!selectedYear ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>🎯 Score 50/50 with PYQs</Text>
            <Text style={styles.introSub}>
              Practicing full-length, real shift papers is the absolute best way to gauge your preparation. Select a year to browse shifts.
            </Text>
          </View>

          <Text style={styles.listHeader}>Available Years</Text>

          {YEARS.map((y) => (
            <TouchableOpacity
              key={y.year}
              style={styles.yearCard}
              activeOpacity={0.8}
              onPress={() => setSelectedYear(y.year)}
            >
              <View style={styles.yearRow}>
                <Text style={styles.yearNum}>{y.year}</Text>
                {y.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTxt}>{y.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.yearLabel}>{y.label}</Text>
              <Text style={styles.yearDesc}>{y.desc}</Text>
              <View style={styles.yearDivider} />
              <View style={styles.yearMeta}>
                <Text style={styles.yearStat}>📂 {y.count} Sets Available</Text>
                <Text style={styles.arrowIcon}>Browse →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        // STAGE 2: Browse Dates & Shifts for the selected year
        <View style={{ flex: 1 }}>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by date (e.g. 14 July) or shift..."
              placeholderTextColor={COLORS.text_secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnTxt}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTxt}>No shifts match your search.</Text>
              </View>
            ) : (
              filteredData.map((group) => (
                <View key={group.date} style={styles.dateGroup}>
                  <Text style={styles.dateHeader}>📅 {group.date}</Text>
                  
                  {group.shifts.map((item) => (
                    <View key={item.id} style={styles.shiftCard}>
                      <View style={styles.shiftHeader}>
                        <View>
                          <Text style={styles.shiftTitle}>CGL {selectedYear} · Shift {item.shift}</Text>
                          <Text style={styles.shiftTime}>⏰ {item.time}</Text>
                        </View>
                        <View style={[styles.diffBadge, { backgroundColor: difficultyColor(item.difficulty) + '15' }]}>
                          <Text style={[styles.diffBadgeTxt, { color: difficultyColor(item.difficulty) }]}>
                            {item.difficulty}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.shiftDivider} />

                      <View style={styles.metaRow}>
                        <View style={styles.metaCol}>
                          <Text style={styles.metaLabel}>QUESTIONS</Text>
                          <Text style={styles.metaValue}>100 Qs</Text>
                        </View>
                        <View style={styles.metaCol}>
                          <Text style={styles.metaLabel}>DURATION</Text>
                          <Text style={styles.metaValue}>60 Mins</Text>
                        </View>
                        <View style={styles.metaCol}>
                          <Text style={styles.metaLabel}>MAX MARKS</Text>
                          <Text style={styles.metaValue}>200 Marks</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.startBtn}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/exam/${item.id}`)}
                      >
                        <Text style={styles.startBtnTxt}>🔒 Unlock & Start Test</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
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
  listHeader: { fontSize: 13, fontWeight: '800', color: COLORS.text_primary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  
  // Year Selector
  yearCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  yearNum: { fontSize: 22, fontWeight: '900', color: COLORS.accent_light },
  badge: { backgroundColor: '#E74C3C22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeTxt: { color: '#E74C3C', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  yearLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary, marginTop: 6 },
  yearDesc: { fontSize: 11, color: COLORS.text_secondary, marginTop: 4, lineHeight: 15 },
  yearDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  yearMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearStat: { fontSize: 11, color: COLORS.text_muted, fontWeight: '600' },
  arrowIcon: { fontSize: 11, color: COLORS.accent_light, fontWeight: '700' },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: COLORS.bg_card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: COLORS.text_primary,
  },
  clearBtn: { padding: 6 },
  clearBtnTxt: { fontSize: 12, color: COLORS.text_secondary },
  
  // Shift selector
  dateHeader: { fontSize: 13, fontWeight: '800', color: COLORS.accent_light, marginVertical: 10, letterSpacing: 0.5 },
  dateGroup: { marginBottom: 10 },
  shiftCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text_primary },
  shiftTime: { fontSize: 10.5, color: COLORS.text_secondary, marginTop: 4 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  diffBadgeTxt: { fontSize: 9, fontWeight: '800' },
  shiftDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  
  // Meta column
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaCol: { alignItems: 'center', flex: 1 },
  metaLabel: { fontSize: 8, color: COLORS.text_muted, fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  metaValue: { fontSize: 11, color: COLORS.text_primary, fontWeight: '700' },
  
  // Buttons
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  startBtnTxt: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { fontSize: 13, color: COLORS.text_secondary },
});
