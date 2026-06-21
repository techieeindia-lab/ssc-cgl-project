import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { EXAM_CONFIG, SECTIONS } from '../../src/constants/examConfig';
import { useTheme } from '../../src/context/ThemeContext';

export default function TestScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

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

        <View style={styles.optionsGrid}>
          {TEST_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optCard, { borderLeftColor: opt.color }]}
              activeOpacity={0.75}
              onPress={() => {
                if (opt.id === 'full_mock') {
                  // The dynamic [id] route resolves id='full' as the 100-Q mock.
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