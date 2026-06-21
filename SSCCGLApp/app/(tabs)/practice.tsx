import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { SECTIONS } from '../../src/constants/examConfig';
import { useTheme } from '../../src/context/ThemeContext';

export default function PracticeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const PRACTICE_MODES = [
    {
      icon: '⚡', title: t('practice.dailyQuiz'), sub: t('practice.dailyQuizSub'),
      color: '#F39C12', badge: t('home.today'),
      route: { pathname: '/quiz/play', params: { type: 'mix', count: '10' } },
    },
    {
      icon: '🎯', title: t('practice.topicDrill'), sub: t('practice.topicDrillSub'),
      color: colors.accent, badge: null,
      route: { pathname: '/quiz' },
    },
    {
      icon: '🔁', title: t('practice.revisionMode'), sub: t('practice.revisionModeSub'),
      color: '#E74C3C', badge: null,
      route: { pathname: '/quiz/revision' },
    },
    {
      icon: '⏱️', title: t('practice.speedRound'), sub: t('practice.speedRoundSub'),
      color: '#27AE60', badge: t('home.new'),
      route: { pathname: '/quiz/speed' },
    },
    {
      icon: '📰', title: t('practice.currentAffairs'), sub: t('practice.currentAffairsSub'),
      color: '#2E86DE', badge: t('home.new'),
      route: { pathname: '/current-affairs' },
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('practice.title')}</Text>
          <Text style={styles.sub}>{t('practice.sub')}</Text>
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>{t('practice.streakTitle')}</Text>
            <Text style={styles.streakSub}>{t('practice.streakSub')}</Text>
          </View>
          <TouchableOpacity
            style={styles.streakBtn}
            onPress={() => router.push({ pathname: '/quiz/play', params: { type: 'mix', count: '10' } })}
          >
            <Text style={styles.streakBtnText}>{t('practice.go')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{t('practice.practiceModes')}</Text>
        {PRACTICE_MODES.map((mode, i) => (
          <TouchableOpacity
            key={i}
            style={styles.modeRow}
            activeOpacity={0.75}
            onPress={() => router.push(mode.route as any)}
          >
            <View style={[styles.modeIconWrap, { backgroundColor: mode.color + '22' }]}>
              <Text style={styles.modeIcon}>{mode.icon}</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSub}>{mode.sub}</Text>
            </View>
            {mode.badge && (
              <View style={[styles.badge, { backgroundColor: mode.color + '22' }]}>
                <Text style={[styles.badgeText, { color: mode.color }]}>{mode.badge}</Text>
              </View>
            )}
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t('practice.practiceBySection')}</Text>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.sectionRow}
            activeOpacity={0.75}
            onPress={() => router.push({ pathname: '/quiz', params: { section: s.id } })}
          >
            <Text style={styles.secEmoji}>{s.icon}</Text>
            <View style={styles.secInfo}>
              <Text style={styles.secName}>{s.name}</Text>
              <Text style={styles.secSub}>25 {t('practice.topics')} · 500+ {t('practice.questions')}</Text>
            </View>
            <View style={styles.secBar}>
              <View style={[styles.secBarFill, { width: '0%', backgroundColor: s.color }]} />
            </View>
            <Text style={[styles.secPct, { color: s.color }]}>0%</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text_primary },
  sub: { fontSize: 13, color: COLORS.text_secondary, marginTop: 4 },
  streakCard: {
    marginHorizontal: 20, marginBottom: 24,
    backgroundColor: '#F39C1215', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#F39C1233', gap: 12,
  },
  streakIcon: { fontSize: 28 },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text_primary },
  streakSub: { fontSize: 11, color: COLORS.text_secondary, marginTop: 2 },
  streakBtn: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  streakBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: COLORS.text_primary,
    paddingHorizontal: 20, marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 14,
  },
  modeIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  modeIcon: { fontSize: 22 },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  modeSub: { fontSize: 11, color: COLORS.text_secondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  arrow: { fontSize: 20, color: COLORS.text_muted },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12,
  },
  secEmoji: { fontSize: 22 },
  secInfo: { flex: 1 },
  secName: { fontSize: 13, fontWeight: '600', color: COLORS.text_primary },
  secSub: { fontSize: 11, color: COLORS.text_secondary, marginTop: 2 },
  secBar: {
    width: 50, height: 4, backgroundColor: COLORS.border,
    borderRadius: 2, overflow: 'hidden',
  },
  secBarFill: { height: '100%', borderRadius: 2 },
  secPct: { fontSize: 11, fontWeight: '700', minWidth: 30, textAlign: 'right' },
});