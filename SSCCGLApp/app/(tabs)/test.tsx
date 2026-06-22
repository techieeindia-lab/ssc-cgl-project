import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { EXAM_CONFIG, SECTIONS } from '../../src/constants/examConfig';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { getTestHistory } from '../../src/services/testService';

type Attempt = {
  id: string;
  score: number;
  correct: number;
  wrong: number;
  total: number;
  maxScore: number;
  testType: string;
  sectionStats?: Record<string, any>;
  answers?: Record<string, number | null>;
  questionIds?: string[];
  createdAt?: { seconds: number } | null;
};

const TEST_TYPE_LABELS: Record<string, string> = {
  full: 'Full Mock',
  pyst: 'PYST',
  sectional: 'Sectional',
  pyq: 'Prev Year',
};

const relativeDate = (createdAt: { seconds: number } | null | undefined): string => {
  if (!createdAt?.seconds) return '';
  const diff = Date.now() - createdAt.seconds * 1000;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export default function TestScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getTestHistory(user.uid, 5).then((data) => setAttempts(data as Attempt[])).catch(console.error);
    }, [user]),
  );

  const TEST_OPTIONS = [
    {
      id: 'full_mock',
      icon: '🎯',
      title: t('test.fullMock'),
      sub: t('test.fullMockSub'),
      tag: t('test.newPattern'),
      tagColor: '#E74C3C',
      color: colors.accent,
    },
    {
      id: 'pyst',
      icon: '⚡',
      title: t('test.pyst'),
      sub: t('test.pystSub'),
      tag: t('test.previousYear'),
      tagColor: '#F39C12',
      color: '#F39C12',
    },
    {
      id: 'sectional',
      icon: '📂',
      title: t('test.sectional'),
      sub: t('test.sectionalSub'),
      tag: t('test.sectionWise'),
      tagColor: '#9B59B6',
      color: '#9B59B6',
    },
    {
      id: 'pyq',
      icon: '📚',
      title: t('test.pyq'),
      sub: t('test.pyqSub'),
      tag: t('test.pyqTag'),
      tagColor: '#27AE60',
      color: '#27AE60',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('test.title')}</Text>
          <Text style={styles.sub}>{t('test.sub')}</Text>
        </View>

        {/* Exam Stats Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            {[
              { n: EXAM_CONFIG.totalQuestions, l: t('test.questions') },
              { n: `${EXAM_CONFIG.totalDuration / 60}`, l: t('test.minutes') },
              { n: EXAM_CONFIG.marksPerCorrect * EXAM_CONFIG.totalQuestions, l: t('test.maxMarks') },
              { n: EXAM_CONFIG.marksPerWrong, l: t('test.negMark') },
            ].map((item, i) => (
              <React.Fragment key={i}>
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerNum}>{item.n}</Text>
                  <Text style={styles.bannerLbl}>{item.l}</Text>
                </View>
                {i < 3 && <View style={styles.bannerDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Weekly Live Test Banner (static placeholder) */}
        <View style={styles.liveBanner}>
          <View style={styles.liveBannerLeft}>
            <View style={styles.liveTag}>
              <Text style={styles.liveTagText}>{t('test.liveTestBanner.tag')}</Text>
            </View>
            <Text style={styles.liveTitle}>{t('test.liveTestBanner.title')}</Text>
            <Text style={styles.liveSub}>{t('test.liveTestBanner.sub')}</Text>
          </View>
          <TouchableOpacity style={styles.liveBtn} activeOpacity={0.8}>
            <Text style={styles.liveBtnText}>{t('test.liveTestBanner.cta')}</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Test Type Cards */}
        <View style={styles.optionsGrid}>
          {TEST_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optCard, { borderLeftColor: opt.color }]}
              activeOpacity={0.75}
              onPress={() => {
                if (opt.id === 'full_mock') {
                  router.push({ pathname: '/exam/[id]', params: { id: 'full' } });
                } else if (opt.id === 'pyst') {
                  router.push('/exam/pyst');
                } else if (opt.id === 'sectional') {
                  router.push('/exam/sectional');
                } else if (opt.id === 'pyq') {
                  router.push('/exam/pyq');
                }
              }}
            >
              <View style={styles.optTop}>
                <Text style={styles.optIcon}>{opt.icon}</Text>
                <View style={[styles.optTag, { backgroundColor: opt.tagColor + '22' }]}>
                  <Text style={[styles.optTagText, { color: opt.tagColor }]}>{opt.tag}</Text>
                </View>
              </View>
              <Text style={styles.optTitle}>{opt.title}</Text>
              <Text style={styles.optSub}>{opt.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Sectional Start */}
        <Text style={styles.sectionLabel}>{t('test.quickSectional')}</Text>
        <View style={styles.sectionRow}>
          {SECTIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sectionChip, { borderColor: s.color }]}
              activeOpacity={0.75}
                onPress={() => router.push(`/exam/${s.id}`)}
            >
              <Text style={styles.sectionEmoji}>{s.icon}</Text>
              <Text style={[styles.sectionChipText, { color: s.color }]}>
                {s.shortName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Games */}
        <Text style={styles.sectionLabel}>{t('test.quickGames')}</Text>
        <View style={styles.sectionRow}>
          <TouchableOpacity
            style={[styles.sectionChip, { borderColor: '#F39C12' }]}
            onPress={() => router.push('/quiz/speed')}
          >
            <Text style={styles.sectionEmoji}>⏱️</Text>
            <Text style={[styles.sectionChipText, { color: '#F39C12' }]}>{t('test.speedRound')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sectionChip, { borderColor: '#E74C3C' }]}
            onPress={() => router.push('/quiz/revision')}
          >
            <Text style={styles.sectionEmoji}>🔁</Text>
            <Text style={[styles.sectionChipText, { color: '#E74C3C' }]}>{t('test.revision')}</Text>
          </TouchableOpacity>
        </View>

        {/* Past Attempts */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t('test.pastAttempts')}</Text>
        {!user ? (
          <Text style={styles.pastEmpty}>{t('test.pastAttemptSignedOut')}</Text>
        ) : attempts.length === 0 ? (
          <Text style={styles.pastEmpty}>{t('test.pastAttemptEmpty')}</Text>
        ) : (
          attempts.map((a) => {
            const label = TEST_TYPE_LABELS[a.testType] || a.testType;
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.pastRow}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: '/exam/result',
                    params: {
                      result: JSON.stringify({
                        id: a.id,
                        score: a.score,
                        maxScore: a.maxScore,
                        correct: a.correct,
                        wrong: a.wrong,
                        skipped: a.total - a.correct - a.wrong,
                        total: a.total,
                        testType: a.testType,
                        sectionStats: a.sectionStats ?? {},
                      }),
                    },
                  })
                }
              >
                <View style={styles.pastLeft}>
                  <Text style={styles.pastType}>{label}</Text>
                  <Text style={styles.pastDate}>{relativeDate(a.createdAt)}</Text>
                </View>
                <View style={styles.pastRight}>
                  <Text style={styles.pastScore}>
                    {a.score?.toFixed(0) ?? '—'}/{a.maxScore}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text_primary },
  sub: { fontSize: 13, color: COLORS.text_secondary, marginTop: 4 },
  banner: {
    marginHorizontal: 20,
    backgroundColor: COLORS.bg_card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accent_dark,
    marginBottom: 24,
  },
  bannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerStat: { flex: 1, alignItems: 'center' },
  bannerNum: { fontSize: 18, fontWeight: '800', color: COLORS.accent_light },
  bannerLbl: { fontSize: 10, color: COLORS.text_secondary, marginTop: 2 },
  bannerDivider: { width: 1, height: 28, backgroundColor: COLORS.border },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 24,
  },
  optCard: {
    width: '47%',
    backgroundColor: COLORS.bg_card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
  },
  optTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  optIcon: { fontSize: 24 },
  optTag: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  optTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  optTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text_primary, marginBottom: 4 },
  optSub: { fontSize: 11, color: COLORS.text_secondary },
  liveBanner: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: '#2E86DE22', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#2E86DE44',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  liveBannerLeft: { flex: 1, gap: 4 },
  liveTag: {
    alignSelf: 'flex-start', backgroundColor: '#E74C3C',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5,
  },
  liveTagText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  liveTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text_primary },
  liveSub: { fontSize: 11, color: COLORS.text_secondary },
  liveBtn: {
    backgroundColor: '#2E86DE', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10,
  },
  liveBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  pastEmpty: {
    fontSize: 13, color: COLORS.text_muted, paddingHorizontal: 20,
    lineHeight: 20,
  },
  pastRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pastLeft: { gap: 2 },
  pastType: { fontSize: 13, fontWeight: '700', color: COLORS.text_primary },
  pastDate: { fontSize: 11, color: COLORS.text_secondary },
  pastRight: {},
  pastScore: { fontSize: 16, fontWeight: '800', color: COLORS.accent_light },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text_primary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionChip: {
    flex: 1,
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 4,
  },
  sectionEmoji: { fontSize: 18 },
  sectionChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});